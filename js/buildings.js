export class Building {
    constructor(faction, type, x, y) {
        this.faction = faction;
        this.type = type;
        this.x = x;
        this.y = y;
        this.alive = true;
        
        const stats = this.getBuildingStats(faction, type);
        
        this.health = stats.health;
        this.maxHealth = stats.health;
        this.cost = stats.cost;
        this.abilities = stats.abilities || [];
        this.productionQueue = [];
        this.energyGeneration = stats.energyGeneration || 0;
        this.alloyGeneration = stats.alloyGeneration || 0;
        
        // Visual properties
        this.color = this.getFactionColor(faction);
        this.symbol = this.getBuildingSymbol(type);
    }
    
    getBuildingStats(faction, type) {
        const buildingData = {
            // NeoCorp Buildings
            neocorp: {
                command_center: {
                    health: 150,
                    cost: { energy: 100, alloys: 80 },
                    abilities: ['unit_production', 'resource_boost'],
                    energyGeneration: 20,
                    alloyGeneration: 10
                },
                supply_depot: {
                    health: 80,
                    cost: { energy: 50, alloys: 40 },
                    abilities: ['resource_storage'],
                    energyGeneration: 15,
                    alloyGeneration: 5
                },
                research_lab: {
                    health: 60,
                    cost: { energy: 80, alloys: 60 },
                    abilities: ['tech_research'],
                    energyGeneration: 5,
                    alloyGeneration: 0
                }
            },
            
            // Xenotech Buildings
            xenotech: {
                spawning_pool: {
                    health: 120,
                    cost: { energy: 90, alloys: 70 },
                    abilities: ['bio_production', 'evolution'],
                    energyGeneration: 15,
                    alloyGeneration: 8
                },
                mutation_chamber: {
                    health: 90,
                    cost: { energy: 70, alloys: 50 },
                    abilities: ['unit_upgrade'],
                    energyGeneration: 10,
                    alloyGeneration: 12
                },
                neural_network: {
                    health: 70,
                    cost: { energy: 60, alloys: 40 },
                    abilities: ['mind_link'],
                    energyGeneration: 8,
                    alloyGeneration: 5
                }
            },
            
            // AI Overmind Buildings
            overmind: {
                ai_core: {
                    health: 200,
                    cost: { energy: 120, alloys: 100 },
                    abilities: ['automated_production', 'system_control'],
                    energyGeneration: 25,
                    alloyGeneration: 15
                },
                assembly_plant: {
                    health: 100,
                    cost: { energy: 80, alloys: 90 },
                    abilities: ['mass_production'],
                    energyGeneration: 12,
                    alloyGeneration: 18
                },
                quantum_relay: {
                    health: 80,
                    cost: { energy: 60, alloys: 70 },
                    abilities: ['teleportation_hub'],
                    energyGeneration: 10,
                    alloyGeneration: 8
                }
            }
        };
        
        return buildingData[faction]?.[type] || {
            health: 100, cost: { energy: 50, alloys: 50 }, 
            abilities: [], energyGeneration: 10, alloyGeneration: 5
        };
    }
    
    getFactionColor(faction) {
        const colors = {
            neocorp: '#00ff00',
            xenotech: '#ff6600',
            overmind: '#00ccff'
        };
        return colors[faction] || '#ffffff';
    }
    
    getBuildingSymbol(type) {
        const symbols = {
            // NeoCorp
            command_center: '⬛',
            supply_depot: '■',
            research_lab: '◈',
            
            // Xenotech
            spawning_pool: '●',
            mutation_chamber: '◉',
            neural_network: '◎',
            
            // Overmind
            ai_core: '▣',
            assembly_plant: '▤',
            quantum_relay: '◊'
        };
        return symbols[type] || '▓';
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
        }
        return damage;
    }
    
    repair(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    // Production methods
    canProduceUnit(unitType, gameState) {
        // Simple cost calculation without creating unit instance
        const unitCosts = {
            scout_drone: { energy: 20, alloys: 10 },
            mech_infantry: { energy: 30, alloys: 20 },
            bio_drone: { energy: 15, alloys: 5 },
            mutagen_beast: { energy: 40, alloys: 15 },
            nanobot_swarm: { energy: 25, alloys: 15 },
            sentinel_turret: { energy: 40, alloys: 35 }
        };
        
        const cost = unitCosts[unitType] || { energy: 30, alloys: 20 };
        
        return gameState.getCurrentResources().energy >= cost.energy &&
               gameState.getCurrentResources().alloys >= cost.alloys;
    }
    
    produceUnit(unitType, gameState) {
        const unitCosts = {
            scout_drone: { energy: 20, alloys: 10 },
            mech_infantry: { energy: 30, alloys: 20 },
            bio_drone: { energy: 15, alloys: 5 },
            mutagen_beast: { energy: 40, alloys: 15 },
            nanobot_swarm: { energy: 25, alloys: 15 },
            sentinel_turret: { energy: 40, alloys: 35 }
        };
        
        const cost = unitCosts[unitType] || { energy: 30, alloys: 20 };
        
        if (!gameState.getCurrentResources().energy >= cost.energy ||
            !gameState.getCurrentResources().alloys >= cost.alloys) {
            return false;
        }
        
        if (gameState.spendResources(cost)) {
            // Add to production queue (units take time to produce)
            this.productionQueue.push({
                type: unitType,
                turnsRemaining: 2 // Units take 2 turns to produce
            });
            
            return true;
        }
        
        return false;
    }
    
    updateProduction(gameState) {
        // Process production queue
        for (let i = this.productionQueue.length - 1; i >= 0; i--) {
            const production = this.productionQueue[i];
            production.turnsRemaining--;
            
            if (production.turnsRemaining <= 0) {
                // Find empty adjacent tile to spawn unit
                const spawnPosition = this.findSpawnPosition(gameState);
                if (spawnPosition) {
                    gameState.addUnit(this.faction, production.type, spawnPosition.x, spawnPosition.y);
                    console.log(`${production.type} produced at (${spawnPosition.x}, ${spawnPosition.y})`);
                }
                
                this.productionQueue.splice(i, 1);
            }
        }
    }
    
    findSpawnPosition(gameState) {
        // Check adjacent tiles for empty space
        const directions = [
            [0, -1], [1, 0], [0, 1], [-1, 0], // Cardinal directions first
            [-1, -1], [1, -1], [1, 1], [-1, 1] // Diagonal directions
        ];
        
        for (const [dx, dy] of directions) {
            const x = this.x + dx;
            const y = this.y + dy;
            
            if (gameState.grid && gameState.grid.isValidPosition(x, y)) {
                const unit = gameState.getUnitAt(x, y);
                const building = gameState.getBuildingAt(x, y);
                
                if (!unit && !building) {
                    return { x, y };
                }
            }
        }
        
        return null; // No spawn position available
    }
    
    // Generate resources each turn
    generateResources(gameState) {
        const resources = gameState.getCurrentResources();
        resources.energy += this.energyGeneration;
        resources.alloys += this.alloyGeneration;
    }
    
    // Use building abilities
    useAbility(abilityName, gameState, target = null) {
        if (!this.abilities.includes(abilityName)) return false;
        
        switch (abilityName) {
            case 'unit_production':
                return this.unitProductionAbility(gameState, target);
            case 'resource_boost':
                return this.resourceBoostAbility(gameState);
            case 'tech_research':
                return this.techResearchAbility(gameState, target);
            case 'bio_production':
                return this.bioProductionAbility(gameState, target);
            case 'evolution':
                return this.evolutionAbility(gameState);
            case 'automated_production':
                return this.automatedProductionAbility(gameState);
            case 'system_control':
                return this.systemControlAbility(gameState);
            default:
                return false;
        }
    }
    
    unitProductionAbility(gameState, unitType) {
        if (unitType) {
            return this.produceUnit(unitType, gameState);
        }
        return false;
    }
    
    resourceBoostAbility(gameState) {
        // Temporary resource generation boost
        const resources = gameState.getCurrentResources();
        resources.energy += 30;
        resources.alloys += 20;
        return true;
    }
    
    techResearchAbility(gameState, techName) {
        // Research new technologies
        const cost = { energy: 100, alloys: 50 };
        if (gameState.spendResources(cost)) {
            console.log(`Researching ${techName}`);
            return true;
        }
        return false;
    }
    
    bioProductionAbility(gameState, unitType) {
        // Xenotech's biological production is faster
        if (unitType && this.canProduceUnit(unitType, gameState)) {
            const unitStats = new (require('./units.js').Unit)(this.faction, unitType, 0, 0);
            const cost = unitStats.cost;
            
            if (gameState.spendResources(cost)) {
                this.productionQueue.push({
                    type: unitType,
                    turnsRemaining: 1 // Bio units produce faster
                });
                return true;
            }
        }
        return false;
    }
    
    evolutionAbility(gameState) {
        // Evolve nearby units
        const nearbyUnits = gameState.units.filter(unit => {
            const distance = Math.abs(unit.x - this.x) + Math.abs(unit.y - this.y);
            return distance <= 2 && unit.faction === this.faction && unit.alive;
        });
        
        nearbyUnits.forEach(unit => {
            unit.maxHealth += 5;
            unit.health += 5;
            unit.attack += 2;
        });
        
        return nearbyUnits.length > 0;
    }
    
    automatedProductionAbility(gameState) {
        // AI Overmind's automated production
        const unitTypes = ['nanobot_swarm', 'sentinel_turret'];
        const randomUnit = unitTypes[Math.floor(Math.random() * unitTypes.length)];
        
        if (this.canProduceUnit(randomUnit, gameState)) {
            return this.produceUnit(randomUnit, gameState);
        }
        return false;
    }
    
    systemControlAbility(gameState) {
        // Take control of nearby enemy units temporarily
        const nearbyEnemies = gameState.units.filter(unit => {
            const distance = Math.abs(unit.x - this.x) + Math.abs(unit.y - this.y);
            return distance <= 3 && unit.faction !== this.faction && unit.alive;
        });
        
        // This would require more complex implementation for temporary control
        console.log(`System override affecting ${nearbyEnemies.length} enemy units`);
        return nearbyEnemies.length > 0;
    }
    
    getDisplayName() {
        return this.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}