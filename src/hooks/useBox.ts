import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnnotationBox } from '../types/AnnotationBox';
import {getBoxes, addBox, updateBox, deleteBox, deleteAllBoxes, getBoxesByDatasetId} from "../service/boxesService";

export function useBoxes() {
    const queryClient = useQueryClient();

    const { data: boxesBackend = [] } = useQuery({
        queryKey: ["boxes"],
        queryFn: getBoxes,
        refetchInterval: 1000,
    });

    // Add a box mutation
    const { mutate: addBoxMutation } = useMutation({
        mutationFn: (box: AnnotationBox) => addBox(box),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boxes"] });
        },
    });

    // Update the boxes in the backend
    const { mutate: updateBoxMutation } = useMutation({
        mutationFn: (box: AnnotationBox) => updateBox(box),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boxes"] });
        },
    });

    const { mutate: deleteBoxMutation } = useMutation({
        mutationFn: (id: string) => deleteBox(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boxes"] });
        },
    });

    const { mutate: deleteAllBoxesByDatasetIdMutation } = useMutation({
        mutationFn: (datasetId: string) => deleteAllBoxes(datasetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boxes"] });
        },
    });




    return { boxesBackend, addBoxMutation, updateBoxMutation, deleteBoxMutation, deleteAllBoxesByDatasetIdMutation };
}

export function useBoxByDatasetId(datasetId: string) {

    const { data: boxesBackend = [] } = useQuery({
        queryKey: ["boxes", datasetId],
        queryFn: () => getBoxesByDatasetId(datasetId),
        refetchInterval: 1000,
    });

    return { boxesBackend };
}
