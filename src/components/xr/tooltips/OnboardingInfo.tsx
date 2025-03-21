import { useThree, useFrame } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Root, Video, Text } from "@react-three/uikit";
import { Card } from "@react-three/uikit-apfel";
import { Button } from "@react-three/uikit-default";
import { ChevronRight } from '@react-three/uikit-lucide';

interface OboardingInfoProps {
    closeOnboarding: () => void;
}

export function OnboardingInfo({ closeOnboarding }: OboardingInfoProps) {
    const { camera } = useThree();
    const videoRef = useRef<THREE.Group>(null);
    const [src, setSrc] = React.useState<string>('https://storage.googleapis.com/vr_bucket_kdg29/tutorial_draw_a_box.mp4');

    useEffect(() => {
        if (videoRef.current) {
            const distance = 15;
            // Calculate position in front of camera
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(camera.quaternion);
            forward.multiplyScalar(distance);

            // Position the panel
            videoRef.current.position.copy(camera.position).add(forward);
            videoRef.current.position.y += 2;

            // Set rotation to match camera's horizontal rotation only
            const euler = new THREE.Euler(0, camera.rotation.y, 0, 'XYZ');
            videoRef.current.setRotationFromEuler(euler);
        }
    }, [camera]);

    function handleVideoChange(name: string) {
        if(name === 'DrawBox') {
            setSrc("https://storage.googleapis.com/vr_bucket_kdg29/tutorial_draw_a_box.mp4");
        }
        if(name === 'Movement') {
            setSrc("https://storage.googleapis.com/vr_bucket_kdg29/moving_tutorial.mp4");
        }
        if(name === 'HUD') {
            setSrc("https://storage.googleapis.com/vr_bucket_kdg29/hud_tutorial.mp4");
        }
    }


    return (
        <group ref={videoRef}>
            <Root>
                <Card borderRadius={32} padding={15} gap={8} flexDirection="column">
                    <Card borderRadius={32} padding={28} gap={8} flexDirection="column" width={1800}>
                        <Text fontSize={34}>
                            Welcome to the Segments.ai VR experience! This video will guide you through the basics of
                            the VR interface.
                        </Text>
                        <Card display={"flex"} flexDirection={"row"} gap={8}>
                            <Button variant={"default"} size="icon" width={350} height={80} onClick={() => handleVideoChange('Movement')}>
                                <ChevronRight width={35} height={35} />
                                <Text fontSize={25}>How do I move in the VR?</Text>
                            </Button>
                            <Button variant={"default"} size="icon" width={330} height={80}
                                    onPointerEnter={() => console.log('hover')} onClick={() => handleVideoChange('DrawBox')}>
                                <ChevronRight width={35} height={35} />
                                <Text fontSize={25}>How do I draw a box?</Text>
                            </Button>
                            <Button variant={"default"} size="icon" width={330} height={80} onClick={() => handleVideoChange('HUD')}>
                                <ChevronRight width={35} height={35} />
                                <Text fontSize={25}>How to use the hud?</Text>
                            </Button>
                            <Button variant={"default"} size="icon" width={280} height={80} marginLeft={50} onClick={closeOnboarding}>
                                <Text fontSize={25}>Close</Text>
                            </Button>
                        </Card>
                    </Card>
                    <Video src={src} loop autoplay width={1080} height={1080} crossOrigin={"anonymous"} />
                </Card>
            </Root>
        </group>
    );
}