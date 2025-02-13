import React, {useRef, useState} from "react";
import * as THREE from "three";


interface PCDModelProps {
    geometry: THREE.BufferGeometry;
    originalColors: Float32Array;
}

export function PCDModel( { geometry}: PCDModelProps ) {

    const groupRef = useRef<THREE.Group>(null);
    const pointsRef = useRef<THREE.Points>(null);
    const [pointSize, setPointSize] = useState(0.02);



    return (
        <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]} scale={[0.3,0.3,0.3]} position={[0,2,0]}>
            <points
                ref={pointsRef}
                geometry={geometry}
            >
                <pointsMaterial vertexColors size={pointSize}/>
            </points>
        </group>
    )
}