class ChessEngine {
    constructor() {
        this.engine = null;
        this.isReady = false;
        this.initializationAttempts = 0;
        this.maxAttempts = 3;
        this.initPromise = null;
        this.onMove = null;
        
        this.difficultyLevels = {
            beginner: { movetime: 100 },      // Quick moves
            intermediate: { movetime: 500 },   // More thought
            advanced: { movetime: 1000 },      // Careful consideration
            expert: { movetime: 2000 }         // Deep analysis
        };

        this.init();
    }

    async init() {
        // Don't reinitialize if already ready
        if (this.isReady && this.engine) {
            return Promise.resolve();
        }

        try {
            if (this.initializationAttempts >= this.maxAttempts) {
                console.error('Failed to initialize chess engine after multiple attempts');
                return Promise.reject(new Error('Max initialization attempts reached'));
            }

            this.initializationAttempts++;
            console.log('Initializing chess engine, attempt:', this.initializationAttempts);

            // Initialize Lozza as a Web Worker
            this.engine = new Worker('/lozza/lozza.js');
            
            if (!this.engine) {
                throw new Error('Failed to create Lozza instance');
            }

            // Create a promise that resolves when the engine is ready
            this.initPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Engine initialization timeout'));
                }, 10000); // Increased timeout to 10 seconds

                this.engine.onmessage = (event) => {
                    const message = event.data;
                    
                    if (message.startsWith('bestmove')) {
                        const moveStr = message.split(' ')[1];
                        if (this.onMove && moveStr !== '(none)') {
                            console.log('Engine selected move:', moveStr);
                            // Ensure the move is in the correct format
                            const formattedMove = this.formatMove(moveStr);
                            this.onMove(formattedMove);
                        }
                    } else if (message.includes('readyok')) {
                        this.isReady = true;
                        clearTimeout(timeout);
                        resolve();
                        console.log('Lozza engine ready');
                    }
                };

                this.engine.onerror = (error) => {
                    console.error('Lozza worker error:', error);
                    clearTimeout(timeout);
                    reject(error);
                };

                // Initialize engine with UCI commands
                this.engine.postMessage('uci');
                this.engine.postMessage('isready');
            });

            await this.initPromise;
            return this.initPromise;

        } catch (error) {
            console.error('Chess engine initialization error:', error);
            this.destroy();
            if (this.initializationAttempts < this.maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.init();
            }
            throw error;
        }
    }

    // Add method to translate moves based on board orientation
    translateMove(move) {
        // Return the move as is - the chess.js library will handle the validation
        return move;
    }

    setDifficulty(level) {
        if (!this.engine || !this.isReady) {
            console.warn('Engine not ready for difficulty setting');
            return false;
        }
        
        const settings = this.difficultyLevels[level];
        if (!settings) {
            console.warn('Invalid difficulty level:', level);
            return false;
        }

        // Store current difficulty settings
        this.currentDifficulty = settings;
        console.log('Difficulty set to:', level, 'movetime:', settings.movetime);
        return true;
    }

    // Add a new method to format moves
    formatMove(move) {
        if (!move || typeof move !== 'string') {
            throw new Error('Invalid move format');
        }

        // Clean the move string and ensure it's in the correct format
        move = move.trim().toLowerCase();

        // Add more strict validation for move format
        const isValidMove = /^[a-h][1-8][a-h][1-8][qrbnk]?$/.test(move);
        if (!isValidMove) {
            console.error('Invalid move received from engine:', move);
            throw new Error(`Invalid move format: ${move}`);
        }

        // Log the formatted move for debugging
        const formattedMove = {
            from: move.slice(0, 2),
            to: move.slice(2, 4),
            promotion: move.length === 5 ? move[4] : undefined
        };
        console.log('Formatted move:', formattedMove);

        return formattedMove;
    }

    async getMove(fen, difficulty, onMove, boardOrientation = 'white') {
        try {
            await this.init();

            if (!this.engine || !this.isReady) {
                throw new Error('Engine not ready for move calculation');
            }

            if (!fen) {
                throw new Error('Invalid FEN position');
            }

            if (!onMove || typeof onMove !== 'function') {
                throw new Error('Invalid move callback');
            }

            this.currentOrientation = boardOrientation;
            this.onMove = onMove;
            
            if (!this.setDifficulty(difficulty)) {
                throw new Error('Failed to set difficulty');
            }

            // Add a small delay between commands to ensure proper processing
            this.engine.postMessage('ucinewgame');
            await new Promise(resolve => setTimeout(resolve, 50));
            
            this.engine.postMessage('position fen ' + fen);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            this.engine.postMessage(`go movetime ${this.currentDifficulty.movetime}`);
            
            console.log('Engine calculating move:', { 
                fen,
                difficulty,
                movetime: this.currentDifficulty.movetime,
                boardOrientation
            });
        } catch (error) {
            console.error('Error getting move:', error);
            throw error;
        }
    }

    destroy() {
        if (this.engine) {
            try {
                // Send quit command before terminating
                this.engine.postMessage('quit');
                setTimeout(() => {
                    this.engine.terminate();
                    this.engine = null;
                    this.isReady = false;
                    this.initPromise = null;
                    this.initializationAttempts = 0;
                    console.log('Engine destroyed');
                }, 100);
            } catch (error) {
                console.error('Error destroying engine:', error);
            }
        }
    }
}

// Create a singleton instance
const chessEngine = new ChessEngine();
export default chessEngine; 