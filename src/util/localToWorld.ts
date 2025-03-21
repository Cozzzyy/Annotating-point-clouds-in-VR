import {AnnotationBox} from "../types/AnnotationBox";
import * as THREE from "three";
/** Convert a local-space position into world coordinates. */
export function localToWorld(localPos: THREE.Vector3, box: AnnotationBox): THREE.Vector3 {
    const boxMatrix = new THREE.Matrix4();
    boxMatrix.compose(
        box.center,
        new THREE.Quaternion().setFromEuler(box.rotation),
        new THREE.Vector3(1, 1, 1)
    );
    return localPos.clone().applyMatrix4(boxMatrix);
}