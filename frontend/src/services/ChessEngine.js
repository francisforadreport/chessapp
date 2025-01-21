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
        try {
            if (this.initializationAttempts >= this.maxAttempts) {
                console.error('Failed to initialize chess engine after multiple attempts');
                return;
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
                }, 5000); // 5 second timeout

                this.engine.onmessage = (event) => {
                    const message = event.data;
                    console.log('Lozza message:', message);

                    if (message.startsWith('bestmove')) {
                        const move = message.split(' ')[1];
                        if (this.onMove) {
                            this.onMove(move);
                            console.log('Engine selected move:', move);
                        }
                    } else if (message.trim() === 'readyok') {  // Exact match with trim
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
                console.log('Engine initialization commands sent');
            });

            // Wait for initialization to complete
            await this.initPromise;

        } catch (error) {
            console.error('Chess engine initialization error:', error);
            this.destroy();
            if (this.initializationAttempts < this.maxAttempts) {
                setTimeout(() => this.init(), 1000);
            }
        }
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

    async getMove(fen, difficulty, onMove) {
        try {
            if (this.initPromise) {
                await this.initPromise;
            }

            if (!this.engine || !this.isReady) {
                throw new Error('Engine not ready for move calculation');
            }

            if (!fen) {
                throw new Error('Invalid FEN position');
            }

            this.onMove = onMove;
            if (!this.setDifficulty(difficulty)) {
                throw new Error('Failed to set difficulty');
            }

            // Set position and calculate move with current difficulty
            this.engine.postMessage(`position fen ${fen}`);
            this.engine.postMessage(`go movetime ${this.currentDifficulty.movetime}`);
            console.log('Requested move calculation:', { 
                fen, 
                difficulty, 
                movetime: this.currentDifficulty.movetime 
            });
        } catch (error) {
            console.error('Error getting move:', error);
            throw error;
        }
    }

    destroy() {
        if (this.engine) {
            this.engine.terminate();
            this.engine = null;
            this.isReady = false;
            this.initPromise = null;
            console.log('Engine destroyed');
        }
    }
}

const chessEngine = new ChessEngine();
window.chessEngine = chessEngine;
export default chessEngine; 