import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteDataset, getDatasets, addDataset } from "../service/datasetService";

export function useDatasets() {
    const queryClient = useQueryClient();

    // Fetch datasets
    const { data: datasets = [] } = useQuery({
        queryKey: ["datasets"],
        queryFn: getDatasets,
        refetchInterval: 2000,
    });

    // Mutation to delete a dataset
    const deleteMutation = useMutation({
        mutationFn: deleteDataset,
        onMutate: async (datasetId: string) => {
            await queryClient.cancelQueries({ queryKey: ["datasets"] });

            const previousDatasets = queryClient.getQueryData(["datasets"]);

            queryClient.setQueryData(["datasets"], (old: any) =>
                old ? old.filter((dataset: any) => dataset.id !== datasetId) : []
            );

            return { previousDatasets };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousDatasets) {
                queryClient.setQueryData(["datasets"], context.previousDatasets);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["datasets"] });
        },
    });

    // Mutation to add a dataset
    const addMutation = useMutation({
        mutationFn: addDataset,
        onMutate: async (newDataset) => {
            await queryClient.cancelQueries({ queryKey: ["datasets"] });

            const previousDatasets = queryClient.getQueryData(["datasets"]);

            queryClient.setQueryData(["datasets"], (old: any) =>
                old ? [...old, newDataset] : [newDataset]
            );

            return { previousDatasets };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousDatasets) {
                queryClient.setQueryData(["datasets"], context.previousDatasets);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["datasets"] });
        },
    });

    return {
        datasets,
        deleteDataset: deleteMutation.mutate,
        addDataset: addMutation.mutate
    };
}
