export interface Sample {
    uuid: string;
    name: string;
    data_type: string;
    attributes: {
        [key: string]: any;
    };
    metadata: {
        [key: string]: any;
    };
    priority: number;
    created_at: string;
    created_by: string;
    dataset: string;
}