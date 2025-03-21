import React from "react";
import {Text, Billboard} from "@react-three/drei";
import {Vector3} from "three";
import {useLabelingMode} from "../../../context/LabelingContext";


export function StatusDisplay() {
    const lineHeight = 0.02;
    const position = new Vector3(-0.15, -0.1, 0.05);
    const {enableLabeling, selectedLabel} = useLabelingMode();

    return (
        <Billboard position={position}>
            {/* Background plane */}
            <mesh position={[0.07, 0.02, -0.001]}>
                <planeGeometry args={[0.15, 0.045, 1]}/>
                <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Text rows */}
            <Text
                fontSize={0.012}
                color={enableLabeling ? "green" : "red"}
                anchorX="left"
                anchorY="bottom"
                position={[0, lineHeight, 0]}
                outlineWidth={0.001}
                outlineColor="#000000"
            >
                {`Drawing Mode: ${enableLabeling ? 'ON' : 'OFF'}`}
            </Text>

            <Text
                fontSize={0.012}
                color="white"
                anchorX="left"
                anchorY="bottom"
                position={[0, 0, 0]}
                outlineWidth={0.001}
                outlineColor="#000000"
            >
                {`Label: ${selectedLabel ? selectedLabel.name : 'None'}`}
            </Text>
        </Billboard>
    );
}