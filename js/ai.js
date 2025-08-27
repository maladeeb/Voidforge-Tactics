export class AIPlayer {
    constructor(faction, gameState) {
        this.faction = faction;
        this.gameState = gameState;
        this.difficulty = 'normal'; // easy, normal, hard
        this.strategy = this.getStrategy(faction);
    }
    
    getStrategy(faction) {
        const strategies = {
            neocorp: 'balanced',    // Balanced approach with economy focus
            xenotech: 'aggressive', // Rush tactics with swarm units
            overmind: 'defensive'   // Tech-focused with strong defense
        };
        return strategies[faction] || 'balanced';
    }
    
    takeTurn() {
        console.log(`AI ${this.faction} taking turn...`);
        
        // AI turn phases
        this.evaluateThreats();
        this.planActions();
        this.executeActions();
        
        // End turn
        this.gameState.endTurn();
    }
    
    evaluateThreats() {
        // Analyze current board state
        this.threats = [];
        this.opportunities = [];
        
        const myUnits = this.gameState.units.filter(u => u.faction === this.faction && u.alive);
        const enemyUnits = this.gameState.units.filter(u => u.faction !== this.faction && u.alive);
        
        // Find threatened units
        myUnits.forEach(unit => {
            const threateningEnemies = enemyUnits.filter(enemy => {
                const distance = Math.abs(unit.x - enemy.x) + Math.abs(unit.y - enemy.y);
                return distance <= enemy.range;
            });
            
            if (threateningEnemies.length > 0) {
                this.threats.push({
                    unit: unit,
                    threats: threateningEnemies,
                    priority: this.calculateThreatPriority(unit, threateningEnemies)
                });
            }
        });
        
        // Find attack opportunities
        enemyUnits.forEach(enemy => {
            const attackers = myUnits.filter(unit => {
                const distance = Math.abs(unit.x - enemy.x) + Math.abs(unit.y - enemy.y);
                return distance <= unit.range && unit.canAct();
            });
            
            if (attackers.length > 0) {
                this.opportunities.push({
                    target: enemy,
                    attackers: attackers,
                    priority: this.calculateAttackPriority(enemy, attackers)
                });
            }
        });
        
        // Sort by priority
        this.threats.sort((a, b) => b.priority - a.priority);
        this.opportunities.sort((a, b) => b.priority - a.priority);
    }
    
    calculateThreatPriority(unit, threats) {
        let priority = 0;
        
        // Higher priority for valuable units
        priority += unit.attack * 2;
        priority += unit.health;
        
        // Higher priority for units under immediate threat
        const damage = threats.reduce((total, threat) => total + threat.attack, 0);
        if (damage >= unit.health) {
            priority += 100; // Unit would die
        }
        
        return priority;
    }
    
    calculateAttackPriority(target, attackers) {
        let priority = 0;
        
        // Higher priority for weak enemies that can be killed
        const totalDamage = attackers.reduce((total, attacker) => total + attacker.attack, 0);
        if (totalDamage >= target.health) {
            priority += 50; // Can kill target
        }
        
        // Higher priority for dangerous enemies
        priority += target.attack;
        
        // Lower priority for heavily defended targets
        priority -= target.defense * 2;
        
        return priority;
    }
    
    planActions() {
        this.actionPlan = [];
        
        switch (this.strategy) {
            case 'aggressive':
                this.planAggressiveActions();
                break;
            case 'defensive':
                this.planDefensiveActions();
                break;
            case 'balanced':
            default:
                this.planBalancedActions();
                break;
        }
    }
    
    planAggressiveActions() {
        // Prioritize attacks
        this.opportunities.forEach(opportunity => {
            opportunity.attackers.forEach(attacker => {
                if (attacker.canAct()) {
                    this.actionPlan.push({
                        type: 'attack',
                        unit: attacker,
                        target: opportunity.target,
                        priority: opportunity.priority
                    });
                }
            });
        });
        
        // Move units forward
        const myUnits = this.gameState.units.filter(u => u.faction === this.faction && u.alive && u.canAct());
        myUnits.forEach(unit => {
            if (!this.actionPlan.find(action => action.unit === unit)) {
                const moveTarget = this.findAggressiveMoveTarget(unit);
                if (moveTarget) {
                    this.actionPlan.push({
                        type: 'move',
                        unit: unit,
                        target: moveTarget,
                        priority: 20
                    });
                }
            }
        });
    }
    
    planDefensiveActions() {
        // Prioritize healing and defensive positions
        this.threats.forEach(threat => {
            const unit = threat.unit;
            if (unit.canAct()) {
                // Try to move to safety
                const safePosition = this.findSafePosition(unit);
                if (safePosition) {
                    this.actionPlan.push({
                        type: 'move',
                        unit: unit,
                        target: safePosition,
                        priority: threat.priority
                    });
                } else {
                    // If can't retreat, attack
                    const bestTarget = this.findBestTarget(unit);
                    if (bestTarget) {
                        this.actionPlan.push({
                            type: 'attack',
                            unit: unit,
                            target: bestTarget,
                            priority: threat.priority / 2
                        });
                    }
                }
            }
        });
        
        // Attack with remaining units
        const myUnits = this.gameState.units.filter(u => u.faction === this.faction && u.alive && u.canAct());
        myUnits.forEach(unit => {
            if (!this.actionPlan.find(action => action.unit === unit)) {
                const target = this.findBestTarget(unit);
                if (target) {
                    this.actionPlan.push({
                        type: 'attack',
                        unit: unit,
                        target: target,
                        priority: 15
                    });
                }
            }
        });
    }
    
    planBalancedActions() {
        // Mix of offensive and defensive actions
        
        // First, handle immediate threats
        this.threats.slice(0, 2).forEach(threat => {
            const unit = threat.unit;
            if (unit.canAct()) {
                const safePosition = this.findSafePosition(unit);
                if (safePosition && unit.health < unit.maxHealth * 0.5) {
                    this.actionPlan.push({
                        type: 'move',
                        unit: unit,
                        target: safePosition,
                        priority: threat.priority
                    });
                }
            }
        });
        
        // Then, take advantage of opportunities
        this.opportunities.slice(0, 3).forEach(opportunity => {
            const bestAttacker = opportunity.attackers.find(a => a.canAct());
            if (bestAttacker) {
                this.actionPlan.push({
                    type: 'attack',
                    unit: bestAttacker,
                    target: opportunity.target,
                    priority: opportunity.priority
                });
            }
        });
        
        // Move remaining units
        const myUnits = this.gameState.units.filter(u => u.faction === this.faction && u.alive && u.canAct());
        myUnits.forEach(unit => {
            if (!this.actionPlan.find(action => action.unit === unit)) {
                const moveTarget = this.findTacticalMoveTarget(unit);
                if (moveTarget) {
                    this.actionPlan.push({
                        type: 'move',
                        unit: unit,
                        target: moveTarget,
                        priority: 10
                    });
                }
            }
        });
        
        // Consider building if resources are high
        this.considerBuilding();
    }
    
    executeActions() {
        // Sort actions by priority
        this.actionPlan.sort((a, b) => b.priority - a.priority);
        
        // Execute actions
        this.actionPlan.forEach(action => {
            if (action.unit.canAct()) {
                switch (action.type) {
                    case 'move':
                        this.executeMove(action);
                        break;
                    case 'attack':
                        this.executeAttack(action);
                        break;
                    case 'build':
                        this.executeBuild(action);
                        break;
                    case 'ability':
                        this.executeAbility(action);
                        break;
                }
            }
        });
    }
    
    executeMove(action) {
        const success = this.gameState.moveUnit(action.unit, action.target.x, action.target.y);
        if (success) {
            console.log(`AI moved ${action.unit.type} to (${action.target.x}, ${action.target.y})`);
        }
    }
    
    executeAttack(action) {
        const success = this.gameState.attackTarget(action.unit, action.target.x, action.target.y);
        if (success) {
            console.log(`AI ${action.unit.type} attacked ${action.target.type}`);
        }
    }
    
    executeBuild(action) {
        // Building logic would go here
        console.log(`AI considering building ${action.buildingType}`);
    }
    
    executeAbility(action) {
        // Ability usage logic would go here
        console.log(`AI using ability ${action.ability}`);
    }
    
    findBestTarget(unit) {
        const enemyUnits = this.gameState.units.filter(u => u.faction !== this.faction && u.alive);
        const targetsInRange = enemyUnits.filter(enemy => {
            const distance = Math.abs(unit.x - enemy.x) + Math.abs(unit.y - enemy.y);
            return distance <= unit.range;
        });
        
        if (targetsInRange.length === 0) return null;
        
        // Prioritize weak targets that can be killed
        return targetsInRange.reduce((best, target) => {
            const targetPriority = this.calculateTargetValue(target, unit);
            const bestPriority = best ? this.calculateTargetValue(best, unit) : -1;
            return targetPriority > bestPriority ? target : best;
        }, null);
    }
    
    calculateTargetValue(target, attacker) {
        let value = 0;
        
        // Prefer targets that can be killed
        if (attacker.attack >= target.health) {
            value += 100;
        }
        
        // Prefer dangerous targets
        value += target.attack;
        
        // Prefer weak targets
        value += (target.maxHealth - target.health);
        
        // Penalty for well-defended targets
        value -= target.defense * 3;
        
        return value;
    }
    
    findSafePosition(unit) {
        const enemyUnits = this.gameState.units.filter(u => u.faction !== this.faction && u.alive);
        const possibleMoves = this.getPossibleMoves(unit);
        
        // Find position that minimizes enemy threat
        return possibleMoves.reduce((safest, pos) => {
            const threatLevel = this.calculatePositionThreat(pos, enemyUnits);
            if (!safest || threatLevel < this.calculatePositionThreat(safest, enemyUnits)) {
                return pos;
            }
            return safest;
        }, null);
    }
    
    findAggressiveMoveTarget(unit) {
        const enemyUnits = this.gameState.units.filter(u => u.faction !== this.faction && u.alive);
        if (enemyUnits.length === 0) return null;
        
        // Find closest enemy
        const closestEnemy = enemyUnits.reduce((closest, enemy) => {
            const distance = Math.abs(unit.x - enemy.x) + Math.abs(unit.y - enemy.y);
            const closestDistance = closest ? 
                Math.abs(unit.x - closest.x) + Math.abs(unit.y - closest.y) : Infinity;
            return distance < closestDistance ? enemy : closest;
        }, null);
        
        // Move towards closest enemy
        return this.getMoveTowardsTarget(unit, closestEnemy);
    }
    
    findTacticalMoveTarget(unit) {
        // Balanced movement - consider both offense and defense
        const enemyUnits = this.gameState.units.filter(u => u.faction !== this.faction && u.alive);
        const possibleMoves = this.getPossibleMoves(unit);
        
        return possibleMoves.reduce((best, pos) => {
            const score = this.calculatePositionScore(pos, unit, enemyUnits);
            const bestScore = best ? this.calculatePositionScore(best, unit, enemyUnits) : -Infinity;
            return score > bestScore ? pos : best;
        }, null);
    }
    
    getPossibleMoves(unit) {
        const moves = [];
        const range = unit.movement;
        
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const distance = Math.abs(dx) + Math.abs(dy);
                if (distance <= range && distance > 0) {
                    const x = unit.x + dx;
                    const y = unit.y + dy;
                    
                    if (this.gameState.grid.isValidPosition(x, y)) {
                        const occupant = this.gameState.getUnitAt(x, y) || this.gameState.getBuildingAt(x, y);
                        if (!occupant) {
                            moves.push({ x, y });
                        }
                    }
                }
            }
        }
        
        return moves;
    }
    
    calculatePositionThreat(pos, enemyUnits) {
        return enemyUnits.reduce((threat, enemy) => {
            const distance = Math.abs(pos.x - enemy.x) + Math.abs(pos.y - enemy.y);
            if (distance <= enemy.range) {
                return threat + enemy.attack;
            }
            return threat;
        }, 0);
    }
    
    calculatePositionScore(pos, unit, enemyUnits) {
        let score = 0;
        
        // Penalty for being in range of enemies
        score -= this.calculatePositionThreat(pos, enemyUnits) * 2;
        
        // Bonus for being able to attack enemies
        enemyUnits.forEach(enemy => {
            const distance = Math.abs(pos.x - enemy.x) + Math.abs(pos.y - enemy.y);
            if (distance <= unit.range) {
                score += 30;
                if (unit.attack >= enemy.health) {
                    score += 50; // Can kill this enemy
                }
            }
        });
        
        // Slight preference for defensive terrain
        const tile = this.gameState.grid.getTile(pos.x, pos.y);
        if (tile) {
            score += tile.defensiveBonus * 5;
        }
        
        return score;
    }
    
    getMoveTowardsTarget(unit, target) {
        const possibleMoves = this.getPossibleMoves(unit);
        
        return possibleMoves.reduce((best, pos) => {
            const distance = Math.abs(pos.x - target.x) + Math.abs(pos.y - target.y);
            const bestDistance = best ? 
                Math.abs(best.x - target.x) + Math.abs(best.y - target.y) : Infinity;
            return distance < bestDistance ? pos : best;
        }, null);
    }
    
    considerBuilding() {
        const resources = this.gameState.getCurrentResources();
        
        // Simple building logic - build if we have excess resources
        if (resources.energy > 150 && resources.alloys > 100) {
            const buildings = this.gameState.factionManager.getFactionBuildings(this.faction);
            if (buildings.length > 0) {
                // Find a suitable location for building
                const buildLocation = this.findBuildLocation();
                if (buildLocation) {
                    this.actionPlan.push({
                        type: 'build',
                        buildingType: buildings[0].type,
                        target: buildLocation,
                        priority: 25
                    });
                }
            }
        }
    }
    
    findBuildLocation() {
        // Find an empty tile near our units
        const myUnits = this.gameState.units.filter(u => u.faction === this.faction && u.alive);
        if (myUnits.length === 0) return null;
        
        // Try to build near our units
        for (const unit of myUnits) {
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const x = unit.x + dx;
                    const y = unit.y + dy;
                    
                    if (this.gameState.grid.isValidPosition(x, y)) {
                        const occupant = this.gameState.getUnitAt(x, y) || this.gameState.getBuildingAt(x, y);
                        if (!occupant) {
                            return { x, y };
                        }
                    }
                }
            }
        }
        
        return null;
    }
}