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
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddIcon from "@mui/icons-material/Add";
import { Label } from "../../types/Label";
import DeleteIcon from "@mui/icons-material/Delete";

interface LabelingTableProps {
    labelSpecs?: Label[];
    editMode: boolean;
    onSave: (updatedLabels: Label[]) => void;
    onBack: () => void;
    setEditMode: (editMode: boolean) => void;
}

export function LabelingTable({ labelSpecs, editMode, onSave, setEditMode, onBack }: LabelingTableProps) {
    const [labels, setLabels] = useState<Label[]>(labelSpecs || []);

    const handleEditChange = (index: number, field: keyof Label, value: string) => {
        setLabels((prev) =>
            prev.map((label, i) =>
                i === index ? { ...label, [field]: value } : label
            )
        );
    };

    const handleDeleteLabel = (index: number) => {
        setLabels((prev) => {
            const updatedLabels = prev.filter((_, i) => i !== index);
            return updatedLabels.map((label, i) => ({ ...label, id: i + 1 }));
        });
    };

    const handleAddLabel = () => {
        const newLabel: Label = {
            id: labels.length + 1,
            name: "Nieuw Label",
            description: "Beschrijving",
            attribute: "Attribuut",
            color: "#000000", // Standaard zwart
        };
        setLabels([...labels, newLabel]);
    };

    return (
        <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, boxShadow: 3, p: 2, width:"720px" }}>
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
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Naam</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Beschrijving</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Attribuut</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Kleur</TableCell>
                        {editMode && <TableCell sx={{ color: "white", fontWeight: "bold" }}>Acties</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {labels.map((label, index) => (
                        <TableRow key={label.id} sx={{ backgroundColor: index % 2 === 0 ? "#e3f2fd" : "white" }}>
                            <TableCell>{label.id}</TableCell>
                            <TableCell>
                                {editMode ? (
                                    <TextField value={label.name} onChange={(e) => handleEditChange(index, "name", e.target.value)} size="small" fullWidth />
                                ) : (
                                    label.name
                                )}
                            </TableCell>
                            <TableCell>
                                {editMode ? (
                                    <TextField value={label.description} onChange={(e) => handleEditChange(index, "description", e.target.value)} size="small" fullWidth />
                                ) : (
                                    label.description
                                )}
                            </TableCell>
                            <TableCell>
                                {editMode ? (
                                    <TextField value={label.attribute} onChange={(e) => handleEditChange(index, "attribute", e.target.value)} size="small" fullWidth />
                                ) : (
                                    label.attribute
                                )}
                            </TableCell>
                            <TableCell>
                                {editMode ? (
                                    <input
                                        type="color"
                                        value={label.color}
                                        onChange={(e) => handleEditChange(index, "color", e.target.value)}
                                        style={{ width: "50px", height: "30px", border: "none", cursor: "pointer" }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            backgroundColor: label.color,
                                            borderRadius: "50%",
                                            border: "1px solid #ccc",
                                        }}
                                    />
                                )}
                            </TableCell>
                            {editMode && (
                                <TableCell>
                                    <Button variant="contained" color="error" onClick={() => handleDeleteLabel(index)}>
                                        <DeleteIcon />
                                    </Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Box display="flex" justifyContent="center" gap={2} sx={{ mt: 2 }}>
                <Button variant="contained" color="secondary" onClick={onBack}>
                    Terug
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={async () => {
                        if (editMode) {
                            onSave(labels);
                        }
                        setEditMode(!editMode);
                    }}
                >
                    {editMode ? "Opslaan" : "Bewerk Labels"}
                </Button>
            </Box>
        </TableContainer>
    );
}