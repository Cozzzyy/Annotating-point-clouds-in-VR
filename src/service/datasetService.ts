import axios from 'axios';
import { Dataset} from "../types/Dataset";
import {Sample} from "../types/Sample";
import * as THREE from "three";
import {LabelExport} from "../types/LabelExport";

const BASE_URL: string = process.env.REACT_APP_API_BASE_URL_DATASETS!;
const SEGMENTSAI_URL : string = process.env.REACT_APP_API_SEGMNETS_URL!;
const API_KEY: string = process.env.REACT_APP_API_KEY!;

export const getDatasets = async (): Promise<Dataset[]> => {
    const response = await axios.get(BASE_URL);
    return response.data.map((dataset: any) => ({
        ...dataset,
        egoPose: dataset.egoPose
            ? {
                position: dataset.egoPose.position
                    ? new THREE.Vector3(
                        dataset.egoPose.position.x,
                        dataset.egoPose.position.y,
                        dataset.egoPose.position.z
                    )
                    : undefined,
                heading: dataset.egoPose.heading
                    ? new THREE.Quaternion(
                        dataset.egoPose.heading.qx,
                        dataset.egoPose.heading.qy,
                        dataset.egoPose.heading.qz,
                        dataset.egoPose.heading.qw
                    )
                    : undefined,
            }
            : undefined,
    }));
};


export const updateDataset = async (dataset: Dataset): Promise<Dataset> => {

    const datasetToSend = {
        ...dataset,
        egoPose: dataset.egoPose
            ? {
                position: dataset.egoPose.position
                    ? { x: dataset.egoPose.position.x, y: dataset.egoPose.position.y, z: dataset.egoPose.position.z }
                    : undefined,
                heading: dataset.egoPose.heading
                    ? { qx: dataset.egoPose.heading.x, qy: dataset.egoPose.heading.y, qz: dataset.egoPose.heading.z, qw: dataset.egoPose.heading.w }
                    : undefined,
            }
            : undefined,
    }

    const response = await axios.put(`${BASE_URL}/${dataset.id}`, datasetToSend);
    return response.data;
};

export const getSample = async (sampleUuid: string): Promise<Sample> => {
    const response = await axios.get(`${SEGMENTSAI_URL}samples/${sampleUuid}`, {
        headers: {
            Authorization: `APIKey ${API_KEY}`,
        },
    });
    return response.data;
};

export const addDataset = async (dataset: Dataset): Promise<Dataset> => {
    const response = await axios.post(BASE_URL, dataset);
    return response.data;
}

export const getDatasetById = async (datasetId: string): Promise<Dataset> => {
    const response = await axios.get(`${BASE_URL}/${datasetId}`);
    return response.data;
}

export const exportAnnotations = async (data: LabelExport, sampleUuid: string) : Promise<void> => {
    const url = `${SEGMENTSAI_URL}labels/${sampleUuid}/ground-truth`;

    const response = await axios.put(url, data, {
        headers: {
            Authorization: `APIKey ${API_KEY}`,
        }
    });
}

export const deleteDataset = async (datasetId: string): Promise<any> => {
    const response = await axios.delete(`${BASE_URL}/${datasetId}`);
    return response.data;
}