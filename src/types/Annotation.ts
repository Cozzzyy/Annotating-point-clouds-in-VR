
export type Annotation = {
    track_id?: number;           // Track identifier
    id?: number | 1;             // Legacy field, always equal to track_id
    category_id?: number | 1;    // Category identifier
    type?: "cuboid";         // Annotation type, in this case "cuboid"
    position: {
        x: number;
        y: number;
        z: number;
    };      // Position of the annotation
    dimensions: {
        x: number;
        y: number;
        z: number;
    };    // Dimensions of the cuboid
    yaw: number;            // Yaw rotation (angle)
    rotation?: {
        qx: number;
        qy: number;
        qz: number;
        qw: number
    };  // Optional: 3D rotation quaternion (only when enabled)
};