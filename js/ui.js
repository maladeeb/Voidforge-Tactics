export class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = this.getUIElements();
    }
    
    getUIElements() {
        return {
            turnInfo: document.getElementById('turnInfo'),
            phaseInfo: document.getElementById('phaseInfo'),
            energyCount: document.getElementById('energyCount'),
            alloyCount: document.getElementById('alloyCount'),
            shardCount: document.getElementById('shardCount'),
            selectedUnit: document.getElementById('selectedUnit'),
            tileInfo: document.getElementById('tileInfo'),
            moveBtn: document.getElementById('moveBtn'),
            attackBtn: document.getElementById('attackBtn'),
            buildBtn: document.getElementById('buildBtn'),
            abilityBtn: document.getElementById('abilityBtn'),
            endTurnBtn: document.getElementById('endTurnBtn')
        };
    }
    
    updateUI() {
        this.updateTurnInfo();
        this.updateResources();
        this.updateSelectedUnit();
        this.updateActionButtons();
    }
    
    updateTurnInfo() {
        const gameState = this.game.gameState;
        const factionName = gameState.factionManager.getFactionName(gameState.currentFaction);
        const factionClass = `faction-${gameState.currentFaction}`;
        
        this.elements.turnInfo.textContent = `Turn ${gameState.currentTurn} - ${factionName}`;
        this.elements.turnInfo.className = factionClass;
        
        const phaseNames = {
            resource: 'Resource Phase',
            action: 'Action Phase',
            event: 'Event Phase'
        };
        
        this.elements.phaseInfo.textContent = phaseNames[gameState.currentPhase] || 'Unknown Phase';
    }
    
    updateResources() {
        const resources = this.game.gameState.getCurrentResources();
        
        this.elements.energyCount.textContent = resources.energy;
        this.elements.alloyCount.textContent = resources.alloys;
        this.elements.shardCount.textContent = resources.voidShards;
    }
    
    updateSelectedUnit() {
        const unit = this.game.gameState.selectedUnit;
        
        if (unit) {
            const unitInfo = this.createUnitInfoHTML(unit);
            this.elements.selectedUnit.innerHTML = unitInfo;
        } else {
            this.elements.selectedUnit.textContent = 'None';
        }
    }
    
    createUnitInfoHTML(unit) {
        const healthPercent = (unit.health / unit.maxHealth * 100).toFixed(0);
        const healthColor = healthPercent > 60 ? '#00ff00' : 
                          healthPercent > 30 ? '#ffff00' : '#ff0000';
        
        return `
            <div class="unit-info">
                <div style="color: ${unit.color}; font-weight: bold;">
                    ${unit.getDisplayName()}
                </div>
                <div>Health: 
                    <span style="color: ${healthColor}">
                        ${unit.health}/${unit.maxHealth}
                    </span>
                </div>
                <div>Attack: ${unit.attack}</div>
                <div>Defense: ${unit.defense}</div>
                <div>Movement: ${unit.movement}</div>
                <div>Range: ${unit.range}</div>
                <div>Action Points: ${unit.actionPoints}/${unit.maxActionPoints}</div>
                ${unit.abilities.length > 0 ? 
                    `<div>Abilities: ${unit.abilities.join(', ')}</div>` : 
                    ''
                }
            </div>
        `;
    }
    
    updateActionButtons() {
        const gameState = this.game.gameState;
        const selectedUnit = gameState.selectedUnit;
        const currentAction = gameState.currentAction;
        
        // Enable/disable buttons based on game state
        const canAct = selectedUnit && 
                      selectedUnit.faction === gameState.currentFaction && 
                      selectedUnit.canAct();
        
        this.elements.moveBtn.disabled = !canAct;
        this.elements.attackBtn.disabled = !canAct;
        this.elements.buildBtn.disabled = false; // Building doesn't require unit selection
        this.elements.abilityBtn.disabled = !canAct || !selectedUnit?.abilities?.length;
        
        // Highlight active action
        [this.elements.moveBtn, this.elements.attackBtn, 
         this.elements.buildBtn, this.elements.abilityBtn].forEach(btn => {
            btn.style.backgroundColor = '#004400';
        });
        
        if (currentAction) {
            const activeBtn = this.elements[currentAction + 'Btn'];
            if (activeBtn) {
                activeBtn.style.backgroundColor = '#006600';
            }
        }
        
        // Update end turn button
        this.updateEndTurnButton();
    }
    
    updateEndTurnButton() {
        const gameState = this.game.gameState;
        const hasActionsLeft = gameState.getCurrentFactionUnits().some(unit => unit.canAct());
        
        if (hasActionsLeft) {
            this.elements.endTurnBtn.style.backgroundColor = '#444400';
            this.elements.endTurnBtn.textContent = 'End Turn';
        } else {
            this.elements.endTurnBtn.style.backgroundColor = '#004400';
            this.elements.endTurnBtn.textContent = 'End Turn (All units used)';
        }
    }
    
    updateTileInfo(tile) {
        if (!tile) {
            this.elements.tileInfo.textContent = 'Hover over tiles for info';
            return;
        }
        
        const tileTypeNames = {
            plains: 'Plains',
            rocky_crater: 'Rocky Crater',
            crystal_vein: 'Crystal Vein',
            void_anomaly: 'Void Anomaly'
        };
        
        let info = `${tileTypeNames[tile.type] || tile.type} (${tile.x}, ${tile.y})`;
        
        if (tile.movementCost > 1) {
            info += `\nMovement Cost: ${tile.movementCost}`;
        }
        
        if (tile.defensiveBonus > 0) {
            info += `\nDefensive Bonus: +${tile.defensiveBonus}`;
        }
        
        if (tile.resources) {
            info += `\nResource: ${tile.resources.type} (${tile.resources.amount})`;
        }
        
        if (tile.controlled) {
            const factionName = this.game.gameState.factionManager.getFactionName(tile.controlled);
            info += `\nControlled by: ${factionName}`;
        }
        
        this.elements.tileInfo.textContent = info;
    }
    
    showMessage(message, type = 'info') {
        // Create a temporary message overlay
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #222;
            border: 2px solid #00ff00;
            padding: 20px;
            z-index: 1000;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            border-radius: 5px;
        `;
        
        if (type === 'error') {
            messageDiv.style.borderColor = '#ff0000';
            messageDiv.style.color = '#ff0000';
        } else if (type === 'warning') {
            messageDiv.style.borderColor = '#ffff00';
            messageDiv.style.color = '#ffff00';
        }
        
        document.body.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
    
    showGameOver(winner) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        const winnerName = this.game.gameState.factionManager.getFactionName(winner);
        const winnerColor = this.game.gameState.factionManager.getFactionColor(winner);
        
        overlay.innerHTML = `
            <div style="
                background: #111;
                border: 3px solid ${winnerColor};
                padding: 40px;
                text-align: center;
                border-radius: 10px;
                color: ${winnerColor};
                font-family: 'Courier New', monospace;
            ">
                <h1 style="margin: 0 0 20px 0; font-size: 36px; text-shadow: 0 0 10px ${winnerColor};">
                    VICTORY!
                </h1>
                <h2 style="margin: 0 0 20px 0; font-size: 24px;">
                    ${winnerName} Wins!
                </h2>
                <button onclick="location.reload()" style="
                    background: #004400;
                    border: 2px solid #00ff00;
                    color: #00ff00;
                    padding: 10px 20px;
                    font-family: inherit;
                    cursor: pointer;
                    border-radius: 5px;
                    font-size: 16px;
                ">
                    Play Again
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    // Show tooltip for abilities or detailed unit info
    showTooltip(element, content) {
        const tooltip = document.createElement('div');
        tooltip.innerHTML = content;
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            border: 1px solid #00ff00;
            padding: 10px;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 1500;
            border-radius: 3px;
            max-width: 200px;
        `;
        
        // Position tooltip near element
        const rect = element.getBoundingClientRect();
        tooltip.style.left = (rect.right + 10) + 'px';
        tooltip.style.top = rect.top + 'px';
        
        document.body.appendChild(tooltip);
        
        // Remove tooltip after delay or on mouse leave
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
        
        return tooltip;
    }
}