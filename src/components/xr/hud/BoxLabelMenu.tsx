import { Button, Card } from "@react-three/uikit-apfel";
import { MainTitle } from "./MainTitle";
import { Text } from "@react-three/uikit";
import { Label } from "../../../types/Label";
import { useLabelingMode } from "../../../context/LabelingContext";
import { useBoxContext } from "../../../context/BoxContext";
import { useHud } from "../../../context/HudContext";
import { useAppContext } from "../../../context/AppContext";
import { useEffect, useRef, useState } from "react";

export function BoxLabelMenu() {
    const { selectedDataset } = useAppContext();
    const { setIsLabelingOpen, setIsHudOpen } = useHud();
    const { setSelectedLabel } = useLabelingMode();
    const { selectedBox, setSelectedBox } = useLabelingMode();
    const { addLabelToBox, deleteBox, setEditMode } = useBoxContext();

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            console.log("🎤 Starting voice recognition...");
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            console.log("Stopping voice recognition...");
            recognitionRef.current.onend = null; // Prevent auto-restart
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) {
            console.warn("⚠️ Speech recognition not supported.");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onstart = () => {
            console.log("🎤 Voice recognition started...");
            setIsListening(true);
        };

        recognition.onend = () => {
            console.warn("Voice recognition stopped.");
            setIsListening(false);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const spokenText = event.results[event.results.length - 1][0].transcript.trim();
            console.log("🗣️ Recognized:", spokenText);
            handleVoiceCommand(spokenText);
        };

        recognition.onerror = (event : any) => {
            console.error("Speech recognition error:", event.error);
        };

        recognitionRef.current = recognition;
        startListening(); // Start when component mounts

        return () => stopListening(); // Cleanup when unmounting
    }, []);

    const handleVoiceCommand = (spokenText: string) => {
        console.log("🎙️ Spraakherkenning herkende:", spokenText);

        // Normalize spoken text: Convert to lowercase & remove special characters
        const normalizedSpokenText = spokenText.toLowerCase().replace(/[^\w\s]/g, "");

        const matchedLabel = (selectedDataset?.labels || []).find((label) => {
            // Normalize label name: Convert to lowercase & replace special characters with space
            const normalizedLabelName = label.name.toLowerCase().replace(/[^\w\s]/g, " ");

            // Check if any word in the spoken text is in the label name
            return normalizedSpokenText.split(" ").some((word) => normalizedLabelName.includes(word));
        });

        if (matchedLabel) {
            console.log(`✅ Label herkend: ${matchedLabel.name}`);
            handleLabelClick(matchedLabel);
            stopListening(); // Stop listening once a label is selected
        } else {
            console.warn("Geen match gevonden.");
        }
    };



    const handleLabelClick = (label: Label) => {
        if (selectedBox) {
            addLabelToBox(selectedBox, label);
            setSelectedLabel(null);
            setSelectedBox(null);
        } else {
            setSelectedLabel(label);
        }
        setIsLabelingOpen(false);
        setIsHudOpen(false);
    };

    const handleDeleteBox = () => {
        if (selectedBox) {
            deleteBox(selectedBox!.id!);
            setIsLabelingOpen(false);
        }
    };

    const handleEditBox = () => {
        if (selectedBox) {
            setEditMode(selectedBox);
            setIsLabelingOpen(false);
        }
    }

    const getRows = (labels: Label[], itemsPerRow = 3) => {
        return labels.reduce((acc, label, index) => {
            if (index % itemsPerRow === 0) acc.push([]);
            acc[acc.length - 1].push(label);
            return acc;
        }, [] as Label[][]);
    };

    const labelRows = getRows(selectedDataset?.labels || []);

    return (
        <Card borderRadius={32} padding={28} gap={16} flexDirection="column" style={{ cursor: "pointer", width: "300px" }}>
            <MainTitle />
            <Text fontSize={10}>Choose a label</Text>

            {labelRows.map((row, rowIndex) => (
                <Card key={rowIndex} flexDirection="row" gap={8}>
                    {row.map((option) => (
                        <Button key={option.id} onClick={() => handleLabelClick(option)} variant="rect" size="sm" platter>
                            <Text>{option.name}</Text>
                        </Button>
                    ))}
                </Card>
            ))}
            <Button onClick={handleEditBox}  variant="rect" size="sm" platter>
                <Text>Edit</Text>
            </Button>
            <Button onClick={handleDeleteBox} variant="rect" size="sm" platter>
                <Text>Delete Box</Text>
            </Button>
        </Card>
    );
}
