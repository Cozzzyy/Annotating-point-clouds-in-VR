import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
} from "@mui/material";
import { LabelSpec } from "../../types/LabelSpec";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddIcon from "@mui/icons-material/Add";

interface LabelingTableProps {
    labelSpecs: LabelSpec[];
    editMode: boolean; // Nieuw: Staat om te bewerken
}

export function LabelingTable({ labelSpecs, editMode }: LabelingTableProps) {
    const [labels, setLabels] = useState(labelSpecs);

    const handleEditChange = (id: number, field: keyof LabelSpec, value: string) => {
        setLabels((prev) =>
            prev.map((label) => (label.id === id ? { ...label, [field]: value } : label))
        );
    };

    const handleAddLabel = () => {
        const newLabel: LabelSpec = {
            id: labels.length + 1,
            name: "New Label",
            description: "Enter description",
            attribute: "Enter attribute",
        };
        setLabels([...labels, newLabel]);
    };

    return (
        <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, overflow: "hidden", boxShadow: 3, p: 2 }}>
            {/* Titel met icoon en "Label Toevoegen" knop */}
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" align="left" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ListAltIcon sx={{ fontSize: 28, color: "#42a5f5" }} />
                    Labeling Specification
                </Typography>
                {editMode && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddLabel}>
                        Label Toevoegen
                    </Button>
                )}
            </Box>

            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: "#1976d2" }}>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Description</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Attribute</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {labels.map((spec, index) => (
                        <TableRow key={spec.id} sx={{ backgroundColor: index % 2 === 0 ? "#e3f2fd" : "white" }}>
                            <TableCell>{spec.id}</TableCell>
                            <TableCell>
                                {editMode ? (
                                    <TextField
                                        value={spec.name}
                                        onChange={(e) => handleEditChange(spec.id, "name", e.target.value)}
                                        size="small"
                                        fullWidth
                                    />
                                ) : (
                                    spec.name
                                )}
                            </TableCell>
                            <TableCell>
                                {editMode ? (
                                    <TextField
                                        value={spec.description}
                                        onChange={(e) => handleEditChange(spec.id, "description", e.target.value)}
                                        size="small"
                                        fullWidth
                                    />
                                ) : (
                                    spec.description
                                )}
                            </TableCell>
                            <TableCell>
                                {editMode ? (
                                    <TextField
                                        value={spec.attribute}
                                        onChange={(e) => handleEditChange(spec.id, "attribute", e.target.value)}
                                        size="small"
                                        fullWidth
                                    />
                                ) : (
                                    spec.attribute
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
