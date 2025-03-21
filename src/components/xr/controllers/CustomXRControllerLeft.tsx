import React, {useState} from "react";
import {ToolTipData} from "../../../types/ToolTipData";
import {DefaultXRController, DefaultXRInputSourceTeleportPointer, useXRInputSourceStateContext} from "@react-three/xr";
import {useFrame} from "@react-three/fiber";
import {Quaternion, Vector3} from "three";
import {ToolTipsGroup} from "../tooltips/ToolTipsGroup";

const tooltipsData: ToolTipData[] = [
    {
        id: "x-button",
        text: "Toggle the HUD",
        position: "right",
        controller: "left"
    },
    {
        id: "xr-standard-thumbstick",
        text: "Movement",
        position: "left",
        controller: "left"
    },
    {
        id: "xr-standard-trigger",
        text: "Hold to select a point to teleport, Release to teleport",
        position: "left",
        controller: "left"
    },
];

export const CustomXRControllerLeft = ({children}: any) => {
    const state = useXRInputSourceStateContext("controller");
    const [showTooltips, setShowTooltips] = useState(false);

    useFrame((_, delta) => {

        if (state.object) {
            const quaternion = state.object.getWorldQuaternion(new Quaternion());
            const controllerUp = new Vector3(0, 1, 0).applyQuaternion(quaternion);
            const worldUp = new Vector3(0, 1, 0);
            const angle = controllerUp.angleTo(worldUp);

            setShowTooltips(angle > Math.PI * 0.48);

        }
    });


    return (
        <>
            <DefaultXRController/>
            <DefaultXRInputSourceTeleportPointer />
            {showTooltips && <ToolTipsGroup tooltipsData={tooltipsData}/>}
        </>
    );
};