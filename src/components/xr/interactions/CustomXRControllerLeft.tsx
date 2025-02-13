import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
    useXR,
    DefaultXRController,
    DefaultXRInputSourceTeleportPointer,
    useXRInputSourceStateContext,
    useTouchPointer,
    useLinesPointer,
    defaultTouchPointerOpacity,
} from "@react-three/xr";
import {Object3D} from "three";



export function CustomXRControllerLeft() {
    // Access all XR controllers from react-three/xr
    const state = useXRInputSourceStateContext('controller')
    const controllerRef = useRef<Object3D>(null)
    const pointer = useTouchPointer(controllerRef, state)
    return(
        <>
            <DefaultXRController pointer={pointer} opacity={defaultTouchPointerOpacity} />
            <DefaultXRInputSourceTeleportPointer />
        </>

    );

/*
    return (
        <group>

                   <DefaultXRController />

                   <DefaultXRInputSourceTeleportPointer />
        </group>
    );
*/
}




