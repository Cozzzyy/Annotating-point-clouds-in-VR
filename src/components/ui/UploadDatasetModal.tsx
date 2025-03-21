import React, { useState } from "react";
import { Modal, Box, CardContent, Typography, CardActions, Button, TextField } from "@mui/material";
import { addDataset, getSample } from "../../service/datasetService";
import { Sample } from "../../types/Sample";
import { Dataset } from "../../types/Dataset";

interface UploadDatasetModalProps {
    open: boolean;
    onClose: () => void;
    handleAddDataset: (dataset: Dataset) => void;
}

export function UploadDatasetModal({ open, onClose, handleAddDataset }: UploadDatasetModalProps) {
    const [uuid, setUuid] = useState("");
    const [dataSet, setDataSet] = useState<Dataset | null>(null);
    const [error, setError] = useState<string | null>(null);

    const uploadDataset = async () => {
        if (!uuid) return;
        try {
            const sample: Sample = await getSample(uuid);
            const newDataset: Dataset = {
                id: sample.uuid,
                name: sample.name,
                url: sample.attributes?.pcd?.url || "",
                egoPose: {
                    position: sample.attributes?.ego_pose?.position,
                    heading: sample.attributes?.ego_pose?.heading,
                },
                images: sample.attributes?.images?.map((img: any) => ({
                    url: img.url,
                    extrinsics: {
                        rotation: img.extrinsics.rotation,
                        translation: img.extrinsics.translation,
                    },
                    intrinsics: img.intrinsics,
                    // Add the distortion property here:
                    distortion: img.distortion // e.g. { model: "fisheye", coefficients: { k1, k2, ... } }
                })),
            };
            handleAddDataset(newDataset);
            setDataSet(newDataset);
            setUuid("");
            setError(null);
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to fetch sample. Please check the UUID.");
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    width: 400,
                    margin: "auto",
                    mt: "10%",
                    bgcolor: "background.paper",
                    p: 4,
                    borderRadius: 2,
                    border: "1px solid black",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                }}
            >
                <CardContent sx={{ textAlign: "start" }}>
                    <Typography variant="h6" gutterBottom>
                        Add Sample
                    </Typography>
                    <TextField
                        label="Dataset UUID"
                        value={uuid}
                        onChange={(e) => setUuid(e.target.value)}
                        variant="outlined"
                        fullWidth
                    />
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </CardContent>
                {dataSet && (
                    <CardContent>
                        <Typography variant="body2">
                            Dataset <strong>{dataSet.name}</strong> added successfully.
                        </Typography>
                    </CardContent>
                )}
                <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                    <Button variant="contained" color="primary" onClick={uploadDataset}>
                        Add Dataset
                    </Button>
                </CardActions>
            </Box>
        </Modal>
    );
}