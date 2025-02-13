import React, { useState, useEffect, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import { AnnotationBox } from "../../../types/AnnotationBox";
import { useXRInputSourceState } from "@react-three/xr";

interface TwoPointAnnotationProps {
    setBox: (box: AnnotationBox) => void;
}

export function TwoPointAnnotation({ setBox }: TwoPointAnnotationProps) {
    const { gl } = useThree();
    const [startMarker, setStartMarker] = useState<THREE.Vector3 | null>(null);
    const [previewMarker, setPreviewMarker] = useState<THREE.Vector3 | null>(null);
    const [activeController, setActiveController] = useState<THREE.Object3D | null>(null);
    const controllerSource = useXRInputSourceState("controller", "right");
    const [hoveringBox, setHoveringBox] = useState(false);

    /**
     * Computes the annotation box from two points.
     *
     * Given two points (p1 and p2), this function calculates the center point
     * and the size (dimensions) of the box defined by these two points.
     *
     * @param p1 - The first point.
     * @param p2 - The second point.
     * @returns An object containing the center and size of the box.
     */
    const computeBox = (p1: THREE.Vector3, p2: THREE.Vector3) => {
        const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const size = new THREE.Vector3(
            Math.abs(p2.x - p1.x),
            Math.abs(p2.y - p1.y),
            Math.abs(p2.z - p1.z)
        );
        return { center, size };
    };

    /**
     * Determines the controller's pointing position in world space.
     *
     * This function retrieves the controller's world position and orientation,
     * applies a forward direction vector, and returns the position where the
     * controller is "pointing" at a default distance.
     *
     * @param controller - The controller object.
     * @returns The computed pointing position.
     */
    const getPointingPosition = (controller: THREE.Object3D | null) => {
        if (!controller) return new THREE.Vector3();
        const controllerPos = new THREE.Vector3();
        controller.getWorldPosition(controllerPos);
        const controllerQuat = new THREE.Quaternion();
        controller.getWorldQuaternion(controllerQuat);
        // Local forward direction of the controller
        const localForward = new THREE.Vector3(0, -1, -1);
        // Apply the controller's quaternion to get the world forward direction
        const pointerDir = localForward.applyQuaternion(controllerQuat).normalize();
        const defaultDistance = 1; // Adjust this distance as needed
        return controllerPos.clone().add(pointerDir.multiplyScalar(defaultDistance));
    };

    /**
     * Handles the start of a selection event (selectstart).
     *
     * When a selectstart event is triggered and the controller is not hovering over
     * an existing box, this function sets the start and preview markers to the current
     * pointing position of the controller.
     *
     * @param event - The selection start event.
     */
    const handleSelectStart = useCallback(
        (event: any) => {
            // Only start a box if we’re not hovering over an existing one and the controller exists
            if (hoveringBox || !controllerSource?.object) return;
            const startPos = getPointingPosition(controllerSource.object);
            console.log("New box drag start at:", startPos);
            setStartMarker(startPos);
            setPreviewMarker(startPos);
            setActiveController(controllerSource.object);
        },
        [hoveringBox, controllerSource]
    );

    /**
     * Handles the end of a selection event (selectend).
     *
     * When a selectend event occurs, this function computes the final annotation box
     * using the start and preview markers, passes it to the setBox callback, and resets
     * the markers.
     *
     * @param event - The selection end event.
     */
    const handleSelectEnd = useCallback(
        (event: any) => {
            if (startMarker && previewMarker) {
                const box = computeBox(startMarker, previewMarker);
                setBox(box);
            }
            setStartMarker(null);
            setPreviewMarker(null);
            setActiveController(null);
        },
        [startMarker, previewMarker, setBox]
    );

    /**
     * Updates the preview marker on every frame.
     *
     * This useFrame callback continuously calculates the controller's current pointing
     * position and updates the preview marker, allowing for real-time feedback during
     * the box creation process.
     */
    useFrame(() => {
        if (!controllerSource?.object) return;
        // Compute the current pointer position from where the controller is pointing
        const newPreview = getPointingPosition(controllerSource.object);
        setPreviewMarker(newPreview);
    });

    /**
     * Adds event listeners to XR controllers for select events.
     *
     * This useEffect hook attaches the handleSelectStart and handleSelectEnd event
     * listeners to both available XR controllers when the component mounts, and cleans
     * them up when it unmounts.
     */
    useEffect(() => {
        const controller1 = gl.xr.getController(0);
        const controller2 = gl.xr.getController(1);

        if (controller1) {
            controller1.addEventListener("selectstart", handleSelectStart);
            controller1.addEventListener("selectend", handleSelectEnd);
        }
        if (controller2) {
            controller2.addEventListener("selectstart", handleSelectStart);
            controller2.addEventListener("selectend", handleSelectEnd);
        }

        return () => {
            if (controller1) {
                controller1.removeEventListener("selectstart", handleSelectStart);
                controller1.removeEventListener("selectend", handleSelectEnd);
            }
            if (controller2) {
                controller2.removeEventListener("selectstart", handleSelectStart);
                controller2.removeEventListener("selectend", handleSelectEnd);
            }
        };
    }, [gl, handleSelectStart, handleSelectEnd]);

    // Render a preview box if both start and preview markers are available.
    let previewBox = null;
    if (startMarker && previewMarker) {
        const { center, size } = computeBox(startMarker, previewMarker);
        previewBox = (
            <mesh position={center}>
                <boxGeometry args={[size.x, size.y, size.z]} />
                <meshStandardMaterial color="blue" transparent opacity={0.3} />
                <Edges color="white" />
            </mesh>
        );
    }

    return <>{previewBox}</>;
}
