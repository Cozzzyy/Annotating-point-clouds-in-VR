import {VrScene} from "../scenes/VrScene";
import {Menu} from "./ui/Menu";
import {useAppContext} from "../context/AppContext";
import {LabelingProvider} from "../context/LabelingContext";
import {HudProvider, useHud} from "../context/HudContext";
import {BoxProvider} from "../context/BoxContext";
import axios from "axios";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {PointerPositionProvider} from "../context/PointerPositionContext";
import {createXRStore} from "@react-three/xr";
import {CustomXRControllerRight} from "./xr/controllers/CustomXRControllerRight";
import {CustomXRControllerLeft} from "./xr/controllers/CustomXRControllerLeft";
import {useEffect} from "react";

const xrStore = createXRStore({
    controller: {
        left: CustomXRControllerLeft, right: CustomXRControllerRight, teleportPointer: true,
    },

})

export const Content = () => {
    const {enterVR, selectedDataset} = useAppContext();
    axios.defaults.baseURL = "http://localhost:3000/";
    const queryClient = new QueryClient();

    useEffect(() => {
        if (!enterVR) {

            xrStore.getState().session?.end()

        }
    }, [enterVR]);

    return (
        <QueryClientProvider client={queryClient}>
            <>
                <HudProvider>
                    <LabelingProvider>
                        <BoxProvider>
                            {!enterVR && <Menu/>}
                            {enterVR && (

                                <PointerPositionProvider>
                                    <VrScene dataset={selectedDataset} xrStore={xrStore}/>
                                </PointerPositionProvider>
                            )}
                        </BoxProvider>
                    </LabelingProvider>
                </HudProvider>
            </>
        </QueryClientProvider>
    );
};
