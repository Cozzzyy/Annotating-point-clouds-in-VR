import React, {useEffect, useState} from "react";
import { Environment } from "@react-three/drei";
import { createXRStore, XR } from "@react-three/xr";
import { Hud } from "../components/xr/hud/Hud";
import { PCDModel } from "../components/xr/PCDModel";
import BrushingAnnotation from "../components/xr/annotations/BrushingAnnotation";
import { TwoPointAnnotation } from "../components/xr/annotations/TwoPointAnnotation";
import { AnnotationBoxMesh } from "../components/xr/AnnotationBoxMesh";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { usePCDLoader } from "../hooks/usePCDLoader";
import { AnnotationBox } from "../types/AnnotationBox";
import { SettingsProvider } from "../context/SettingsContext";
import { Dataset } from "../types/Dataset";
import { Floor } from "../components/xr/Floor";
import { ToggleEditMode } from "../components/xr/interactions/ToggleEditMode";
import { useLabelingMode } from "../context/LabelingContext";
import { ToggleDrawingMode } from "../components/xr/interactions/ToggleDrawingMode";
import { useBoxContext } from "../context/BoxContext";
import {

    convertWebXRToBackendCoordinate, getYawFromEuler
} from "../util/coordConverter";
import VirtualCameraView from "../components/xr/cameras/VirtualCameraView";
import {VirtualCameras} from "../components/xr/cameras/VirtualCameras";
import {useHud} from "../context/HudContext";
import {OnboardingInfo} from "../components/xr/tooltips/OnboardingInfo";

interface VrSceneProps {
    dataset: Dataset | null;
    xrStore: ReturnType<typeof createXRStore>;
}

export function VrScene({dataset, xrStore}: VrSceneProps) {
    const [editMode, setEditMode] = useState<boolean>(false);
    const {drawMode, enableLabeling, setDrawMode} = useLabelingMode();
    const {boxes, addBox, updateBox} = useBoxContext();
    const [teleportPosition, setTeleportPosition] = useState<{ x: number; y: number; z: number } | null>(null);
    const [previousDrawMode, setPreviousDrawMode] = useState<string>("");
    const [pcdBounds, setPcdBounds] = useState<{ width: number; depth: number; center: THREE.Vector3 }>({
        width: 10,
        depth: 10,
        center: new THREE.Vector3(0, 0, 0),
    });
    const {filteredGeometry, originalColors} = usePCDLoader(dataset!.url, dataset, 1, setPcdBounds);
    const {showOnboarding, setShowOnboarding} = useHud();

    // If a boxes are editable we need to set the edit mode to true
    useEffect(() => {
        if (boxes.some((box) => box.editable)) {
            handleEditMode();
        }
    }, [boxes]);



    function handleBoxUpdate(updatedBox: AnnotationBox) {
        const convertedboxMidPoint = convertWebXRToBackendCoordinate({
            x: updatedBox.center.x, // Offset from egoPose
            y: updatedBox.center.y,
            z: updatedBox.center.z,
        });
        convertedboxMidPoint.add(dataset?.egoPose?.position!);
        updateBox(updatedBox);
    }

    function handleEditMode(){
        if(drawMode != "") {
            setPreviousDrawMode(drawMode);
            setDrawMode("");
            setEditMode(true);
        }
    }

    function handleAddBox(newBox: AnnotationBox) {
        addBox(newBox);
        handleEditMode();
    }

    function handleOnboardingClose() {
        setShowOnboarding(false);
    }

    return (
        <SettingsProvider>
            <Canvas style={{width: "100vw", height: "100vh"}}>
                <color attach="background" args={["black"]}/>
                <XR store={xrStore}>
                    <Hud/>
                    <ToggleEditMode
                        editMode={editMode}
                        setEditMode={setEditMode}
                        setPreviousDrawMode={setPreviousDrawMode}
                        previousDrawMode={previousDrawMode}
                        setDrawMode={setDrawMode}
                    />
                    <ToggleDrawingMode/>
                    {(drawMode !== "brushing" || !enableLabeling) && <PCDModel geometry={filteredGeometry}/>}
                    {(!editMode && enableLabeling) && (
                        <>
                            {drawMode === "brushing" && (
                                <BrushingAnnotation geometry={filteredGeometry} originalColors={originalColors}
                                                    setAnnotationBox={handleAddBox}/>
                            )}
                            {drawMode === "twoPoint" && <TwoPointAnnotation setBox={handleAddBox}/>}
                        </>
                    )}
                    <Floor showOnboarding={showOnboarding}/>

                    {showOnboarding && <OnboardingInfo closeOnboarding={handleOnboardingClose}/>}


                    {boxes.map((box) => (
                        <AnnotationBoxMesh
                            key={box.id}
                            box={box}
                            updateBox={handleBoxUpdate}
                            color="blue"
                            opacity={0.5}
                            preview={false}
                            editMode={editMode}
                        />
                    ))}
                    {/* Now we plop our images into the scene */}

                    {!showOnboarding && <VirtualCameras dataset={dataset!}/>}
                </XR>
                <Environment preset="sunset"/>
            </Canvas>
            <div
                style={{
                    position: "fixed",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    pointerEvents: "auto",
                    zIndex: 10,
                }}
            >
                <button onClick={() => xrStore.enterVR()} style={{fontSize: "20px", padding: "8px 16px"}}>
                    Enter VR
                </button>
            </div>
        </SettingsProvider>
    );
}