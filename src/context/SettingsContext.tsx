import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of our context state
interface SettingsContextProps {
    pointSize: number;
    drawMode: string;
    setPointSize: (size: (prev :  number) => number) => void;
    setDrawMode: (mode: string) => void;
}

// Create the context with an undefined initial value
const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

// Define the provider's props type
interface SettingsProviderProps {
    children: ReactNode;
}

// Define the provider component without using React.FC
export function SettingsProvider({ children }: SettingsProviderProps): JSX.Element {
    const [pointSize, setPointSize] = useState<number>(0.015);
    const [drawMode, setDrawMode] = useState<string>("brushing");


    return (
        <SettingsContext.Provider value={{ pointSize, setPointSize, drawMode, setDrawMode }}>
            {children}
        </SettingsContext.Provider>
    );
}

// Custom hook for consuming the context
export function useSettings(): SettingsContextProps {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
