import React, { useState, useEffect, useCallback, useRef } from "react";
import {useThree, useFrame, RootState} from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import { AnnotationBox } from "../../../types/AnnotationBox";
import {useXR, useXRInputSourceState} from "@react-three/xr";
import { usePointerPosition } from "../../../context/PointerPositionContext";
import {v4 as uuidv4} from "uuid";

interface TwoPointAnnotationProps {
    setBox: (box: AnnotationBox) => void;
}

export function TwoPointAnnotation({ setBox }: TwoPointAnnotationProps) {
    const { gl} = useThree();
    const { camera } = useThree();
    const [startMarker, setStartMarker] = useState<THREE.Vector3 | null>(null);
    const [previewMarker, setPreviewMarker] = useState<THREE.Vector3 | null>(null);
    const controllerSource = useXRInputSourceState("controller", "right");
    const [hoveringBox, setHoveringBox] = useState(false);
    const { pointerPosition } = usePointerPosition();
    const [showPreviewPointer, setShowPreviewPointer] = useState(true);
    const [rotation, setRotation] = useState(0);
    function getWorldCameraYaw(): number {

        // 1️⃣ Get world quaternion of camera
        const worldQuat = new THREE.Quaternion();
        camera.getWorldQuaternion(worldQuat);

        // 5️⃣ Convert to Euler and return yaw
        const euler = new THREE.Euler().setFromQuaternion(worldQuat, 'YXZ');
        return euler.y;
    }



    const computeOrientedBox = (p1: THREE.Vector3, p2: THREE.Vector3, yaw: number) => {
        // Create a quaternion for the inverse rotation.
        const inverseQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -yaw, 0));

        // Transform p1 and p2 into the rotated (local) coordinate system.
        const localP1 = p1.clone().applyQuaternion(inverseQuat);
        const localP2 = p2.clone().applyQuaternion(inverseQuat);

        // Compute an axis-aligned bounding box in this rotated (local) space.
        const box3 = new THREE.Box3().setFromPoints([localP1, localP2]);
        const centerLocal = new THREE.Vector3();
        const size = new THREE.Vector3();
        box3.getCenter(centerLocal);
        box3.getSize(size);

        // Now, transform the center back to world coordinates by reapplying the rotation.
        const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
        const center = centerLocal.applyQuaternion(quat);

        return { center, size, rotation: new THREE.Euler(0, yaw, 0) };
    };


    const handleSelectStart = useCallback(
        (event: any) => {
            if (pointerPosition) {
                setRotation(getWorldCameraYaw)
                setShowPreviewPointer(false);
                const currentPos = new THREE.Vector3();
                pointerPosition.getWorldPosition(currentPos);
                setStartMarker(currentPos);
                setPreviewMarker(currentPos);
            }
        },
        [pointerPosition, hoveringBox, controllerSource]
    );

    const handleSelectEnd = useCallback(
        (event: any) => {
            if (startMarker && previewMarker) {
                setShowPreviewPointer(true);
                const box = computeOrientedBox(startMarker, previewMarker, rotation);
                const annotatedBox: AnnotationBox = {
                    id: uuidv4(),
                    center: box.center,
                    size: box.size,
                    rotation: box.rotation,
                    accepted: true,
                };
                setBox(annotatedBox);
            }
            setStartMarker(null);
            setPreviewMarker(null);
        },
        [startMarker, previewMarker, setBox]
    );

    useFrame((state) => {

        //setRotation(state.camera.getWorldDirection(new THREE.Vector3()).angleTo(new THREE.Vector3(0, 0, -1)));



        if (pointerPosition) {
            const currentPos = new THREE.Vector3();
            pointerPosition.getWorldPosition(currentPos);
            setPreviewMarker(currentPos);
        }
    });

    useEffect(() => {
        const controller = gl.xr.getController(0);
        const controller2 = gl.xr.getController(1);

        if (controller2) {
            controller2.addEventListener("selectstart", handleSelectStart);
            controller2.addEventListener("selectend", handleSelectEnd);
        }
        return () => {
            if (controller2) {
                controller2.removeEventListener("selectstart", handleSelectStart);
                controller2.removeEventListener("selectend", handleSelectEnd);
            }
        };
    }, [gl, handleSelectStart, handleSelectEnd]);

    let previewBox = null;
    if (startMarker && previewMarker) {
        const box = computeOrientedBox(startMarker, previewMarker, rotation);



        previewBox = (
            <mesh position={box.center} rotation={box.rotation}>
                <boxGeometry args={[box.size.x, box.size.y, box.size.z]} />
                <meshStandardMaterial color="blue" transparent opacity={0.3} />
                <Edges color="white" />
            </mesh>
        );
    }


    let previewBall = null;
    if (previewMarker) {
        previewBall = (
            <mesh position={previewMarker} visible={showPreviewPointer}>
                <sphereGeometry args={[0.15, 20, 20]} />
                <meshStandardMaterial color="red" />
            </mesh>
        );
    }

    return (
        <>
            {previewBox}
            {previewBall}
        </>
    );
}