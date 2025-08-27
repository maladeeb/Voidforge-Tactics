import { Game } from './game.js';

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    
    // Make game available globally for debugging
    window.game = game;
    
    // Start the game
    game.start();
});