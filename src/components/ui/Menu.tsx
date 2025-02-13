// src/components/Menu.tsx
import React, {useState} from "react";
import { Container, Card, CardHeader, Tabs, Tab } from "@mui/material";
import { TabPanel } from "./TabPanel";
import { DatasetsTab } from "./DatasetsTab";
import { UploadDatasetTab } from "./UploadDatasetTab";
import {Dataset} from "../../types/Dataset";

export function Menu () {
    const [tabIndex, setTabIndex] = useState<number>(0);


    const datasets: Dataset[] = [
        {
            name: "Segments.ai testing dataset",
            url: "./assets/test3.pcd.bin",
            labelSpecs: [
                { id: 1, name: "Car", description: "A vehicle with four wheels", attribute: "Vehicle" },
                { id: 2, name: "Person", description: "A human being", attribute: "Human" },
                { id: 3, name: "Tree", description: "A tall plant with a trunk", attribute: "Nature" },
            ],
        },
        {
            name: "City Street Dataset",
            url: "./assets/city_street.pcd.bin",
            labelSpecs: [
                { id: 4, name: "Bicycle", description: "A two-wheeled vehicle", attribute: "Vehicle" },
                { id: 5, name: "Traffic Light", description: "A signal light for traffic control", attribute: "Infrastructure" },
                { id: 6, name: "Pedestrian", description: "A person walking", attribute: "Human" },
            ],
        },
        {
            name: "Highway Dataset",
            url: "./assets/highway.pcd.bin",
            labelSpecs: [
                { id: 7, name: "Truck", description: "A large motor vehicle", attribute: "Vehicle" },
                { id: 8, name: "Road Sign", description: "A sign providing information to drivers", attribute: "Infrastructure" },
                { id: 9, name: "Motorcycle", description: "A two-wheeled motor vehicle", attribute: "Vehicle" },
            ],
        },
        {
            name: "Forest Path Dataset",
            url: "./assets/forest_path.pcd.bin",
            labelSpecs: [
                { id: 10, name: "Bush", description: "A small shrub-like plant", attribute: "Nature" },
                { id: 11, name: "Rock", description: "A large piece of stone", attribute: "Nature" },
                { id: 12, name: "Animal", description: "A non-human living being", attribute: "Wildlife" },
            ],
        },
        {
            name: "Indoor Office Dataset",
            url: "./assets/indoor_office.pcd.bin",
            labelSpecs: [
                { id: 13, name: "Desk", description: "A table used for work", attribute: "Furniture" },
                { id: 14, name: "Chair", description: "A piece of furniture to sit on", attribute: "Furniture" },
                { id: 15, name: "Computer", description: "An electronic device for computing", attribute: "Electronics" },
            ],
        },
    ];



    const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
        setTabIndex(newValue);
    };

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                width: "100vw",
                height: "100vh", // Full viewport height
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #ece9e6, #ffffff)", // Modern gradient background
            }}
        >
            <Card
                sx={{
                    width: "850px",    // Larger card width
                    minHeight: "600px", // Larger card height
                    borderRadius: 2,
                    boxShadow: 3,
                    overflow: "hidden",
                }}
            >
                <CardHeader
                    title="Annotating Cloud Points in VR"
                    titleTypographyProps={{ align: "center", variant: "h5" }}
                    sx={{ backgroundColor: "#f5f5f5" }}
                />
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Datasets" id="tab-0" aria-controls="tabpanel-0" />
                    <Tab label="Upload Dataset" id="tab-1" aria-controls="tabpanel-1" />
                </Tabs>
                <TabPanel value={tabIndex} index={0}>
                    <DatasetsTab datasets={datasets} />
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                    <UploadDatasetTab/>
                </TabPanel>
            </Card>
        </Container>
    );
};
