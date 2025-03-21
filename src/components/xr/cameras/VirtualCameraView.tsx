import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree, useLoader, useFrame } from "@react-three/fiber";
import { SampleImage } from "../../../types/SampleImage";
import { convertBackendCoordinateAndFlipZ, convertBackendRotation } from "../../../util/coordConverter";

interface VirtualCameraViewProps {
    sampleImage: SampleImage;
    egoPose?: { heading?: THREE.Quaternion };
    width?: number;
    height?: number;
    screenOffset?: number;
    verticalOffset?: number;

    id: string;
}

function useImageDimensions(url: string) {
    const [dims, setDims] = useState<{ width: number; height: number } | null>(null);
    useEffect(() => {
        if (!url) return;
        const img = new Image();
        img.src = url;
        img.onload = () => setDims({ width: img.naturalWidth, height: img.naturalHeight });
    }, [url]);
    return dims;
}


const VirtualCameraView: React.FC<VirtualCameraViewProps> = ({
                                                                 sampleImage,
                                                                 egoPose,
                                                                 width = 640,
                                                                 height = 480,
                                                                 screenOffset = 5,
                                                                 verticalOffset = 5,
                                                                 id,
                                                             }) => {
    const { scene, gl: mainRenderer } = useThree();

    // Create a render target for this virtual camera's output.
    const renderTarget = useMemo(() => new THREE.WebGLRenderTarget(width, height), [width, height]);

    // Create and position the virtual camera.
    const { camera, convertedCameraPosition, convertedRot } = useMemo(() => {
        const cam = new THREE.PerspectiveCamera();
        // Convert translation
        const rawOffset = new THREE.Vector3(
            sampleImage.extrinsics.translation.x,
            sampleImage.extrinsics.translation.y,
            sampleImage.extrinsics.translation.z
        );
        const convertedPos = convertBackendCoordinateAndFlipZ(rawOffset);
        let convertedCameraPosition = convertedPos.clone();

        // Convert rotation
        const rawQuat = new THREE.Quaternion(
            sampleImage.extrinsics.rotation.qx,
            sampleImage.extrinsics.rotation.qy,
            sampleImage.extrinsics.rotation.qz,
            sampleImage.extrinsics.rotation.qw
        );
        let convertedRot = convertBackendRotation(rawQuat);

        // Optional egoPose adjustment
        if (egoPose?.heading) {
            const eulerHeading = new THREE.Euler().setFromQuaternion(egoPose.heading, "XYZ");
            const pitch = eulerHeading.z;
            const pitchAsYaw = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, pitch, 0, "XYZ"));
            convertedRot.multiply(pitchAsYaw);
            convertedCameraPosition.applyQuaternion(pitchAsYaw);
        }
        cam.scale.set(3,3,3)
        cam.position.copy(convertedCameraPosition);
        cam.quaternion.copy(convertedRot);

        return { camera: cam, convertedCameraPosition, convertedRot };
    }, [sampleImage, egoPose, width, height]);



    // Compute the correct FOV from intrinsics.
    const imgDims = useImageDimensions(sampleImage.url);
    useEffect(() => {
        if (!imgDims || !sampleImage.intrinsics) return;
        const K = sampleImage.intrinsics.intrinsic_matrix;
        const fx = K[0][0], fy = K[1][1], cx = K[0][2], cy = K[1][2];
        setCameraProjectionFromIntrinsics(camera, fx, fy, cx, cy, imgDims.width, imgDims.height, 0.1, 1000);
    }, [imgDims, sampleImage.intrinsics, camera, id]);

    // Calculate the plane position in front of the virtual camera.
    const screenPosition = useMemo(() => {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(convertedRot);
        const up = new THREE.Vector3(0, 1, 0);
        return convertedCameraPosition.clone().add(forward.multiplyScalar(screenOffset)).add(up.multiplyScalar(verticalOffset));
    }, [convertedCameraPosition, convertedRot, screenOffset, verticalOffset]);

    // Load the real image texture for overlay.
    const realImgTexture = useLoader(THREE.TextureLoader, sampleImage.url);

    // Here, create an offscreen renderer for this camera.

    // Use this offscreen renderer to update the render target each frame.
    useFrame(() => {
        var currentRenderTarget = mainRenderer.getRenderTarget();
        var currentXrEnabled = mainRenderer.xr.enabled;
        var currentShadowAutoUpdate = mainRenderer.shadowMap.autoUpdate;

        mainRenderer.xr.enabled = false;
        mainRenderer.shadowMap.autoUpdate = false;

        mainRenderer.setRenderTarget( renderTarget );
        mainRenderer.clear();
        mainRenderer.render( scene, camera );

        mainRenderer.xr.enabled = currentXrEnabled;
        mainRenderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
        mainRenderer.setRenderTarget( currentRenderTarget );
    });


    // Return two planes: one displaying the offscreen render target texture,
    // and one for the real image overlay (if needed).
    return (
        <>
            {/* Virtual camera output plane */}
            <mesh position={screenPosition} quaternion={convertedRot}>
                <planeGeometry args={[width * 0.007, height * 0.007]} />
                <meshBasicMaterial map={renderTarget.texture} side={THREE.DoubleSide} />
            </mesh>

            {/* Real image overlay plane (currently hidden via opacity=0) */}
            <mesh
                position={screenPosition.clone().add(new THREE.Vector3(0, 0, 0.001).applyQuaternion(convertedRot))}
                quaternion={convertedRot}
            >
                <planeGeometry args={[width * 0.007, height * 0.007]} />
                <meshBasicMaterial map={realImgTexture} side={THREE.DoubleSide} transparent opacity={0.3} />
            </mesh>
        </>
    );
};

export default VirtualCameraView;

function setCameraProjectionFromIntrinsics(
    camera: THREE.Camera,
    fx: number,
    fy: number,
    cx: number,
    cy: number,
    imageWidth: number,
    imageHeight: number,
    near = 0.1,
    far = 1000
) {
    const left = -cx * (near / fx);
    const right = (imageWidth - cx) * (near / fx);
    const top = cy * (near / fy);
    const bottom = -(imageHeight - cy) * (near / fy);
    const projectionMatrix = new THREE.Matrix4().makePerspective(left, right, top, bottom, near, far);
    camera.projectionMatrix.copy(projectionMatrix);
    camera.projectionMatrixInverse.copy(projectionMatrix).invert();
}







