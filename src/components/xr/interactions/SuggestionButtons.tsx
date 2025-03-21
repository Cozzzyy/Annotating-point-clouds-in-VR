import React, { useState } from "react";
import { Text, Billboard } from "@react-three/drei";
import {useBoxContext} from "../../../context/BoxContext";
import {AnnotationBox} from "../../../types/AnnotationBox";

interface SuggestionButtonsProps {
    position: [number, number, number]; // Optional position
    box: AnnotationBox;
}

export function SuggestionButtons({ position, box }: SuggestionButtonsProps) {
    const { deleteBox, setAcceptedStatus } = useBoxContext();
    const scaleFactor = 5; // Adjust scale to match scene
    const [hoveredButton, setHoveredButton] = useState<"accept" | "delete" | null>(null);


    return (
        <Billboard follow lockX={false} lockY={false} lockZ={false} position={position}>
            <group scale={[scaleFactor, scaleFactor, scaleFactor]}>
                {/* Accept Button */}
                <mesh
                    position={[-0.15, 0, 0]} // Moved closer
                    onPointerOver={() => setHoveredButton("accept")}
                    onPointerOut={() => setHoveredButton(null)}
                    onClick={() => setAcceptedStatus(box)}
                >
                    <planeGeometry args={[0.25, 0.12]} />
                    <meshBasicMaterial color={hoveredButton === "accept" ? "#44cc44" : "green"} />
                    <Text fontSize={0.06} color="white" position={[0, 0, 0.01]}>Accept</Text>
                </mesh>

                {/* Delete Button */}
                <mesh
                    position={[0.15, 0, 0]} // Moved closer
                    onPointerOver={() => setHoveredButton("delete")}
                    onPointerOut={() => setHoveredButton(null)}
                    onClick={() => deleteBox(box.id!)}
                >
                    <planeGeometry args={[0.25, 0.12]} />
                    <meshBasicMaterial color={hoveredButton === "delete" ? "#cc4444" : "red"} />
                    <Text fontSize={0.06} color="white" position={[0, 0, 0.01]}>Delete</Text>
                </mesh>
            </group>
        </Billboard>
    );
};
