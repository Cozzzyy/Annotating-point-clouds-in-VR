import React, { useRef } from "react";
import * as THREE from "three";
import { useSettings } from "../../context/SettingsContext";
import {useAppContext} from "../../context/AppContext";


interface PCDModelProps {
    geometry: THREE.BufferGeometry;
}

export function PCDModel({ geometry }: PCDModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const pointsRef = useRef<THREE.Points>(null);
    const pointSize = useSettings().pointSize;
    const {rotation, selectedDataset} = useAppContext();

    if(!selectedDataset) {
        console.error("No ego pose found for dataset: ", selectedDataset);
        return null;
    }


    //TODO Add null checks


    return (
        <group
            ref={groupRef}
        >
            <points ref={pointsRef} geometry={geometry}>
                <pointsMaterial vertexColors size={pointSize} />
            </points>
        </group>
    );
}