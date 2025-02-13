import {AnnotationBox} from "../../../types/AnnotationBox";

import * as THREE from "three";

import { Handle } from "@react-three/handle";
import {useEffect, useRef, useState} from "react";
import {defaultApply} from "@pmndrs/handle";


interface CornerHandleProps {
    handleIndex: number;
    initialPosition: [number, number, number];
    center: THREE.Vector3;
    size: THREE.Vector3;
    updateBox?: (index: number, updatedBox: AnnotationBox) => void;
    boxIndex?: number;
}

export function CornerHandle({ handleIndex, center, size, updateBox, boxIndex }: CornerHandleProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [savedPosition, setSavedPosition] = useState<THREE.Vector3 | null>(null);
    const [inPlace, setInPlace] = useState(false); // NEW STATE: Prevent unnecessary offset updates

    // **Calculate Offset Based on Corner Index**
    const getCornerOffset = () => {
        return new THREE.Vector3(
            (handleIndex & 1 ? -1 : 1) * size.x / 2,
            (handleIndex & 2 ? -1 : 1) * size.y / 2,
            (handleIndex & 4 ? -1 : 1) * size.z / 2
        );
    };

    // **Effect: Update Position When Box Resizes (But Not If In Place)**
    useEffect(() => {
        if (!isDragging && meshRef.current && !inPlace) {
            const offset = getCornerOffset();
            meshRef.current.position.set(center.x + offset.x, center.y + offset.y, center.z + offset.z);
        }
    }, [center, size, inPlace]);

    const applyHandleMovement = (state: any, target: THREE.Object3D) => {
        if (!meshRef.current) return;

        if (state.first) {
            setIsDragging(true);
            setSavedPosition(meshRef.current.position.clone());
            setInPlace(false); // Mark as in-place when dragging starts
        }

        defaultApply(state, target); // Let the ball move freely

        const worldPos = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPos);

        // Compute the opposite corner
        const oppositeCorner = new THREE.Vector3(
            center.x * 2 - worldPos.x,
            center.y * 2 - worldPos.y,
            center.z * 2 - worldPos.z
        );

        // Compute new size
        const newSize = new THREE.Vector3(
            Math.abs(worldPos.x - oppositeCorner.x),
            Math.abs(worldPos.y - oppositeCorner.y),
            Math.abs(worldPos.z - oppositeCorner.z)
        );

        // Compute new center
        const newCenter = new THREE.Vector3(
            (worldPos.x + oppositeCorner.x) / 2,
            (worldPos.y + oppositeCorner.y) / 2,
            (worldPos.z + oppositeCorner.z) / 2
        );

        // **Real-time Box Update**
        if (updateBox && boxIndex !== undefined) {
            updateBox(boxIndex, {center: newCenter, size: newSize});
        }

        if (state.last) {
            setIsDragging(false);
            setSavedPosition(worldPos.clone());
            setInPlace(true); // Allow future updates when handle is released
        }
    };

    return (
        <Handle
            translate={{ x: true, y: true, z: true }}
            scale={{ uniform: true }}
            targetRef="from-context"
            apply={applyHandleMovement}
        >
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color={isDragging ? "green" : "red"} />
            </mesh>
        </Handle>
    );
}