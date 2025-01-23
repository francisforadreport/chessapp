import React, { useState } from 'react';

const DifficultyLevel = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert'
};

const GameSetupModal = ({ onStartGame, initialConfig }) => {
    // Initialize playerName from localStorage or empty string
    const [playerName, setPlayerName] = useState(() => {
        return localStorage.getItem('username') || '';
    });
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    // Start at step 2 if username exists
    const [step, setStep] = useState(() => {
        return localStorage.getItem('username') ? 2 : 1;
    });

    const handleStartGame = () => {
        const config = {
            playerName,
            difficulty: selectedDifficulty,
            playerColor: selectedColor
        };
        
        // Save to localStorage
        localStorage.setItem('username', playerName);
        localStorage.setItem('gameConfig', JSON.stringify(config));
        
        onStartGame(config);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Welcome to Chess Pro AI
                </h2>

                {/* Step 1: Name Input (only shown if no username stored) */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
                                Enter your name
                            </label>
                            <input
                                type="text"
                                id="playerName"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Your name"
                            />
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            disabled={!playerName.trim()}
                            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 2: Difficulty Selection */}
                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Select Difficulty</p>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(DifficultyLevel).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setSelectedDifficulty(value);
                                        setStep(3);
                                    }}
                                    className={`
                                        p-4 rounded-lg border-2 transition-all
                                        ${selectedDifficulty === value 
                                            ? 'border-green-500 bg-green-50' 
                                            : 'border-gray-200 hover:border-green-200'}
                                    `}
                                >
                                    <div className="font-medium text-gray-800">
                                        {key.charAt(0) + key.slice(1).toLowerCase()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Color Selection */}
                {step === 3 && (
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Choose Your Color</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedColor('w')}
                                className={`
                                    flex-1 p-4 rounded-lg border-2 transition-all
                                    ${selectedColor === 'w' 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-gray-200 hover:border-green-200'}
                                `}
                            >
                                <div className="font-medium text-gray-800">⚪ White</div>
                            </button>
                            <button
                                onClick={() => setSelectedColor('b')}
                                className={`
                                    flex-1 p-4 rounded-lg border-2 transition-all
                                    ${selectedColor === 'b' 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-gray-200 hover:border-green-200'}
                                `}
                            >
                                <div className="font-medium text-gray-800">⚫ Black</div>
                            </button>
                        </div>

                        <button
                            onClick={handleStartGame}
                            disabled={!selectedColor}
                            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Start Game
                        </button>
                    </div>
                )}

                {/* Progress Indicator */}
                <div className="flex justify-center mt-6 gap-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`
                                w-2 h-2 rounded-full transition-colors
                                ${step === i ? 'bg-green-500' : 'bg-gray-200'}
                            `}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GameSetupModal; 