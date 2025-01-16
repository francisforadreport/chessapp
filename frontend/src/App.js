import React from "react";
import Users from "./components/Users";
import Games from "./components/Games";
import Chessboard from "./components/Chessboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const App = () => {
    return (
        <div>
            <h1>Chess App</h1>
            <ToastContainer />
            <Users />
            <Games />
            <Chessboard />
        </div>
    );
};

export default App;
