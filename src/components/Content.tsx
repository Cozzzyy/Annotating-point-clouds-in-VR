// components/Content.tsx
import React from "react";
import {VrScene} from "../scenes/VrScene";
import {Menu} from "./ui/Menu";
import {useAppContext} from "../context/AppContext";
import {LabelingProvider} from "../context/LabelingContext";
import {HudProvider} from "../context/HudContext";
import {BoxProvider} from "../context/BoxContext";

export const Content = () => {
    const {enterVR, selectedDataset} = useAppContext();

    return (
        <>
            {!enterVR && <Menu/>}
            <HudProvider>
                <LabelingProvider>
                    <BoxProvider>
                        {enterVR && <VrScene dataset={selectedDataset}/>}
                    </BoxProvider>
                </LabelingProvider>
            </HudProvider>
        </>
    );
};
