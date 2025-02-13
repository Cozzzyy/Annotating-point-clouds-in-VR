// src/components/BinFileDropzone.tsx
import React from "react";
import { useDropzone } from "react-dropzone";
import { Box, Typography } from "@mui/material";

export function BinFileDropzone () {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "application/octet-stream": [".bin"] },
        multiple: false,
        onDrop: (acceptedFiles) => {
            console.log("Accepted files:", acceptedFiles);
            // Handle the dropped file(s) as needed.
        },
    });

    return (
        <Box
            {...getRootProps()}
            sx={{
                border: "2px dashed #aaa",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: isDragActive ? "#f0f0f0" : "inherit",
                transition: "background-color 0.2s ease",
            }}
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <Typography variant="body1">Drop the .bin file here...</Typography>
            ) : (
                <Typography variant="body1">
                    Drag and drop a <strong>.bin</strong> file here, or click to select a file
                </Typography>
            )}
        </Box>
    );
};
