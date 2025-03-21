import * as THREE from "three";

export interface DistortionModel {
    model: string; // e.g. "fisheye" or "pinhole"
    coefficients: {
        k1: number;
        k2: number;
        k3?: number;
        p1?: number;
        p2?: number;
        // possibly more if your model includes them
    };
}

export interface SampleImage {
    url: string;
    extrinsics: {
        rotation: THREE.Quaternion;
        translation: THREE.Vector3;
    };
    intrinsics?: {
        intrinsic_matrix: number[][];
        // or however you store the 3x3 matrix
    };
    distortion?: DistortionModel;
}

