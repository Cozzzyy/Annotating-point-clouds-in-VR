import {useXRInputSourceState} from "@react-three/xr";
import {useFrame} from "@react-three/fiber";
import {useBoxContext} from "../../../context/BoxContext";

interface ToggleEditModeProps {
    editMode: boolean;
    previousDrawMode: string;
    setEditMode: (editMode: boolean) => void;
    setDrawMode: (drawMode: string) => void;
    setPreviousDrawMode: (previousDrawMode: string) => void;

}

export function ToggleEditMode( {editMode, setEditMode, setPreviousDrawMode, setDrawMode, previousDrawMode}: ToggleEditModeProps) {
    const {clearEditMode} = useBoxContext();
    const controller = useXRInputSourceState("controller", "right");

    useFrame(() => {
        if (controller && controller?.object){
            if(controller?.gamepad?.["a-button"]?.state === "pressed" && editMode){
                setEditMode(false);
                setDrawMode(previousDrawMode);
                setPreviousDrawMode("");
                clearEditMode();
            }
        }
    });

    return null;

}