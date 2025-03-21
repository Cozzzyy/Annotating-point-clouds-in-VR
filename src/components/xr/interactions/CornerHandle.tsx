import { AnnotationBox } from "../../../types/AnnotationBox";
import * as THREE from "three";
import { Handle } from "@react-three/handle";
import { useEffect, useRef, useState } from "react";
import { defaultApply } from "@pmndrs/handle";
import {worldToLocal} from "../../../util/worldToLocal";
import {localToWorld} from "../../../util/localToWorld";

interface CornerHandleProps {
    handleIndex: number;
    box: AnnotationBox;
    updateBox?: (updatedBox: AnnotationBox) => void;
}

/**
 * CornerHandle component for resizing the box with rotation awareness.
 */
export function CornerHandle({ handleIndex, updateBox, box }: CornerHandleProps) {
    const meshRef = useRef<THREE.Mesh | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [handleRadius, setHandleRadius] = useState(0.05);


    useEffect(() => {
        // For example, we use 10% of the smallest dimension of the box.
        const newRadius =
            Math.min(box.size.x, box.size.y, box.size.z) * 0.075;
        setHandleRadius(newRadius);
    }, [box.size.x, box.size.y, box.size.z]);

    // **Calculate Offset Based on Corner Index**
    const getCornerOffset = (index: number) => {
        return new THREE.Vector3(
            (index & 1 ? -1 : 1) * box.size.x / 2,
            (index & 2 ? -1 : 1) * box.size.y / 2,
            (index & 4 ? -1 : 1) * box.size.z / 2
        );
    };

    // **Effect: Update Handle Position When Box Changes**
    useEffect(() => {
        if (!isDragging && meshRef.current) {
            const offset = getCornerOffset(handleIndex);
            const rotatedOffset = offset.clone().applyEuler(box.rotation);

            meshRef.current?.position.set(
                box.center.x + rotatedOffset.x,
                box.center.y + rotatedOffset.y,
                box.center.z + rotatedOffset.z
            );
        }
    }, [box.center, box.size, box.rotation]); // Depend on box properties

    const applyHandleMovement = (state: any, target: THREE.Object3D) => {
        if (!meshRef.current) return;
        defaultApply(state, target);

        if (state.first) {
            setIsDragging(true);
        }

        const worldPos = new THREE.Vector3();
        meshRef.current?.getWorldPosition(worldPos);

        // **Convert worldPos into local space**
        const localWorldPos = worldToLocal(worldPos, box);

        // **Find the Opposite Corner in Local Space**
        const oppositeCornerIndex = handleIndex ^ 7; // Flip all bits (3-bit index)
        const oppositeCornerLocal = getCornerOffset(oppositeCornerIndex);

        // **Compute new local size**
        const box3 = new THREE.Box3().setFromPoints([oppositeCornerLocal, localWorldPos]);

        // **Extract new local center and size**
        const newLocalCenter = box3.getCenter(new THREE.Vector3());
        const newLocalSize = box3.getSize(new THREE.Vector3());

        // **Convert local center back to world space**
        const newWorldCenter = localToWorld(newLocalCenter, box);

        // **Update the box with corrected rotation-aware resizing**
        if (updateBox) {
            updateBox({
                ...box,
                center: newWorldCenter,
                size: newLocalSize,
            });
        }

        if (state.last) {
            setIsDragging(false);
        }
    };

    // Pick color depending on states:
    const color = isDragging
        ? "green"
        : hovered
            ? "lightgreen"
            : "red";

    return (
        <Handle
            translate={{ x: true, y: true, z: true }}
            scale={{ uniform: true }}
            targetRef={meshRef}
            apply={applyHandleMovement}
        >
            <mesh ref={meshRef}
                  onPointerOver={() => setHovered(true)}
                  onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[handleRadius, 16, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </Handle>
    );
}
