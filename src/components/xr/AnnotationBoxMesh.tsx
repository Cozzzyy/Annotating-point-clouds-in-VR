// AnnotationBoxMesh.tsx
import React, { useMemo, useRef, useState} from "react";
import * as THREE from "three";
import {Text, Billboard} from "@react-three/drei";
import {AnnotationBox} from "../../types/AnnotationBox";
import {Handle, HandleTarget} from "@react-three/handle";
import {CornerHandle} from "./interactions/CornerHandle";
import {useHud} from "../../context/HudContext";
import {useLabelingMode} from "../../context/LabelingContext";
import {SideHandle} from "./interactions/SideHandle";
import {RotationHandle} from "./interactions/RotationHandle";
import {defaultApply} from "@pmndrs/handle";
import {SuggestionButtons} from "./interactions/SuggestionButtons";

interface AnnotationBoxMeshProps {
    box: AnnotationBox;
    updateBox?: (updatedBox: AnnotationBox) => void;
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
 * This version ensures that pointer events (hover/click) only trigger when
 * using the right controller.
 *
 * @param {AnnotationBoxMeshProps} props - The properties for the annotation box.
 * @returns The 3D annotation box element.
 */
export function AnnotationBoxMesh({
                                      box,
                                      updateBox,
                                      color = "skyblue",
                                      opacity = 0.4,
                                      preview = false,
                                      editMode,
                                  }: AnnotationBoxMeshProps) {
    const {setIsLabelingOpen} = useHud();
    const {setSelectedBox, enableLabeling} = useLabelingMode();
    const [hovered, setHovered] = useState(false);
    const boxMeshRef = useRef<THREE.Mesh>(null);
    // Create a wireframe geometry for the box edges.
    const edgeGeometry = useMemo(() => {
        const boxGeo = new THREE.BoxGeometry(box.size.x, box.size.y, box.size.z);
        const edges = new THREE.EdgesGeometry(boxGeo);
        const transformedEdges = edges.clone();
        const matrix = new THREE.Matrix4().makeRotationFromEuler(box.rotation!);
        transformedEdges.applyMatrix4(matrix);
        return transformedEdges;
    }, [box.size.x, box.size.y, box.size.z, box.rotation]);


    // Determine the base color.
    const baseColor = (editMode && box.editable) ? "orange" : box.label ? box.label.color : color;

    const computedColor = new THREE.Color(baseColor);
    if (hovered && !enableLabeling) {
        computedColor.lerp(new THREE.Color("white"), 0.3);
    }

    // Helper function to check if the pointer event is from the right controller.
    const isRightController = (e: any) => {
        return e.internalPointer?.state?.inputSource?.handedness === "right";
    };

    const applyHandleMovement = (state: any, target: THREE.Object3D) => {
        if (!boxMeshRef.current) return;
        defaultApply(state, target);
        const newPos = target.position.clone();
        if (updateBox) {
            updateBox({
                ...box,
                center: newPos,
            });
        }


    };

    return (
        <>
            <HandleTarget targetRef={boxMeshRef}>
                <Handle rotate={false}
                        translate={(editMode && box.editable)}
                        scale={false}
                        targetRef={boxMeshRef}
                        apply={applyHandleMovement}>
                    <mesh
                        ref={boxMeshRef}
                        position={[box.center.x, box.center.y, box.center.z]}
                        rotation={box.rotation}
                        onPointerOver={(e) => {
                            if (isRightController(e)) {
                                setHovered(true);
                            }
                        }}
                        onPointerOut={(e) => {
                            if (isRightController(e)) {
                                setHovered(false);
                            }
                        }}
                        onPointerDown={(e) => {
                            if (isRightController(e)) {
                                if (!editMode && !enableLabeling) {
                                    setIsLabelingOpen(true);
                                    setSelectedBox(box);
                                }
                            }
                        }}
                    >
                        <boxGeometry args={[box.size.x, box.size.y, box.size.z]}/>
                        <meshBasicMaterial color={computedColor} transparent opacity={0.5}/>
                    </mesh>
                </Handle>
            </HandleTarget>
            {(editMode && box.editable) &&
                [...Array(8)].map((_, i) => (
                    <HandleTarget key={`corner-${i}`}>
                        <CornerHandle
                            handleIndex={i}
                            updateBox={updateBox}
                            box={box}
                        />
                    </HandleTarget>
                ))}

            {(editMode && box.editable) &&
                [...Array(6)].map((_, i) => (
                    <HandleTarget key={`side-${i}`}>
                        <SideHandle
                            handleIndex={i}
                            updateBox={updateBox}
                            box={box}
                        />
                    </HandleTarget>
                ))

            }
            {(editMode && box.editable) && getEdgeMidpointsAndAxes(box).map(({localOffset, axis, index}) => (
                <RotationHandle
                    key={index}
                    box={box}
                    updateBox={updateBox}
                    handleIndex={index}
                    axis={axis}
                />
            ))}

            <lineSegments
                geometry={edgeGeometry}
                position={[box.center.x, box.center.y, box.center.z]}
            >
                <lineBasicMaterial color={computedColor}/>
            </lineSegments>

            <Billboard
                scale={[5, 5, 5]}
                position={[
                    box.center.x,
                    box.center.y + box.size.y / 2 + 1,
                    box.center.z,
                ]}
            >
                <Text fontSize={0.1} color="white" anchorX="center" anchorY="bottom">
                    {(editMode && box.editable) ? "Edit Mode" : box.label ? box.label.name : "No Label"}
                </Text>
            </Billboard>

            {(!box.accepted && !editMode) && (
                <SuggestionButtons
                    position={[box.center.x, box.center.y + box.size.y / 2 + 0.7, box.center.z]}
                    box={box}
                />
            )}

        </>
    );
}


/**
 * Returns an array of edge definitions:
 * - localOffset: the corner’s offset from box center in local space
 * - axis: which axis we revolve around
 * - index: unique ID
 */
export function getEdgeMidpointsAndAxes(box: AnnotationBox) {
    // same halfX, halfY, halfZ as before
    const halfX = box.size.x / 2;
    const halfZ = box.size.z / 2;

    const edgesParallelToY = [
        {offset: new THREE.Vector3(-halfX, 0, +halfZ), axis: "y"},
        {offset: new THREE.Vector3(+halfX, 0, +halfZ), axis: "y"},
        {offset: new THREE.Vector3(-halfX, 0, -halfZ), axis: "y"},
        {offset: new THREE.Vector3(+halfX, 0, -halfZ), axis: "y"},
    ];

    // combine them
    const allEdges = [...edgesParallelToY];

    // Return them as raw local offsets plus axis, plus an index
    return allEdges.map(({offset, axis}, i) => ({
        localOffset: offset, // do NOT apply the box rotation here
        axis,
        index: i,
    }));
}