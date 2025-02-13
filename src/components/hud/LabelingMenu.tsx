import {Button, Card} from "@react-three/uikit-apfel";
import {Root, Text} from "@react-three/uikit";
import React from "react";
import {MainTitle} from "./MainTitle";
import {useLabelingMode} from "../../context/LabelingContext";

interface LabelingMenuProps {
    back: () => void;
}

export function LabelingMenu ({ back }: LabelingMenuProps) {

    const {drawMode , setDrawMode} = useLabelingMode();

    function handleBrushing() {
        setDrawMode("brushing");
    }

    function handleTwoPointDraggable() {
        setDrawMode("twoPoint");
        console.log(drawMode);
    }

    return (
            <Card
                borderRadius={32}
                padding={28}
                gap={8}
                flexDirection="column"
                style={{ cursor: "pointer", width: "250px" }}
            >
                <MainTitle/>
                <Text fontSize={10}>Choose the type of annotation</Text>
                <Button onClick={handleBrushing} variant="rect" size="sm" platter>
                    <Text>Brushing</Text>
                </Button>
                <Button onClick={handleTwoPointDraggable} variant="rect" size="sm" platter>
                    <Text>Two Point Draggable</Text>
                </Button>
                <Button onClick={back} on variant="rect" size="sm" platter>
                    <Text>Back</Text>
                </Button>
            </Card>
    );
}