import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { FileLoader } from "three";

/**
 * Custom hook to load and process a PCD (Point Cloud Data) file.
 *
 * This hook performs the following steps:
 * 1. Loads binary point cloud data from a given URL.
 * 2. Decimates the point cloud to reduce the number of points based on the provided decimation factor.
 * 3. Computes per-vertex colors (ranging from blue to red) based on the z-coordinate.
 * 4. Computes the bounding box of the point cloud and invokes the onBoundsComputed callback.
 *
 * @param url - The URL of the PCD file.
 * @param decimation - The decimation factor to reduce the number of points (default is 5).
 * @param onBoundsComputed - Callback invoked with the computed bounds (width, depth, center) of the point cloud.
 * @returns An object containing the processed (filtered) geometry and the original colors.
 */
export function usePCDLoader(
    url: string,
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
        const totalPoints = original.length / 3;
        const sampleCount = Math.floor(totalPoints / decimation);
        const decimated = new Float32Array(sampleCount * 3);
        for (let i = 0, j = 0; i < totalPoints; i += decimation) {
            decimated[j++] = original[i * 3];
            decimated[j++] = original[i * 3 + 1];
            decimated[j++] = original[i * 3 + 2];
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(decimated, 3));
        return geom;
    }, [buffer, decimation]);

    // Compute per-vertex colors based on the z-coordinate.
    // Colors are interpolated from blue (low z) to red (high z).
    // Also, create a filtered geometry that includes both position and color attributes.
    const { filteredGeometry, originalColors } = useMemo(() => {
        const positions = geometry.getAttribute("position").array as Float32Array;
        let minZ = Infinity;
        let maxZ = -Infinity;
        for (let i = 0; i < positions.length; i += 3) {
            const z = positions[i + 2];
            if (z < minZ) minZ = z;
            if (z > maxZ) maxZ = z;
        }
        const colors: number[] = [];
        for (let i = 0; i < positions.length; i += 3) {
            const z = positions[i + 2];
            const color = new THREE.Color();
            const ratio = (z - minZ) / (maxZ - minZ);
            color.lerpColors(new THREE.Color(0x0000ff), new THREE.Color(0xff0000), ratio);
            colors.push(color.r, color.g, color.b);
        }
        const filteredGeom = new THREE.BufferGeometry();
        filteredGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
        filteredGeom.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
        filteredGeom.getAttribute("color").needsUpdate = true;
        return { filteredGeometry: filteredGeom, originalColors: new Float32Array(colors) };
    }, [geometry]);

    // Compute the bounding box of the filtered geometry and invoke the callback with the computed bounds.
    useEffect(() => {
        if (!filteredGeometry) return;

        const bbox = new THREE.Box3().setFromObject(new THREE.Points(filteredGeometry));
        if (bbox.isEmpty()) return;

        // Compute half the width and depth, and a scaled center.
        const width = (bbox.max.x - bbox.min.x) * 0.5;
        const depth = (bbox.max.y - bbox.min.y) * 0.5; // Since rotated (-Math.PI/2), Y becomes Z
        const center = bbox.getCenter(new THREE.Vector3()).multiplyScalar(0.5);

        onBoundsComputed({ width, depth, center });
    }, [filteredGeometry]);

    return { filteredGeometry, originalColors };
}
