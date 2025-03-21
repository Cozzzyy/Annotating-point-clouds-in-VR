import * as THREE from 'three';
import {Label} from "./Label";

export interface AnnotationBox
{
    id: string;
    center: THREE.Vector3;
    size: THREE.Vector3;
    rotation: THREE.Euler;
    label?: Label;
    datasetId?: string;
    editable?: boolean;
    accepted: boolean;
}