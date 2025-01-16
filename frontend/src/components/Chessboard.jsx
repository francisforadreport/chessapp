import React, { useState } from "react";
import { Chess } from "chess.js";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Chessboard = () => {
    const [chess] = useState(new Chess());
    const [gameState, setGameState] = useState(chess.board());
    const [currentTurn, setCurrentTurn] = useState("w"); // "w" for white, "b" for black

    // Save game state to the backend
    const saveGame = async (gameId, moves) => {
        if (!Array.isArray(moves)) {
            console.error("Invalid moves array:", moves);
            toast.error("Invalid game state. Cannot save.");
            return;
        }
    
        try {
            console.log("Saving game:", { gameId, moves });
            await axios.post("http://localhost:5001/games/save", { gameId, moves });
            console.log("Game saved successfully.");
        } catch (err) {
            console.error("Error saving game:", err.response?.data || err.message);
            toast.error("Failed to save game. Please try again.");
        }
    };        

    // Handle a piece drop
    const handleDrop = (from, to) => {
        console.log("Attempted move:", { from, to });
    
        try {
            const piece = chess.get(from);
            
            if (!piece) {
                toast.error("No piece selected");
                return;
            }
    
            if (piece.color !== currentTurn) {
                toast.error(`It's ${currentTurn === 'w' ? 'White' : 'Black'}'s turn`);
                return;
            }
    
            // Check if move is legal according to chess rules
            const moves = chess.moves({ verbose: true });
            const isLegal = moves.some(move => 
                move.from === from && move.to === to
            );
    
            if (!isLegal) {
                toast.error("Illegal move for this piece");
                return;
            }
    
            const move = chess.move({
                from,
                to,
                promotion: 'q'
            });
    
            if (move) {
                setGameState(chess.board());
                setCurrentTurn(chess.turn());
                saveGame("game1", chess.history());
            }
        } catch (error) {
            console.error("Move error:", error);
            toast.error("Invalid move attempted");
        }
    };                                     

    // Render a single square
    const Square = ({ children, onDrop, position, isLight }) => {
        const [, drop] = useDrop(() => ({
            accept: "piece",
            drop: (item) => onDrop(item.position, position), // Pass both source and target positions
        }));

        return (
            <div
                ref={drop}
                style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: isLight ? "white" : "gray",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid black",
                }}
            >
                {children}
            </div>
        );
    };

    // Render a single piece
    const Piece = ({ piece, position }) => {
        const [, drag] = useDrag(() => ({
            type: "piece",
            item: { position }, // Pass source position
        }));

        return (
            <div
                ref={drag}
                style={{
                    fontSize: "24px",
                    cursor: "grab",
                }}
            >
                {piece.toUpperCase()}
            </div>
        );
    };

    // Render the entire chessboard
    const renderBoard = () => {
        return gameState.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex" }}>
                {row.map((square, squareIndex) => {
                    const position = `${String.fromCharCode(97 + squareIndex)}${8 - rowIndex}`;
                    const isLight = (rowIndex + squareIndex) % 2 === 0;

                    return (
                        <Square
                            key={squareIndex}
                            isLight={isLight}
                            position={position} // Pass position to Square
                            onDrop={(from, to) => handleDrop(from, to)} // Handle source and target
                        >
                            {square && <Piece piece={square.type} position={position} />}
                        </Square>
                    );
                })}
            </div>
        ));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <h1>Chessboard</h1>
                <div style={{ display: "inline-block" }}>{renderBoard()}</div>
                <ToastContainer /> {/* Toast container for notifications */}
            </div>
        </DndProvider>
    );
};

export default Chessboard;
