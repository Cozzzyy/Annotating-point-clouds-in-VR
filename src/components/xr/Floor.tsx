import React, {useEffect, useRef} from "react";
import * as THREE from "three";
import {Euler, Group, Vector3} from "three";
import {TeleportTarget, useXRInputSourceState, XROrigin} from "@react-three/xr";
import {useFrame, useThree} from "@react-three/fiber";
import {useBoxContext} from "../../context/BoxContext";

interface FloorProps {
    showOnboarding: boolean;
}

export function Floor({showOnboarding}: FloorProps) {

    const controllerLeft = useXRInputSourceState("controller", "left");
    const controllerRight = useXRInputSourceState("controller", "right");
    const ref = useRef<Group>(null);
    const {camera} = useThree(); // Get the camera
    const {boxTeleportation, setBoxTeleportation} = useBoxContext();

    useEffect(() => {
        if (boxTeleportation) {
            console.log("Teleporting to:", boxTeleportation);
            handleTeleport(boxTeleportation);
            const userRotation = new THREE.Euler(0, 0.55, 0, "XYZ");
            handleRotation(userRotation);
            setBoxTeleportation(null);
        }
    }, [boxTeleportation]);

    // Handle teleportation
    const handleTeleport = (position: Vector3) => {
        if (!ref.current) return;
        const newPosition = new THREE.Vector3(position.x, ref.current.position.y, position.z)
        ref.current.position.copy(newPosition);
    };

    const handleRotation = (euler: Euler) => {
        if (!ref.current) return;
        ref.current.rotation.copy(euler);
    }

    useEffect(() => {
        if (showOnboarding) {
            handleTeleport(new Vector3(0, 0, 0));
            handleRotation(new Euler(0, 0, 0));
        }
    }, [showOnboarding]);

    useFrame((_, delta) => {
        if (!ref.current || !controllerLeft || !controllerRight) return;

        const thumbstickState = controllerLeft.gamepad["xr-standard-thumbstick"];
        const squeezeState = controllerLeft.gamepad["xr-standard-squeeze"];
        const thumbstickStateRight = controllerRight.gamepad["xr-standard-thumbstick"];

        if (!thumbstickState) return;

        // Get camera forward direction
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Keep movement on the horizontal plane
        cameraDirection.normalize();

        // Get camera right direction for strafing
        const right = new THREE.Vector3();
        right.crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection).normalize();

        const moveSpeed = delta * 4; // Adjust speed
        const rotateSpeed = delta ; // Adjust speed

        // Move forward or backward when pressing the thumbstick
        const forwardMove = cameraDirection.clone().multiplyScalar(-thumbstickState.yAxis * moveSpeed);
        ref.current.position.add(forwardMove);

        // Strafe left or right when pressing the thumbstick
        const strafeMove = right.clone().multiplyScalar(-thumbstickState.xAxis * moveSpeed);
        ref.current.position.add(strafeMove);


        if (thumbstickStateRight.state !== "pressed") {
            // Move up/down
            if (thumbstickStateRight.yAxis < 0 )  {
                ref.current.position.y += rotateSpeed;
            } else if (thumbstickStateRight.yAxis > 0) {
                ref.current.position.y -= rotateSpeed;
            }

            // Rotate left/right
            if (thumbstickStateRight.xAxis < 0) {
                ref.current.rotation.y += rotateSpeed;
            } else if (thumbstickStateRight.xAxis > 0) {
                ref.current.rotation.y -= rotateSpeed;
            }
        }


    });

    return (
        <>
            <XROrigin ref={ref} scale={[3, 3, 3]}/>

            <TeleportTarget onTeleport={handleTeleport}>
                <mesh position={[0, -2.7, 0]} scale={[250, 1, 250]} receiveShadow>
                    <boxGeometry/>
                    <meshStandardMaterial color="black"/>
                </mesh>
            </TeleportTarget>

        </>
    );
}
