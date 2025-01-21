import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
    DndContext, 
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    useDraggable,
    useDroppable 
} from '@dnd-kit/core';

// Custom SVG pieces
const PIECES = {
  p: (color) => (
    <svg viewBox="0 0 45 45" width="40" height="40">
      <path
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill={color === 'w' ? '#fff' : '#666'}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  r: (color) => (
    <svg viewBox="0 0 45 45" width="40" height="40">
      <path
        d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"
        fill={color === 'w' ? '#fff' : '#666'}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M34 14l-3 3H14l-3-3"
        fill={color === 'w' ? '#fff' : '#666'}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M31 17v12.5H14V17"
        fill={color === 'w' ? '#fff' : '#666'}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  n: (color) => (
    <svg viewBox="0 0 45 45" width="40" height="40">
      <path
        d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
        fill={color === 'w' ? '#fff' : '#666'}
        stroke="#000"
        strokeWidth="1.5"
      />
      <path
        d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10"
        fill={color === 'w' ? '#fff' : '#666'}
        stroke="#000"
        strokeWidth="1.5"
      />
    </svg>
  ),
  b: (color) => (
    <svg viewBox="0 0 45 45" width="40" height="40">
      <g
        fill="none"
        fillRule="evenodd"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"
          fill={color === 'w' ? '#fff' : '#666'}
        />
        <path
          d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"
          fill={color === 'w' ? '#fff' : '#666'}
        />
      </g>
    </svg>
  ),
  q: (color) => (
    <svg viewBox="0 0 45 45" width="40" height="40">
      <g
        fill={color === 'w' ? '#fff' : '#666'}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
        <path
          d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z"
          strokeLinecap="round"
        />
        <path
          d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
          strokeLinecap="butt"
        />
        <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" />
      </g>
    </svg>
  ),
  k: (color) => (
    <svg viewBox="0 0 45 45" width="40" height="40">
      <g
        fill="none"
        fillRule="evenodd"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M22.5 11.63V6M20 8h5"
          strokeLinejoin="miter"
          fill={color === 'w' ? '#fff' : '#666'}
        />
        <path
          d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
          fill={color === 'w' ? '#fff' : '#666'}
        />
        <path
          d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7"
          fill={color === 'w' ? '#fff' : '#666'}
        />
      </g>
    </svg>
  ),
};

// Add new game state types
const GameEndType = {
    CHECKMATE: 'checkmate',
    STALEMATE: 'stalemate',
    THREEFOLD: 'threefold',
    INSUFFICIENT: 'insufficient',
    FIFTY_MOVE: 'fifty-move',
    DRAW: 'draw'
};

// Add Modal component
const GameOverModal = ({ winner, gameEndType, onNewGame, onClose }) => {
    const getTitle = () => {
        if (gameEndType === GameEndType.CHECKMATE) {
            return `Checkmate! ${winner} wins!`;
        }
        return "Draw!";
    };

    const getDescription = () => {
        switch (gameEndType) {
            case GameEndType.STALEMATE:
                return "Draw by Stalemate - The player to move has no legal moves but is not in check.";
            case GameEndType.THREEFOLD:
                return "Draw by Threefold Repetition - The same position has occurred three times.";
            case GameEndType.INSUFFICIENT:
                return "Draw by Insufficient Material - Neither player has enough pieces to force checkmate.";
            case GameEndType.FIFTY_MOVE:
                return "Draw by Fifty-Move Rule - No pawn has been moved and no piece has been captured in the last 50 moves.";
            case GameEndType.DRAW:
                return "Draw by Agreement";
            default:
                return "";
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                    {getTitle()}
                </h2>
                {gameEndType !== GameEndType.CHECKMATE && (
                    <p className="text-gray-600 mb-4">
                        {getDescription()}
                    </p>
                )}
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={onNewGame}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        New Game
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add CapturedPieces component
const CapturedPieces = ({ pieces, color }) => {
    // Group pieces by type
    const groupedPieces = pieces.reduce((acc, piece) => {
        acc[piece] = (acc[piece] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="h-14 mb-2">
            <h3 className={`font-bold text-gray-700 mb-1 text-sm`}>
                {color === 'w' ? 'White' : 'Black'} Captured:
            </h3>
            <div className="flex gap-2 min-h-[24px]">
                {Object.entries(groupedPieces).map(([piece, count]) => (
                    <div key={piece} className="flex items-center">
                        <span className="text-lg scale-75">
                            {PIECES[piece.toLowerCase()](color)}
                        </span>
                        <span className="ml-0.5 text-xs text-gray-700">
                            ({count})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Add MoveHistory component
const MoveHistory = ({ moves, currentTurn }) => {
    const scrollRef = React.useRef(null);
    
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [moves]);

    return (
        <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-gray-200 font-bold">Move History</h3>
                <div className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full
                    ${currentTurn === 'w' ? 'bg-white text-gray-800' : 'bg-gray-700 text-white'}
                    transition-colors duration-300
                `}>
                    <div className={`
                        w-2 h-2 rounded-full bg-green-500 animate-pulse
                    `}/>
                    <span className="text-sm font-medium">
                        {currentTurn === 'w' ? 'White' : 'Black'} to move
                    </span>
                </div>
            </div>

            <div 
                ref={scrollRef}
                className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700"
            >
                <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1 text-gray-300 pr-2">
                    {moves.reduce((pairs, move, index) => {
                        if (index % 2 === 0) {
                            pairs.push([
                                moves[index],
                                moves[index + 1]
                            ]);
                        }
                        return pairs;
                    }, []).map((pair, index) => (
                        <React.Fragment key={index}>
                            <div className="text-gray-500 select-none">{index + 1}.</div>
                            <div className="font-medium hover:bg-gray-700 px-2 py-0.5 rounded cursor-pointer">
                                {pair[0]}
                            </div>
                            <div className="font-medium hover:bg-gray-700 px-2 py-0.5 rounded cursor-pointer">
                                {pair[1] || ''}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Add PromotionModal component
const PromotionModal = ({ isOpen, onSelect, color }) => {
    const pieces = ['q', 'r', 'b', 'n'];  // queen, rook, bishop, knight

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Choose Promotion Piece</h2>
                <div className="flex gap-4">
                    {pieces.map((piece) => (
                        <button
                            key={piece}
                            onClick={() => onSelect(piece)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {PIECES[piece](color)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Add CheckNotification component for persistent check display
const CheckNotification = ({ isInCheck, turn }) => {
    if (!isInCheck) return null;

    const checkedColor = turn === 'w' ? 'White' : 'Black';
    return (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse z-50 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-bold">{checkedColor} is in check!</span>
        </div>
    );
};

// Add a debug menu for testing different scenarios
const TestScenarios = ({ onSetPosition }) => {
    const scenarios = [
        {
            name: "Stalemate",
            // Black king is stalemated
            fen: "k7/8/1KP5/8/8/8/8/8 w - - 0 1"
        },
        {
            name: "Insufficient Material (K vs K)",
            fen: "4k3/8/4K3/8/8/8/8/8 w - - 0 1"
        },
        {
            name: "Insufficient Material (K+B vs K)",
            fen: "4k3/8/4K3/8/8/8/8/B7 w - - 0 1"
        },
        {
            name: "Near Checkmate",
            // One move away from checkmate
            fen: "7k/5ppp/8/8/8/8/6PP/6RK w - - 0 1"
        },
        {
            name: "Immediate Checkmate",
            // Black is in checkmate
            fen: "7k/5QQP/8/8/8/8/8/7K b - - 0 1"
        }
    ];

    return (
        <div className="fixed bottom-4 left-4 bg-gray-800 p-4 rounded-lg shadow-lg z-50">
            <h3 className="text-white font-bold mb-2">Test Scenarios</h3>
            <div className="space-y-2">
                {scenarios.map((scenario) => (
                    <button
                        key={scenario.name}
                        onClick={() => onSetPosition(scenario.fen)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-200 
                                 hover:bg-gray-700 rounded transition-colors"
                    >
                        {scenario.name}
                    </button>
                ))}
                <button
                    onClick={() => onSetPosition('start')}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-200 
                             hover:bg-gray-700 rounded transition-colors"
                >
                    Reset to Start
                </button>
            </div>
        </div>
    );
};

// Update Header component
const Header = ({ onNewGame, showTestScenarios, setShowTestScenarios }) => {
    return (
        <header className="bg-white shadow-sm mb-4 sm:mb-8">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-green-900">
                        Chess Game
                    </h1>

                    {/* Buttons */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={onNewGame}
                            className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base 
                                     bg-green-600 text-white rounded-lg hover:bg-green-700 
                                     transition-colors flex items-center gap-2"
                        >
                            <span>New Game</span>
                        </button>
                        <button
                            onClick={() => setShowTestScenarios(prev => !prev)}
                            className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base 
                                     bg-gray-800 text-white rounded-lg hover:bg-gray-700 
                                     transition-colors flex items-center gap-2"
                        >
                            <span>{showTestScenarios ? 'Hide' : 'Show'} Test</span>
                            <span className="hidden sm:inline text-sm text-gray-400">(Option + T)</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

const Chessboard = () => {
    const [chess] = useState(() => {
        const savedFen = localStorage.getItem('chessPosition');
        const newChess = new Chess();
        if (savedFen) {
            try {
                newChess.load(savedFen);
            } catch (error) {
                console.error('Error loading saved position:', error);
            }
        }
        return newChess;
    });

    const [gameState, setGameState] = useState(() => chess.board());
    const [currentTurn, setCurrentTurn] = useState(() => chess.turn());
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [winner, setWinner] = useState(null);
    const [capturedPieces, setCapturedPieces] = useState(() => {
        const savedCaptured = localStorage.getItem('capturedPieces');
        return savedCaptured ? JSON.parse(savedCaptured) : { w: [], b: [] };
    });
    const [isInCheck, setIsInCheck] = useState(false);
    const [moveHistory, setMoveHistory] = useState(() => {
        const savedHistory = localStorage.getItem('moveHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    const [promotionMove, setPromotionMove] = useState(null);
    const [gameEndType, setGameEndType] = useState(null);
    const [showTestScenarios, setShowTestScenarios] = useState(false);

    const cleanupToasts = useCallback(() => {
        return new Promise((resolve) => {
            try {
                toast.dismiss();
                setTimeout(resolve, 100); // Add small delay to ensure cleanup completes
            } catch (error) {
                console.error('Error cleaning up toasts:', error);
                resolve();
            }
        });
    }, []);

    // Calculate possible moves based on selected piece
    const possibleMoves = useMemo(() => {
        if (!selectedPiece) return [];
        return chess.moves({
            square: selectedPiece,
            verbose: true
        }).map(move => move.to);
    }, [selectedPiece, chess]);

    // Function to check game ending conditions
    const checkGameEnd = useCallback(() => {
        // Already handled checkmate
        if (chess.isCheckmate()) {
            const winner = chess.turn() === 'w' ? 'Black' : 'White';
            setWinner(winner);
            setGameEndType(GameEndType.CHECKMATE);
            setShowModal(true);
            return true;
        }

        // Stalemate
        if (chess.isStalemate()) {
            setGameEndType(GameEndType.STALEMATE);
            setShowModal(true);
            return true;
        }

        // Threefold Repetition
        if (chess.isThreefoldRepetition()) {
            setGameEndType(GameEndType.THREEFOLD);
            setShowModal(true);
            return true;
        }

        // Insufficient Material
        if (chess.isInsufficientMaterial()) {
            setGameEndType(GameEndType.INSUFFICIENT);
            setShowModal(true);
            return true;
        }

        // 50 Move Rule
        if (chess.isDraw()) { // This includes the fifty move rule
            setGameEndType(GameEndType.FIFTY_MOVE);
            setShowModal(true);
            return true;
        }

        return false;
    }, [chess, setShowModal, setWinner]);

    const handleDrop = async (from, to) => {
        try {
            // If the piece is dropped back to its original position, ignore the move
            if (from === to) {
                return; // Silently return without any error message
            }

            const piece = chess.get(from);
            const targetPiece = chess.get(to);
            
            // Clear existing toasts before showing new ones
            await cleanupToasts();
                
            if (!piece) {
                toast.error("No piece selected", { 
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    toastId: 'no-piece'
                });
                return;
            }

            if (piece.color !== currentTurn) {
                toast.error(`It's ${currentTurn === 'w' ? 'White' : 'Black'}'s turn`, { 
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    toastId: 'wrong-turn'
                });
                return;
            }

            // Check for pawn promotion
            const isPawnPromotion = piece?.type === 'p' && 
                ((piece.color === 'w' && to[1] === '8') || 
                 (piece.color === 'b' && to[1] === '1'));

            if (isPawnPromotion) {
                const moves = chess.moves({ verbose: true });
                const isLegal = moves.some(move => 
                    move.from === from && 
                    move.to === to && 
                    move.flags.includes('p')
                );

                if (!isLegal) {
                    toast.error("Illegal move", {
                        position: "bottom-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        toastId: 'illegal-move'
                    });
                    return;
                }

                setPromotionMove({ from, to });
                return;
            }

            const moves = chess.moves({ verbose: true });
            const isLegal = moves.some(move => 
                move.from === from && move.to === to
            );

            if (!isLegal) {
                toast.error("Illegal move", {
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    toastId: 'illegal-move'
                });
                return;
            }

            // Clear any existing error toasts before successful move
            await cleanupToasts();

            const move = chess.move({
                from,
                to,
                promotion: 'q'
            });

            if (move) {
                setGameState(chess.board());
                setCurrentTurn(chess.turn());
                setMoveHistory(chess.history());
                setSelectedPiece(null); // Clear selected piece after move

                if (targetPiece) {
                    setCapturedPieces(prev => ({
                        ...prev,
                        [targetPiece.color]: [...prev[targetPiece.color], targetPiece.type]
                    }));
                }

                setIsInCheck(chess.inCheck());
                checkGameEnd(); // Check for game-ending conditions
            }
        } catch (error) {
            console.error("Move attempt failed:", error);
            await cleanupToasts();
            toast.error("Invalid move", { 
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                toastId: 'invalid-move'
            });
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!active || !over) return;
        handleDrop(active.id, over.id);
    };

    const Square = ({ children, position, isLight, isHighlighted }) => {
        const { setNodeRef } = useDroppable({
            id: position
        });

        return (
            <div
                ref={setNodeRef}
                className={`
                    w-16 h-16 flex items-center justify-center relative
                    ${isLight ? 'bg-green-50' : 'bg-green-700'}
                    ${isHighlighted ? 'after:absolute after:w-full after:h-full after:bg-yellow-300 after:opacity-40' : ''}
                `}
            >
                {children}
            </div>
        );
    };

    const Piece = ({ piece, color, position, currentTurn, onSelect }) => {
        const { attributes, listeners, setNodeRef } = useDraggable({
            id: position,
            data: { piece, color, position }
        });

        return (
            <div 
                ref={setNodeRef}
                {...listeners}
                {...attributes}
                className="cursor-grab select-none touch-none"
                onClick={() => {
                    if (color === currentTurn) {
                        onSelect(position);
                    }
                }}
            >
                {PIECES[piece.toLowerCase()](color)}
            </div>
        );
    };

    const renderBoard = () => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        return (
            <div className="inline-block bg-green-900 p-4 rounded-lg shadow-lg">
                {/* File coordinates (top) */}
                <div className="flex ml-8">
                    {files.map(file => (
                        <div key={file} className="w-16 h-8 flex items-center justify-center text-green-50">
                            {file}
                        </div>
                    ))}
                </div>

                {/* Board with rank coordinates */}
                {gameState.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                        {/* Rank coordinate (left) */}
                        <div className="w-8 h-16 flex items-center justify-center text-green-50">
                            {ranks[rowIndex]}
                        </div>

                        {/* Chess squares */}
                        {row.map((square, squareIndex) => {
                            const position = `${files[squareIndex]}${ranks[rowIndex]}`;
                            const isLight = (rowIndex + squareIndex) % 2 === 0;
                            const isHighlighted = possibleMoves.includes(position);

                            return (
                                <Square
                                    key={squareIndex}
                                    isLight={isLight}
                                    position={position}
                                    isHighlighted={isHighlighted}
                                    onDrop={handleDrop}
                                >
                                    {square && (
                                        <Piece
                                            piece={square.type}
                                            color={square.color}
                                            position={position}
                                            currentTurn={currentTurn}
                                            onSelect={(pos) => setSelectedPiece(pos === selectedPiece ? null : pos)}
                                        />
                                    )}
                                </Square>
                            );
                        })}

                        {/* Rank coordinate (right) */}
                        <div className="w-8 h-16 flex items-center justify-center text-green-50">
                            {ranks[rowIndex]}
                        </div>
                    </div>
                ))}

                {/* File coordinates (bottom) */}
                <div className="flex ml-8">
                    {files.map(file => (
                        <div key={file} className="w-16 h-8 flex items-center justify-center text-green-50">
                            {file}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Update handlePromotion function
    const handlePromotion = (promotionPiece) => {
        if (!promotionMove) return;

        try {
            const targetPiece = chess.get(promotionMove.to);

            const move = chess.move({
                from: promotionMove.from,
                to: promotionMove.to,
                promotion: promotionPiece
            });

            if (move) {
                setGameState(chess.board());
                setCurrentTurn(chess.turn());
                setMoveHistory(chess.history());
                
                if (targetPiece && targetPiece.color !== move.color) {
                    setCapturedPieces(prev => ({
                        ...prev,
                        [targetPiece.color]: [...prev[targetPiece.color], targetPiece.type]
                    }));
                }
                
                // Only update the check status - CheckNotification will handle the display
                setIsInCheck(chess.inCheck());
            }
        } catch (error) {
            console.error("Promotion failed:", error);
            toast.error("Invalid promotion move", {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                toastId: 'move-error'
            });
        } finally {
            setPromotionMove(null);
        }
    };

    // Cleanup effect
    React.useEffect(() => {
        return () => {
            cleanupToasts();
        };
    }, [cleanupToasts]);

    // Update handleNewGame to clear localStorage
    const handleNewGame = async () => {
        chess.reset();
        setGameState(chess.board());
        setCurrentTurn("w");
        setSelectedPiece(null);
        setShowModal(false);
        setWinner(null);
        setGameEndType(null);
        setCapturedPieces({ w: [], b: [] });
        setIsInCheck(false);
        setMoveHistory([]);
        
        // Clear localStorage
        localStorage.removeItem('chessPosition');
        localStorage.removeItem('moveHistory');
        localStorage.removeItem('capturedPieces');
        
        try {
            await cleanupToasts();
        } catch (error) {
            console.error('Error cleaning up toasts in new game:', error);
        }
    };

    // Add position setter
    const setPosition = (fen) => {
        try {
            if (fen === 'start') {
                chess.reset();
            } else {
                chess.load(fen);
            }
            
            setGameState(chess.board());
            setCurrentTurn(chess.turn());
            setMoveHistory(chess.history());
            setIsInCheck(chess.inCheck());
            
            // Immediately check for end conditions
            if (chess.isCheckmate()) {
                const winner = chess.turn() === 'w' ? 'Black' : 'White';
                setWinner(winner);
                setGameEndType(GameEndType.CHECKMATE);
                setShowModal(true);
            } else if (chess.isStalemate()) {
                setGameEndType(GameEndType.STALEMATE);
                setShowModal(true);
            } else if (chess.isInsufficientMaterial()) {
                setGameEndType(GameEndType.INSUFFICIENT);
                setShowModal(true);
            } else if (chess.isDraw()) {
                setGameEndType(GameEndType.DRAW);
                setShowModal(true);
            }
            
        } catch (error) {
            console.error('Error setting position:', error);
            toast.error('Invalid position');
        }
    };

    // Update the keyboard shortcut handler
    useEffect(() => {
        const handleKeyPress = (e) => {
            console.log('Key pressed:', {
                key: e.key,
                altKey: e.altKey,
                metaKey: e.metaKey,
                ctrlKey: e.ctrlKey
            });
            
            // Check for both Alt/Option key
            if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 't') {
                e.preventDefault();
                setShowTestScenarios(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Save game state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('chessPosition', chess.fen());
        localStorage.setItem('moveHistory', JSON.stringify(moveHistory));
        localStorage.setItem('capturedPieces', JSON.stringify(capturedPieces));
    }, [chess, moveHistory, capturedPieces]);

    return (
        <DndContext 
            sensors={sensors}
            onDragEnd={handleDragEnd}
        >
            <div className="min-h-screen bg-gray-50">
                <Header 
                    onNewGame={handleNewGame}
                    showTestScenarios={showTestScenarios}
                    setShowTestScenarios={setShowTestScenarios}
                />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-2 sm:py-4">
                        <CheckNotification isInCheck={isInCheck} turn={currentTurn} />
                        
                        <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start">
                            {/* Board and captured pieces */}
                            <div className="w-full sm:w-auto flex flex-col items-center space-y-2">
                                <CapturedPieces pieces={capturedPieces.w} color="w" />
                                <div className="inline-block bg-green-900 p-2 sm:p-4 rounded-lg shadow-lg 
                                              overflow-x-auto max-w-full">
                                    {renderBoard()}
                                </div>
                                <CapturedPieces pieces={capturedPieces.b} color="b" />
                            </div>

                            {/* Move History - Full width on mobile, side panel on desktop */}
                            <div className="w-full lg:w-64 h-[300px] sm:h-[400px] lg:h-[520px]">
                                <MoveHistory 
                                    moves={moveHistory} 
                                    currentTurn={currentTurn}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {showModal && (
                    <GameOverModal 
                        winner={winner}
                        gameEndType={gameEndType}
                        onNewGame={handleNewGame}
                        onClose={handleCloseModal}
                    />
                )}
                
                <PromotionModal 
                    isOpen={!!promotionMove}
                    onSelect={handlePromotion}
                    color={currentTurn}
                />
                
                <ToastContainer
                    position="bottom-right"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    limit={3}
                />
                
                {showTestScenarios && (
                    <TestScenarios onSetPosition={setPosition} />
                )}
            </div>
        </DndContext>
    );
};

export default Chessboard;