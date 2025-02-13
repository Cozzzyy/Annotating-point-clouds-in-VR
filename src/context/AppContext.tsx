import React, { createContext, useState, useContext, ReactNode } from 'react';
import {Dataset} from "../types/Dataset";



// Define the shape of our AppContext state.
interface AppContextProps {
    selectedDataset: Dataset | null;
    setSelectedDataset: (dataset: Dataset | null) => void;
    enterVR: boolean;
    setEnterVR: (enter: boolean) => void;
}

// Create the context with an undefined initial value.
const AppContext = createContext<AppContextProps | undefined>(undefined);

// Define the provider's props type.
interface AppProviderProps {
    children: ReactNode;
}

// Create the AppProvider component.
export function AppProvider({ children }: AppProviderProps): JSX.Element {
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
    const [enterVR, setEnterVR] = useState(false);

    return (
        <AppContext.Provider value={{ selectedDataset, setSelectedDataset, enterVR, setEnterVR }}>
            {children}
        </AppContext.Provider>
    );
}

// Custom hook for consuming the context.
export function useAppContext(): AppContextProps {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
