import { useFrame, useThree } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr"; // Ensure this hook is available in your setup
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MainMenu } from "./MainMenu";
import { Vector3 } from "three";
import {useLabelingMode} from "../../../context/LabelingContext";
import {useHud} from "../../../context/HudContext";


export function Hud(): JSX.Element {
    const {isHudOpen, isLabelingOpen, setIsHudOpen, setIsLabelingOpen} = useHud();
    const {setEnableLabeling} = useLabelingMode();
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree(); // Get the camera so we can make the HUD face it

    // Get the left controller's state
    const leftController = useXRInputSourceState("controller", "left");

    // Define the base HUD scale.
    // Define the base HUD scale.
    const scale = new THREE.Vector3(0.45, 0.45, 0.1); //for vr 0.15 0.15 0.05
    // Base offset (in meters) from the controller.
    const baseOffsetDistance = -2.8; //-1.6 for VR
    // Additional vertical offset (in meters) to lower the HUD.
    const verticalOffset = 1.2;
    // Speed multiplier to increase the offset when the controller moves fast.
    const speedMultiplier = 0.001; // Adjust this value as needed


    // Reference to store the previous controller position for velocity calculation.
    const prevControllerPos = useRef<Vector3 | null>(null);
    // Ref to track whether the x-button was pressed in the previous frame.
    const wasXPressed = useRef(false);

    // Ensure the HUD always renders on top.
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach((mat) => {
                            mat.depthTest = false;
                            mat.depthWrite = false;
                            mat.transparent = true;
                        });
                    } else if (mesh.material) {
                        mesh.material.depthTest = false;
                        mesh.material.depthWrite = false;
                        mesh.material.transparent = true;
                    }
                    mesh.renderOrder = 999;
                }
            });
        }

        if(isHudOpen) {
            setEnableLabeling(false);
        }else {
            setEnableLabeling(true);
        }
    }, [isHudOpen]);

    useFrame(() => {
        if (leftController && leftController.object) {
            // Get the current controller world position.
            const currentPos = leftController.object.getWorldPosition(new THREE.Vector3());

            // Compute velocity (distance moved since last frame).
            if (!prevControllerPos.current) {
                prevControllerPos.current = currentPos.clone();
            }
            const velocity = currentPos.clone().sub(prevControllerPos.current);

            if(prevControllerPos.current) {
                prevControllerPos.current.copy(currentPos);
            }

            const speed = velocity.length();

            // Compute a dynamic offset: the faster the controller moves, the greater the offset.
            const dynamicOffset = baseOffsetDistance + speed * speedMultiplier;

            // Get the controller's forward direction in world space.
            const forward = leftController.object.getWorldDirection(new THREE.Vector3());

            // Calculate the HUD position: start at the controller's position, add forward offset, then lower vertically.
            const hudPos = currentPos.clone().add(forward.multiplyScalar(dynamicOffset));
            hudPos.y -= verticalOffset;

            if (groupRef.current) {
                groupRef.current.position.copy(hudPos);

                const cameraWorldPos = new THREE.Vector3();
                camera.getWorldPosition(cameraWorldPos);
                groupRef.current.lookAt(cameraWorldPos);

                groupRef.current.scale.copy(scale);
            }

            // --- Toggle HUD on x-button press (edge-triggered) ---
            const xButton = leftController.gamepad["x-button"];
            if (xButton) {
                if (xButton.state === "pressed" && !wasXPressed.current) {
                    setIsHudOpen((prev) => !prev);
                    setIsLabelingOpen(false);
                    wasXPressed.current = true;
                } else if (xButton.state !== "pressed") {
                    wasXPressed.current = false;
                }
            }
        }
    });


    return (
        <group ref={groupRef}>
            {(isHudOpen || isLabelingOpen) && <MainMenu />}
        </group>
    );
}
