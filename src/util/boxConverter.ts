import {Annotation} from "../types/Annotation";
import {Dataset} from "../types/Dataset";
import * as THREE from "three";
import {
    convertBackendCoordinateAndFlipZ, convertWebXRSizesToBackend,
    convertWebXRToBackendCoordinate
} from "./coordConverter";
import {AnnotationBox} from "../types/AnnotationBox";
import {LabelExport} from "../types/LabelExport";
import {getDatasetById} from "../service/datasetService";

export function getConvertedBoxFromBackendToWebXr(box: Annotation, dataset: Dataset): THREE.Vector3 {
    const backendCoord = new THREE.Vector3(box.position.x, box.position.y, box.position.z);

    // Subtract egoPose position if available
    if (dataset?.egoPose?.position) {
        backendCoord.sub(dataset.egoPose.position);
    }

    // Convert the coordinates and flip Z
    return convertBackendCoordinateAndFlipZ(backendCoord);
}

export async function getConvertedBoxesFromWebXrToBackend(boxes: AnnotationBox[]): Promise<LabelExport> {
    const annotations: Annotation[] = await Promise.all(
        boxes.map(async (box, index) => {
            const dataset = await getDatasetById(box.datasetId!);
            const quaternion = new THREE.Quaternion().setFromEuler(box.rotation);
            const convertedBoxMidPoint = convertWebXRToBackendCoordinate({
                x: box.center.x, // Offset from egoPose
                y: box.center.y,
                z: box.center.z,
            })
            convertedBoxMidPoint.add(dataset?.egoPose?.position!)

            const convertedSize = convertWebXRSizesToBackend(
                {
                    x: box.size.x,
                    y: box.size.y,
                    z: box.size.z
                }
            )

            return {
                track_id: index + 1,
                category_id: 1,
                type: "cuboid",  // Ensuring exact string match
                position: {
                    x: convertedBoxMidPoint.x,
                    y: convertedBoxMidPoint.y,
                    z: convertedBoxMidPoint.z
                },
                dimensions: {
                    x: convertedSize.x,
                    y: convertedSize.y,
                    z: convertedSize.z
                },
                yaw: 0,
                rotation: {
                    qx: quaternion.x,
                    qy: quaternion.z,
                    qz: quaternion.y,
                    qw: quaternion.w
                }
            } as Annotation;
        })
    );

    return {
        attributes: {
            format_version: 0.1,
            annotations: annotations
        },
        label_status: "PRELABELED",
        score: 0.9254
    };
}


