import * as THREE from "three";
import { useRef, useEffect } from "react";

interface LineSegmentProps {
    start: THREE.Vector3;
    end: THREE.Vector3;
    color?: string;
}

/**
 * A minimal R3F component that shows a line from "start" to "end"
 * using <primitive object={...} /> to host a Three.js Line instance.
 */
export function LineSegment({ start, end, color = "yellow" }: LineSegmentProps) {
    // We'll store the THREE.Line in this ref
    const lineRef = useRef<THREE.Line | null>(null);

    useEffect(() => {
        // 1. Create geometry & material once
        const geometry = new THREE.BufferGeometry();
        // We have 2 points, so 2 * 3 = 6 floats
        const positions = new Float32Array(6);
        // Make a BufferAttribute with itemSize=3 so each point is [x,y,z]
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.LineBasicMaterial({ color });

        // 2. Create the actual THREE.Line
        const line = new THREE.Line(geometry, material);
        // Save it in our ref
        lineRef.current = line;

        return () => {
            // optional cleanup
            geometry.dispose();
            material.dispose();
        };
    }, [color]); // re-run if color changes

    // Whenever "start" or "end" changes, update the positions
    useEffect(() => {
        if (!lineRef.current) return;
        const posAttr = lineRef.current?.geometry.attributes.position as THREE.BufferAttribute;
        // start
        posAttr.setXYZ(0, start.x, start.y, start.z);
        // end
        posAttr.setXYZ(1, end.x, end.y, end.z);
        posAttr.needsUpdate = true;
    }, [start, end]);

    return (
        // If lineRef.current is null initially, <primitive object={null} /> is harmless
        lineRef.current && <primitive object={lineRef.current} />
    );
}
