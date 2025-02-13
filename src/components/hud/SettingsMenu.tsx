import {Text} from "@react-three/uikit";
import {Button, Card} from "@react-three/uikit-apfel";
import React from "react";
import {MainTitle} from "./MainTitle";
import {useSettings} from "../../context/SettingsContext";

export function SettingsMenu() {

    const { pointSize, setPointSize } = useSettings();

    function increasePointSize() {
        setPointSize((prev) => prev * 1.1);
    }

    function decreasePointSize() {
        setPointSize((prev) => prev * 0.9);
    }

    return (
        <Card
            borderRadius={32}
            padding={28}
            gap={8}
            flexDirection="column"
            style={{ cursor: "pointer", width: "500px" }}
        >
            <MainTitle />
            <Text fontSize={10} marginLeft={15}>Settings</Text>
            <Card
                flexDirection={"row"}
                justifyContent={"space-between"}
                style={{backgroundColor: "#202020"}}
                padding={10}
            >
                <Text>Point size</Text>
                <Button onClick={decreasePointSize} variant="rect" size="sm" platter>
                    <Text fontSize={25}>-</Text>
                </Button>
                <Text color={"white"}>{pointSize.toFixed(2)}</Text>
                <Button variant="rect" size="sm" platter>
                    <Text onClick={increasePointSize} fontSize={25} >+</Text>
                </Button>

            </Card>
        </Card>
    );
}