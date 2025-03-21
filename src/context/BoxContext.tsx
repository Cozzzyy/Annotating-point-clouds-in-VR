import React, {createContext, useContext, useEffect, useState} from "react";
import {v4 as uuidv4} from "uuid"; // Import the uuid function
import {AnnotationBox} from "../types/AnnotationBox";
import {Label} from "../types/Label";
import {useBoxes} from "../hooks/useBox";
import {useAppContext} from "./AppContext";
import {useLabelingMode} from "./LabelingContext";
import {getPredictions} from "../service/boxesService";
import {Attribute} from "../types/Attribute";
import {Annotation} from "../types/Annotation";
import * as THREE from "three";
import {LabelExport} from "../types/LabelExport";
import {exportAnnotations} from "../service/datasetService";
import {getConvertedBoxFromBackendToWebXr, getConvertedBoxesFromWebXrToBackend} from "../util/boxConverter";

interface BoxContextType {
    boxes: AnnotationBox[];
    addBox: (box: AnnotationBox) => void;
    updateBox: (updatedBox: AnnotationBox) => void;
    addLabelToBox: (box: AnnotationBox, label: Label) => void;
    saveBoxesToBackend: () => void;
    deleteBox: (index: string) => void;
    clearEditMode: () => void;
    loadBoxes: () => void;
    exportBoxes: (datasetId: string) => void;
    setAcceptedStatus: (box: AnnotationBox) => void;
    setEditMode: (box: AnnotationBox) => void;
    clearAllUnsavedBoxes: () => void;
    boxTeleportation: THREE.Vector3 | null;
    setBoxTeleportation: (teleportation: THREE.Vector3 | null) => void;
}

const BoxContext = createContext<BoxContextType | undefined>(undefined);

export const BoxProvider: React.FC<React.PropsWithChildren<{}>> = ({children}) => {
    const {reviewMode, selectedDataset} = useAppContext();
    const {selectedLabel} = useLabelingMode();
    const {boxesBackend, addBoxMutation, updateBoxMutation, deleteBoxMutation} = useBoxes();
    const [boxes, setBoxes] = useState<AnnotationBox[]>([]);
    const [boxTeleportation, setBoxTeleportation] = useState<THREE.Vector3 | null>(null);

    async function loadBoxes() {
        try {
            const predictions: Attribute = await getPredictions(selectedDataset?.id!);

            const newBoxes = predictions.annotations.map((box: Annotation) => {
                const convertedBox = getConvertedBoxFromBackendToWebXr(box, selectedDataset!);
                return {
                    id: uuidv4(),
                    datasetId: selectedDataset?.id!,
                    center: new THREE.Vector3(
                        convertedBox.x,
                        convertedBox.y,
                        convertedBox.z
                    ),
                    label: isLabelSelected(),
                    size: new THREE.Vector3(box.dimensions.x, box.dimensions.y, box.dimensions.z),
                    rotation: new THREE.Euler(0, box.yaw, 0, "XYZ"),
                    editable: false,
                    accepted: false
                };
            });

            setBoxes(newBoxes);

        } catch (error) {
            console.error("Error loading boxes:", error);
        }
    }


    async function exportBoxes(datasetId: string) {
        const boxesArray = Array.isArray(boxesBackend) ? boxesBackend : [boxesBackend]; // Ensure it's always an array
        if(boxesArray.length === 0) {
            console.log("No boxes to export");
        }
        const labelExport: LabelExport = await getConvertedBoxesFromWebXrToBackend(boxesArray);
        await exportAnnotations(labelExport, datasetId);
    }


    useEffect(() => {
        if (reviewMode) {
            // Dont add the same boxes twice
            if (boxes.length === 0) {
                setBoxes(boxesBackend);
            }
        }
    }, [boxesBackend, reviewMode]);

    function setAcceptedStatus(box: AnnotationBox) {
        setBoxes((prevBoxes) =>
            prevBoxes.map((b) => (b.id === box.id ? {...b, accepted: true} : b))
        );
    }

    function setEditMode(box: AnnotationBox) {
        setBoxes((prevBoxes) =>
            prevBoxes.map((b) => (b.id === box.id ? {...b, editable: true} : b))
        );
    }

    function clearEditMode() {
        setBoxes((prevBoxes) =>
            prevBoxes.map((b) => ({...b, editable: false}))
        );
    }

    function isLabelSelected() {
        if (selectedLabel !== null && selectedLabel !== undefined) {
            return selectedLabel;
        }
    }

    async function addBox(box: AnnotationBox) {
        box.id = uuidv4();
        box.datasetId = selectedDataset?.id;
        box.label = isLabelSelected();
        box.editable = true;
        box.accepted = true;
        setBoxes((prevBoxes) => [...prevBoxes, box]);
    }

    const updateBox = (updatedBox: AnnotationBox) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) => (box.id === updatedBox.id ? updatedBox : box))
        );
    };


    const addLabelToBox = (box: AnnotationBox, label: Label) => {
        box.label = label;
        updateBox(box);
    };

    const deleteBox = (id: string) => {
        setBoxes((prevBoxes) => prevBoxes.filter((box) => box.id !== id));
        deleteBoxMutation(id);
    }

    const clearAllUnsavedBoxes = () => {
        setBoxes([]);
    }

    const saveBoxesToBackend = () => {
        // Delete boxes that are in the backend but not in the current state
        boxesBackend.forEach((box) => {
            const existingBox = boxes.find((b) => b.id === box.id);
            if (!existingBox) {
                console.log(`Deleting box with id: ${box.id}`);
                deleteBoxMutation(box.id!);
            }
        });

        // Update or add boxes that are in the current state
        boxes.forEach((box) => {
            const existingBox = boxesBackend.find((b) => b.id === box.id);


            if (existingBox) {

                updateBoxMutation(box);
            } else {
                if(box.accepted) {
                    addBoxMutation(box);
                }
            }
        });
    };


    return (
        <BoxContext.Provider
            value={{
                boxes,
                addBox,
                updateBox,
                addLabelToBox,
                deleteBox,
                saveBoxesToBackend,
                clearEditMode,
                clearAllUnsavedBoxes,
                loadBoxes,
                exportBoxes,
                setAcceptedStatus,
                setEditMode,
                boxTeleportation,
                setBoxTeleportation
            }}>
            {children}
        </BoxContext.Provider>
    );
};

export const useBoxContext = () => {
    const context = useContext(BoxContext);
    if (!context) {
        throw new Error("useBoxContext must be used within a BoxProvider");
    }
    return context;
};
