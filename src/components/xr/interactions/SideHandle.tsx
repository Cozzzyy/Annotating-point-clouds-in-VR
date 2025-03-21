import { useEffect, useRef, useState } from "react";
import { defaultApply } from "@pmndrs/handle";
import { Handle } from "@react-three/handle";
import * as THREE from "three";
import { AnnotationBox } from "../../../types/AnnotationBox";
import { worldToLocal } from "../../../util/worldToLocal";
import { localToWorld } from "../../../util/localToWorld";

interface SideHandleProps {
    /** Which face/side of the box this handle is attached to.
     *  Typically 0..5 for front/back/left/right/top/bottom. */
    handleIndex: number;

    /** Optional callback to update the box state when the user drags this handle. */
    updateBox?: (updatedBox: AnnotationBox) => void;

    /** The AnnotationBox data (center, size, rotation, etc.) we are modifying. */
    box: AnnotationBox;
}

/**
 * SideHandle is a draggable "plate" attached to one face of an AnnotationBox.
 * Users can grab and drag it along that face's normal to resize the box in that dimension.
 *
 * - It uses react-three/handle for the drag logic.
 * - The plate is sized and positioned based on which face (handleIndex) it's attached to.
 */
export function SideHandle({ handleIndex, updateBox, box }: SideHandleProps) {
    /**
     * A ref to the mesh for this handle. We pass it to <Handle> so it becomes draggable.
     */
    const meshRef = useRef<THREE.Mesh | null>(null);

    /** Whether this handle is currently being dragged. */
    const [isDragging, setIsDragging] = useState(false);

    /** Whether the pointer is currently hovering over this handle. */
    const [hovered, setHovered] = useState(false);

    /**
     * The dimensions (width, height, depth) of the handle "plate".
     * We update these based on the box's size and which face we're on.
     */
    const [plateSize, setPlateSize] = useState({ width: 0.1, height: 0.1, depth: 0.01 });

    /**
     * Effect: whenever the box size or handleIndex changes, recalculate the
     * handle plate’s dimensions. Different faces use different dimensions
     * (e.g., front/back uses x & y, left/right uses z & y, etc.).
     */
    useEffect(() => {
        let newPlateSize;
        switch (handleIndex) {
            // For front/back, use box’s x and y dimensions.
            case 0:
            case 1:
                newPlateSize = {
                    width: box.size.x * 0.3,
                    height: box.size.y * 0.3,
                    depth: Math.min(box.size.x, box.size.y, box.size.z) * 0.01,
                };
                break;
            // For left/right, use box’s z and y dimensions.
            case 2:
            case 3:
                newPlateSize = {
                    width: box.size.z * 0.3,
                    height: box.size.y * 0.3,
                    depth: Math.min(box.size.x, box.size.y, box.size.z) * 0.01,
                };
                break;
            // For top/bottom, use box’s x and z dimensions.
            case 4:
            case 5:
                newPlateSize = {
                    width: box.size.x * 0.3,
                    height: box.size.z * 0.3,
                    depth: Math.min(box.size.x, box.size.y, box.size.z) * 0.01,
                };
                break;
            default:
                newPlateSize = { width: 0.1, height: 0.1, depth: 0.01 };
        }
        setPlateSize(newPlateSize);
    }, [box.size, handleIndex]);

    /**
     * Returns the local offset in the box's coordinate space for a given face.
     * For example, handleIndex=0 (Front) is at -z half the box size, etc.
     */
    function getHandleOffset(index: number, boxSize: THREE.Vector3): THREE.Vector3 {
        switch (index) {
            case 0: return new THREE.Vector3(0, 0, -boxSize.z / 2); // Front
            case 1: return new THREE.Vector3(0, 0, boxSize.z / 2);  // Back
            case 2: return new THREE.Vector3(-boxSize.x / 2, 0, 0); // Left
            case 3: return new THREE.Vector3(boxSize.x / 2, 0, 0);  // Right
            case 4: return new THREE.Vector3(0, -boxSize.y / 2, 0); // Bottom
            case 5: return new THREE.Vector3(0, boxSize.y / 2, 0);  // Top
            default: return new THREE.Vector3(0, 0, 0);
        }
    }

    /**
     * Returns the local rotation (as a quaternion) so that the plate
     * is oriented flush with the corresponding face in the box’s local space.
     */
    function getHandleLocalRotation(index: number): THREE.Quaternion {
        let euler: THREE.Euler;
        switch (index) {
            case 0: // Front
                euler = new THREE.Euler(0, 0, 0);
                break;
            case 1: // Back
                euler = new THREE.Euler(0, Math.PI, 0);
                break;
            case 2: // Left
                euler = new THREE.Euler(0, Math.PI / 2, 0);
                break;
            case 3: // Right
                euler = new THREE.Euler(0, -Math.PI / 2, 0);
                break;
            case 4: // Bottom
                euler = new THREE.Euler(Math.PI / 2, 0, 0);
                break;
            case 5: // Top
                euler = new THREE.Euler(-Math.PI / 2, 0, 0);
                break;
            default:
                euler = new THREE.Euler(0, 0, 0);
        }
        return new THREE.Quaternion().setFromEuler(euler);
    }

    /**
     * Effect: whenever the box center/size/rotation or dragging state changes,
     * recalculate the handle's world position and rotation so it's flush with
     * the correct face of the box.
     */
    useEffect(() => {
        if (!meshRef.current) return;

        // 1. Compute the offset in local space for this face.
        const offsetLocal = getHandleOffset(
            handleIndex,
            new THREE.Vector3(box.size.x, box.size.y, box.size.z)
        );

        // 2. Rotate that offset by the box's current rotation to get world offset.
        const rotatedOffset = offsetLocal.clone().applyEuler(box.rotation);

        // 3. Final position = box center + rotated offset.
        const handleWorldPos = new THREE.Vector3().copy(box.center).add(rotatedOffset);

        // 4. Final rotation = box rotation * local handle rotation.
        const boxQuat = new THREE.Quaternion().setFromEuler(box.rotation);
        const localHandleQuat = getHandleLocalRotation(handleIndex);
        const finalQuat = boxQuat.clone().multiply(localHandleQuat);

        meshRef.current!.position.copy(handleWorldPos);
        meshRef.current!.quaternion.copy(finalQuat);
    }, [handleIndex, box.center, box.size, box.rotation, isDragging]);

    /**
     * applyHandleMovement: called by <Handle> on drag events.
     * We want to:
     * 1) Constrain the drag movement along the face normal,
     * 2) Update the box’s size and center accordingly.
     *
     * @param state - Provided by react-three/handle (drag state).
     * @param target - The mesh object being moved (meshRef.current).
     */
    const applyHandleMovement = (state: any, target: THREE.Object3D) => {
        if (!meshRef.current) return;

        // Start dragging
        if (state.first) {
            setIsDragging(true);
        }

        // Use the default drag logic from pmndrs/handle for basic translation
        defaultApply(state, target);

        // 1. Determine how far we’ve moved in world space.
        const currentPos = new THREE.Vector3();
        meshRef.current!.getWorldPosition(currentPos);
        const initialPos = state.initial.position; // position at drag start
        const movementVec = currentPos.clone().sub(initialPos);

        // 2. Figure out the face normal in local space.
        let localNormal: THREE.Vector3;
        switch (handleIndex) {
            case 0: localNormal = new THREE.Vector3(0, 0, -1); break; // Front
            case 1: localNormal = new THREE.Vector3(0, 0, 1); break;  // Back
            case 2: localNormal = new THREE.Vector3(-1, 0, 0); break; // Left
            case 3: localNormal = new THREE.Vector3(1, 0, 0); break;  // Right
            case 4: localNormal = new THREE.Vector3(0, -1, 0); break; // Bottom
            case 5: localNormal = new THREE.Vector3(0, 1, 0); break;  // Top
            default: localNormal = new THREE.Vector3(0, 0, 0);
        }

        // 3. Transform the local normal into world space by applying the box’s rotation.
        const boxQuat = new THREE.Quaternion().setFromEuler(box.rotation);
        const worldNormal = localNormal.clone().applyQuaternion(boxQuat).normalize();

        // 4. Project the movement vector onto that normal (so we only move along that axis).
        const movementAmount = movementVec.dot(worldNormal);
        const constrainedMovement = worldNormal.clone().multiplyScalar(movementAmount);

        // 5. Update the handle’s position to reflect that constrained movement.
        const newPos = initialPos.clone().add(constrainedMovement);
        target.position.copy(newPos);

        // 6. Reapply the handle's rotation so it remains flush with the face.
        const finalQuat = boxQuat.clone().multiply(getHandleLocalRotation(handleIndex));
        target.quaternion.copy(finalQuat);

        // 7. Convert the new position to the box’s local space so we can recalc the box size.
        const localWorldPos = worldToLocal(newPos, box);

        // 8. Construct localMin/localMax for the new box dimensions.
        const localMin = new THREE.Vector3(-box.size.x / 2, -box.size.y / 2, -box.size.z / 2);
        const localMax = new THREE.Vector3(box.size.x / 2, box.size.y / 2, box.size.z / 2);

        // Adjust the relevant axis based on which face is being dragged.
        if (handleIndex === 0) localMin.z = localWorldPos.z;  // front
        else if (handleIndex === 1) localMax.z = localWorldPos.z; // back
        else if (handleIndex === 2) localMin.x = localWorldPos.x; // left
        else if (handleIndex === 3) localMax.x = localWorldPos.x; // right
        else if (handleIndex === 4) localMin.y = localWorldPos.y; // bottom
        else if (handleIndex === 5) localMax.y = localWorldPos.y; // top

        // 9. Convert that into a Box3, then extract center & size in local space.
        const newBox = new THREE.Box3(localMin, localMax);
        const newLocalCenter = newBox.getCenter(new THREE.Vector3());
        const newLocalSize = newBox.getSize(new THREE.Vector3());

        // 10. Convert the local center back to world space for the final box center.
        const newWorldCenter = localToWorld(newLocalCenter, box);

        // 11. Update the box data in the parent if provided.
        if (updateBox) {
            updateBox({
                ...box,
                center: newWorldCenter,
                size: newLocalSize,
            });
        }

        // End dragging
        if (state.last) {
            setIsDragging(false);
        }
    };

    // Choose a color based on hover/drag states.
    const color = isDragging ? "blue" : hovered ? "lightblue" : "yellow";

    return (
        <Handle
            translate={{ x: true, y: true, z: true }} // allow translation in any axis
            targetRef={meshRef}
            apply={applyHandleMovement}
        >
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                {/* Plate geometry sized according to plateSize */}
                <boxGeometry args={[plateSize.width, plateSize.height, plateSize.depth]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </Handle>
    );
}





