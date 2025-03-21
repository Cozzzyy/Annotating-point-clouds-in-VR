import { Card, Typography, Button, Box } from "@mui/material";
import LongMenu from "./LongMenu";
import { Dataset } from "../../types/Dataset";
import { useBoxByDatasetId } from "../../hooks/useBox";
import FilePresentIcon from '@mui/icons-material/FilePresent';

interface SampleCardProps {
    dataset: Dataset;
    handleSelectDataset: (dataset: Dataset) => void;
    deleteAllBoxes: (dataset: Dataset) => void;
    handleShowLabels: (dataset: Dataset) => void;
    handleReviewMode: () => void;
    handleDeleteDataset: (datasetId: string) => void;
}

export function SampleCard({ dataset, handleSelectDataset, deleteAllBoxes, handleShowLabels, handleReviewMode, handleDeleteDataset }: SampleCardProps): JSX.Element {
    const { boxesBackend } = useBoxByDatasetId(dataset.id!);

    return (
        <Card
            onClick={() => handleShowLabels(dataset)}
            sx={{
                width: "720px",
                height: "28px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.3)",
                borderRadius: 2.5,
                padding: 2,
                mb: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.4)",
                    cursor: "pointer"
                }
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "start",
                    justifyContent: "space-between",
                    width: "220px"
                }}>
                <FilePresentIcon sx={{ color: "primary.main" }} />
                <Typography variant="body1" sx={{fontWeight: "bold", textAlignt: "start", width :"150px", ml:2 }}>
                    {dataset.name}
                </Typography>
                <Typography variant="body2" sx={{textAlign:"left", fontWeight: "thin", opacity: "0.4", fontStyle: "italic", width:"40px" }}>
                    {boxesBackend.length > 0 ? "Prelabeled" : "Empty"}
                </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Button variant="contained" color="primary" size="small" onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDataset(dataset);
                    deleteAllBoxes(dataset);
                }}
                        sx={{
                            borderRadius: 2.5,
                            fontWeight: "bold"
                        }}
                >
                    Start labeling
                </Button>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleReviewMode();
                        handleSelectDataset(dataset);
                    }}
                    variant="outlined"
                    color="primary"
                    size="small"
                    disabled={boxesBackend.length === 0}
                    sx={{
                        borderRadius: 2.5,
                        fontWeight: "bold",
                        '&.Mui-disabled': {
                            color: 'text.disabled',
                            borderColor: 'rgba(0, 0, 0, 0.12)'
                        }
                    }}
                >
                    Review
                </Button>
                <Box onClick={(e) => e.stopPropagation()}>
                    <LongMenu datasetId={dataset.id!} handleDeleteDataset={handleDeleteDataset}/>
                </Box>
            </Box>
        </Card>
    );
}