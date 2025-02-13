import React, { createContext, useState, useContext, ReactNode } from 'react';
import {AnnotationBox} from "../types/AnnotationBox";

// Define the shape of our DrawModeContext state.
interface LabelingContextProps {
    drawMode: string;
    enableLabeling: boolean;
    selectedBox : AnnotationBox | null;
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

    return (
        <LabelingContext.Provider value={{ drawMode, setDrawMode, enableLabeling, setEnableLabeling, selectedBox, setSelectedBox }}>
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