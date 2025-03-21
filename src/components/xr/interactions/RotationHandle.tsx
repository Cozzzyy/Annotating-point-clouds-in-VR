import * as THREE from "three";
import { Handle } from "@react-three/handle";
import { useEffect, useRef, useState } from "react";
import { AnnotationBox } from "../../../types/AnnotationBox";
import { getEdgeMidpointsAndAxes } from "../AnnotationBoxMesh";
import { worldToLocal } from "../../../util/worldToLocal";

/**
 * Helper function that wraps an angle into the range [-π, π].
 * This is useful for avoiding large positive/negative values
 * when computing angular differences.
 * @param angle - The input angle (in radians).
 * @returns The angle, normalized to [-π, π].
 */
function wrapAngle(angle: number): number {
    while (angle < -Math.PI) angle += 2 * Math.PI;
    while (angle > Math.PI) angle -= 2 * Math.PI;
    return angle;
}

interface RotationHandleProps {
    /** The annotation box data, including center, size, and rotation. */
    box: AnnotationBox;

    /** An optional callback to update the box state in a parent component. */
    updateBox?: (updatedBox: AnnotationBox) => void;

    /** The index of this box, if needed for external tracking. */
    boxIndex?: number;

    /**
     * The axis around which this handle should allow rotation.
     * Typically one of: "x", "y", or "z".
     */
    axis: string;

    /**
     * The handle index (edge index) this rotation handle is attached to.
     * Each edge can be identified by a unique index in getEdgeMidpointsAndAxes.
     */
    handleIndex: number;
}

/**
 * The RotationHandle component attaches a draggable rotation handle
 * to an AnnotationBox, allowing the user to rotate the box around a
 * specified axis (e.g., Y-axis). It uses an invisible torus for raycasting
 * and a visible cylinder as the actual "handle" mesh.
 *
 * @param props - RotationHandleProps
 */
export function RotationHandle({
                                   box,
                                   updateBox,
                                   boxIndex,
                                   axis,
                                   handleIndex,
                               }: RotationHandleProps) {
    /**
     * References to the handle mesh and the invisible torus used for intersection tests.
     * Note that they can be null before the component mounts.
     */
    const meshRef = useRef<THREE.Mesh | null>(null);
    const torusRef = useRef<THREE.Mesh | null>(null);

    /** Whether the handle is currently hovered by the pointer. */
    const [isHovered, setIsHovered] = useState(false);

    /** Whether the user is currently dragging (rotating). */
    const [isDragging, setIsDragging] = useState(false);

    /** The handle’s radius and height, which depend on the box size. */
    const [handleRadius, setHandleRadius] = useState(0.05);
    const [handleHeight, setHandleHeight] = useState(0.3);

    /**
     * Refs that store data needed for the rotation logic:
     * - radiusRef: the radius of the ring from the box center.
     * - startingHandleAngleRef: the angle of the handle at drag start.
     * - initialBoxYawRef: the box's yaw rotation at drag start.
     * - continuousAngleRef: a running angle used for smoothing/unfolding angles across ±π.
     */
    const radiusRef = useRef(0);
    const startingHandleAngleRef = useRef(0);
    const initialBoxYawRef = useRef(0);
    const continuousAngleRef = useRef(0);

    // Compute the position of this handle (startPos) and how big the torus ring should be.
    const startPos = getEdgeHandlePosition(box, handleIndex);
    const torusRadius = startPos.distanceTo(box.center);

    /**
     * Effect: Recompute the handle's cylinder geometry (radius, height)
     * whenever the box dimensions change. This ensures the handle
     * scales appropriately with the box size.
     */
    useEffect(() => {
        const computedRadius = Math.min(box.size.x, box.size.y, box.size.z) * 0.06;
        const computedHeight = Math.min(box.size.x, box.size.y, box.size.z) * 0.5;

        const minRadius = 0.02; // never smaller than 0.02
        const minHeight = 0.05; // never smaller than 0.05

        setHandleRadius(Math.max(computedRadius, minRadius));
        setHandleHeight(Math.max(computedHeight, minHeight));
    }, [box.size.x, box.size.y, box.size.z]);

    /**
     * Effect: Position the handle mesh at the correct edge midpoint
     * and compute an initial angle whenever the box changes or
     * when dragging finishes.
     */
    useEffect(() => {
        if (!isDragging && meshRef.current) {
            const startPos = getEdgeHandlePosition(box, handleIndex);
            meshRef.current?.position.copy(startPos);

            // The angle from the box center to the startPos.
            startingHandleAngleRef.current = Math.atan2(
                startPos.z - box.center.z,
                startPos.x - box.center.x
            );

            // Convert that position into local space to find how far it is from the box center.
            const localPos = worldToLocal(startPos, box);
            radiusRef.current = Math.hypot(localPos.x, localPos.z);
        }
    }, [box.center, box.size, box.rotation, isDragging, handleIndex]);

    /**
     * Helper function to handle the ±π discontinuity. This ensures
     * angles don't suddenly jump from +3.14 to -3.14, but instead
     * continue accumulating smoothly.
     *
     * @param prevAngle - The previously recorded continuous angle.
     * @param newAngle - The newly computed raw angle from the box center to the intersection point.
     * @returns A continuous angle that doesn't jump across ±π.
     */
    function accumulateContinuousAngle(prevAngle: number, newAngle: number): number {
        let delta = newAngle - prevAngle;
        if (delta > Math.PI) {
            delta -= 2 * Math.PI;
        } else if (delta < -Math.PI) {
            delta += 2 * Math.PI;
        }
        return prevAngle + delta;
    }

    /**
     * Called by <Handle> whenever the user drags this rotation handle.
     * It updates the box's rotation based on the pointer intersection with
     * the invisible torus (torusRef).
     *
     * @param state - Provided by react-three/handle, containing drag state (first, last, etc.)
     * @param target - The object being dragged (meshRef.current).
     */
    function applyHandleMovement(state: any, target: THREE.Object3D) {
        // If either ref is missing, we can’t proceed.
        if (!meshRef.current || !torusRef.current) return;

        // On drag start
        if (state.first) {
            // Record the box's current yaw and the handle's initial angle.
            initialBoxYawRef.current = getAxisRotation(box.rotation, "y");
            const startPos = getEdgeHandlePosition(box, handleIndex);
            const initialAngle = Math.atan2(
                startPos.z - box.center.z,
                startPos.x - box.center.x
            );
            startingHandleAngleRef.current = initialAngle;
            continuousAngleRef.current = initialAngle; // Initialize our continuous angle
            setIsDragging(true);
            return;
        }

        // On drag end
        if (state.last) {
            setIsDragging(false);
            return;
        }

        // Perform a raycast to find where the pointer hits the invisible torus.
        const raycaster = new THREE.Raycaster();
        raycaster.ray.copy(state.event.ray);
        const intersects = raycaster.intersectObject(torusRef.current!, true);
        if (intersects.length === 0) return;

        // rawAngle: the direct angle from box center to the intersection point
        const intersectPoint = intersects[0].point;
        const rawAngle = Math.atan2(
            intersectPoint.z - box.center.z,
            intersectPoint.x - box.center.x
        );

        // "Unfold" the angle to avoid ±π discontinuities.
        const unfoldedAngle = accumulateContinuousAngle(continuousAngleRef.current, rawAngle);

        // Optionally smooth out small changes to avoid jitter.
        const smoothingFactor = 0.1;
        const smoothedAngle =
            continuousAngleRef.current + smoothingFactor * (unfoldedAngle - continuousAngleRef.current);

        // Update the continuous angle reference.
        continuousAngleRef.current = smoothedAngle;

        // Compute how far we’ve rotated from the handle's initial angle.
        const rawDeltaAngle = smoothedAngle - startingHandleAngleRef.current;
        // Optionally wrap to [-π, π].
        const deltaAngle = wrapAngle(rawDeltaAngle);

        // Compute the new yaw for the box by subtracting delta from the initial yaw.
        const newBoxYaw = initialBoxYawRef.current - deltaAngle;

        // Update the box's rotation in the parent if provided.
        if (updateBox) {
            updateBox({
                ...box,
                rotation: new THREE.Euler(0, newBoxYaw, 0),
            });
        }

        // Reposition the handle along the ring, so it visually follows the pointer.
        const newHandlePos = new THREE.Vector3(
            box.center.x + radiusRef.current * Math.cos(smoothedAngle),
            meshRef.current?.position.y,
            box.center.z + radiusRef.current * Math.sin(smoothedAngle)
        );
        target.position.copy(newHandlePos);
    }

    // Choose how the handle cylinder is oriented based on which axis we're rotating around.
    let cylinderRotation = new THREE.Euler();
    if (axis === "x") {
        cylinderRotation.set(0, 0, -Math.PI / 2);
    } else if (axis === "z") {
        cylinderRotation.set(Math.PI / 2, 0, 0);
    } else {
        cylinderRotation.set(0, 0, 0);
    }

    return (
        <>
            {/**
             * The <Handle> component from @react-three/handle
             * is what makes the mesh draggable. We pass it:
             * - targetRef: the mesh we want to move.
             * - apply: a function that updates rotation on drag.
             */}
            <Handle
                targetRef={meshRef}
                apply={applyHandleMovement}
            >
                <mesh
                    ref={meshRef}
                    rotation={cylinderRotation}
                    onPointerOver={() => setIsHovered(true)}
                    onPointerOut={() => setIsHovered(false)}
                >
                    <cylinderGeometry args={[handleRadius, handleRadius, handleHeight, 16]} />
                    <meshStandardMaterial
                        color={isDragging ? "green" : isHovered ? "orange" : "blue"}
                    />
                </mesh>
            </Handle>

            {/**
             * The torus is invisible but used for raycasting:
             * when the pointer intersects it, we can determine the angle
             * around the box center. It’s rotated 90° around X so it’s
             * in the horizontal plane.
             */}
            <mesh
                ref={torusRef}
                position={[box.center.x, box.center.y, box.center.z]}
                rotation={[Math.PI / 2, 0, 0]}
                visible={false}
            >
                <torusGeometry args={[torusRadius, 0.4, 16, 100]} />
                <meshBasicMaterial color={"red"} opacity={0} transparent={true} />
            </mesh>

            {/**
             * A smaller, visible torus that appears only when dragging,
             * giving the user feedback for the ring they're rotating along.
             */}
            {isDragging && (
                <mesh
                    position={[box.center.x, box.center.y, box.center.z]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <torusGeometry args={[torusRadius, 0.05, 16, 100]} />
                    <meshBasicMaterial color="yellow" />
                </mesh>
            )}
        </>
    );
}

/**
 * Finds the position in world space for the given edge index.
 * The position is based on the midpoint of that edge on the box,
 * then rotated by the box's current rotation.
 *
 * @param box - The AnnotationBox containing center, rotation, etc.
 * @param edgeIndex - Which edge’s midpoint we want.
 * @returns The 3D position of that edge’s midpoint in world coordinates.
 */
function getEdgeHandlePosition(box: AnnotationBox, edgeIndex: number): THREE.Vector3 {
    const allEdges = getEdgeMidpointsAndAxes(box);
    const edgeDef = allEdges.find((e) => e.index === edgeIndex);
    if (!edgeDef) return box.center.clone();

    // localOffset is the offset from the box center in the box’s local space.
    const localPos = edgeDef.localOffset.clone();
    localPos.applyEuler(box.rotation);
    return box.center.clone().add(localPos);
}

/**
 * Retrieves the rotation value for the specified axis from a THREE.Euler.
 *
 * @param e - The Euler rotation to read.
 * @param axis - "x", "y", or "z".
 * @returns The rotation (in radians) around that axis.
 */
function getAxisRotation(e: THREE.Euler, axis: string) {
    if (axis === "x") return e.x;
    if (axis === "y") return e.y;
    return e.z;
}









