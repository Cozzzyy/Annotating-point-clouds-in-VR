import * as THREE from "three";
import {Annotation} from "../types/Annotation";
import {Dataset} from "../types/Dataset";

/**
 * Converts a coordinate from the backend (LIDAR space) to your WebXR coordinate system.
 * It applies a 90° rotation around X and reverses the sign of the z coordinate.
 *
 * @param coord - The input coordinate { x, y, z } from the backend.
 * @returns A THREE.Vector3 in the converted coordinate system.
 */
export function convertBackendCoordinate(coord: { x: number; y: number; z: number }): THREE.Vector3 {
    return new THREE.Vector3(coord.x, coord.z, coord.y);
}


export function convertBackendCoordinateAndFlipZ(coord: { x: number; y: number; z: number }): THREE.Vector3 {
    return new THREE.Vector3(
        coord.x,    // X remains the same
        coord.z,    // Z-up (theirs) becomes Y-up (ours)
        -coord.y    // Flip Y (left/right) to match our Z (left/right)
    );
}

export function convertWebXRToBackendCoordinate(coord: { x: number; y: number; z: number }): THREE.Vector3 {
    return new THREE.Vector3(
        coord.x,    // X remains the same
        -coord.z,   // Y was flipped before, so we unflip it
        coord.y     // Y-up (ours) goes back to Z-up (theirs)
    );
}

export function convertWebXRSizesToBackend(size: { x: number; y: number; z: number }): THREE.Vector3 {
    return new THREE.Vector3(
        size.x,
        size.z,
        size.y
    );
}


/**
 * Converts a backend rotation (as a quaternion) from LIDAR space to your WebXR coordinate system.
 * It applies a 90° rotation about the X-axis.
 *
 * @param rot - The backend rotation with properties { x, y, z, w }.
 * @returns A THREE.Quaternion in the converted coordinate system.
 */
export function convertBackendRotation(rot: { x: number; y: number; z: number; w: number }): THREE.Quaternion {
    // Create a quaternion from the backend rotation.
    const rawBackendRotation = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);




    const axisFix = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2, 0, 0, "XYZ"));
    const fixedRotation = axisFix.multiply(rawBackendRotation);



    return fixedRotation;
}

export function convertBackendCameraRotation(rot: { x: number; y: number; z: number; w: number }): THREE.Quaternion {
    // Create a quaternion from the backend rotation.
    const rawBackendRotation = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);




    const axisFix = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2, 0,0 , "XYZ"));
    const fixedRotation = rawBackendRotation.multiply(axisFix);



    return fixedRotation;
}


/**
 * Converts a WebXR Euler rotation (in our coordinate system)
 * back to a backend Euler rotation (in their coordinate system).
 */
export function convertWebXREulerToBackendEuler(eulerWebXR: THREE.Euler): THREE.Euler {
    // T is the fixed rotation: -90° about the X-axis.
    // Its inverse will be used to reverse the conversion.
    const T = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, "XYZ"));
    const T_inv = T.clone().invert();

    // Convert the WebXR Euler to a quaternion.
    const q_webxr = new THREE.Quaternion().setFromEuler(eulerWebXR);

    // Reverse the transformation: q_backend = T^-1 * q_webxr * T.
    const q_backend = T_inv.clone().multiply(q_webxr).multiply(T);

    // Convert back to Euler angles using the same order.
    const eulerBackend = new THREE.Euler().setFromQuaternion(q_backend, eulerWebXR.order);
    return eulerBackend;
}

/**
 * Extracts the yaw (heading) from a WebXR Euler rotation
 * after converting it into the backend's coordinate system.
 *
 * In this example, we assume that in the backend's Euler, the yaw is represented by the Z component.
 */
export function getBackendYawFromEuler(euler: THREE.Euler): { yawRadians: number; yawDegrees: number } {
    // Here, we assume that the backend's yaw (heading) is the rotation about the Z-axis.
    const yawRadians = euler.z;
    const yawDegrees = THREE.MathUtils.radToDeg(yawRadians);
    return { yawRadians, yawDegrees };
}

export function getYawFromEuler(euler: THREE.Euler): { yawRadians: number; yawDegrees: number } {
    // Here, we assume that the backend's yaw (heading) is the rotation about the Z-axis.
    const yawRadians = euler.y;
    const yawDegrees = THREE.MathUtils.radToDeg(yawRadians);
    return { yawRadians, yawDegrees };
}
