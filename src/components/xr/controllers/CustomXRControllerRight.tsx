// CustomXRControllerRight.tsx
import React, {useEffect, useRef} from "react";
import {ToolTipData} from "../../../types/ToolTipData";
import {DefaultXRController, useXRInputSourceStateContext} from "@react-three/xr";
import {Mesh, Quaternion, Vector3} from "three";
import {usePointerPosition} from "../../../context/PointerPositionContext";
import {useFrame} from "@react-three/fiber";
import {ToolTipsGroup} from "../tooltips/ToolTipsGroup";
import {StatusDisplay} from "../tooltips/StatusDisplay";

const tooltipsData: ToolTipData[] = [
    {
        id: "a-button",
        text: "Press A-button to exit edit mode",
        position: "left",
        controller: "right"
    },
    {
        id: "b-button",
        text: "Enable/Disable drawing mode",
        position: "left",
        controller: "right"
    },
    {
        id: "xr-standard-thumbstick",
        text: "Turn arnoud and go up and down",
        position: "right",
        controller: "right"
    },
    {
        id: "xr-standard-trigger",
        text: "(Trigger) Drawing/Brushing a box or selecting a box in select mode",
        position: "right",
        controller: "right"
    },
];

export const CustomXRControllerRight = () => {
    const state = useXRInputSourceStateContext("controller");
    const spawnPointRef = useRef<Mesh>(null);
    const {setPointerPosition} = usePointerPosition();
    const [shouldShowTooltips, setShouldShowTooltips] = React.useState(false);

    useEffect(() => {
        if (spawnPointRef.current) {
            setPointerPosition(spawnPointRef.current);
        }
    }, [setPointerPosition]);

    useFrame((_, delta) => {
        if (!spawnPointRef.current || !state.gamepad) return;
        const thumbstickState = state.gamepad["xr-standard-thumbstick"];
        if (!thumbstickState) return;

        if (thumbstickState.state === "pressed") {
            spawnPointRef.current.position.z += (thumbstickState.yAxis ?? 0) * delta;
        }

        if (state.object) {
            const quaternion = state.object.getWorldQuaternion(new Quaternion());
            const controllerUp = new Vector3(0, 1, 0).applyQuaternion(quaternion);
            const worldUp = new Vector3(0, 1, 0);
            const angle = controllerUp.angleTo(worldUp);

            setShouldShowTooltips(angle > Math.PI * 0.48);
        }
    });
    return (
        <>
            <DefaultXRController />
            <mesh ref={spawnPointRef} name="spawnPoint" position={[0, 0, -1]} visible={false}>
                <sphereGeometry args={[0.02, 16, 16]}/>
                <meshStandardMaterial color="red"/>
            </mesh>
            {shouldShowTooltips ? (
                <ToolTipsGroup tooltipsData={tooltipsData} />
            ) : (
                <StatusDisplay />
            )}
        </>
    );
};
