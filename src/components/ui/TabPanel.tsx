// src/components/TabPanel.tsx
import React from "react";
import { Box } from "@mui/material";

interface TabPanelProps {
    children: React.ReactNode;
    value: number;
    index: number;
}

export function TabPanel({ children, value, index, ...other }: TabPanelProps): JSX.Element {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}
