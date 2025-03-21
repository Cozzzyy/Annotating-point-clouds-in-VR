import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of our HudContext state.
interface HudContextProps {
    isHudOpen: boolean;
    isLabelingOpen: boolean;
    setIsHudOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLabelingOpen: React.Dispatch<React.SetStateAction<boolean>>;
    showOnboarding: boolean;
    setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with an undefined initial value.
const HudContext = createContext<HudContextProps | undefined>(undefined);

// Define the provider's props type.
interface HudProviderProps {
    children: ReactNode;
}

// Define the provider component.
export function HudProvider({ children }: HudProviderProps): JSX.Element {
    const [isHudOpen, setIsHudOpen] = useState<boolean>(false);
    const [isLabelingOpen, setIsLabelingOpen] = useState<boolean>(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    return (
        <HudContext.Provider value={{ isHudOpen, setIsHudOpen,isLabelingOpen, setIsLabelingOpen, showOnboarding, setShowOnboarding }}>
            {children}
        </HudContext.Provider>
    );
}

// Custom hook for consuming the context.
export function useHud(): HudContextProps {
    const context = useContext(HudContext);
    if (context === undefined) {
        throw new Error('useHud must be used within a HudProvider');
    }
    return context;
}