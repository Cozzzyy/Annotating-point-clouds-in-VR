import {Root, Text} from "@react-three/uikit";
import {Button, Card} from "@react-three/uikit-apfel";
import {LabelingMenu} from "./LabelingMenu";
import {MainTitle} from "./MainTitle";
import {SettingsMenu} from "./SettingsMenu";
import {BoxLabelMenu} from "./BoxLabelMenu";
import { NavigateBoxes } from "./NavigateBoxes";
import {useHud} from "../../../context/HudContext";
import {useBoxContext} from "../../../context/BoxContext";
import {useAppContext} from "../../../context/AppContext";
import {useState} from "react";


export function MainMenu() {
    const{isLabelingOpen, setIsHudOpen, setShowOnboarding} = useHud();
    const [isLabelingMenuOpen, setIsLabelingMenuOpen] = useState(false);
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
    const [isNavigateMenuOpen, setIsNavigateMenuOpen] = useState(false);
    const [teleportTarget, setTeleportTarget] = useState<{ x: number; y: number; z: number } | null>(null);
    const {saveBoxesToBackend, loadBoxes, clearAllUnsavedBoxes} = useBoxContext();
    const {setExitVR} = useAppContext();



    function onClickBack() {
        setIsLabelingMenuOpen(false);
    }

    function closeLabelingMenu() {
        setIsLabelingMenuOpen(false);
    }

    function handleExitVR(){
        setExitVR();
        setIsHudOpen(false);
        clearAllUnsavedBoxes();
    }


    return (
        <Root>
            {isLabelingOpen ? (
                <BoxLabelMenu />
            ) : isLabelingMenuOpen ? (
                <LabelingMenu back={onClickBack} close={closeLabelingMenu} />
            ) : isSettingsMenuOpen ? (
                <SettingsMenu />
            ) : isNavigateMenuOpen ? (
                <NavigateBoxes onClose={() => setIsNavigateMenuOpen(false)} onTeleport={setTeleportTarget} />
            ) : (
                <Card
                    borderRadius={32}
                    padding={28}
                    gap={8}
                    flexDirection="column"
                    style={{ cursor: "pointer", width: "350px" }}
                >
                    <MainTitle />
                    <Button onClick={() => setIsLabelingMenuOpen(true)} variant="rect" size="sm" platter style={{ backgroundColor: 'blue' }}>
                        <Text>Start Labeling</Text>
                    </Button>
                    <Button onClick={ async () => {
                        loadBoxes();
                        setIsHudOpen(false);
                    }} variant="rect" size="sm" platter>
                        <Text>Ai Suggestions</Text>
                    </Button>
                    <Button onClick={() => setIsNavigateMenuOpen(true)} variant="rect" size="sm" platter>
                        <Text>Navigate Boxes</Text>
                    </Button>
                    <Button variant="rect" size="sm" platter onClick={() => {
                        setShowOnboarding(true);
                        setIsHudOpen(false)}}>
                        <Text>Help</Text>
                    </Button>
                    <Button onClick={() => setIsSettingsMenuOpen(true)} variant="rect" size="sm" platter>
                        <Text>Settings</Text>
                    </Button>
                    <Button onClick={ async () => {
                        saveBoxesToBackend();
                        handleExitVR();

                    }} variant="rect" size="sm" platter>
                        <Text>Exit and Save</Text>
                    </Button>
                    <Button onClick={() => {
                        handleExitVR();
                    }} variant="rect" size="sm" platter>
                        <Text>Exit</Text>
                    </Button>
                </Card>
            )}
        </Root>
    );
}