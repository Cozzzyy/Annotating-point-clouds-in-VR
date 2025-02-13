// src/components/UploadDatasetTab.tsx
import React from "react";
import { CardContent, Typography, CardActions, Button } from "@mui/material";
import { BinFileDropzone } from "./BinFileDropzone";

export function UploadDatasetTab () {
    return (
        <>
            <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                    Upload Dataset
                </Typography>
                <BinFileDropzone />
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button variant="contained" color="primary">
                    Upload
                </Button>
            </CardActions>
        </>
    );
}
