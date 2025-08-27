export class InputHandler {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.mouseX = 0;
        this.mouseY = 0;
        this.hoveredTile = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Convert to grid coordinates
        const gridPos = this.game.renderer.screenToGrid(this.mouseX, this.mouseY);
        
        // Update hovered tile
        if (this.game.grid.isValidPosition(gridPos.x, gridPos.y)) {
            this.hoveredTile = gridPos;
            const tile = this.game.grid.getTile(gridPos.x, gridPos.y);
            this.game.uiManager.updateTileInfo(tile);
        } else {
            this.hoveredTile = null;
        }
    }
    
    handleClick(e) {
        if (!this.hoveredTile) return;
        
        const { x, y } = this.hoveredTile;
        
        // Handle different game states and actions
        switch (this.game.gameState.currentAction) {
            case 'move':
                this.handleMoveAction(x, y);
                break;
            case 'attack':
                this.handleAttackAction(x, y);
                break;
            case 'build':
                this.handleBuildAction(x, y);
                break;
            case 'ability':
                this.handleAbilityAction(x, y);
                break;
            default:
                this.handleDefaultClick(x, y);
                break;
        }
    }
    
    handleRightClick(e) {
        e.preventDefault();
        
        // Clear current selection or action
        this.game.gameState.currentAction = null;
        this.game.gameState.selectedUnit = null;
        this.game.uiManager.updateUI();
    }
    
    handleDefaultClick(x, y) {
        const unit = this.game.gameState.getUnitAt(x, y);
        
        if (unit && unit.faction === this.game.gameState.currentFaction) {
            // Select friendly unit
            this.game.gameState.selectedUnit = unit;
            this.game.gameState.selectedTile = { x, y };
            this.game.uiManager.updateSelectedUnit();
        } else if (this.game.gameState.selectedUnit) {
            // Try to move selected unit
            const success = this.game.gameState.moveUnit(this.game.gameState.selectedUnit, x, y);
            if (success) {
                this.game.gameState.currentAction = null;
            }
        } else {
            // Select empty tile
            this.game.gameState.selectedTile = { x, y };
        }
    }
    
    handleMoveAction(x, y) {
        if (!this.game.gameState.selectedUnit) {
            console.log('No unit selected for movement');
            return;
        }
        
        const success = this.game.gameState.moveUnit(this.game.gameState.selectedUnit, x, y);
        if (success) {
            this.game.gameState.currentAction = null;
            console.log('Unit moved successfully');
        } else {
            console.log('Cannot move unit to that location');
        }
    }
    
    handleAttackAction(x, y) {
        if (!this.game.gameState.selectedUnit) {
            console.log('No unit selected for attack');
            return;
        }
        
        const success = this.game.gameState.attackTarget(this.game.gameState.selectedUnit, x, y);
        if (success) {
            this.game.gameState.currentAction = null;
            console.log('Attack executed');
        } else {
            console.log('Cannot attack that target');
        }
    }
    
    handleBuildAction(x, y) {
        // Building construction logic
        const tile = this.game.grid.getTile(x, y);
        if (!tile) return;
        
        // Check if tile is empty and can be built on
        const unit = this.game.gameState.getUnitAt(x, y);
        if (unit) {
            console.log('Cannot build on occupied tile');
            return;
        }
        
        // Show building options (this would typically open a menu)
        this.showBuildingMenu(x, y);
    }
    
    handleAbilityAction(x, y) {
        if (!this.game.gameState.selectedUnit) {
            console.log('No unit selected for ability use');
            return;
        }
        
        const unit = this.game.gameState.selectedUnit;
        
        // Use the first available ability (in a full game, this would be selectable)
        if (unit.abilities.length > 0) {
            const abilityName = unit.abilities[0];
            const target = { x, y };
            
            const success = unit.useAbility(abilityName, target);
            if (success) {
                this.game.gameState.currentAction = null;
                console.log(`${abilityName} ability used`);
            } else {
                console.log(`Cannot use ${abilityName} ability`);
            }
        }
    }
    
    showBuildingMenu(x, y) {
        // This would show a building selection menu
        // For now, just try to build a basic structure
        const buildings = this.game.gameState.factionManager.getFactionBuildings(this.game.gameState.currentFaction);
        
        if (buildings.length > 0) {
            const building = buildings[0]; // Select first building type
            this.tryBuildStructure(x, y, building);
        }
    }
    
    tryBuildStructure(x, y, buildingType) {
        const success = this.game.gameState.spendResources(buildingType.cost);
        if (success) {
            // Create building (simplified)
            console.log(`Built ${buildingType.name} at (${x}, ${y})`);
            this.game.gameState.currentAction = null;
        } else {
            console.log('Insufficient resources to build');
        }
    }
    
    handleKeyDown(e) {
        switch (e.code) {
            case 'KeyM':
                this.game.setActionMode('move');
                break;
            case 'KeyA':
                this.game.setActionMode('attack');
                break;
            case 'KeyB':
                this.game.setActionMode('build');
                break;
            case 'KeyQ':
                this.game.setActionMode('ability');
                break;
            case 'Space':
                e.preventDefault();
                this.game.gameState.endTurn();
                break;
            case 'Escape':
                this.game.gameState.currentAction = null;
                this.game.gameState.selectedUnit = null;
                this.game.uiManager.updateUI();
                break;
        }
    }
    
    handleKeyUp(e) {
        // Handle key up events if needed
    }
    
    // Get current mouse position in grid coordinates
    getMouseGridPosition() {
        return this.hoveredTile;
    }
    
    // Check if mouse is over a specific tile
    isMouseOverTile(x, y) {
        return this.hoveredTile && this.hoveredTile.x === x && this.hoveredTile.y === y;
    }
}