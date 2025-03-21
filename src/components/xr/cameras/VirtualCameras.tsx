import { Dataset } from "../../../types/Dataset";
import VirtualCameraView from "./VirtualCameraView";
import React, {useCallback, useEffect, useRef} from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

interface VirtualCamerasProps {
    dataset?: Dataset;
}

export const VirtualCameras: React.FC<VirtualCamerasProps> = ({ dataset }) => {
    return (
        <>
            {dataset?.images?.map((img, idx) => (
                <VirtualCameraView
                    key={idx}
                    id={`camera-${idx}`}
                    sampleImage={img}
                    egoPose={dataset?.egoPose}
                />
            ))}
        </>
    );
};

