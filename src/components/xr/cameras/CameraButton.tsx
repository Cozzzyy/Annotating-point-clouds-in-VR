import React, { useMemo, useState, useEffect, MutableRefObject } from "react";
import * as THREE from "three";
import { Group } from "three";

interface CameraButtonProps {
    onClick: () => void;
    position: THREE.Vector3;
    rotation: THREE.Quaternion;
    originRef: MutableRefObject<Group>;
}

export const CameraButton: React.FC<CameraButtonProps> = ({
                                                              onClick,
                                                              position,
                                                              rotation,
                                                              originRef
                                                          }) => {
    // State to track whether the user is hovering
    const [hovered, setHovered] = useState(false);
    // State to track whether the user has been teleported
    const [teleported, setTeleported] = useState(false);

    // Build our camera model only once, and store references to the materials
    const cameraModel = useMemo(() => {
        // Create a parent group
        const group = new THREE.Group();

        // Main body: a box
        const bodyGeom = new THREE.BoxGeometry(0.4, 0.2, 0.3);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        group.add(bodyMesh);

        // Lens: a cylinder (rotated so it’s facing forward along +Z)
        const lensGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 32);
        const lensMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const lensMesh = new THREE.Mesh(lensGeom, lensMat);
        lensMesh.rotation.x = Math.PI / 2;
        lensMesh.position.z = 0.2;
        group.add(lensMesh);

        // Optional ring around the lens
        const ringGeom = new THREE.TorusGeometry(0.1, 0.02, 8, 16);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.z = 0.2;
        group.add(ringMesh);

        return {
            group,
            bodyMat,
            lensMat,
            ringMat,
        };
    }, []);

    // On hover state changes, adjust the material colors
    useEffect(() => {
        if (!cameraModel) return;

        if (hovered) {
            // Lighten or change colors when hovered
            cameraModel.bodyMat.color.setHex(0x666666);
            cameraModel.lensMat.color.setHex(0x222222);
            cameraModel.ringMat.color.setHex(0xffff00);
        } else {
            // Revert to original colors
            cameraModel.bodyMat.color.setHex(0x333333);
            cameraModel.lensMat.color.setHex(0x000000);
            cameraModel.ringMat.color.setHex(0xffaa00);
        }
    }, [hovered, cameraModel]);

    // Flip the camera 180° around Y if it appears backwards
    const axisFix = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, Math.PI, 0, "XYZ")
    );
    const finalRotation = rotation.clone().multiply(axisFix);

    return (
        <group
            position={position}
            quaternion={finalRotation}
            onClick={() => {
                if (originRef.current) {
                    // Create a copy of the button's position.
                    const userTeleportPos = position.clone();
                    if (!teleported) {
                        // Lower the user by 8 units so the head is at camera level.
                        userTeleportPos.y -= 8;
                    } else {
                        // Move the user back up to level.
                        userTeleportPos.y = 0;
                    }
                    originRef.current.position.copy(userTeleportPos);
                    // Optionally, if you want to also update orientation, you can copy the rotation.
                    // originRef.current.quaternion.copy(finalRotation);
                    // Toggle the teleport state.
                    setTeleported(!teleported);
                }
                onClick();
            }}
            onPointerOver={(e) => {
                e.stopPropagation(); // so it doesn't bubble up
                setHovered(true);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHovered(false);
            }}
        >
            <primitive object={cameraModel.group} />
        </group>
    );
};

