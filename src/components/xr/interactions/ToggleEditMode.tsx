import {useXRInputSourceState} from "@react-three/xr";
import {useFrame} from "@react-three/fiber";

interface ToggleEditModeProps {
    editMode: boolean;
    previousDrawMode: string;
    setEditMode: (editMode: boolean) => void;
    setDrawMode: (drawMode: string) => void;
    setPreviousDrawMode: (previousDrawMode: string) => void;

}

export function ToggleEditMode( {editMode, setEditMode, setPreviousDrawMode, setDrawMode, previousDrawMode}: ToggleEditModeProps) {
    const controller = useXRInputSourceState("controller", "right");

    useFrame(() => {
        if (controller && controller?.object){
            if(controller?.gamepad?.["a-button"]?.state === "pressed" && editMode){
                setEditMode(false);
                setDrawMode(previousDrawMode);
                setPreviousDrawMode("");

            }
        }
    });

    return null;

}