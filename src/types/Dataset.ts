import {Label} from "./Label";
import * as THREE from "three";
import {SampleImage} from "./SampleImage";

export interface Dataset {
    id: string;
    name: string;
    url: string;
    egoPose?: {
        position?: THREE.Vector3;
        heading?: THREE.Quaternion;
    }
    frames?: {
        egoPose?: {
            position?: THREE.Vector3;
            heading?: THREE.Quaternion;
        }
    }

    labels?: Label[]; // Optioneel veld voor labeling specificaties
    images?: SampleImage[];
}
