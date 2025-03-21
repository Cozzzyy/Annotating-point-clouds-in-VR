import React, {StrictMode} from "react";
import ReactDOM from "react-dom/client";
import {AppProvider} from "./context/AppContext";
import {Content} from "./components/Content";


const App = () => {

    return (
        <>
            <StrictMode>
                <AppProvider>
                    <Content/>
                </AppProvider>
            </StrictMode>

        </>
    );
};


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App/>);
