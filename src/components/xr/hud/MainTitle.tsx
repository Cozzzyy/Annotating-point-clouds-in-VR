import {Image, Text} from "@react-three/uikit";
import {Card} from "@react-three/uikit-apfel";
import React from "react";

export function MainTitle() {
    return (
        <Card
            flexDirection={"row"}
            borderRadius={15}
        >
            <Image src="./assets/logo/Icon.png" width={40} height={60}/>
            <Text fontSize={32} marginLeft={15}>Segments.ai</Text>
        </Card>
    );
}