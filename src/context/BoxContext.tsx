import React, { createContext, useContext, useState } from "react";
import {AnnotationBox} from "../types/AnnotationBox";
import {LabelSpec} from "../types/LabelSpec";



interface BoxContextType {
    boxes: AnnotationBox[];
    addBox: (newBox: Omit<AnnotationBox, "id">) => void;
    updateBox: (index: number, updatedBox: AnnotationBox) => void;
    addLabelToBox: (box: AnnotationBox, label: LabelSpec) => void;
    // You can add more functions here (e.g., updateBox, removeBox)
}

const BoxContext = createContext<BoxContextType | undefined>(undefined);

export const BoxProvider: React.FC<React.PropsWithChildren<{}>> = ({
                                                                       children,
                                                                   }) => {
    const [boxes, setBoxes] = useState<AnnotationBox[]>([]);

    const addBox = (newBox: Omit<AnnotationBox, "id">) => {
        setBoxes((prevBoxes) => {
            // Generate a random number between 0 and 999999 as the initial ID.
            let newId = Math.floor(Math.random() * 1000000);

            // Check for duplicates and generate a new one if necessary.
            while (prevBoxes.some((box) => box.id === newId)) {
                newId = Math.floor(Math.random() * 1000000);
            }

            const boxWithId: AnnotationBox = {
                ...newBox,
                id: newId,
            };

            return [...prevBoxes, boxWithId];
        });
    };

    const updateBox = (index: number, updatedBox: AnnotationBox) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box, i) => (i === index ? updatedBox : box))
        );
    };

    const addLabelToBox = (box: AnnotationBox, label: LabelSpec) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((b) => (b.id === box.id ? { ...b, label } : b))
        );
    };

    return (
        <BoxContext.Provider value={{ boxes, addBox, updateBox, addLabelToBox }}>
            {children}
        </BoxContext.Provider>
    );
};

export const useBoxContext = () => {
    const context = useContext(BoxContext);
    if (!context) {
        throw new Error("useBoxContext must be used within a BoxProvider");
    }
    return context;
};
