export class Unit {
    constructor(faction, type, x, y) {
        this.faction = faction;
        this.type = type;
        this.x = x;
        this.y = y;
        this.alive = true;
        
        // Get unit stats from faction data
        const stats = this.getUnitStats(faction, type);
        
        this.health = stats.health;
        this.maxHealth = stats.health;
        this.attack = stats.attack;
        this.defense = stats.defense;
        this.movement = stats.movement;
        this.range = stats.range;
        this.accuracy = stats.accuracy;
        this.maxActionPoints = stats.actionPoints;
        this.actionPoints = stats.actionPoints;
        this.cost = stats.cost;
        this.abilities = stats.abilities || [];
        
        // Visual properties
        this.color = this.getFactionColor(faction);
        this.symbol = this.getUnitSymbol(type);
    }
    
    getUnitStats(faction, type) {
        const unitData = {
            // NeoCorp Syndicate Units
            neocorp: {
                scout_drone: {
                    health: 30,
                    attack: 15,
                    defense: 1,
                    movement: 4,
                    range: 3,
                    accuracy: 85,
                    actionPoints: 2,
                    cost: { energy: 20, alloys: 10 }
                },
                mech_infantry: {
                    health: 60,
                    attack: 25,
                    defense: 3,
                    movement: 3,
                    range: 2,
                    accuracy: 80,
                    actionPoints: 2,
                    cost: { energy: 30, alloys: 20 }
                },
                titan_walker: {
                    health: 120,
                    attack: 40,
                    defense: 5,
                    movement: 2,
                    range: 3,
                    accuracy: 75,
                    actionPoints: 1,
                    cost: { energy: 60, alloys: 40 }
                }
            },
            
            // Xenotech Collective Units
            xenotech: {
                bio_drone: {
                    health: 25,
                    attack: 20,
                    defense: 1,
                    movement: 3,
                    range: 1,
                    accuracy: 90,
                    actionPoints: 2,
                    cost: { energy: 15, alloys: 5 },
                    abilities: ['swarm']
                },
                mutagen_beast: {
                    health: 80,
                    attack: 35,
                    defense: 2,
                    movement: 3,
                    range: 1,
                    accuracy: 85,
                    actionPoints: 2,
                    cost: { energy: 40, alloys: 15 },
                    abilities: ['evolve']
                },
                hive_node: {
                    health: 100,
                    attack: 15,
                    defense: 4,
                    movement: 1,
                    range: 2,
                    accuracy: 70,
                    actionPoints: 1,
                    cost: { energy: 50, alloys: 30 },
                    abilities: ['spawn']
                }
            },
            
            // AI Overmind Units
            overmind: {
                nanobot_swarm: {
                    health: 40,
                    attack: 18,
                    defense: 2,
                    movement: 3,
                    range: 2,
                    accuracy: 88,
                    actionPoints: 2,
                    cost: { energy: 25, alloys: 15 },
                    abilities: ['repair']
                },
                sentinel_turret: {
                    health: 90,
                    attack: 30,
                    defense: 6,
                    movement: 0,
                    range: 4,
                    accuracy: 95,
                    actionPoints: 2,
                    cost: { energy: 40, alloys: 35 },
                    abilities: ['auto_target']
                },
                quantum_hacker: {
                    health: 50,
                    attack: 20,
                    defense: 2,
                    movement: 3,
                    range: 3,
                    accuracy: 85,
                    actionPoints: 2,
                    cost: { energy: 35, alloys: 25 },
                    abilities: ['teleport', 'hack']
                }
            }
        };
        
        return unitData[faction]?.[type] || {
            health: 50, attack: 20, defense: 2, movement: 2, range: 2, 
            accuracy: 75, actionPoints: 2, cost: { energy: 30, alloys: 20 }
        };
    }
    
    getFactionColor(faction) {
        const colors = {
            neocorp: '#00ff00',    // Green
            xenotech: '#ff6600',   // Orange
            overmind: '#00ccff'    // Cyan
        };
        return colors[faction] || '#ffffff';
    }
    
    getUnitSymbol(type) {
        const symbols = {
            // NeoCorp
            scout_drone: 'S',
            mech_infantry: 'M',
            titan_walker: 'T',
            
            // Xenotech
            bio_drone: 'B',
            mutagen_beast: 'X',
            hive_node: 'H',
            
            // Overmind
            nanobot_swarm: 'N',
            sentinel_turret: '◊',
            quantum_hacker: 'Q'
        };
        return symbols[type] || '?';
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health -= actualDamage;
        
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
        }
        
        return actualDamage;
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    canAct() {
        return this.alive && this.actionPoints > 0;
    }
    
    resetActionPoints() {
        this.actionPoints = this.maxActionPoints;
    }
    
    // Use an ability
    useAbility(abilityName, target = null) {
        if (!this.abilities.includes(abilityName) || this.actionPoints <= 0) {
            return false;
        }
        
        switch (abilityName) {
            case 'swarm':
                // Bio-drones get attack bonus when near other bio-drones
                return this.swarmAbility();
            case 'evolve':
                // Mutagen beasts can evolve to gain stats
                return this.evolveAbility();
            case 'teleport':
                // Quantum hackers can teleport short distances
                return this.teleportAbility(target);
            case 'repair':
                // Nanobots can repair nearby units
                return this.repairAbility(target);
            default:
                return false;
        }
    }
    
    swarmAbility() {
        // Implementation for swarm ability
        this.actionPoints -= 1;
        return true;
    }
    
    evolveAbility() {
        // Evolve to gain permanent stat boosts
        this.maxHealth += 10;
        this.health += 10;
        this.attack += 5;
        this.actionPoints -= 1;
        return true;
    }
    
    teleportAbility(target) {
        if (target && typeof target === 'object' && target.x !== undefined && target.y !== undefined) {
            this.x = target.x;
            this.y = target.y;
            this.actionPoints -= 1;
            return true;
        }
        return false;
    }
    
    repairAbility(target) {
        if (target && target.faction === this.faction) {
            target.heal(20);
            this.actionPoints -= 1;
            return true;
        }
        return false;
    }
    
    getDisplayName() {
        return this.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}