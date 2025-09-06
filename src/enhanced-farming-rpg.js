// Enhanced Farming RPG with Advanced Gameplay Systems
class EnhancedFarmingRPG {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // Enhanced Player Controller
        this.player = new EnhancedPlayer(400, 300);
        
        // Game Systems
        this.farmingSystem = new FarmingSystem();
        this.inventorySystem = new InventorySystem();
        this.weatherSystem = new WeatherSystem();
        this.particleSystem = new ParticleSystem();
        this.floatingTextSystem = new FloatingTextSystem();
        
        // World state
        this.camera = { x: 0, y: 0 };
        this.tileSize = 32;
        this.mapWidth = 50;
        this.mapHeight = 40;
        this.time = 0;
        this.gameState = 'playing';
        
        // Performance optimization
        this.viewport = { startX: 0, startY: 0, endX: 0, endY: 0 };
        this.objectPool = new ObjectPool();
        
        this.initializeMap();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    initializeMap() {
        this.map = [];
        for (let y = 0; y < this.mapHeight; y++) {
            const row = [];
            for (let x = 0; x < this.mapWidth; x++) {
                row.push(1); // Default grass
            }
            this.map.push(row);
        }
    }
    
    setupEventListeners() {
        // Enhanced input handling
        document.addEventListener('keydown', (e) => this.player.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.player.handleKeyUp(e));
        
        // Tool hotkeys
        for (let i = 1; i <= 9; i++) {
            document.addEventListener('keydown', (e) => {
                if (e.key === i.toString()) {
                    this.inventorySystem.selectTool(i - 1);
                }
            });
        }
    }
    
    update(deltaTime = 0.016) {
        this.time += deltaTime;
        
        // Update systems
        this.player.update(deltaTime, this.map, this.tileSize);
        this.farmingSystem.update(deltaTime);
        this.weatherSystem.update(deltaTime);
        this.particleSystem.update(deltaTime);
        this.floatingTextSystem.update(deltaTime);
        
        // Update camera
        this.updateCamera();
        
        // Update viewport culling
        this.updateViewport();
        
        // Handle interactions
        this.handleInteractions();
    }
    
    updateCamera() {
        // Smooth camera following
        const targetX = this.player.x - this.canvas.width / 2;
        const targetY = this.player.y - this.canvas.height / 2;
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        // Clamp camera to map bounds
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapWidth * this.tileSize - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapHeight * this.tileSize - this.canvas.height));
    }
    
    updateViewport() {
        this.viewport.startX = Math.floor(this.camera.x / this.tileSize);
        this.viewport.startY = Math.floor(this.camera.y / this.tileSize);
        this.viewport.endX = Math.min(this.viewport.startX + Math.ceil(this.canvas.width / this.tileSize) + 1, this.mapWidth);
        this.viewport.endY = Math.min(this.viewport.startY + Math.ceil(this.canvas.height / this.tileSize) + 1, this.mapHeight);
    }
    
    handleInteractions() {
        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        
        if (this.player.actionPressed) {
            const tool = this.inventorySystem.getCurrentTool();
            this.performAction(tool, tileX, tileY);
            this.player.actionPressed = false;
        }
    }
    
    performAction(tool, x, y) {
        switch (tool.type) {
            case 'hoe':
                this.farmingSystem.tillSoil(x, y);
                this.addFloatingText(x * this.tileSize, y * this.tileSize, 'Tilled!', '#8D6E63');
                this.addParticles(x * this.tileSize, y * this.tileSize, 'dirt');
                break;
            case 'seeds':
                if (this.farmingSystem.plantSeed(x, y, tool.seedType)) {
                    this.addFloatingText(x * this.tileSize, y * this.tileSize, 'Planted!', '#4CAF50');
                    this.addParticles(x * this.tileSize, y * this.tileSize, 'plant');
                }
                break;
            case 'watering_can':
                this.farmingSystem.waterCrop(x, y);
                this.addFloatingText(x * this.tileSize, y * this.tileSize, 'Watered!', '#2196F3');
                this.addParticles(x * this.tileSize, y * this.tileSize, 'water');
                break;
            case 'scythe':
                const harvest = this.farmingSystem.harvestCrop(x, y);
                if (harvest) {
                    this.addFloatingText(x * this.tileSize, y * this.tileSize, `+${harvest.quantity} ${harvest.type}`, '#FFD700');
                    this.addParticles(x * this.tileSize, y * this.tileSize, 'harvest');
                }
                break;
        }
    }
    
    addFloatingText(x, y, text, color) {
        this.floatingTextSystem.add(x, y, text, color);
    }
    
    addParticles(x, y, type) {
        this.particleSystem.emit(x, y, type, 5);
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render world
        this.renderMap();
        this.renderFarmingSystem();
        this.renderPlayer();
        
        // Render effects
        this.particleSystem.render(this.ctx, this.camera);
        this.floatingTextSystem.render(this.ctx, this.camera);
        this.weatherSystem.render(this.ctx);
        
        // Render UI
        this.renderUI();
    }
    
    renderMap() {
        for (let y = Math.max(0, this.viewport.startY); y < this.viewport.endY; y++) {
            for (let x = Math.max(0, this.viewport.startX); x < this.viewport.endX; x++) {
                const screenX = x * this.tileSize - this.camera.x;
                const screenY = y * this.tileSize - this.camera.y;
                this.renderTile(this.map[y][x], screenX, screenY);
            }
        }
    }
    
    renderTile(tileType, x, y) {
        const colors = {
            1: '#7CB342', // Grass
            2: '#2196F3', // Water
            3: '#8D6E63'  // Dirt
        };
        
        this.ctx.fillStyle = colors[tileType] || '#666';
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }
    
    renderFarmingSystem() {
        this.farmingSystem.render(this.ctx, this.camera, this.tileSize, this.viewport);
    }
    
    renderPlayer() {
        this.player.render(this.ctx, this.camera);
    }
    
    renderUI() {
        // Inventory hotbar
        this.inventorySystem.renderHotbar(this.ctx);
        
        // Weather info
        this.weatherSystem.renderUI(this.ctx);
        
        // Tool info
        const tool = this.inventorySystem.getCurrentTool();
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(10, this.canvas.height - 60, 200, 50);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`Tool: ${tool.name}`, 20, this.canvas.height - 35);
        this.ctx.fillText(`Action: ${tool.action}`, 20, this.canvas.height - 15);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Enhanced Player Controller with 8-directional movement
class EnhancedPlayer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        
        // Physics
        this.velocity = { x: 0, y: 0 };
        this.acceleration = 800;
        this.friction = 0.85;
        this.maxSpeed = 150;
        
        // Animation
        this.direction = 'down';
        this.animFrame = 0;
        this.animSpeed = 8;
        this.isMoving = false;
        
        // State machine
        this.state = 'idle';
        this.stateTimer = 0;
        
        // Input
        this.keys = {};
        this.actionPressed = false;
        
        // Equipment
        this.equipment = {
            hat: null,
            shirt: 'basic',
            pants: 'basic',
            boots: null
        };
    }
    
    handleKeyDown(e) {
        this.keys[e.key] = true;
        
        if (e.key === ' ') {
            this.actionPressed = true;
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.key] = false;
    }
    
    update(deltaTime, map, tileSize) {
        this.handleInput(deltaTime);
        this.updatePhysics(deltaTime);
        this.updateAnimation(deltaTime);
        this.checkCollisions(map, tileSize);
        this.updateState(deltaTime);
    }
    
    handleInput(deltaTime) {
        let inputX = 0;
        let inputY = 0;
        
        // 8-directional input
        if (this.keys['ArrowLeft'] || this.keys['a']) inputX -= 1;
        if (this.keys['ArrowRight'] || this.keys['d']) inputX += 1;
        if (this.keys['ArrowUp'] || this.keys['w']) inputY -= 1;
        if (this.keys['ArrowDown'] || this.keys['s']) inputY += 1;
        
        // Normalize diagonal movement
        if (inputX !== 0 && inputY !== 0) {
            inputX *= 0.707;
            inputY *= 0.707;
        }
        
        // Apply acceleration
        this.velocity.x += inputX * this.acceleration * deltaTime;
        this.velocity.y += inputY * this.acceleration * deltaTime;
        
        // Update direction and movement state
        if (inputX !== 0 || inputY !== 0) {
            this.isMoving = true;
            
            // Determine direction (8 directions)
            if (inputX > 0 && inputY === 0) this.direction = 'right';
            else if (inputX < 0 && inputY === 0) this.direction = 'left';
            else if (inputY > 0 && inputX === 0) this.direction = 'down';
            else if (inputY < 0 && inputX === 0) this.direction = 'up';
            else if (inputX > 0 && inputY > 0) this.direction = 'down-right';
            else if (inputX < 0 && inputY > 0) this.direction = 'down-left';
            else if (inputX > 0 && inputY < 0) this.direction = 'up-right';
            else if (inputX < 0 && inputY < 0) this.direction = 'up-left';
        } else {
            this.isMoving = false;
        }
    }
    
    updatePhysics(deltaTime) {
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Limit max speed
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }
        
        // Update position
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
    }
    
    updateAnimation(deltaTime) {
        if (this.isMoving) {
            this.animFrame += this.animSpeed * deltaTime;
            if (this.animFrame >= 4) this.animFrame = 0;
        } else {
            this.animFrame = 0;
        }
    }
    
    checkCollisions(map, tileSize) {
        // Simple collision detection
        const corners = [
            { x: this.x, y: this.y },
            { x: this.x + this.width, y: this.y },
            { x: this.x, y: this.y + this.height },
            { x: this.x + this.width, y: this.y + this.height }
        ];
        
        for (let corner of corners) {
            const tileX = Math.floor(corner.x / tileSize);
            const tileY = Math.floor(corner.y / tileSize);
            
            if (tileX < 0 || tileX >= map[0].length || tileY < 0 || tileY >= map.length) {
                // Out of bounds - push back
                this.x = Math.max(0, Math.min(this.x, map[0].length * tileSize - this.width));
                this.y = Math.max(0, Math.min(this.y, map.length * tileSize - this.height));
                this.velocity.x = 0;
                this.velocity.y = 0;
                return;
            }
        }
    }
    
    updateState(deltaTime) {
        this.stateTimer += deltaTime;
        
        switch (this.state) {
            case 'idle':
                if (this.isMoving) this.setState('walking');
                break;
            case 'walking':
                if (!this.isMoving) this.setState('idle');
                break;
        }
    }
    
    setState(newState) {
        this.state = newState;
        this.stateTimer = 0;
    }
    
    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(screenX + 6, screenY + this.height - 4, this.width - 12, 4);
        
        // Body
        ctx.fillStyle = '#FF9900'; // AWS Orange
        ctx.fillRect(screenX + 8, screenY + 16, 16, 12);
        
        // Head
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(screenX + 10, screenY + 6, 12, 12);
        
        // Hat
        ctx.fillStyle = '#232F3E'; // AWS Dark
        ctx.fillRect(screenX + 8, screenY + 4, 16, 6);
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(screenX + 12, screenY + 10, 2, 2);
        ctx.fillRect(screenX + 18, screenY + 10, 2, 2);
        
        // Equipment visualization
        this.renderEquipment(ctx, screenX, screenY);
        
        // Direction indicator (for debugging)
        if (this.isMoving) {
            ctx.fillStyle = '#FFFF00';
            ctx.font = '8px monospace';
            ctx.fillText(this.direction, screenX, screenY - 5);
        }
    }
    
    renderEquipment(ctx, x, y) {
        // Render equipment based on current gear
        if (this.equipment.hat) {
            // Render hat
        }
        
        // Tool in hand
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x + 20, y + 18, 8, 2);
    }
}

// Advanced Farming System
class FarmingSystem {
    constructor() {
        this.crops = new Map();
        this.soilQuality = new Map();
        this.seasons = ['spring', 'summer', 'fall', 'winter'];
        this.currentSeason = 0;
        this.dayLength = 60; // seconds
        this.currentDay = 0;
        
        this.cropTypes = {
            'tomato': { growthTime: 5, seasons: ['spring', 'summer'], value: 50 },
            'corn': { growthTime: 8, seasons: ['summer'], value: 80 },
            'pumpkin': { growthTime: 10, seasons: ['fall'], value: 120 }
        };
    }
    
    tillSoil(x, y) {
        const key = `${x},${y}`;
        this.soilQuality.set(key, { tilled: true, watered: false, fertilized: false });
        return true;
    }
    
    plantSeed(x, y, seedType) {
        const key = `${x},${y}`;
        const soil = this.soilQuality.get(key);
        
        if (!soil || !soil.tilled) return false;
        
        const cropType = this.cropTypes[seedType];
        if (!cropType) return false;
        
        this.crops.set(key, {
            type: seedType,
            stage: 0,
            maxStages: 4,
            growthTime: cropType.growthTime,
            timeToNextStage: cropType.growthTime / 4,
            watered: false,
            quality: 'bronze'
        });
        
        return true;
    }
    
    waterCrop(x, y) {
        const key = `${x},${y}`;
        const crop = this.crops.get(key);
        const soil = this.soilQuality.get(key);
        
        if (crop) {
            crop.watered = true;
            crop.timeToNextStage *= 0.8; // Faster growth when watered
        }
        
        if (soil) {
            soil.watered = true;
        }
        
        return true;
    }
    
    harvestCrop(x, y) {
        const key = `${x},${y}`;
        const crop = this.crops.get(key);
        
        if (!crop || crop.stage < crop.maxStages) return null;
        
        const harvest = {
            type: crop.type,
            quantity: this.calculateHarvestQuantity(crop),
            quality: crop.quality
        };
        
        this.crops.delete(key);
        return harvest;
    }
    
    calculateHarvestQuantity(crop) {
        let baseQuantity = 1;
        
        // Quality multiplier
        const qualityMultipliers = { bronze: 1, silver: 1.5, gold: 2 };
        baseQuantity *= qualityMultipliers[crop.quality];
        
        return Math.floor(baseQuantity);
    }
    
    update(deltaTime) {
        // Update crop growth
        for (let [key, crop] of this.crops) {
            if (crop.stage < crop.maxStages) {
                crop.timeToNextStage -= deltaTime;
                
                if (crop.timeToNextStage <= 0) {
                    crop.stage++;
                    crop.timeToNextStage = crop.growthTime / 4;
                    
                    // Determine quality based on care
                    if (crop.watered) {
                        crop.quality = 'silver';
                    }
                }
            }
        }
        
        // Reset watered status daily
        for (let [key, crop] of this.crops) {
            crop.watered = false;
        }
    }
    
    render(ctx, camera, tileSize, viewport) {
        // Render soil
        for (let [key, soil] of this.soilQuality) {
            const [x, y] = key.split(',').map(Number);
            
            if (x < viewport.startX || x >= viewport.endX || y < viewport.startY || y >= viewport.endY) continue;
            
            const screenX = x * tileSize - camera.x;
            const screenY = y * tileSize - camera.y;
            
            if (soil.tilled) {
                ctx.fillStyle = soil.watered ? '#5D4037' : '#8D6E63';
                ctx.fillRect(screenX, screenY, tileSize, tileSize);
            }
        }
        
        // Render crops
        for (let [key, crop] of this.crops) {
            const [x, y] = key.split(',').map(Number);
            
            if (x < viewport.startX || x >= viewport.endX || y < viewport.startY || y >= viewport.endY) continue;
            
            const screenX = x * tileSize - camera.x;
            const screenY = y * tileSize - camera.y;
            
            this.renderCrop(ctx, crop, screenX, screenY, tileSize);
        }
    }
    
    renderCrop(ctx, crop, x, y, size) {
        const colors = {
            0: '#8BC34A', // Seedling
            1: '#4CAF50', // Young
            2: '#2E7D32', // Mature
            3: '#1B5E20', // Ready to harvest
            4: '#FF5722'  // Harvest
        };
        
        ctx.fillStyle = colors[crop.stage] || colors[0];
        
        // Render based on crop type and stage
        if (crop.stage === 0) {
            // Seedling
            ctx.fillRect(x + size/2 - 2, y + size - 8, 4, 6);
        } else if (crop.stage < 4) {
            // Growing
            const height = 8 + (crop.stage * 4);
            ctx.fillRect(x + size/2 - 3, y + size - height, 6, height);
        } else {
            // Ready to harvest
            ctx.fillRect(x + size/2 - 4, y + size - 16, 8, 16);
            
            // Quality indicator
            const qualityColors = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700' };
            ctx.fillStyle = qualityColors[crop.quality];
            ctx.fillRect(x + size - 8, y + 2, 6, 6);
        }
    }
}

// Inventory System with drag-and-drop
class InventorySystem {
    constructor() {
        this.tools = [
            { name: 'Hoe', type: 'hoe', action: 'Till soil', icon: '🔨' },
            { name: 'Seeds', type: 'seeds', seedType: 'tomato', action: 'Plant seeds', icon: '🌱' },
            { name: 'Watering Can', type: 'watering_can', action: 'Water crops', icon: '🚿' },
            { name: 'Scythe', type: 'scythe', action: 'Harvest crops', icon: '🗡️' }
        ];
        
        this.currentToolIndex = 0;
        this.inventory = new Map();
    }
    
    selectTool(index) {
        if (index >= 0 && index < this.tools.length) {
            this.currentToolIndex = index;
        }
    }
    
    getCurrentTool() {
        return this.tools[this.currentToolIndex];
    }
    
    addItem(item, quantity = 1) {
        const current = this.inventory.get(item) || 0;
        this.inventory.set(item, current + quantity);
    }
    
    renderHotbar(ctx) {
        const hotbarY = 10;
        const slotSize = 50;
        const spacing = 5;
        
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(10, hotbarY, this.tools.length * (slotSize + spacing) - spacing, slotSize);
        
        // Tool slots
        for (let i = 0; i < this.tools.length; i++) {
            const x = 10 + i * (slotSize + spacing);
            const tool = this.tools[i];
            const isSelected = i === this.currentToolIndex;
            
            // Slot background
            ctx.fillStyle = isSelected ? '#FF9900' : '#555';
            ctx.fillRect(x, hotbarY, slotSize, slotSize);
            
            // Tool icon
            ctx.font = '24px monospace';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(tool.icon, x + 13, hotbarY + 35);
            
            // Hotkey number
            ctx.font = '12px monospace';
            ctx.fillText((i + 1).toString(), x + 2, hotbarY + 12);
        }
    }
}

// Weather System with visual effects
class WeatherSystem {
    constructor() {
        this.currentWeather = 'sunny';
        this.weatherTypes = ['sunny', 'rainy', 'cloudy', 'stormy'];
        this.weatherTimer = 0;
        this.weatherDuration = 30; // seconds
        this.raindrops = [];
    }
    
    update(deltaTime) {
        this.weatherTimer += deltaTime;
        
        if (this.weatherTimer >= this.weatherDuration) {
            this.changeWeather();
            this.weatherTimer = 0;
        }
        
        // Update weather effects
        if (this.currentWeather === 'rainy') {
            this.updateRain(deltaTime);
        }
    }
    
    changeWeather() {
        this.currentWeather = this.weatherTypes[Math.floor(Math.random() * this.weatherTypes.length)];
        console.log(`Weather changed to: ${this.currentWeather}`);
    }
    
    updateRain(deltaTime) {
        // Add new raindrops
        if (Math.random() < 0.3) {
            this.raindrops.push({
                x: Math.random() * 1000,
                y: -10,
                speed: 200 + Math.random() * 100
            });
        }
        
        // Update existing raindrops
        this.raindrops = this.raindrops.filter(drop => {
            drop.y += drop.speed * deltaTime;
            return drop.y < 800;
        });
    }
    
    render(ctx) {
        if (this.currentWeather === 'rainy') {
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
            ctx.lineWidth = 1;
            
            this.raindrops.forEach(drop => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x - 2, drop.y + 10);
                ctx.stroke();
            });
        }
    }
    
    renderUI(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(ctx.canvas.width - 150, 10, 140, 40);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px monospace';
        ctx.fillText(`Weather: ${this.currentWeather}`, ctx.canvas.width - 145, 30);
    }
}

// Particle System with object pooling
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 200;
    }
    
    emit(x, y, type, count = 5) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            this.particles.push(this.createParticle(x, y, type));
        }
    }
    
    createParticle(x, y, type) {
        const configs = {
            dirt: { color: '#8D6E63', life: 1, speed: 50 },
            water: { color: '#2196F3', life: 0.8, speed: 30 },
            plant: { color: '#4CAF50', life: 1.2, speed: 40 },
            harvest: { color: '#FFD700', life: 1.5, speed: 60 }
        };
        
        const config = configs[type] || configs.dirt;
        
        return {
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * config.speed,
            vy: (Math.random() - 0.5) * config.speed - 20,
            color: config.color,
            life: config.life,
            maxLife: config.life,
            size: 2 + Math.random() * 3
        };
    }
    
    update(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.vy += 100 * deltaTime; // Gravity
            particle.life -= deltaTime;
            
            return particle.life > 0;
        });
    }
    
    render(ctx, camera) {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            const screenX = particle.x - camera.x;
            const screenY = particle.y - camera.y;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.fillRect(screenX, screenY, particle.size, particle.size);
        });
        
        ctx.globalAlpha = 1;
    }
}

// Floating Text System
class FloatingTextSystem {
    constructor() {
        this.texts = [];
    }
    
    add(x, y, text, color = '#FFFFFF') {
        this.texts.push({
            x: x,
            y: y,
            text: text,
            color: color,
            life: 2,
            maxLife: 2,
            vy: -50
        });
    }
    
    update(deltaTime) {
        this.texts = this.texts.filter(text => {
            text.y += text.vy * deltaTime;
            text.life -= deltaTime;
            return text.life > 0;
        });
    }
    
    render(ctx, camera) {
        this.texts.forEach(text => {
            const alpha = text.life / text.maxLife;
            const screenX = text.x - camera.x;
            const screenY = text.y - camera.y;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = text.color;
            ctx.font = 'bold 16px monospace';
            ctx.fillText(text.text, screenX, screenY);
        });
        
        ctx.globalAlpha = 1;
    }
}

// Object Pool for performance optimization
class ObjectPool {
    constructor() {
        this.pools = new Map();
    }
    
    get(type) {
        if (!this.pools.has(type)) {
            this.pools.set(type, []);
        }
        
        const pool = this.pools.get(type);
        return pool.length > 0 ? pool.pop() : this.create(type);
    }
    
    release(type, object) {
        if (!this.pools.has(type)) {
            this.pools.set(type, []);
        }
        
        this.reset(object);
        this.pools.get(type).push(object);
    }
    
    create(type) {
        // Factory method for different object types
        switch (type) {
            case 'particle':
                return { x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '#FFF' };
            default:
                return {};
        }
    }
    
    reset(object) {
        // Reset object properties
        Object.keys(object).forEach(key => {
            if (typeof object[key] === 'number') {
                object[key] = 0;
            }
        });
    }
}