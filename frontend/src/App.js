import React from "react";
import Chessboard from "./components/Chessboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
    return (
        <div>
            <Chessboard />
            <ToastContainer />
        </div>
    );
};

export default App;
