import { Mesh } from "three";
import React, { createContext, useContext, useState } from 'react';

interface SpawnPointContextProps {
    pointerPosition: Mesh | null;
    setPointerPosition: React.Dispatch<React.SetStateAction<Mesh | null>>;
}

export const PointerPositionContext = createContext<SpawnPointContextProps>({
    pointerPosition: null,
    setPointerPosition: () => {}, // default no-op function
});

export const usePointerPosition = () => useContext(PointerPositionContext);

export const PointerPositionProvider = ({ children } : any) => {
    const [pointerPosition, setPointerPosition] = useState<Mesh | null>(null);

    return (
        <PointerPositionContext.Provider value={{ pointerPosition: pointerPosition, setPointerPosition: setPointerPosition }}>
            {children}
        </PointerPositionContext.Provider>
    );
};
