import axios from 'axios';
import {AnnotationBox} from "../types/AnnotationBox";
import * as THREE from 'three';
import {Attribute} from "../types/Attribute";

//TODO Duplicated code to be fixed later

export const getBoxes = async (): Promise<AnnotationBox[]> => {
    const response = await axios.get('boxes');
    return response.data.map((box: any): AnnotationBox => ({
        ...box,
        center: new THREE.Vector3(box.center.x, box.center.y, box.center.z),
        size: new THREE.Vector3(box.size.x, box.size.y, box.size.z),
        rotation: new THREE.Euler(
            box.rotation.x,
            box.rotation.y,
            box.rotation.z,
            box.rotation.order || "XYZ"
        ),
    }));
};


export const getBoxesByDatasetId = async (datasetId: string): Promise<AnnotationBox[]> => {
    const response = await axios.get(`/boxes/?datasetId=${datasetId}`);
    return response.data.map((box: any): AnnotationBox => ({
        ...box,
        center: new THREE.Vector3(box.center.x, box.center.y, box.center.z),
        size: new THREE.Vector3(box.size.x, box.size.y, box.size.z),
        rotation: new THREE.Euler(
            box.rotation.x,
            box.rotation.y,
            box.rotation.z,
            box.rotation.order || "XYZ"
        ),
    }));
}



export const addBox = async (box: AnnotationBox) => {
    const boxToSend = {
        ...box,
        center: { x: box.center.x, y: box.center.y, z: box.center.z },
        size: { x: box.size.x, y: box.size.y, z: box.size.z },
        rotation: { x: box.rotation.x, y: box.rotation.y, z: box.rotation.z, order: box.rotation.order },
    };
    await axios.post<AnnotationBox>('boxes', boxToSend);
};

export const updateBox = async (box: AnnotationBox) => {
    const boxToSend = {
        ...box,
        center: { x: box.center.x, y: box.center.y, z: box.center.z },
        size: { x: box.size.x, y: box.size.y, z: box.size.z },
        rotation: { x: box.rotation.x, y: box.rotation.y, z: box.rotation.z, order: box.rotation.order },
    };
    await axios.put<AnnotationBox>(`boxes/${box.id}`, boxToSend);
}

export const deleteBox = async (id: string) => {
    await axios.delete(`boxes/${id}`);
}

export const deleteAllBoxes = async (datasetId: string) => {
    await axios.delete(`/boxes/?datasetId=${datasetId}`);
}

export const getPredictions = async (sampleUUID: string): Promise<Attribute> => {
    const response = await axios.get(`http://localhost:8000/predict?uuid=${sampleUUID}`);
    return response.data;
};

