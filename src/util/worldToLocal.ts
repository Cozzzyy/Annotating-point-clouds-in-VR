import * as THREE from "three";
import {AnnotationBox} from "../types/AnnotationBox";

export function worldToLocal(worldPos: THREE.Vector3, box: AnnotationBox): THREE.Vector3 {
    const boxMatrix = new THREE.Matrix4();
    boxMatrix.compose(
        box.center,
        new THREE.Quaternion().setFromEuler(box.rotation),
        new THREE.Vector3(1, 1, 1)
    );
    const inv = boxMatrix.clone().invert();
    return worldPos.clone().applyMatrix4(inv);
}