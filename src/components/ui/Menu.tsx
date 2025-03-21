// src/components/Menu.tsx

import {Container, Typography} from "@mui/material";
import {DatasetsTab} from "./DatasetsTab";
import {getPredictions} from "../../service/boxesService";
import {Attribute} from "../../types/Attribute";


export function Menu() {

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
                flexDirection: "column",
                backgroundImage: 'url("./assets/background.jpg")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                pb:15
            }}
        >
            <Typography
                sx={{
                    padding: 2,
                    fontSize: 75,
                    textAlign: "center",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                    width: "650px",
                    fontWeight: "bold",
                    color: "black",
                    lineHeight: 1.2,
                }}
            >Annotating point clouds in VR</Typography>
            <Typography
                sx={{
                    opacity: 0.7,
                    padding: 2,
                    fontSize: 20,
                    textAlign: "center",
                    width: "650px",
                    fontWeight: "thin",
                    color: "black",
                    mb:3,
                }}
            >Upload your point cloud file and start embracing the 3D world of annotating point clouds </Typography>
            <DatasetsTab/>
        </Container>
    );
}
