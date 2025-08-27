export class FactionManager {
    constructor() {
        this.factions = {
            neocorp: {
                name: 'NeoCorp Syndicate',
                color: '#00ff00',
                description: 'Human-focused, balanced faction emphasizing adaptability and economy',
                traits: ['adaptable', 'economic'],
                units: ['scout_drone', 'mech_infantry', 'titan_walker'],
                specialAbilities: ['corporate_espionage', 'supply_drop']
            },
            xenotech: {
                name: 'Xenotech Collective',
                color: '#ff6600', 
                description: 'Alien-hybrid faction focusing on swarm tactics and mutation',
                traits: ['aggressive', 'evolutionary'],
                units: ['bio_drone', 'mutagen_beast', 'hive_node'],
                specialAbilities: ['mutation_burst', 'hive_mind']
            },
            overmind: {
                name: 'AI Overmind',
                color: '#00ccff',
                description: 'Robotic faction relying on tech superiority and automation',
                traits: ['defensive', 'technological'],
                units: ['nanobot_swarm', 'sentinel_turret', 'quantum_hacker'],
                specialAbilities: ['system_override', 'singularity_bomb']
            }
        };
    }
    
    getFaction(factionId) {
        return this.factions[factionId];
    }
    
    getFactionColor(factionId) {
        return this.factions[factionId]?.color || '#ffffff';
    }
    
    getFactionName(factionId) {
        return this.factions[factionId]?.name || 'Unknown Faction';
    }
    
    getAllFactions() {
        return Object.keys(this.factions);
    }
    
    // Get faction-specific building types
    getFactionBuildings(factionId) {
        const buildings = {
            neocorp: [
                {
                    type: 'command_center',
                    name: 'Command Center',
                    cost: { energy: 100, alloys: 80 },
                    health: 150,
                    abilities: ['unit_production', 'resource_boost']
                },
                {
                    type: 'supply_depot',
                    name: 'Supply Depot',
                    cost: { energy: 50, alloys: 40 },
                    health: 80,
                    abilities: ['resource_storage']
                },
                {
                    type: 'research_lab',
                    name: 'Research Lab',
                    cost: { energy: 80, alloys: 60 },
                    health: 60,
                    abilities: ['tech_research']
                }
            ],
            xenotech: [
                {
                    type: 'spawning_pool',
                    name: 'Spawning Pool',
                    cost: { energy: 90, alloys: 70 },
                    health: 120,
                    abilities: ['bio_production', 'evolution']
                },
                {
                    type: 'mutation_chamber',
                    name: 'Mutation Chamber',
                    cost: { energy: 70, alloys: 50 },
                    health: 90,
                    abilities: ['unit_upgrade']
                },
                {
                    type: 'neural_network',
                    name: 'Neural Network',
                    cost: { energy: 60, alloys: 40 },
                    health: 70,
                    abilities: ['mind_link']
                }
            ],
            overmind: [
                {
                    type: 'ai_core',
                    name: 'AI Core',
                    cost: { energy: 120, alloys: 100 },
                    health: 200,
                    abilities: ['automated_production', 'system_control']
                },
                {
                    type: 'assembly_plant',
                    name: 'Assembly Plant',
                    cost: { energy: 80, alloys: 90 },
                    health: 100,
                    abilities: ['mass_production']
                },
                {
                    type: 'quantum_relay',
                    name: 'Quantum Relay',
                    cost: { energy: 60, alloys: 70 },
                    health: 80,
                    abilities: ['teleportation_hub']
                }
            ]
        };
        
        return buildings[factionId] || [];
    }
    
    // Get faction-specific technologies
    getFactionTech(factionId) {
        const tech = {
            neocorp: [
                { name: 'Advanced Logistics', cost: { energy: 100, alloys: 50 }, effect: 'Increased movement range' },
                { name: 'Modular Weapons', cost: { energy: 80, alloys: 60 }, effect: 'Unit customization' },
                { name: 'Corporate Network', cost: { energy: 120, alloys: 40 }, effect: 'Resource sharing' }
            ],
            xenotech: [
                { name: 'Rapid Evolution', cost: { energy: 90, alloys: 30 }, effect: 'Faster mutations' },
                { name: 'Hive Coordination', cost: { energy: 70, alloys: 40 }, effect: 'Swarm bonuses' },
                { name: 'Adaptive Biology', cost: { energy: 100, alloys: 60 }, effect: 'Environmental resistance' }
            ],
            overmind: [
                { name: 'Quantum Computing', cost: { energy: 150, alloys: 80 }, effect: 'Enhanced AI abilities' },
                { name: 'Automated Systems', cost: { energy: 100, alloys: 70 }, effect: 'Self-repair capabilities' },
                { name: 'Neural Interface', cost: { energy: 80, alloys: 50 }, effect: 'Unit coordination' }
            ]
        };
        
        return tech[factionId] || [];
    }
    
    // Special faction abilities
    useFactionAbility(factionId, abilityName, gameState) {
        switch (factionId) {
            case 'neocorp':
                return this.useNeoCorpAbility(abilityName, gameState);
            case 'xenotech':
                return this.useXenotechAbility(abilityName, gameState);
            case 'overmind':
                return this.useOvermindAbility(abilityName, gameState);
            default:
                return false;
        }
    }
    
    useNeoCorpAbility(abilityName, gameState) {
        switch (abilityName) {
            case 'corporate_espionage':
                // Steal resources from enemy factions
                return this.corporateEspionage(gameState);
            case 'supply_drop':
                // Emergency resource delivery
                return this.supplyDrop(gameState);
            default:
                return false;
        }
    }
    
    useXenotechAbility(abilityName, gameState) {
        switch (abilityName) {
            case 'mutation_burst':
                // Rapidly evolve all units
                return this.mutationBurst(gameState);
            case 'hive_mind':
                // Share health between units
                return this.hiveMind(gameState);
            default:
                return false;
        }
    }
    
    useOvermindAbility(abilityName, gameState) {
        switch (abilityName) {
            case 'system_override':
                // Take control of enemy units temporarily
                return this.systemOverride(gameState);
            case 'singularity_bomb':
                // Create a black hole effect
                return this.singularityBomb(gameState);
            default:
                return false;
        }
    }
    
    // Ability implementations
    corporateEspionage(gameState) {
        const cost = { energy: 50, voidShards: 1 };
        if (!gameState.spendResources(cost)) return false;
        
        // Steal resources from each enemy faction
        const enemyFactions = ['xenotech', 'overmind'].filter(f => f !== 'neocorp');
        enemyFactions.forEach(faction => {
            const stolen = Math.min(20, gameState.resources[faction].energy);
            gameState.resources[faction].energy -= stolen;
            gameState.resources.neocorp.energy += stolen;
        });
        
        return true;
    }
    
    supplyDrop(gameState) {
        const cost = { voidShards: 1 };
        if (!gameState.spendResources(cost)) return false;
        
        gameState.resources.neocorp.energy += 50;
        gameState.resources.neocorp.alloys += 30;
        
        return true;
    }
    
    mutationBurst(gameState) {
        const cost = { energy: 80, voidShards: 1 };
        if (!gameState.spendResources(cost)) return false;
        
        // Evolve all xenotech units
        gameState.units.filter(u => u.faction === 'xenotech' && u.alive).forEach(unit => {
            unit.maxHealth += 10;
            unit.health += 10;
            unit.attack += 3;
        });
        
        return true;
    }
    
    hiveMind(gameState) {
        const cost = { energy: 60 };
        if (!gameState.spendResources(cost)) return false;
        
        // Average health across all living xenotech units
        const units = gameState.units.filter(u => u.faction === 'xenotech' && u.alive);
        if (units.length === 0) return false;
        
        const totalHealth = units.reduce((sum, unit) => sum + unit.health, 0);
        const avgHealth = Math.floor(totalHealth / units.length);
        
        units.forEach(unit => {
            unit.health = Math.min(unit.maxHealth, avgHealth);
        });
        
        return true;
    }
    
    systemOverride(gameState) {
        const cost = { energy: 100, voidShards: 2 };
        if (!gameState.spendResources(cost)) return false;
        
        // This would temporarily take control of an enemy unit
        // Implementation would require UI selection
        return true;
    }
    
    singularityBomb(gameState) {
        const cost = { energy: 150, voidShards: 3 };
        if (!gameState.spendResources(cost)) return false;
        
        // Create area of effect damage
        // Implementation would require target selection
        return true;
    }
}