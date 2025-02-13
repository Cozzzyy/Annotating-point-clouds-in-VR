import React, { useState } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import {TeleportTarget, XROrigin} from "@react-three/xr";

interface FloorProps {
    width: number;
    depth: number;
    center: THREE.Vector3;
}

export function Floor({ width, depth, center }: FloorProps) {
    const [position, setPosition] = useState(new Vector3());

    return (
        <>

            <XROrigin position={position}  />
            <TeleportTarget onTeleport={setPosition} >
                <mesh
                    scale={[width, -1, depth]} // Apply scene scale
                    position={[center.x, 0, center.z]} // Center under PCD
                    receiveShadow
                >
                    <boxGeometry />
                    <meshStandardMaterial color="black" />
                </mesh>
            </TeleportTarget>
        </>
    );
}



