import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";
import { AnnotationBox } from "../../../types/AnnotationBox";
import { useSettings } from "../../../context/SettingsContext";
import { useAppContext } from "../../../context/AppContext";
import { usePointerPosition } from "../../../context/PointerPositionContext";
import {computeOBBUsingSetFromPoints} from "../../../util/PCAUtil";

interface BrushingAnnotationProps {
    geometry: THREE.BufferGeometry;
    originalColors: Float32Array;
    setAnnotationBox: (box: AnnotationBox) => void;
}

const BrushingAnnotation: React.FC<BrushingAnnotationProps> = ({
                                                                   geometry,
                                                                   originalColors,
                                                                   setAnnotationBox,
                                                               }) => {
    // --- VIEW CONTROLS ---
    const [rot, setRot] = useState<[number, number]>([0, 0]);
    const [vert, setVert] = useState(0);
    const { pointSize } = useSettings();

    const {rotation} = useAppContext();

    // --- BRUSHING / SELECTION STATE ---
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [hoveredIndices, setHoveredIndices] = useState<Set<number>>(new Set());
    const [isBrushing, setIsBrushing] = useState(false);

    // Use the pointer position from the shared context as our brushing marker.
    const { pointerPosition } = usePointerPosition();

    // --- REFERENCES ---
    const groupRef = useRef<THREE.Group>(null);
    const pointsRef = useRef<THREE.Points>(null);

    // --- XR Controller ---
    const controller = useXRInputSourceState("controller", "right");

    // --- XR Scale factor and Brush Radius ---
    const xroriginScale = 5;
    const baseBrushRadius = 0.15;
    const effectiveBrushRadius = baseBrushRadius * xroriginScale;

    // Compute markerSize consistently for both display and selection logic.
    const markerSize = isBrushing
        ? effectiveBrushRadius * 0.5
        : effectiveBrushRadius * 0.6;

    const finishBrushing = useCallback(() => {
        setIsBrushing(false);
        setHoveredIndices(new Set());
        if (selectedIndices.size > 0 && groupRef.current) {
            const posAttr = geometry.getAttribute("position");
            const points: THREE.Vector3[] = [];
            const groupMatrix = groupRef.current.matrixWorld;
            selectedIndices.forEach((index) => {
                const localP = new THREE.Vector3(
                    posAttr.getX(index),
                    posAttr.getY(index),
                    posAttr.getZ(index)
                );
                const worldP = localP.applyMatrix4(groupMatrix);
                points.push(worldP);
            });
            const bbBox = computeOBBUsingSetFromPoints(points)
            setAnnotationBox({center: bbBox.center, size: bbBox.size, rotation: bbBox.rotation});
            setSelectedIndices(new Set());
        }
    }, [selectedIndices, geometry, setAnnotationBox]);

    /**
     * Pointer Handlers for Brushing
     */
    const handlePointerDown = useCallback((event: any) => {
        setIsBrushing(true);
    }, []);
    const handlePointerUp = useCallback((event: any) => {
        setIsBrushing(false);
    }, []);

    // Global pointerup handler to ensure isBrushing resets.
    useEffect(() => {
        const handleGlobalPointerUp = () => {
            setIsBrushing(false);
        };
        window.addEventListener("pointerup", handleGlobalPointerUp);
        return () => window.removeEventListener("pointerup", handleGlobalPointerUp);
    }, []);

    // Every frame, update hovered indices based on the pointer position.
    // Additionally, if brushing is active, add these hovered indices to selectedIndices.
    useFrame(() => {
        if (pointerPosition && groupRef.current) {
            const markerPos = new THREE.Vector3();
            pointerPosition.getWorldPosition(markerPos);

            const posAttr = geometry.getAttribute("position");
            const newHovered = new Set<number>();
            for (let i = 0; i < posAttr.count; i++) {
                const localPos = new THREE.Vector3(
                    posAttr.getX(i),
                    posAttr.getY(i),
                    posAttr.getZ(i)
                );
                const worldPos = localPos.clone().applyMatrix4(groupRef.current.matrixWorld);
                if (worldPos.distanceTo(markerPos) < markerSize) {
                    newHovered.add(i);
                }
            }
            setHoveredIndices(newHovered);

            if (isBrushing) {
                setSelectedIndices((prev) => {
                    const newSet = new Set(prev);
                    newHovered.forEach((idx) => newSet.add(idx));
                    return newSet;
                });
            }
        }
    });

    // Update point colors based on selection and hover state.
    useEffect(() => {
        const colorAttr = geometry.getAttribute("color");
        for (let i = 0; i < colorAttr.count; i++) {
            if (selectedIndices.has(i)) {
                colorAttr.setXYZ(i, 0, 1, 0); // green for selected
            } else if (hoveredIndices.has(i)) {
                colorAttr.setXYZ(i, 1, 0.5, 0); // orange for hovered
            } else {
                colorAttr.setXYZ(
                    i,
                    originalColors[i * 3],
                    originalColors[i * 3 + 1],
                    originalColors[i * 3 + 2]
                );
            }
        }
        colorAttr.needsUpdate = true;
    }, [hoveredIndices, selectedIndices, geometry, originalColors]);

    // XR Controller frame update to finish brushing with thumbstick.
    useFrame(() => {
        if (controller == null) return;
        const thumbstickState = controller.gamepad["xr-standard-thumbstick"];
        if (thumbstickState && thumbstickState.state === "pressed") {
            finishBrushing();
        }
    });

    return (
        <>
            <group
                ref={groupRef}
            >
                <points
                    ref={pointsRef}
                    geometry={geometry}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                >
                    <pointsMaterial vertexColors size={pointSize} />
                </points>
            </group>

            {/* Render a translucent 3D sphere as the brushing marker using the consistent markerSize */}
            {pointerPosition && (() => {
                const markerPos = new THREE.Vector3();
                pointerPosition.getWorldPosition(markerPos);
                return (
                    <mesh position={markerPos}>
                        <sphereGeometry args={[markerSize, 32, 32]} />
                        <meshBasicMaterial color="white" transparent opacity={0.3} />
                    </mesh>
                );
            })()}
        </>
    );
};

export default BrushingAnnotation;

