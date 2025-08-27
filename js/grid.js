export class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tileSize = 32;
        this.tiles = [];
        
        this.initializeTiles();
    }
    
    initializeTiles() {
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = this.generateTile(x, y);
            }
        }
    }
    
    generateTile(x, y) {
        // Generate procedural terrain
        const noise = this.simpleNoise(x * 0.1, y * 0.1);
        let type = 'plains';
        let resources = null;
        
        if (noise > 0.6) {
            type = 'crystal_vein';
            resources = { type: 'energy', amount: Math.floor(Math.random() * 3) + 1 };
        } else if (noise > 0.3) {
            type = 'rocky_crater';
        } else if (noise < -0.3) {
            type = 'void_anomaly';
        }
        
        // Randomly place some resource nodes
        if (Math.random() < 0.05) {
            resources = { 
                type: Math.random() > 0.5 ? 'alloys' : 'energy', 
                amount: Math.floor(Math.random() * 2) + 1 
            };
        }
        
        return {
            x,
            y,
            type,
            resources,
            movementCost: this.getMovementCost(type),
            defensiveBonus: this.getDefensiveBonus(type),
            explored: false,
            controlled: null // Which faction controls this tile
        };
    }
    
    simpleNoise(x, y) {
        // Simple pseudo-noise function
        const seed = x * 12.9898 + y * 78.233;
        return (Math.sin(seed) * 43758.5453) % 1;
    }
    
    getMovementCost(type) {
        switch (type) {
            case 'plains': return 1;
            case 'rocky_crater': return 2;
            case 'crystal_vein': return 1;
            case 'void_anomaly': return 3;
            default: return 1;
        }
    }
    
    getDefensiveBonus(type) {
        switch (type) {
            case 'plains': return 0;
            case 'rocky_crater': return 2;
            case 'crystal_vein': return 0;
            case 'void_anomaly': return 1;
            default: return 0;
        }
    }
    
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.tiles[y][x];
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    // Get neighboring tiles
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            [-1, -1], [0, -1], [1, -1],
            [-1,  0],          [1,  0],
            [-1,  1], [0,  1], [1,  1]
        ];
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (this.isValidPosition(nx, ny)) {
                neighbors.push(this.getTile(nx, ny));
            }
        }
        
        return neighbors;
    }
    
    // Calculate distance between two points
    getDistance(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan distance
    }
    
    // Get tiles within a certain range
    getTilesInRange(centerX, centerY, range) {
        const tiles = [];
        
        for (let y = Math.max(0, centerY - range); y <= Math.min(this.height - 1, centerY + range); y++) {
            for (let x = Math.max(0, centerX - range); x <= Math.min(this.width - 1, centerX + range); x++) {
                if (this.getDistance(centerX, centerY, x, y) <= range) {
                    tiles.push(this.getTile(x, y));
                }
            }
        }
        
        return tiles;
    }
}