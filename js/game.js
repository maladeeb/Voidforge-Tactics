import { Grid } from './grid.js';
import { GameState } from './gameState.js';
import { InputHandler } from './input.js';
import { Renderer } from './renderer.js';
import { UIManager } from './ui.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Core game components
        this.grid = new Grid(20, 15); // 20x15 grid
        this.gameState = new GameState();
        this.renderer = new Renderer(this.ctx, this.grid);
        this.inputHandler = new InputHandler(this.canvas, this);
        this.uiManager = new UIManager(this);
        
        // Game timing
        this.lastUpdate = 0;
        this.isRunning = false;
        
        this.setupInitialGame();
    }
    
    setupInitialGame() {
        // Initialize with some starting units for each faction
        this.gameState.initializeStartingUnits(this.grid);
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            this.inputHandler.handleMouseMove(e);
        });
        
        this.canvas.addEventListener('click', (e) => {
            this.inputHandler.handleClick(e);
        });
        
        // UI button events
        document.getElementById('endTurnBtn').addEventListener('click', () => {
            this.gameState.endTurn();
            this.uiManager.updateUI();
        });
        
        document.getElementById('moveBtn').addEventListener('click', () => {
            this.setActionMode('move');
        });
        
        document.getElementById('attackBtn').addEventListener('click', () => {
            this.setActionMode('attack');
        });
        
        document.getElementById('buildBtn').addEventListener('click', () => {
            this.setActionMode('build');
        });
        
        document.getElementById('abilityBtn').addEventListener('click', () => {
            this.setActionMode('ability');
        });
    }
    
    setActionMode(mode) {
        this.gameState.currentAction = mode;
        console.log(`Action mode set to: ${mode}`);
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastUpdate;
        
        this.update(deltaTime);
        this.render();
        
        this.lastUpdate = currentTime;
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Update game state
        this.gameState.update(deltaTime);
        
        // Update UI
        this.uiManager.updateUI();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render grid and game elements
        this.renderer.render(this.gameState);
    }
    
    // Handle tile selection
    selectTile(x, y) {
        const tile = this.grid.getTile(x, y);
        if (!tile) return;
        
        this.gameState.selectedTile = { x, y };
        
        // Check if there's a unit on this tile
        const unit = this.gameState.getUnitAt(x, y);
        if (unit && unit.faction === this.gameState.currentFaction) {
            this.gameState.selectedUnit = unit;
        } else if (this.gameState.selectedUnit && this.gameState.currentAction === 'move') {
            // Try to move the selected unit
            this.gameState.moveUnit(this.gameState.selectedUnit, x, y);
        } else if (this.gameState.selectedUnit && this.gameState.currentAction === 'attack') {
            // Try to attack
            this.gameState.attackTarget(this.gameState.selectedUnit, x, y);
        }
        
        this.uiManager.updateSelectedUnit();
        this.uiManager.updateTileInfo(tile);
    }
}