import { XRControllerComponent } from "@react-three/xr";
import { Tooltip } from "./ToolTip";
import { Vector3 } from "three";
import React from "react";
import { ToolTipData } from "../../../types/ToolTipData";

interface ToolTipsGroupProps {
    tooltipsData: ToolTipData[];
}

// Define constants for tooltip positions and alignments
const RIGHT_CONTROLLER_LEFT_POSITION = new Vector3(0.06, 0, 0);
const RIGHT_CONTROLLER_RIGHT_POSITION = new Vector3(-0.06, 0, 0);

const LEFT_CONTROLLER_LEFT_POSITION = new Vector3(-0.06, 0, 0);
const LEFT_CONTROLLER_RIGHT_POSITION = new Vector3(0.06, 0, 0);

export function ToolTipsGroup({ tooltipsData }: ToolTipsGroupProps) {



    function getTooltipPosition(tooltip: ToolTipData): Vector3 {
        if (tooltip.controller === "right") {
            if(tooltip.position === "left"){
                return updateYPosition(tooltip, RIGHT_CONTROLLER_RIGHT_POSITION);
            }else {
                return updateYPosition(tooltip, RIGHT_CONTROLLER_LEFT_POSITION);
            }
        } else {
            return tooltip.position === "right" ? updateYPosition(tooltip,LEFT_CONTROLLER_RIGHT_POSITION): updateYPosition(tooltip, LEFT_CONTROLLER_LEFT_POSITION);
        }
    }

    function getTooltipAlignment(tooltip: ToolTipData): "left" | "right" {
        if (tooltip.controller === "right") {
            return tooltip.position === "right" ? "left" : "right";
        } else {
            return tooltip.position === "left" ? "right" : "left";
        }
    }

    function updateYPosition(tooltip: ToolTipData, position: Vector3): Vector3 {
        if (tooltip.id === "xr-standard-thumbstick" && tooltip.controller === "right") {
            return new Vector3(position.x, -0.13, position.z);
        } else  if(tooltip.id === "xr-standard-thumbstick" && tooltip.controller === "left") {
            return new Vector3(position.x, 0.13, position.z);
        } else if(tooltip.id === "xr-standard-squeeze" && tooltip.controller === "left") {
            return new Vector3(0.05, 0, 0);
        } else if(tooltip.id === "xr-standard-squeeze" && tooltip.controller === "right") {
            return new Vector3(0, -0.015, 0.12);
        } else{
            return position;
        }


    }



    return (
        <>
            {tooltipsData.map((tooltip: ToolTipData) => (
                <XRControllerComponent key={tooltip.id} id={tooltip.id}>
                    <Tooltip text={tooltip.text} textPosition={getTooltipPosition(tooltip)} alignment={getTooltipAlignment(tooltip)}/>
                </XRControllerComponent>
            ))}
        </>
    );
}