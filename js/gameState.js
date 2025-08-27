import { Unit } from './units.js';
import { FactionManager } from './factions.js';
import { Building } from './buildings.js';
import { AIPlayer } from './ai.js';

export class GameState {
    constructor() {
        this.currentFaction = 'neocorp';
        this.currentTurn = 1;
        this.currentPhase = 'resource'; // resource, action, event
        this.currentAction = null; // move, attack, build, ability
        
        this.factionManager = new FactionManager();
        this.units = [];
        this.buildings = [];
        
        this.selectedUnit = null;
        this.selectedTile = null;
        
        // Resources for each faction
        this.resources = {
            neocorp: { energy: 100, alloys: 50, voidShards: 0 },
            xenotech: { energy: 100, alloys: 50, voidShards: 0 },
            overmind: { energy: 100, alloys: 50, voidShards: 0 }
        };
        
        this.gameOver = false;
        this.winner = null;
        
        // AI players
        this.aiPlayers = {
            xenotech: new AIPlayer('xenotech', this),
            overmind: new AIPlayer('overmind', this)
        };
    }
    
    initializeStartingUnits(grid) {
        // NeoCorp starting units and buildings (left side)
        this.addUnit('neocorp', 'scout_drone', 2, 7);
        this.addUnit('neocorp', 'mech_infantry', 1, 6);
        this.addUnit('neocorp', 'mech_infantry', 1, 8);
        this.addBuilding('neocorp', 'command_center', 0, 7);
        
        // Xenotech starting units and buildings (center)
        this.addUnit('xenotech', 'bio_drone', 10, 7);
        this.addUnit('xenotech', 'mutagen_beast', 9, 6);
        this.addUnit('xenotech', 'bio_drone', 9, 8);
        this.addBuilding('xenotech', 'spawning_pool', 10, 5);
        
        // AI Overmind starting units and buildings (right side)
        this.addUnit('overmind', 'nanobot_swarm', 18, 7);
        this.addUnit('overmind', 'sentinel_turret', 17, 6);
        this.addUnit('overmind', 'quantum_hacker', 17, 8);
        this.addBuilding('overmind', 'ai_core', 19, 7);
    }
    
    addUnit(faction, unitType, x, y) {
        const unit = new Unit(faction, unitType, x, y);
        this.units.push(unit);
        return unit;
    }
    
    removeUnit(unit) {
        const index = this.units.indexOf(unit);
        if (index > -1) {
            this.units.splice(index, 1);
        }
    }
    
    getUnitAt(x, y) {
        return this.units.find(unit => unit.x === x && unit.y === y && unit.alive);
    }
    
    getBuildingAt(x, y) {
        return this.buildings.find(building => building.x === x && building.y === y && building.alive);
    }
    
    addBuilding(faction, buildingType, x, y) {
        const building = new Building(faction, buildingType, x, y);
        this.buildings.push(building);
        return building;
    }
    
    removeBuilding(building) {
        const index = this.buildings.indexOf(building);
        if (index > -1) {
            this.buildings.splice(index, 1);
        }
    }
    
    getCurrentFactionUnits() {
        return this.units.filter(unit => unit.faction === this.currentFaction && unit.alive);
    }
    
    moveUnit(unit, targetX, targetY) {
        if (!unit || unit.faction !== this.currentFaction) return false;
        if (unit.actionPoints <= 0) return false;
        
        // Check if target position is valid and not occupied
        const targetUnit = this.getUnitAt(targetX, targetY);
        const targetBuilding = this.getBuildingAt(targetX, targetY);
        if (targetUnit || targetBuilding) return false;
        
        // Simple movement - can be enhanced with pathfinding
        const distance = Math.abs(unit.x - targetX) + Math.abs(unit.y - targetY);
        if (distance > unit.movement) return false;
        
        unit.x = targetX;
        unit.y = targetY;
        unit.actionPoints -= 1;
        
        console.log(`${unit.type} moved to (${targetX}, ${targetY})`);
        return true;
    }
    
    attackTarget(attacker, targetX, targetY) {
        if (!attacker || attacker.faction !== this.currentFaction) return false;
        if (attacker.actionPoints <= 0) return false;
        
        const target = this.getUnitAt(targetX, targetY);
        if (!target || target.faction === attacker.faction) return false;
        
        // Check range
        const distance = Math.abs(attacker.x - targetX) + Math.abs(attacker.y - targetY);
        if (distance > attacker.range) return false;
        
        // Calculate damage
        const baseDamage = attacker.attack;
        const accuracy = attacker.accuracy;
        
        if (Math.random() * 100 < accuracy) {
            target.health -= baseDamage;
            console.log(`${attacker.type} attacked ${target.type} for ${baseDamage} damage`);
            
            if (target.health <= 0) {
                target.alive = false;
                console.log(`${target.type} destroyed!`);
            }
        } else {
            console.log(`${attacker.type} missed attack on ${target.type}`);
        }
        
        attacker.actionPoints -= 1;
        return true;
    }
    
    endTurn() {
        // Reset action points for current faction units
        this.getCurrentFactionUnits().forEach(unit => {
            unit.actionPoints = unit.maxActionPoints;
        });
        
        // Switch to next faction
        const factions = ['neocorp', 'xenotech', 'overmind'];
        const currentIndex = factions.indexOf(this.currentFaction);
        const nextIndex = (currentIndex + 1) % factions.length;
        
        if (nextIndex === 0) {
            this.currentTurn++;
        }
        
        this.currentFaction = factions[nextIndex];
        this.currentPhase = 'resource';
        this.currentAction = null;
        this.selectedUnit = null;
        
        // Harvest resources
        this.harvestResources();
        
        console.log(`Turn ${this.currentTurn} - ${this.currentFaction} faction`);
        
        // If current faction is AI, let AI take its turn
        if (this.aiPlayers[this.currentFaction]) {
            setTimeout(() => {
                this.aiPlayers[this.currentFaction].takeTurn();
            }, 1000); // 1 second delay for AI turn
        }
    }
    
    harvestResources() {
        // Base income
        const baseIncome = {
            energy: 10,
            alloys: 5,
            voidShards: 0
        };
        
        const factionResources = this.resources[this.currentFaction];
        factionResources.energy += baseIncome.energy;
        factionResources.alloys += baseIncome.alloys;
        
        // Building resource generation
        this.buildings.forEach(building => {
            if (building.faction === this.currentFaction && building.alive) {
                building.generateResources(this);
                building.updateProduction(this);
            }
        });
        
        // Resource tiles bonus
        // Implementation for crystal veins and other resource tiles would go here
    }
    
    getCurrentResources() {
        return this.resources[this.currentFaction];
    }
    
    spendResources(cost) {
        const resources = this.getCurrentResources();
        
        // Check if we have enough resources
        for (const [resource, amount] of Object.entries(cost)) {
            if (resources[resource] < amount) {
                return false;
            }
        }
        
        // Spend the resources
        for (const [resource, amount] of Object.entries(cost)) {
            resources[resource] -= amount;
        }
        
        return true;
    }
    
    update(deltaTime) {
        // Update game logic here
        this.checkVictoryConditions();
        
        // Show game over screen if game ended
        if (this.gameOver && this.winner) {
            // This would be handled by the UI manager
            console.log(`Game Over! Winner: ${this.winner}`);
        }
    }
    
    checkVictoryConditions() {
        // Simple victory condition: eliminate all enemy units
        const aliveFactions = new Set();
        this.units.forEach(unit => {
            if (unit.alive) {
                aliveFactions.add(unit.faction);
            }
        });
        
        if (aliveFactions.size <= 1) {
            this.gameOver = true;
            this.winner = aliveFactions.values().next().value;
            console.log(`Game Over! Winner: ${this.winner}`);
        }
    }
}