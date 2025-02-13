import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";
import { AnnotationBox } from "../../../types/AnnotationBox";
import { useSettings } from "../../../context/SettingsContext";

interface BrushingAnnotationProps {
    geometry: THREE.BufferGeometry;
    originalColors: Float32Array;
    setAnnotationBox: (box: AnnotationBox) => void;
}

/**
 * BrushingAnnotation Component
 *
 * Enables brush-based selection on a point cloud.
 * Users can brush over points with pointer events, modify the view via keyboard controls,
 * and finalize the selection to compute an annotation box around the selected points.
 */
const BrushingAnnotation: React.FC<BrushingAnnotationProps> = ({
                                                                   geometry,
                                                                   originalColors,
                                                                   setAnnotationBox,
                                                               }) => {
    // --- VIEW CONTROLS ---
    const [rot, setRot] = useState<[number, number]>([0, 0]);
    const [vert, setVert] = useState(0);
    const { pointSize } = useSettings();

    // --- BRUSHING / SELECTION STATE ---
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [hoveredIndices, setHoveredIndices] = useState<Set<number>>(new Set());
    const [isBrushing, setIsBrushing] = useState(false);
    // Holds the current brush center (pointer intersection point)
    const [brushCenter, setBrushCenter] = useState<THREE.Vector3 | null>(null);

    // --- REFERENCES ---
    const groupRef = useRef<THREE.Group>(null);
    const pointsRef = useRef<THREE.Points>(null);
    // Ref for the circle (ring) so its orientation can be updated each frame
    const circleRef = useRef<THREE.Mesh>(null);

    // --- Access the camera for billboarding ---
    const { camera } = useThree();

    // --- (Optional) XR Controller for finishing brushing via button press ---
    const controller = useXRInputSourceState("controller", "right");

    // Update the circle so it always faces the camera
    useFrame(() => {
        if (circleRef.current) {
            circleRef.current.quaternion.copy(camera.quaternion);
        }
    });

    /**
     * Keyboard Controls Effect
     *
     * Listens for keydown events to modify view parameters:
     * - "z": increases vertical offset.
     * - Arrow keys and "K"/"L": adjust rotation.
     * - Space (" "): finalizes the brushing process by computing the annotation box.
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "z":
                    setVert((v) => v + 0.1);
                    break;
                case "ArrowLeft":
                    setRot(([x, y]) => [x, y - Math.PI / 16]);
                    break;
                case "ArrowRight":
                    setRot(([x, y]) => [x, y + Math.PI / 16]);
                    break;
                case "K":
                    setRot(([x, y]) => [x - Math.PI / 16, y]);
                    break;
                case "L":
                    setRot(([x, y]) => [x + Math.PI / 16, y]);
                    break;
                case " ": // Finish brushing and compute the annotation box.
                    finishBrushing();
                    break;
                default:
                    break;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndices, geometry]);

    /**
     * Finishes the brushing process and computes the annotation box.
     *
     * Stops the brushing mode, resets hovered indices, gathers world-space positions
     * of all selected points, calculates a bounding box around them, and passes the result
     * via the setAnnotationBox callback.
     */
    const finishBrushing = () => {
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

            // Log the points that are inside the annotation box:
            console.log("Points inside annotation box:", points);

            const box = new THREE.Box3().setFromPoints(points);
            const center = new THREE.Vector3();
            const size = new THREE.Vector3();
            box.getCenter(center);
            box.getSize(size);
            setAnnotationBox({ center, size });
            setSelectedIndices(new Set());
        }
    };

    /**
     * Overrides the default raycast method for point selection.
     *
     * Iterates over each point in the geometry, transforms it into world space,
     * and checks its distance from the ray. Points within a defined threshold are
     * registered as intersections.
     */
    useEffect(() => {
        if (pointsRef.current) {
            pointsRef.current.raycast = function (raycaster, intersects) {
                const threshold = 0.1;
                const geom = this.geometry;
                const positions = geom.getAttribute("position").array as Float32Array;
                const matrixWorld = this.matrixWorld;
                const ray = raycaster.ray;
                const localPoint = new THREE.Vector3();
                for (let i = 0; i < positions.length; i += 3) {
                    localPoint.set(positions[i], positions[i + 1], positions[i + 2]);
                    localPoint.applyMatrix4(matrixWorld);
                    const distance = ray.distanceToPoint(localPoint);
                    if (distance < threshold) {
                        const intersect = {
                            distance: ray.origin.distanceTo(localPoint),
                            point: localPoint.clone(),
                            index: i / 3,
                            object: this,
                        };
                        intersects.push(intersect);
                    }
                }
            };
        }
    }, [geometry]);

    // --- POINTER HANDLERS FOR BRUSHING ---

    // Define brushRadius and dotThreshold for point selection calculations.
    const brushRadius = 0.15;
    // Relax the dot product check by allowing a small negative value.
    const dotThreshold = -0.1;

    /**
     * Pointer Down Handler
     *
     * Activates brushing mode when the pointer is pressed.
     *
     * @param event - The pointer event.
     */
    const handlePointerDown = (event: any) => {
        setIsBrushing(true);
    };

    /**
     * Pointer Up Handler
     *
     * Deactivates brushing mode when the pointer is released.
     *
     * @param event - The pointer event.
     */
    const handlePointerUp = (event: any) => {
        setIsBrushing(false);
    };

    /**
     * Pointer Move Handler
     *
     * Updates the brush center based on pointer movement, computes which points are within
     * the brush radius, and updates the hovered and selected point indices accordingly.
     *
     * @param event - The pointer event containing intersection and ray data.
     */
    const handlePointerMove = (event: any) => {
        if (!groupRef.current) return;

        // Update the brush center based on the pointer event intersection
        const pointerWorldPoint = event.point;
        setBrushCenter(pointerWorldPoint.clone());

        // (Optional) Check for XR input source handedness:
        const handedness = event.internalPointer?.state?.inputSource?.handedness;
        if (handedness && handedness !== "right") return;

        const ray = event.ray;
        const posAttr = geometry.getAttribute("position");
        const newHovered = new Set<number>();

        for (let i = 0; i < posAttr.count; i++) {
            const localPos = new THREE.Vector3(
                posAttr.getX(i),
                posAttr.getY(i),
                posAttr.getZ(i)
            );
            const worldPos = localPos.clone().applyMatrix4(groupRef.current.matrixWorld);
            const distance = worldPos.distanceTo(pointerWorldPoint);
            const vecToPoint = worldPos.clone().sub(pointerWorldPoint);
            // Use the relaxed dot product condition here
            if (distance < brushRadius && vecToPoint.dot(ray.direction) > dotThreshold) {
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
    };

    /**
     * Effect to update point colors based on selection and hover state.
     *
     * Iterates over each point in the geometry and assigns a color based on:
     * - Green for selected points.
     * - Orange for hovered points.
     * - The original color for all other points.
     */
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

    /**
     * XR Controller Frame Update
     *
     * Checks the state of the XR controller's "a-button" on every frame.
     * If the button is pressed, it triggers the finishBrushing function to finalize selection.
     */
    useFrame(() => {
        if (controller == null) return;
        const thumbstickState = controller.gamepad["xr-standard-thumbstick"];
        if (thumbstickState && thumbstickState.state === "pressed") {
            finishBrushing();
        }
    });

    return (
        <>
            <group ref={groupRef} rotation={[-Math.PI / 2, rot[1], 0]} scale={[0.3, 0.3, 0.3]} position={[0, 2, 0]}>
                <points
                    ref={pointsRef}
                    geometry={geometry}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                >
                    <pointsMaterial vertexColors size={pointSize} />
                </points>
            </group>

            {/* Render a smooth circle (ring) around the brush center */}
            {brushCenter && (
                <mesh ref={circleRef} position={brushCenter}>
                    {/* Using 64 segments for a smooth outline */}
                    <ringGeometry args={[brushRadius - 0.01, brushRadius, 64]} />
                    <meshBasicMaterial color="white" side={THREE.DoubleSide} transparent opacity={0.7} />
                </mesh>
            )}
        </>
    );
};

export default BrushingAnnotation;
