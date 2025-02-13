import { Button, Card } from "@react-three/uikit-apfel";
import { MainTitle } from "./MainTitle";
import { Text } from "@react-three/uikit";
import {LabelSpec} from "../../types/LabelSpec";
import {useLabelingMode} from "../../context/LabelingContext";
import {useBoxContext} from "../../context/BoxContext";
import {useHud} from "../../context/HudContext";

// JSON data containing the labels
const labelData : LabelSpec[] = [
        { id: 1, name: "Car" , color: "red"},
        { id: 2, name: "Tree" },
        { id: 3, name: "Truck", color: "green" },
    ];

export function BoxLabelMenu() {
    const {setIsLabelingOpen} = useHud();
    const {selectedBox} = useLabelingMode();
    const {addLabelToBox} = useBoxContext();

    // Helper function to group the labels into rows of 3
    const getRows = (labels : LabelSpec[], itemsPerRow = 3) => {
        const rows = [];
        for (let i = 0; i < labels.length; i += itemsPerRow) {
            rows.push(labels.slice(i, i + itemsPerRow));
        }
        return rows;
    };

    // Create rows from the JSON data
    const labelRows: LabelSpec[][] = getRows(labelData);

    // Generic handler for label button click
    const handleLabelClick = (label: LabelSpec) => {
       addLabelToBox(selectedBox!, label);
       setIsLabelingOpen(false);
    };

    // Dummy back handler
    const back = () => {
        console.log("Back button clicked");
    };

    return (
        <Card
            borderRadius={32}
            padding={28}
            gap={16}
            flexDirection="column"
            style={{ cursor: "pointer", width: "300px" }}
        >
            <MainTitle />
            <Text fontSize={10}>Choose a label</Text>

            {/* Generate rows of label buttons */}
            {labelRows.map((row, rowIndex) => (
                <Card
                    key={rowIndex}
                    flexDirection="row"
                    gap={16}
                    justifyContent="center"
                >
                    {row.map((option) => (
                        <Button
                            key={option.id}
                            onClick={() => handleLabelClick(option)}
                            variant="rect"
                            size="sm"
                            platter
                        >
                            <Text>{option.name}</Text>
                        </Button>
                    ))}
                </Card>
            ))}

            {/* Back button */}
            <Button onClick={back} variant="rect" size="sm" platter>
                <Text>Back</Text>
            </Button>
        </Card>
    );
}
