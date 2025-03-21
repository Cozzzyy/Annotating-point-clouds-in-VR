import React, { createContext, useState, useContext, ReactNode } from 'react';
import {AnnotationBox} from "../types/AnnotationBox";
import {Label} from "../types/Label";
import * as THREE from "three";

// Define the shape of our DrawModeContext state.
interface LabelingContextProps {
    drawMode: string;
    enableLabeling: boolean;
    selectedBox : AnnotationBox | null;
    selectedLabel: Label | null;
    pointerMesh: React.MutableRefObject<THREE.Mesh | null>;
    setPointerMesh: (mesh: React.MutableRefObject<THREE.Mesh | null>) => void;
    setSelectedLabel: (label: Label | null) => void;
    setDrawMode: (mode: string) => void;
    setEnableLabeling: (enable: boolean) => void;
    setSelectedBox: (box: AnnotationBox | null) => void;
}

// Create the context with an undefined initial value.
const LabelingContext = createContext<LabelingContextProps | undefined>(undefined);

// Define the provider's props type.
interface LabelingProviderProps {
    children: ReactNode;
}


export function LabelingProvider({ children }: LabelingProviderProps): JSX.Element {
    const [drawMode, setDrawMode] = useState<string>("twoPoint");
    const [enableLabeling, setEnableLabeling] = useState<boolean>(true);
    const [selectedBox, setSelectedBox] = useState<AnnotationBox | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
    const pointerMesh = React.useRef<THREE.Mesh | null>(null);

    const setPointerMesh = (mesh: React.MutableRefObject<THREE.Mesh | null>) => {
        pointerMesh.current = mesh.current;
    }

    return (
        <LabelingContext.Provider value={{ drawMode, setDrawMode, enableLabeling, setEnableLabeling, selectedBox, setSelectedBox, selectedLabel, setSelectedLabel, pointerMesh, setPointerMesh }}>
            {children}
        </LabelingContext.Provider>
    );
}

// Custom hook for consuming the context.
export function useLabelingMode():  LabelingContextProps {
    const context = useContext(LabelingContext);
    if (context === undefined) {
        throw new Error('useDrawMode must be used within a DrawModeProvider');
    }
    return context;
}