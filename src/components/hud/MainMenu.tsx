import {Root, Text, Image} from "@react-three/uikit";
import {Button, Card} from "@react-three/uikit-apfel";
import React from "react";
import {LabelingMenu} from "./LabelingMenu";
import {MainTitle} from "./MainTitle";
import {SettingsMenu} from "./SettingsMenu";
import {BoxLabelMenu} from "./BoxLabelMenu";
import {useHud} from "../../context/HudContext";

export function MainMenu() {
    const{isLabelingOpen} = useHud();
    const [isLabelingMenuOpen, setIsLabelingMenuOpen] = React.useState(false);
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = React.useState(false);

    function onClickBack() {
        setIsLabelingMenuOpen(false);
    }

    return (
        <Root>
            {isLabelingOpen ? (
                <BoxLabelMenu />
            ) : isLabelingMenuOpen ? (
                <LabelingMenu back={onClickBack} />
            ) : isSettingsMenuOpen ? (
                <SettingsMenu />
            ) : (
                <Card
                    borderRadius={32}
                    padding={28}
                    gap={8}
                    flexDirection="column"
                    style={{ cursor: "pointer", width: "350px" }}
                >
                    <MainTitle />
                    <Button onClick={() => setIsLabelingMenuOpen(true)} variant="rect" size="sm" platter>
                        <Text>Start Labeling</Text>
                    </Button>
                    <Button onClick={() => setIsSettingsMenuOpen(true)} variant="rect" size="sm" platter>
                        <Text>Settings</Text>
                    </Button>
                </Card>
            )}
        </Root>
    );
}