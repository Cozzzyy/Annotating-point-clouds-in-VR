import React, { useEffect, useState } from "react";
import { updateDataset } from "../../service/datasetService";
import { Dataset } from "../../types/Dataset";
import { getDatasets } from "../../service/datasetService";
import { useAppContext } from "../../context/AppContext";
import { startTransition } from "react";
import { useBoxes } from "../../hooks/useBox";
import { AnnotationBox } from "../../types/AnnotationBox";
import { getBoxesByDatasetId } from "../../service/boxesService";
import { Label } from "../../types/Label";
import { SampleCard } from "./SampleCard";
import { LabelingTable } from "./LabelingTable";
import { Button, Card, Typography } from "@mui/material";
import {UploadDatasetModal} from "./UploadDatasetModal";
import {useDatasets} from "../../hooks/useDataset";

export function DatasetsTab(): JSX.Element {
    const { deleteBoxMutation } = useBoxes();
    const { setSelectedDataset, setEnterVR, setReviewMode } = useAppContext();
    const {datasets, deleteDataset, addDataset} = useDatasets();
    const [selectedLabelDataset, setSelectedLabelDataset] = useState<Dataset | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function handleSaveLabels(updatedLabels: Label[]) {
        if (selectedLabelDataset) {
            const updatedDataset: Dataset = {
                ...selectedLabelDataset,
                labels: updatedLabels
            };

            try {
                console.log("Saving labels:", updatedDataset);
                 await updateDataset(updatedDataset);

            } catch (error) {
                console.error("Error saving labels:", error);
            }
        }
    }

    function handleSelectedDataset(dataset: Dataset) {
        startTransition(() => {
            setSelectedDataset(dataset);
            setEnterVR(true);
        });
    }

    function handleShowLabels(dataset: Dataset) {
        setSelectedLabelDataset(dataset);
        setEditMode(false);
    }

    function handleBack() {
        setSelectedLabelDataset(null);
    }

    function handleReviewMode() {
        setReviewMode(true);
    }

    function handleDeleteDataset(datasetId: string) {
        deleteDataset(datasetId!);
    }

    function handleAddDataset(newDataset: Dataset) {
        addDataset(newDataset);
    }

    async function deleteAllBoxes(dataset: Dataset) {
        const boxesToDelete: AnnotationBox[] = await getBoxesByDatasetId(dataset.id!);

        if (boxesToDelete && boxesToDelete.length > 0) {
            boxesToDelete.forEach((box: AnnotationBox) => {
                if (box.id != null) {
                    deleteBoxMutation(box.id);
                }
            });
        }
    }

    return (
        <>
            {selectedLabelDataset ? (
                <LabelingTable
                    labelSpecs={selectedLabelDataset.labels}
                    editMode={editMode}
                    onSave={handleSaveLabels}
                    onBack={handleBack}
                    setEditMode={setEditMode}
                />
            ) : (
                <>
                    <Card
                        sx={{
                            width: "750px",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            boxShadow: "0px 2px 4px rgba(0,0,0,0)",
                            pb: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold" }}>
                            Samples
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => setIsModalOpen(true)}
                            sx={{
                                color: "black",
                                borderRadius: 2,
                                border: "1px solid",
                                background: "transparent",
                                fontWeight: "bold",
                                boxShadow: "none",
                            }}
                        >
                            Add Sample
                        </Button>
                    </Card>
                    {datasets.map((dataset) => (
                        <SampleCard
                            key={dataset.id}
                            dataset={dataset}
                            deleteAllBoxes={deleteAllBoxes}
                            handleSelectDataset={handleSelectedDataset}
                            handleShowLabels={handleShowLabels}
                            handleReviewMode={handleReviewMode}
                            handleDeleteDataset={handleDeleteDataset}
                        />
                    ))}
                </>
            )}
            <UploadDatasetModal open={isModalOpen} handleAddDataset={handleAddDataset} onClose={() => setIsModalOpen(false)} />
        </>
    );
}