import {Euler, Quaternion} from "three";

export function convertEulerFromQuaternion(quaternion: Quaternion): Euler {
    if (!quaternion) {
        return new Euler();
    }
    const euler = new Euler();
    euler.setFromQuaternion(quaternion);
    return euler;
}