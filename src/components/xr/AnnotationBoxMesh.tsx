// AnnotationBoxMesh.tsx
import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { Text, Billboard } from "@react-three/drei";
import { AnnotationBox } from "../../types/AnnotationBox";
import { HandleTarget } from "@react-three/handle";
import { CornerHandle } from "./interactions/CornerHandle";
import { useHud } from "../../context/HudContext";
import { useLabelingMode } from "../../context/LabelingContext";

interface AnnotationBoxMeshProps {
    box: AnnotationBox;
    index?: number;
    updateBox?: (index: number, updatedBox: AnnotationBox) => void;
    color?: string;
    opacity?: number;
    preview?: boolean;
    editMode?: boolean;
}

/**
 * AnnotationBoxMesh Component
 *
 * Renders a 3D annotation box with interactive features such as:
 * - A main box mesh with hover and click interactions.
 * - Wireframe edges outlining the box.
 * - Billboard labels that always face the camera.
 * - Interactive corner handles (when in edit mode) for resizing/manipulation.
 *
 * @param {AnnotationBoxMeshProps} props - The properties for the annotation box.
 * @returns The 3D annotation box element.
 */
export function AnnotationBoxMesh({
                                      box,
                                      index,
                                      updateBox,
                                      color = "skyblue",
                                      opacity = 0.4,
                                      preview = false,
                                      editMode,
                                  }: AnnotationBoxMeshProps) {
    const { setIsLabelingOpen } = useHud();
    const { setSelectedBox, enableLabeling } = useLabelingMode();

    const [hovered, setHovered] = useState(false);

    /**
     * Computes the edge geometry for the box.
     *
     * This function creates a THREE.BoxGeometry based on the box dimensions and
     * then extracts its edges using THREE.EdgesGeometry to display a wireframe outline.
     */
    const edgeGeometry = useMemo(() => {
        const boxGeo = new THREE.BoxGeometry(box.size.x, box.size.y, box.size.z);
        return new THREE.EdgesGeometry(boxGeo);
    }, [box.size.x, box.size.y, box.size.z]);

    /**
     * Calculates the offsets for each corner of the box.
     *
     * Determines the position of each corner relative to the box center,
     * which is used to position the interactive corner handles when in edit mode.
     */
    const cornerOffsets = useMemo(() => {
        const halfSize = {
            x: box.size.x / 2,
            y: box.size.y / 2,
            z: box.size.z / 2,
        };
        return [
            [halfSize.x, halfSize.y, halfSize.z],
            [halfSize.x, halfSize.y, -halfSize.z],
            [halfSize.x, -halfSize.y, halfSize.z],
            [halfSize.x, -halfSize.y, -halfSize.z],
            [-halfSize.x, halfSize.y, halfSize.z],
            [-halfSize.x, halfSize.y, -halfSize.z],
            [-halfSize.x, -halfSize.y, halfSize.z],
            [-halfSize.x, -halfSize.y, -halfSize.z],
        ];
    }, []);

    const baseColor = editMode ? "orange" : box.label ? box.label.color : color;
    const computedColor = new THREE.Color(baseColor);
    if (hovered && !enableLabeling) {
        computedColor.lerp(new THREE.Color("white"), 0.3);
    }

    return (
        <>
            <mesh
                position={[box.center.x, box.center.y, box.center.z]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onPointerDown={(e) => {
                    if (!editMode && !enableLabeling) {
                        setIsLabelingOpen(true);
                        setSelectedBox(box);
                    }
                }}
            >
                <boxGeometry args={[box.size.x, box.size.y, box.size.z]} />
                <meshBasicMaterial
                    color={computedColor}
                    transparent
                    opacity={0.5}
                />
            </mesh>

            {editMode &&
                cornerOffsets.map((offset, i) => (
                    <HandleTarget key={i}>
                        <CornerHandle
                            handleIndex={i}
                            initialPosition={[
                                box.center.x + offset[0],
                                box.center.y + offset[1],
                                box.center.z + offset[2],
                            ]}
                            center={box.center}
                            size={box.size}
                            updateBox={updateBox}
                            boxIndex={index}
                        />
                    </HandleTarget>
                ))}

            <lineSegments
                geometry={edgeGeometry}
                position={[box.center.x, box.center.y, box.center.z]}
            >
                <lineBasicMaterial color={computedColor} />
            </lineSegments>

            <Billboard
                position={[
                    box.center.x,
                    box.center.y + box.size.y / 2 + 0.2,
                    box.center.z,
                ]}
            >
                <Text fontSize={0.1} color="white" anchorX="center" anchorY="bottom">
                    {editMode ? "Edit Mode" : box.label ? box.label.name : "No Label"}
                </Text>
            </Billboard>
        </>
    );
}
