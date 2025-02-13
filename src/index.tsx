import React from "react";
import ReactDOM from "react-dom/client";
import {AppProvider} from "./context/AppContext";
import {Content} from "./components/Content";

const App = () => {

    return (
        <>
            <AppProvider>
                <Content />
            </AppProvider>

        </>
    );
};



ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App/>);
