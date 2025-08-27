# Voidforge Tactics

A 2D grid-based turn-based sci-fi strategy game built with HTML5 Canvas and JavaScript.

## Game Overview

Voidforge Tactics is set in a gritty sci-fi universe where interstellar corporations wage war over rare "Void Crystals" – ancient artifacts that bend reality and power advanced technologies. Players take command of a corporate expedition force stranded on procedurally generated alien planets.

## Features

### Core Gameplay
- **Grid-based tactical combat** on a 20x15 hex grid
- **Turn-based strategy** with action point system
- **Three unique factions** with asymmetric gameplay:
  - **NeoCorp Syndicate**: Human-focused, balanced faction emphasizing adaptability
  - **Xenotech Collective**: Alien-hybrid faction focusing on swarm tactics and mutation
  - **AI Overmind**: Robotic faction relying on tech superiority and automation

### Game Systems
- **Resource Management**: Collect Energy, Alloys, and Void Shards
- **Unit Combat**: Line-of-sight based combat with cover and range mechanics
- **Building System**: Construct faction-specific buildings for unit production and resource generation
- **AI Opponents**: Intelligent AI with faction-specific strategies
- **Terrain Types**: Different terrain affects movement, defense, and resources

### Controls
- **Mouse**: Click to select units and tiles, hover for information
- **M**: Move mode
- **A**: Attack mode  
- **B**: Build mode
- **Q**: Ability mode
- **Space**: End turn
- **Escape**: Cancel current action

## Quick Start

1. Open `index.html` in a modern web browser
2. The game starts with you controlling the NeoCorp Syndicate (green)
3. Select a unit by clicking on it
4. Choose an action (Move/Attack/Build/Ability) from the UI or keyboard shortcuts
5. Click on a target tile to execute the action
6. Press Space or click "End Turn" when ready
7. AI factions will take their turns automatically

## Faction Details

### NeoCorp Syndicate (Green)
- **Scout Drone**: Fast reconnaissance unit with low health
- **Mech Infantry**: Versatile shooter with modular weapons
- **Titan Walker**: Heavy tank that can fortify positions
- **Command Center**: Main base for unit production and resource generation

### Xenotech Collective (Orange)  
- **Bio-Drone**: Self-replicating swarm units
- **Mutagen Beast**: Melee unit that evolves mid-battle
- **Spawning Pool**: Biological production facility

### AI Overmind (Cyan)
- **Nanobot Swarm**: Repair allies and deconstruct enemies
- **Sentinel Turret**: Stationary defender with auto-targeting
- **Quantum Hacker**: Disrupt enemy tech, teleport short distances
- **AI Core**: Automated production and system control

## Victory Conditions

Currently implemented: **Elimination** - Destroy all enemy units to win.

## Technical Details

### Architecture
- **Modular JavaScript ES6**: Clean separation of concerns
- **HTML5 Canvas**: Hardware-accelerated 2D rendering
- **No external dependencies**: Pure vanilla JavaScript
- **Component-based design**: Easy to extend and modify

### File Structure
```
├── index.html          # Main game page
├── js/
│   ├── main.js         # Entry point
│   ├── game.js         # Main game loop and coordination
│   ├── gameState.js    # Game state management
│   ├── grid.js         # Grid system and terrain
│   ├── units.js        # Unit definitions and behavior
│   ├── buildings.js    # Building system
│   ├── factions.js     # Faction data and abilities
│   ├── renderer.js     # Graphics and visual effects
│   ├── input.js        # Input handling
│   ├── ui.js           # User interface management
│   └── ai.js           # AI behavior and strategy
```

## Future Enhancements

The game is designed to be easily extensible. Potential additions include:
- Multiplayer support (local and online)
- Campaign mode with story missions
- More unit types and abilities
- Procedural map generation
- Advanced AI difficulty levels
- Save/load functionality
- Sound effects and music
- Particle effects and animations

## Development

To modify the game:
1. Edit the JavaScript modules in the `js/` directory
2. Refresh the browser to see changes
3. Use browser developer tools for debugging
4. The game object is available as `window.game` for console testing

## License

This project is open source. Feel free to modify and extend it for your own purposes.

---

*Built with ❤️ for strategy game enthusiasts*