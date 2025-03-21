import { Card, Button } from "@react-three/uikit-apfel";
import { Text } from "@react-three/uikit";
import { useBoxContext } from "../../../context/BoxContext";
import { useAppContext } from "../../../context/AppContext";
import { useHud } from "../../../context/HudContext";

interface NavigateBoxesProps {
    onClose: () => void;
    onTeleport: (position: { x: number; y: number; z: number }) => void;
}

export function NavigateBoxes({ onClose, onTeleport }: NavigateBoxesProps) {
    const { boxes, setBoxTeleportation } = useBoxContext();
    const { setIsHudOpen } = useHud();

    const onSelectBox = (box) => {
        console.log("Box selected:", box);
        if (box.center) {
            const offsetDistance = 2; // Hoeveel meter ervoor je wilt teleporteren

            // global coordinates
            const teleportPosition = {
                x: box.center.x + offsetDistance, //links rechts
                y: box.center.y - 4, //hoogte
                z: box.center.z + offsetDistance // voor achter
            };

            console.log("Teleporting to:", teleportPosition);
            setBoxTeleportation(teleportPosition);
            setIsHudOpen(false);
        }
    };

    return (
        <Card
            borderRadius={32}
            padding={28}
            gap={8}
            flexDirection="column"
            style={{ cursor: "pointer", width: "350px" }}
        >
            <Text fontSize={14}>Navigate Boxes</Text>
            {boxes.length > 0 ? (
                boxes.map((box, index) => (
                    <Button key={box.id} variant="rect" size="sm" platter onClick={() => onSelectBox(box)}>
                        <Text>
                            {index + 1}. {box.label ? box.label.name : "No Label"}
                        </Text>
                    </Button>
                ))
            ) : (
                <Text>No boxes available</Text>
            )}
            <Button onClick={onClose} variant="rect" size="sm" platter>
                <Text>Back</Text>
            </Button>
        </Card>
    );
}
