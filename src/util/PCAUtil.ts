import * as THREE from 'three';
import PCA from 'ml-pca';
/**
 * Computes an oriented bounding box (OBB) around a set of 3D points,
 * restricting the rotation to a yaw (rotation around the Y-axis) only.
 *
 * The function uses a 2D PCA (on the XZ plane) to determine the yaw angle
 * that best aligns the bounding box with the principal axis of the point
 * distribution. It then:
 *
 * 1. Rotates the points so that the principal axis is aligned with the
 *    global X-axis (or Z-axis, if adjusted).
 * 2. Computes an axis-aligned bounding box (AABB) in that rotated space
 *    via `THREE.Box3.setFromPoints()`.
 * 3. Transforms the AABB center back by re-applying the yaw rotation,
 *    yielding an OBB with the correct center and yaw.
 *
 * @param {THREE.Vector3[]} points - The array of 3D points to enclose.
 * @returns {{ center: THREE.Vector3, size: THREE.Vector3, rotation: THREE.Euler }}
 *   An object containing:
 *   - `center`: The center of the OBB in world coordinates.
 *   - `size`: The full extents of the OBB along each axis.
 *   - `rotation`: A `THREE.Euler` representing the yaw rotation (with pitch and roll set to 0).
 */
export function computeOBBUsingSetFromPoints(points: THREE.Vector3[]): { center: THREE.Vector3, size: THREE.Vector3, rotation: THREE.Euler } {
    // Step 1: Compute yaw using PCA on the XZ plane
    const datasetXZ = points.map(point => [point.x, point.z]);
    const pca2D = new PCA(datasetXZ);
    const eigenvalues2D = pca2D.getExplainedVariance();
    const eigenvectors2D = pca2D.getEigenvectors();
    // Sort eigenvectors by explained variance (largest first)
    const sortedAxes = eigenvectors2D.map((vec, index) => ({
        axis: new THREE.Vector2(vec[0], vec[1]).normalize(),
        value: eigenvalues2D[index]
    })).sort((a, b) => b.value - a.value);

    // Use the primary axis to compute the yaw angle
    const mainAxis = sortedAxes[0].axis;
    let yawAngle = Math.atan2(mainAxis.y, mainAxis.x);

    // Optional: Adjust yaw if you want the main axis to align with Z instead of X
    // For instance: yawAngle -= Math.PI / 2;

    // Step 2: Create a rotation matrix to "unrotate" the points
    const invRotationMatrix = new THREE.Matrix4().makeRotationY(-yawAngle);

    // Step 3: Apply the inverse rotation to each point to align with the global axes
    const rotatedPoints: THREE.Vector3[] = points.map(p => p.clone().applyMatrix4(invRotationMatrix));

    // Step 4: Compute an axis-aligned bounding box (AABB) on the rotated points
    const aabb = new THREE.Box3().setFromPoints(rotatedPoints);
    const aabbCenter = aabb.getCenter(new THREE.Vector3());
    const aabbSize = aabb.getSize(new THREE.Vector3());

    // Step 5: Transform the center back to the original orientation
    const rotationMatrix = new THREE.Matrix4().makeRotationY(yawAngle);
    const obbCenter = aabbCenter.clone().applyMatrix4(rotationMatrix);

    // Return the oriented bounding box:
    // - obbCenter: the center in world space,
    // - aabbSize: full extents of the box,
    // - rotation: the yaw rotation (others are zero)
    return {
        center: obbCenter,
        size: aabbSize,
        rotation: new THREE.Euler(0, yawAngle, 0, 'YXZ')
    };
}





