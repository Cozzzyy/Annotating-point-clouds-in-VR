import React, { useState } from "react";
import {
    List,
    ListItem,
    ListItemText,
    Divider,
    Typography,
    Stack,
    Button,
    CardContent,
    CardActions,
} from "@mui/material";
import { Dataset } from "../../types/Dataset";
import { useAppContext } from "../../context/AppContext";
import { startTransition } from "react";
import { LabelingTable } from "./LabelingTable";

interface DatasetsTabProps {
    datasets: Dataset[];
}

export function DatasetsTab({ datasets }: DatasetsTabProps): JSX.Element {
    const { setSelectedDataset, setEnterVR } = useAppContext();
    const [selectedLabelDataset, setSelectedLabelDataset] = useState<Dataset | null>(null);
    const [editMode, setEditMode] = useState(false); // Nieuw: Bewerkmodus voor labels

    function handleSelectedDataset(dataset: Dataset) {
        return () => {
            startTransition(() => {
                setSelectedDataset(dataset);
                setEnterVR(true);
            });
        };
    }

    function handleShowLabels(dataset: Dataset) {
        return () => {
            setSelectedLabelDataset(dataset);
            setEditMode(false); // Zorg ervoor dat we altijd starten in weergavemodus
        };
    }

    function handleBack() {
        setSelectedLabelDataset(null);
    }

    return (
        <CardContent>
            {selectedLabelDataset ? (
                <>
                    <LabelingTable labelSpecs={selectedLabelDataset?.labelSpecs || []} editMode={editMode} />
                    <CardActions sx={{ justifyContent: "center", mt: 2 }}>
                        <Button variant="contained" color="secondary" onClick={handleBack}>
                            Terug
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? "Opslaan" : "Bewerk Labels"}
                        </Button>
                    </CardActions>
                </>
            ) : (
                <>
                    <Typography variant="h6" align="center" gutterBottom>
                        Your Datasets
                    </Typography>
                    <Divider />
                    <List sx={{ width: "100%" }}>
                        {datasets.map((dataset, index) => (
                            <React.Fragment key={index}>
                                <ListItem
                                    secondaryAction={
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                onClick={handleSelectedDataset(dataset)}
                                                variant="contained"
                                                size="small"
                                            >
                                                Start Labeling
                                            </Button>
                                            <Button variant="outlined" size="small">
                                                Start Reviewing
                                            </Button>
                                        </Stack>
                                    }
                                >
                                    <ListItemText
                                        primary={dataset.name}
                                        primaryTypographyProps={{
                                            variant: "subtitle1",
                                            color: "#28289f",
                                            sx: { opacity: 0.6, cursor: "pointer" },
                                            onClick: handleShowLabels(dataset),
                                        }}
                                    />
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                </>
            )}
        </CardContent>
    );
}
