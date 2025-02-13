import { useXRInputSourceState } from "@react-three/xr";
import { useLabelingMode } from "../../../context/LabelingContext";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export function ToggleDrawingMode() {
    const controller = useXRInputSourceState("controller", "right");
    const { enableLabeling, setEnableLabeling } = useLabelingMode();
    const wasPressed = useRef(false);

    useFrame(() => {
        if (controller && controller?.object) {
            const isPressed = controller?.gamepad?.["b-button"]?.state === "pressed";
            if (isPressed && !wasPressed.current) {
                setEnableLabeling(!enableLabeling);
            }
            wasPressed.current = isPressed;
        }
    });

    return null;
}