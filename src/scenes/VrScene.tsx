import {Environment, PerspectiveCamera} from "@react-three/drei";
import {createXRStore, useXRInputSourceState, XR} from "@react-three/xr";
import {Hud} from "../components/hud/Hud";
import {PCDModel} from "../components/xr/PCDModel";
import BrushingAnnotation from "../components/xr/annotations/BrushingAnnotation";
import {TwoPointAnnotation} from "../components/xr/annotations/TwoPointAnnotation";
import {AnnotationBoxMesh} from "../components/xr/AnnotationBoxMesh";
import {Canvas} from "@react-three/fiber";
import * as THREE from "three";
import React, { useState} from "react";
import {usePCDLoader} from "../hooks/usePCDLoader";
import {AnnotationBox} from "../types/AnnotationBox";
import {SettingsProvider} from "../context/SettingsContext";
import {Dataset} from "../types/Dataset";
import {CustomXRControllerLeft} from "../components/xr/interactions/CustomXRControllerLeft";
import {CustomXRControllerRight} from "../components/xr/interactions/CustomXRControllerRight";
import {Floor} from "../components/xr/Floor";
import {ToggleEditMode} from "../components/xr/interactions/ToggleEditMode";
import {useLabelingMode} from "../context/LabelingContext";
import {ToggleDrawingMode} from "../components/xr/interactions/ToggleDrawingMode";
import {useBoxContext} from "../context/BoxContext";

const xrStore = createXRStore({
    controller: { left: CustomXRControllerLeft, right: CustomXRControllerRight, teleportPointer: false  },
})


interface VrSceneProps {
    dataset: Dataset | null;
}

export function VrScene( {dataset}: VrSceneProps) {
    const [editMode, setEditMode] = useState<boolean>(false);
    const {drawMode, enableLabeling, setDrawMode} = useLabelingMode();
    const { boxes, addBox, updateBox } = useBoxContext();
    const [previousDrawMode, setPreviousDrawMode] = useState<string>("");
    const [pcdBounds, setPcdBounds] = useState<{ width: number; depth: number; center: THREE.Vector3 }>({
        width: 10, //
        depth: 10,
        center: new THREE.Vector3(0, 0, 0),
    });
    const {filteredGeometry, originalColors} = usePCDLoader(dataset!.url, 5, setPcdBounds);

    function handleBoxUpdate(index: number, updatedBox: AnnotationBox) {
       updateBox(index, updatedBox);
    }
    function handleAddBox(newBox: AnnotationBox) {
        addBox(newBox);
        setPreviousDrawMode(drawMode);
        setDrawMode("");
        setEditMode(true);

    }


    return (
        <SettingsProvider>
            <Canvas style={{width: "100vw", height: "100vh"}}>
                <color attach="background" args={["black"]}/>
                <PerspectiveCamera
                    makeDefault
                    position={[0, 10, 0]}
                    rotation={[-Math.PI / 10, 0, 0]}
                    fov={60}
                />
                <XR store={xrStore}>
                    <Hud/>
                    <ToggleEditMode editMode={editMode} setEditMode={setEditMode} setPreviousDrawMode={setPreviousDrawMode} previousDrawMode={previousDrawMode} setDrawMode={setDrawMode}/>
                    <ToggleDrawingMode/>
                    {(drawMode !== "brushing" || !enableLabeling)&& (
                        <PCDModel geometry={filteredGeometry} originalColors={originalColors}/>
                    )}

                    {(!editMode && enableLabeling) && (
                        <>
                            {drawMode === "brushing" && (
                                <BrushingAnnotation
                                    geometry={filteredGeometry}
                                    originalColors={originalColors}
                                    setAnnotationBox={handleAddBox}

                                />
                            )}
                            {drawMode === "twoPoint" && <TwoPointAnnotation setBox={handleAddBox}/>}
                        </>
                    )}

                    <Floor width={pcdBounds.width} depth={pcdBounds.depth} center={pcdBounds.center}/>
                    {boxes.map((box, index) => (
                        <AnnotationBoxMesh key={index}
                                           index={index}
                                           box={box}
                                           updateBox={handleBoxUpdate}
                                           color="blue"
                                           opacity={0.5}
                                           preview={false}
                                           editMode={editMode}
                        />
                    ))}
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
    )
}