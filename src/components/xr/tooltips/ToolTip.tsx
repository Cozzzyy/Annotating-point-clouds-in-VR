import React from "react";
import { Text, Billboard } from "@react-three/drei";
import { Vector3 } from "three";

interface TooltipProps {
    text: string;
    textPosition?: Vector3;
    alignment?: 'left' | 'right';
    lineStartPosition?: Vector3;
}

export function Tooltip({
                            text,
                            textPosition = new Vector3(0.1, 0.11, 0),
                            alignment = 'right',
                            lineStartPosition = new Vector3(0, 0, 0)
                        }: TooltipProps) {
    const fontSize = 0.01;

    return (
        <group>
            <Billboard position={textPosition}>
                <Text
                    fontSize={fontSize}
                    color="white"
                    anchorX={alignment}
                >
                    {text}
                </Text>
            </Billboard>

            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([
                            lineStartPosition.x, lineStartPosition.y, lineStartPosition.z,
                            textPosition.x, textPosition.y, textPosition.z
                        ])}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="white" linewidth={2} />
            </line>
        </group>
    );
}