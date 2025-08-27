export class Renderer {
    constructor(ctx, grid) {
        this.ctx = ctx;
        this.grid = grid;
        this.tileSize = 32;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Animation properties
        this.animationTime = 0;
        this.glowIntensity = 0;
    }
    
    render(gameState) {
        this.animationTime += 0.02;
        this.glowIntensity = (Math.sin(this.animationTime * 3) + 1) / 2;
        
        this.renderGrid();
        this.renderBuildings(gameState);
        this.renderUnits(gameState);
        this.renderUI(gameState);
        this.renderEffects();
    }
    
    renderGrid() {
        for (let y = 0; y < this.grid.height; y++) {
            for (let x = 0; x < this.grid.width; x++) {
                this.renderTile(this.grid.getTile(x, y));
            }
        }
    }
    
    renderTile(tile) {
        const screenX = tile.x * this.tileSize + this.offsetX;
        const screenY = tile.y * this.tileSize + this.offsetY;
        
        // Base tile color
        let color = this.getTileColor(tile.type);
        
        // Add glow effect for special tiles
        if (tile.type === 'crystal_vein' || tile.type === 'void_anomaly') {
            const glowAlpha = 0.3 + (this.glowIntensity * 0.4);
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 8;
        } else {
            this.ctx.shadowBlur = 0;
        }
        
        // Draw tile background
        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Draw tile border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Draw resources if present
        if (tile.resources) {
            this.renderResourceNode(screenX, screenY, tile.resources);
        }
        
        // Draw faction control indicator
        if (tile.controlled) {
            this.renderControlIndicator(screenX, screenY, tile.controlled);
        }
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    getTileColor(type) {
        const colors = {
            plains: '#1a4a1a',
            rocky_crater: '#4a4a2a',
            crystal_vein: '#2a1a4a',
            void_anomaly: '#4a1a2a'
        };
        return colors[type] || '#1a1a1a';
    }
    
    renderResourceNode(x, y, resources) {
        const centerX = x + this.tileSize / 2;
        const centerY = y + this.tileSize / 2;
        const radius = 3;
        
        const resourceColors = {
            energy: '#ffff00',
            alloys: '#cccccc',
            voidShards: '#ff00ff'
        };
        
        this.ctx.fillStyle = resourceColors[resources.type] || '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw resource amount
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(resources.amount.toString(), centerX, centerY - 8);
    }
    
    renderControlIndicator(x, y, faction) {
        const size = 4;
        const colors = {
            neocorp: '#00ff00',
            xenotech: '#ff6600',
            overmind: '#00ccff'
        };
        
        this.ctx.fillStyle = colors[faction] || '#ffffff';
        this.ctx.fillRect(x + 2, y + 2, size, size);
    }
    
    renderBuildings(gameState) {
        gameState.buildings.forEach(building => {
            if (building.alive) {
                this.renderBuilding(building, gameState);
            }
        });
    }
    
    renderUnits(gameState) {
        gameState.units.forEach(unit => {
            if (unit.alive) {
                this.renderUnit(unit, gameState);
            }
        });
    }
    
    renderBuilding(building, gameState) {
        const screenX = building.x * this.tileSize + this.offsetX;
        const screenY = building.y * this.tileSize + this.offsetY;
        const centerX = screenX + this.tileSize / 2;
        const centerY = screenY + this.tileSize / 2;
        
        // Building background (larger square)
        this.ctx.fillStyle = building.color;
        this.ctx.fillRect(screenX + 4, screenY + 4, this.tileSize - 8, this.tileSize - 8);
        
        // Building border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX + 4, screenY + 4, this.tileSize - 8, this.tileSize - 8);
        
        // Building symbol
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 18px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(building.symbol, centerX, centerY);
        
        // Health bar
        this.renderBuildingHealthBar(screenX, screenY, building);
        
        // Production queue indicator
        if (building.productionQueue && building.productionQueue.length > 0) {
            this.renderProductionIndicator(screenX, screenY, building);
        }
    }
    
    renderBuildingHealthBar(x, y, building) {
        const barWidth = this.tileSize - 8;
        const barHeight = 4;
        const barX = x + 4;
        const barY = y + this.tileSize - 10;
        
        // Background
        this.ctx.fillStyle = '#660000';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = building.health / building.maxHealth;
        const healthWidth = barWidth * healthPercent;
        
        let healthColor = '#00ff00';
        if (healthPercent < 0.3) healthColor = '#ff0000';
        else if (healthPercent < 0.6) healthColor = '#ffff00';
        
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(barX, barY, healthWidth, barHeight);
    }
    
    renderProductionIndicator(x, y, building) {
        const indicatorSize = 6;
        const indicatorX = x + this.tileSize - indicatorSize - 2;
        const indicatorY = y + 2;
        
        // Pulsing production indicator
        const alpha = 0.5 + (this.glowIntensity * 0.5);
        this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        this.ctx.fillRect(indicatorX, indicatorY, indicatorSize, indicatorSize);
        
        // Production count
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '8px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(building.productionQueue.length.toString(), 
                         indicatorX + indicatorSize / 2, indicatorY + indicatorSize / 2 + 1);
    }
    
    renderUnit(unit, gameState) {
        const screenX = unit.x * this.tileSize + this.offsetX;
        const screenY = unit.y * this.tileSize + this.offsetY;
        const centerX = screenX + this.tileSize / 2;
        const centerY = screenY + this.tileSize / 2;
        
        // Unit selection highlight
        if (gameState.selectedUnit === unit) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);
        }
        
        // Unit background circle
        const radius = this.tileSize / 3;
        this.ctx.fillStyle = unit.color;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Unit border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Unit symbol/type
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(unit.symbol, centerX, centerY);
        
        // Health bar
        this.renderHealthBar(screenX, screenY, unit);
        
        // Action points indicator
        this.renderActionPoints(screenX, screenY, unit);
        
        // Ability indicators
        if (unit.abilities && unit.abilities.length > 0) {
            this.renderAbilityIndicators(screenX, screenY, unit);
        }
    }
    
    renderHealthBar(x, y, unit) {
        const barWidth = this.tileSize - 4;
        const barHeight = 3;
        const barX = x + 2;
        const barY = y + this.tileSize - 8;
        
        // Background
        this.ctx.fillStyle = '#660000';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = unit.health / unit.maxHealth;
        const healthWidth = barWidth * healthPercent;
        
        let healthColor = '#00ff00';
        if (healthPercent < 0.3) healthColor = '#ff0000';
        else if (healthPercent < 0.6) healthColor = '#ffff00';
        
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(barX, barY, healthWidth, barHeight);
    }
    
    renderActionPoints(x, y, unit) {
        const dotSize = 3;
        const spacing = 6;
        const startX = x + 2;
        const startY = y + 2;
        
        for (let i = 0; i < unit.maxActionPoints; i++) {
            const dotX = startX + (i * spacing);
            const dotY = startY;
            
            this.ctx.fillStyle = i < unit.actionPoints ? '#00ff00' : '#333333';
            this.ctx.fillRect(dotX, dotY, dotSize, dotSize);
        }
    }
    
    renderAbilityIndicators(x, y, unit) {
        // Small indicators for special abilities
        if (unit.abilities.includes('swarm')) {
            this.ctx.fillStyle = '#ff6600';
            this.ctx.fillRect(x + this.tileSize - 6, y + 2, 4, 4);
        }
        if (unit.abilities.includes('teleport')) {
            this.ctx.fillStyle = '#00ccff';
            this.ctx.fillRect(x + this.tileSize - 6, y + 8, 4, 4);
        }
    }
    
    renderUI(gameState) {
        // Render movement range for selected unit
        if (gameState.selectedUnit && gameState.currentAction === 'move') {
            this.renderMovementRange(gameState.selectedUnit);
        }
        
        // Render attack range for selected unit
        if (gameState.selectedUnit && gameState.currentAction === 'attack') {
            this.renderAttackRange(gameState.selectedUnit);
        }
        
        // Render tile selection
        if (gameState.selectedTile) {
            this.renderTileSelection(gameState.selectedTile);
        }
    }
    
    renderMovementRange(unit) {
        const range = unit.movement;
        
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const targetX = unit.x + dx;
                const targetY = unit.y + dy;
                const distance = Math.abs(dx) + Math.abs(dy);
                
                if (distance <= range && distance > 0 && 
                    this.grid.isValidPosition(targetX, targetY)) {
                    
                    const screenX = targetX * this.tileSize + this.offsetX;
                    const screenY = targetY * this.tileSize + this.offsetY;
                    
                    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
                    this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                    
                    this.ctx.strokeStyle = '#00ff00';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
                }
            }
        }
    }
    
    renderAttackRange(unit) {
        const range = unit.range;
        
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const targetX = unit.x + dx;
                const targetY = unit.y + dy;
                const distance = Math.abs(dx) + Math.abs(dy);
                
                if (distance <= range && distance > 0 && 
                    this.grid.isValidPosition(targetX, targetY)) {
                    
                    const screenX = targetX * this.tileSize + this.offsetX;
                    const screenY = targetY * this.tileSize + this.offsetY;
                    
                    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                    this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                    
                    this.ctx.strokeStyle = '#ff0000';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
                }
            }
        }
    }
    
    renderTileSelection(selectedTile) {
        const screenX = selectedTile.x * this.tileSize + this.offsetX;
        const screenY = selectedTile.y * this.tileSize + this.offsetY;
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
        this.ctx.setLineDash([]);
    }
    
    renderEffects() {
        // Add particle effects, explosions, etc.
        this.renderAmbientEffects();
    }
    
    renderAmbientEffects() {
        // Subtle sci-fi ambient effects
        const time = this.animationTime;
        
        // Energy particles floating around
        for (let i = 0; i < 8; i++) {
            const x = (Math.sin(time * 0.5 + i) * 150) + 300;
            const y = (Math.cos(time * 0.3 + i * 0.7) * 100) + 200;
            const alpha = (Math.sin(time * 3 + i * 2) + 1) / 6;
            
            this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            this.ctx.fillRect(x, y, 1, 1);
        }
        
        // Scan lines effect
        const scanLineY = (time * 100) % 600;
        this.ctx.fillStyle = `rgba(0, 255, 255, 0.1)`;
        this.ctx.fillRect(0, scanLineY, 800, 2);
        
        // Grid glow effect on crystal veins
        for (let y = 0; y < this.grid.height; y++) {
            for (let x = 0; x < this.grid.width; x++) {
                const tile = this.grid.getTile(x, y);
                if (tile.type === 'crystal_vein') {
                    const screenX = x * this.tileSize + this.offsetX;
                    const screenY = y * this.tileSize + this.offsetY;
                    const pulse = (Math.sin(time * 4 + x + y) + 1) / 2;
                    
                    this.ctx.strokeStyle = `rgba(138, 43, 226, ${pulse * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
                }
            }
        }
    }
    
    // Convert screen coordinates to grid coordinates
    screenToGrid(screenX, screenY) {
        const gridX = Math.floor((screenX - this.offsetX) / this.tileSize);
        const gridY = Math.floor((screenY - this.offsetY) / this.tileSize);
        return { x: gridX, y: gridY };
    }
    
    // Convert grid coordinates to screen coordinates
    gridToScreen(gridX, gridY) {
        const screenX = gridX * this.tileSize + this.offsetX;
        const screenY = gridY * this.tileSize + this.offsetY;
        return { x: screenX, y: screenY };
    }
}