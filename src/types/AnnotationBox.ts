import * as THREE from 'three';
import {LabelSpec} from "./LabelSpec";

export interface AnnotationBox
{
    id?: number;
    center: THREE.Vector3;
    size: THREE.Vector3;
    label?: LabelSpec;
}