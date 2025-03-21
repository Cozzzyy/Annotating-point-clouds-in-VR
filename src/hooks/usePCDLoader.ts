import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { FileLoader } from "three";
import { convertBackendCoordinateAndFlipZ } from "../util/coordConverter";
import { Dataset } from "../types/Dataset";

/**
 * Custom hook to load and process a PCD (Point Cloud Data) file.
 *
 * This hook performs the following steps:
 * 1. Loads binary point cloud data from a given URL.
 * 2. Decimates the point cloud to reduce the number of points based on the provided decimation factor.
 * 3. Computes per-vertex colors (ranging from blue to red) based on the y-coordinate,
 *    using percentile-based clamping to ignore extreme outliers.
 * 4. Computes the bounding box of the point cloud and invokes the onBoundsComputed callback.
 *
 * @param url - The URL of the PCD file.
 * @param dataset - Dataset with Lidar position and other properties of the point cloud.
 * @param decimation - The decimation factor to reduce the number of points (default is 5).
 * @param onBoundsComputed - Callback invoked with the computed bounds (width, depth, center) of the point cloud.
 * @returns An object containing the processed (filtered) geometry and the original colors.
 */
export function usePCDLoader(
    url: string,
    dataset: Dataset | null,
    decimation: number = 5,
    onBoundsComputed: (bounds: { width: number; depth: number; center: THREE.Vector3 }) => void
) {
    // Load the binary data from the provided URL using a FileLoader.
    const buffer = useLoader(
        FileLoader,
        url,
        (loader) => loader.setResponseType("arraybuffer")
    ) as ArrayBuffer;

    // Create a decimated geometry from the loaded binary buffer.
    // This reduces the number of points by sampling every 'decimation'-th point.
    const geometry = useMemo(() => {
        const original = new Float32Array(buffer);
        const stride = 5; // number of floats per point (e.g. x, y, z, plus two extras)
        const totalPoints = original.length / stride;
        const sampleCount = Math.floor(totalPoints / decimation);
        const decimated = new Float32Array(sampleCount * 3);

        for (let i = 0, j = 0; i < totalPoints; i += decimation) {
            const baseIndex = i * stride;
            decimated[j++] = original[baseIndex];       // x
            decimated[j++] = original[baseIndex + 1];     // y
            decimated[j++] = original[baseIndex + 2];     // z
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(decimated, 3));
        return geom;
    }, [buffer, decimation]);

    // Compute per-vertex colors based on the y-coordinate.
    // Colors are interpolated from blue (low y) to red (high y), but using a clamped range
    // (e.g. the 1st and 99th percentiles) to mitigate outlier effects.
    const { filteredGeometry, originalColors } = useMemo(() => {
        const positions = geometry.getAttribute("position").array as Float32Array;

        const convertedPositions: number[] = [];
        const yValues: number[] = [];

        // First pass: Convert positions and gather all y values.

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];

            // Rotate if a heading is provided.
            const pos = new THREE.Vector3(x, y, z);
            if (dataset?.egoPose?.heading) {
                pos.applyQuaternion(dataset.egoPose.heading);
            }

            // Convert from backend to WebXR coordinate space.
            const converted = convertBackendCoordinateAndFlipZ({ x: pos.x, y: pos.y, z: pos.z });
            convertedPositions.push(converted.x, converted.y, converted.z);
            yValues.push(converted.y);
        }

        // Sort y values to compute percentiles.
        yValues.sort((a, b) => a - b);
        const lowerIndex = Math.floor(yValues.length * 0.01);  // 1st percentile
        const upperIndex = Math.floor(yValues.length * 0.99);  // 99th percentile
        const clampedMinY = yValues[lowerIndex];
        const clampedMaxY = yValues[upperIndex];

        // Second pass: Compute colors using clamped y range.
        const colors: number[] = [];
        for (let i = 0; i < convertedPositions.length; i += 3) {
            const y = convertedPositions[i + 1];
            // Clamp y to the [clampedMinY, clampedMaxY] range.
            const clampedY = Math.min(Math.max(y, clampedMinY), clampedMaxY);
            const ratio = (clampedMaxY - clampedMinY) ? (clampedY - clampedMinY) / (clampedMaxY - clampedMinY) : 0.5;
            const color = new THREE.Color().lerpColors(new THREE.Color(0x0000ff), new THREE.Color(0xff0000), ratio);
            colors.push(color.r, color.g, color.b);
        }

        // Create the final geometry with position and color attributes.
        const filteredGeom = new THREE.BufferGeometry();
        filteredGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(convertedPositions), 3));
        filteredGeom.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
        filteredGeom.getAttribute("color").needsUpdate = true;

        return { filteredGeometry: filteredGeom, originalColors: new Float32Array(colors) };
    }, [geometry, dataset?.egoPose?.heading]);

    // Compute the bounding box of the filtered geometry and invoke the callback.
    useEffect(() => {
        if (!filteredGeometry) return;

        const bbox = new THREE.Box3().setFromObject(new THREE.Points(filteredGeometry));
        if (bbox.isEmpty()) return;

        const width = bbox.max.x - bbox.min.x;
        const depth = bbox.max.y - bbox.min.y;
        const center = bbox.getCenter(new THREE.Vector3());
        onBoundsComputed({ width, depth, center });
    }, [filteredGeometry]);

    return { filteredGeometry, originalColors };
}


