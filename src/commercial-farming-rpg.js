/**
 * Commercial-Quality Farming RPG
 * Professional architecture with modular systems
 */
class CommercialFarmingRPG {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Core systems
        this.graphicsEngine = new GraphicsEngine(canvas);
        this.eventSystem = new EventSystem();
        this.configSystem = new ConfigSystem();
        this.saveSystem = new SaveSystem();
        this.audioSystem = new AudioSystem();
        
        // Game systems
        this.sceneManager = new SceneManager(this);
        this.questSystem = new QuestSystem(this);
        this.relationshipSystem = new RelationshipSystem(this);
        this.skillSystem = new SkillSystem(this);
        this.achievementSystem = new AchievementSystem(this);
        this.tutorialSystem = new TutorialSystem(this);
        
        // Game state
        this.gameState = 'loading';
        this.player = null;
        this.world = null;
        this.camera = { x: 0, y: 0 };
        this.time = 0;
        this.deltaTime = 0;
        this.lastFrameTime = 0;
        
        // Performance monitoring
        this.performanceMonitor = new PerformanceMonitor();
        this.errorReporter = new ErrorReporter();
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Load configuration
            await this.configSystem.load();
            
            // Initialize systems
            await this.initializeSystems();
            
            // Load save data
            await this.saveSystem.load();
            
            // Start game
            this.startGame();
            
        } catch (error) {
            this.errorReporter.report(error);
            this.handleInitializationError(error);
        }
    }
    
    async initializeSystems() {
        // Initialize core systems
        await this.audioSystem.initialize();
        await this.graphicsEngine.initialize();
        
        // Initialize game systems
        this.questSystem.initialize();
        this.relationshipSystem.initialize();
        this.skillSystem.initialize();
        this.achievementSystem.initialize();
        this.tutorialSystem.initialize();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load assets
        await this.loadAssets();
    }
    
    async loadAssets() {
        const assetLoader = new AssetLoader();
        
        // Load sprite atlases
        await assetLoader.loadAtlas('characters', 'assets/characters.png', 'assets/characters.json');
        await assetLoader.loadAtlas('tiles', 'assets/tiles.png', 'assets/tiles.json');
        await assetLoader.loadAtlas('ui', 'assets/ui.png', 'assets/ui.json');
        
        // Load audio
        await assetLoader.loadAudio('bgm_farm', 'assets/audio/farm_theme.ogg');
        await assetLoader.loadAudio('sfx_plant', 'assets/audio/plant.wav');
        await assetLoader.loadAudio('sfx_harvest', 'assets/audio/harvest.wav');
        
        // Register assets with graphics engine
        this.graphicsEngine.atlasManager.registerAtlases(assetLoader.atlases);
    }
    
    setupEventListeners() {
        // Input handling
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', () => this.saveSystem.save());
        
        // Game events
        this.eventSystem.on('player.levelUp', (data) => this.handlePlayerLevelUp(data));
        this.eventSystem.on('quest.completed', (data) => this.handleQuestCompleted(data));
        this.eventSystem.on('achievement.unlocked', (data) => this.handleAchievementUnlocked(data));
    }
    
    startGame() {
        // Create player
        this.player = new Player(this);
        
        // Create world
        this.world = new World(this);
        
        // Start with tutorial or main scene
        if (this.saveSystem.isFirstTime()) {
            this.sceneManager.switchTo('tutorial');
        } else {
            this.sceneManager.switchTo('farm');
        }
        
        // Start game loop
        this.gameState = 'playing';
        this.gameLoop();
    }
    
    gameLoop() {
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        this.time += this.deltaTime;
        
        // Performance monitoring
        this.performanceMonitor.startFrame();
        
        try {
            this.update(this.deltaTime);
            this.render();
        } catch (error) {
            this.errorReporter.report(error);
        }
        
        this.performanceMonitor.endFrame();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Update systems
        this.sceneManager.update(deltaTime);
        this.questSystem.update(deltaTime);
        this.relationshipSystem.update(deltaTime);
        this.skillSystem.update(deltaTime);
        this.achievementSystem.update(deltaTime);
        this.tutorialSystem.update(deltaTime);
        this.audioSystem.update(deltaTime);
        
        // Update world
        if (this.world) {
            this.world.update(deltaTime);
        }
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update camera
        this.updateCamera(deltaTime);
    }
    
    render() {
        // Render through graphics engine
        this.graphicsEngine.render(this.camera, this.deltaTime);
        
        // Render current scene
        this.sceneManager.render(this.graphicsEngine);
        
        // Render UI systems
        this.questSystem.render(this.graphicsEngine);
        this.achievementSystem.render(this.graphicsEngine);
        this.tutorialSystem.render(this.graphicsEngine);
    }
    
    updateCamera(deltaTime) {
        if (!this.player) return;
        
        // Smooth camera following
        const targetX = this.player.x - this.canvas.width / 2;
        const targetY = this.player.y - this.canvas.height / 2;
        
        const lerpFactor = 5 * deltaTime;
        this.camera.x += (targetX - this.camera.x) * lerpFactor;
        this.camera.y += (targetY - this.camera.y) * lerpFactor;
        
        // Apply screen shake
        const shakeOffset = this.graphicsEngine.animationSystem.getShakeOffset();
        this.camera.x += shakeOffset.x;
        this.camera.y += shakeOffset.y;
    }
    
    // Input handling
    handleKeyDown(e) {
        this.sceneManager.getCurrentScene()?.handleKeyDown(e);
    }
    
    handleKeyUp(e) {
        this.sceneManager.getCurrentScene()?.handleKeyUp(e);
    }
    
    handleMouseDown(e) {
        this.sceneManager.getCurrentScene()?.handleMouseDown(e);
    }
    
    handleMouseMove(e) {
        this.sceneManager.getCurrentScene()?.handleMouseMove(e);
    }
    
    handleMouseUp(e) {
        this.sceneManager.getCurrentScene()?.handleMouseUp(e);
    }
    
    handleResize() {
        this.graphicsEngine.handleResize();
    }
    
    // Event handlers
    handlePlayerLevelUp(data) {
        this.achievementSystem.checkAchievements('levelUp', data);
        this.audioSystem.playSound('sfx_levelup');
        this.graphicsEngine.screenShake(5, 0.5);
    }
    
    handleQuestCompleted(data) {
        this.achievementSystem.checkAchievements('questCompleted', data);
        this.audioSystem.playSound('sfx_quest_complete');
    }
    
    handleAchievementUnlocked(data) {
        this.showNotification(`Achievement Unlocked: ${data.name}`, 'achievement');
    }
    
    handleInitializationError(error) {
        console.error('Failed to initialize game:', error);
        this.showErrorScreen(error);
    }
    
    showNotification(message, type = 'info') {
        this.eventSystem.emit('ui.notification', { message, type });
    }
    
    showErrorScreen(error) {
        this.gameState = 'error';
        // Show error UI
    }
}

/**
 * Event System for decoupled communication
 */
class EventSystem {
    constructor() {
        this.listeners = new Map();
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }
    
    emit(event, data) {
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        for (const callback of callbacks) {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        }
    }
}

/**
 * Configuration System
 */
class ConfigSystem {
    constructor() {
        this.config = {
            graphics: {
                pixelPerfect: true,
                vsync: true,
                maxFPS: 60,
                particleCount: 500
            },
            audio: {
                masterVolume: 1.0,
                musicVolume: 0.8,
                sfxVolume: 1.0
            },
            gameplay: {
                difficulty: 'normal',
                autoSave: true,
                tutorialEnabled: true
            },
            accessibility: {
                colorBlindSupport: false,
                highContrast: false,
                fontSize: 'normal'
            }
        };
    }
    
    async load() {
        try {
            const saved = localStorage.getItem('farmRPG_config');
            if (saved) {
                const savedConfig = JSON.parse(saved);
                this.config = { ...this.config, ...savedConfig };
            }
        } catch (error) {
            console.warn('Failed to load config:', error);
        }
    }
    
    save() {
        try {
            localStorage.setItem('farmRPG_config', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save config:', error);
        }
    }
    
    get(path) {
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            value = value[key];
            if (value === undefined) break;
        }
        
        return value;
    }
    
    set(path, value) {
        const keys = path.split('.');
        let obj = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in obj)) {
                obj[key] = {};
            }
            obj = obj[key];
        }
        
        obj[keys[keys.length - 1]] = value;
        this.save();
    }
}

/**
 * Save System with versioning
 */
class SaveSystem {
    constructor() {
        this.saveData = {
            version: '1.0.0',
            player: null,
            world: null,
            quests: null,
            relationships: null,
            achievements: null,
            timestamp: null
        };
        this.isFirstTimeFlag = true;
    }
    
    async load() {
        try {
            const saved = localStorage.getItem('farmRPG_save');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Version migration if needed
                if (data.version !== this.saveData.version) {
                    data = this.migrateSave(data);
                }
                
                this.saveData = data;
                this.isFirstTimeFlag = false;
            }
        } catch (error) {
            console.warn('Failed to load save:', error);
        }
    }
    
    save() {
        try {
            this.saveData.timestamp = Date.now();
            localStorage.setItem('farmRPG_save', JSON.stringify(this.saveData));
        } catch (error) {
            console.warn('Failed to save game:', error);
        }
    }
    
    migrateSave(data) {
        // Implement save migration logic
        console.log(`Migrating save from ${data.version} to ${this.saveData.version}`);
        return data;
    }
    
    isFirstTime() {
        return this.isFirstTimeFlag;
    }
    
    getSaveData(key) {
        return this.saveData[key];
    }
    
    setSaveData(key, value) {
        this.saveData[key] = value;
    }
}

/**
 * Scene Management System
 */
class SceneManager {
    constructor(game) {
        this.game = game;
        this.scenes = new Map();
        this.currentScene = null;
        this.transitionState = null;
        
        this.registerScenes();
    }
    
    registerScenes() {
        this.scenes.set('tutorial', new TutorialScene(this.game));
        this.scenes.set('farm', new FarmScene(this.game));
        this.scenes.set('town', new TownScene(this.game));
        this.scenes.set('forest', new ForestScene(this.game));
        this.scenes.set('menu', new MenuScene(this.game));
    }
    
    switchTo(sceneName, transitionType = 'fade') {
        const newScene = this.scenes.get(sceneName);
        if (!newScene) {
            console.warn(`Scene ${sceneName} not found`);
            return;
        }
        
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        this.currentScene = newScene;
        this.currentScene.enter();
        
        // Handle transition
        this.startTransition(transitionType);
    }
    
    startTransition(type) {
        // Implement scene transitions
        switch (type) {
            case 'fade':
                this.game.graphicsEngine.animationSystem.tween(
                    { alpha: 0 },
                    { alpha: 1 },
                    0.5,
                    'easeInOut'
                );
                break;
        }
    }
    
    getCurrentScene() {
        return this.currentScene;
    }
    
    update(deltaTime) {
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }
    }
    
    render(graphicsEngine) {
        if (this.currentScene) {
            this.currentScene.render(graphicsEngine);
        }
    }
}

/**
 * Quest System with branching storylines
 */
class QuestSystem {
    constructor(game) {
        this.game = game;
        this.quests = new Map();
        this.activeQuests = [];
        this.completedQuests = [];
        this.questLog = [];
    }
    
    initialize() {
        this.loadQuestData();
    }
    
    loadQuestData() {
        // Load quest definitions
        const questData = {
            'welcome_to_farm': {
                id: 'welcome_to_farm',
                title: 'Welcome to Your Farm',
                description: 'Plant your first crop to get started',
                objectives: [
                    { id: 'plant_crop', description: 'Plant a parsnip seed', completed: false }
                ],
                rewards: {
                    exp: 50,
                    gold: 100,
                    items: ['watering_can']
                },
                prerequisites: [],
                branches: ['farming_basics']
            }
        };
        
        for (const [id, data] of Object.entries(questData)) {
            this.quests.set(id, new Quest(data));
        }
    }
    
    startQuest(questId) {
        const quest = this.quests.get(questId);
        if (!quest || this.isQuestActive(questId)) return false;
        
        // Check prerequisites
        if (!this.checkPrerequisites(quest.prerequisites)) {
            return false;
        }
        
        this.activeQuests.push(quest);
        quest.start();
        
        this.game.eventSystem.emit('quest.started', { quest });
        return true;
    }
    
    completeObjective(questId, objectiveId) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (!quest) return;
        
        quest.completeObjective(objectiveId);
        
        if (quest.isCompleted()) {
            this.completeQuest(quest);
        }
    }
    
    completeQuest(quest) {
        const index = this.activeQuests.indexOf(quest);
        if (index !== -1) {
            this.activeQuests.splice(index, 1);
        }
        
        this.completedQuests.push(quest);
        quest.complete();
        
        // Give rewards
        this.giveRewards(quest.rewards);
        
        // Start branch quests
        for (const branchId of quest.branches) {
            this.startQuest(branchId);
        }
        
        this.game.eventSystem.emit('quest.completed', { quest });
    }
    
    giveRewards(rewards) {
        if (rewards.exp) {
            this.game.player.addExp(rewards.exp);
        }
        
        if (rewards.gold) {
            this.game.player.addGold(rewards.gold);
        }
        
        if (rewards.items) {
            for (const item of rewards.items) {
                this.game.player.inventory.addItem(item);
            }
        }
    }
    
    isQuestActive(questId) {
        return this.activeQuests.some(q => q.id === questId);
    }
    
    checkPrerequisites(prerequisites) {
        return prerequisites.every(prereq => 
            this.completedQuests.some(q => q.id === prereq)
        );
    }
    
    update(deltaTime) {
        for (const quest of this.activeQuests) {
            quest.update(deltaTime);
        }
    }
    
    render(graphicsEngine) {
        // Render quest UI
        this.renderQuestLog(graphicsEngine);
    }
    
    renderQuestLog(graphicsEngine) {
        // Implement quest log UI rendering
    }
}

/**
 * Individual Quest class
 */
class Quest {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.objectives = data.objectives;
        this.rewards = data.rewards;
        this.prerequisites = data.prerequisites;
        this.branches = data.branches;
        this.status = 'inactive';
        this.startTime = null;
    }
    
    start() {
        this.status = 'active';
        this.startTime = Date.now();
    }
    
    complete() {
        this.status = 'completed';
    }
    
    completeObjective(objectiveId) {
        const objective = this.objectives.find(obj => obj.id === objectiveId);
        if (objective) {
            objective.completed = true;
        }
    }
    
    isCompleted() {
        return this.objectives.every(obj => obj.completed);
    }
    
    update(deltaTime) {
        // Update quest logic
    }
}

/**
 * Relationship System with NPCs
 */
class RelationshipSystem {
    constructor(game) {
        this.game = game;
        this.relationships = new Map();
        this.dialogueSystem = new DialogueSystem(game);
    }
    
    initialize() {
        this.loadNPCData();
    }
    
    loadNPCData() {
        const npcData = {
            'farmer_joe': {
                name: 'Farmer Joe',
                personality: 'friendly',
                interests: ['farming', 'weather'],
                gifts: {
                    loved: ['parsnip', 'coffee'],
                    liked: ['vegetables'],
                    disliked: ['junk']
                },
                relationship: 0,
                maxRelationship: 10
            }
        };
        
        for (const [id, data] of Object.entries(npcData)) {
            this.relationships.set(id, new NPCRelationship(data));
        }
    }
    
    giveGift(npcId, item) {
        const relationship = this.relationships.get(npcId);
        if (!relationship) return;
        
        const points = relationship.getGiftPoints(item);
        relationship.addPoints(points);
        
        this.game.eventSystem.emit('relationship.giftGiven', {
            npcId,
            item,
            points,
            newLevel: relationship.getLevel()
        });
    }
    
    startDialogue(npcId) {
        const relationship = this.relationships.get(npcId);
        if (!relationship) return;
        
        this.dialogueSystem.startDialogue(npcId, relationship.getLevel());
    }
    
    update(deltaTime) {
        this.dialogueSystem.update(deltaTime);
    }
    
    render(graphicsEngine) {
        this.dialogueSystem.render(graphicsEngine);
    }
}

/**
 * NPC Relationship class
 */
class NPCRelationship {
    constructor(data) {
        this.name = data.name;
        this.personality = data.personality;
        this.interests = data.interests;
        this.gifts = data.gifts;
        this.points = data.relationship || 0;
        this.maxPoints = data.maxRelationship * 100;
    }
    
    addPoints(points) {
        this.points = Math.min(this.points + points, this.maxPoints);
    }
    
    getLevel() {
        return Math.floor(this.points / 100);
    }
    
    getGiftPoints(item) {
        if (this.gifts.loved.includes(item)) return 80;
        if (this.gifts.liked.includes(item)) return 45;
        if (this.gifts.disliked.includes(item)) return -20;
        return 20; // neutral
    }
}

/**
 * Dialogue System
 */
class DialogueSystem {
    constructor(game) {
        this.game = game;
        this.currentDialogue = null;
        this.dialogueTree = new Map();
        this.isActive = false;
    }
    
    startDialogue(npcId, relationshipLevel) {
        // Load dialogue based on NPC and relationship level
        this.currentDialogue = this.loadDialogue(npcId, relationshipLevel);
        this.isActive = true;
    }
    
    loadDialogue(npcId, level) {
        // Return dialogue data based on NPC and relationship level
        return {
            speaker: npcId,
            text: "Hello there! How's the farming going?",
            options: [
                { text: "Great!", response: "That's wonderful to hear!" },
                { text: "Could be better", response: "Don't give up, farming takes time!" }
            ]
        };
    }
    
    selectOption(index) {
        if (!this.currentDialogue || !this.currentDialogue.options) return;
        
        const option = this.currentDialogue.options[index];
        if (option) {
            // Process dialogue choice
            this.currentDialogue.text = option.response;
            this.currentDialogue.options = null;
        }
    }
    
    endDialogue() {
        this.currentDialogue = null;
        this.isActive = false;
    }
    
    update(deltaTime) {
        // Update dialogue animations
    }
    
    render(graphicsEngine) {
        if (!this.isActive || !this.currentDialogue) return;
        
        // Render dialogue box
        this.renderDialogueBox(graphicsEngine);
    }
    
    renderDialogueBox(graphicsEngine) {
        // Implement dialogue box rendering
    }
}

/**
 * Skill System with skill trees
 */
class SkillSystem {
    constructor(game) {
        this.game = game;
        this.skills = new Map();
        this.skillTrees = new Map();
    }
    
    initialize() {
        this.setupSkills();
    }
    
    setupSkills() {
        const skillData = {
            farming: {
                name: 'Farming',
                level: 1,
                exp: 0,
                expToNext: 100,
                perks: new Map()
            },
            mining: {
                name: 'Mining',
                level: 1,
                exp: 0,
                expToNext: 100,
                perks: new Map()
            },
            fishing: {
                name: 'Fishing',
                level: 1,
                exp: 0,
                expToNext: 100,
                perks: new Map()
            }
        };
        
        for (const [id, data] of Object.entries(skillData)) {
            this.skills.set(id, new Skill(data));
        }
    }
    
    addExp(skillId, amount) {
        const skill = this.skills.get(skillId);
        if (!skill) return;
        
        skill.addExp(amount);
        
        if (skill.hasLeveledUp()) {
            this.handleLevelUp(skillId, skill);
        }
    }
    
    handleLevelUp(skillId, skill) {
        this.game.eventSystem.emit('skill.levelUp', {
            skillId,
            newLevel: skill.level,
            skill
        });
        
        // Unlock new perks
        this.unlockPerks(skillId, skill.level);
    }
    
    unlockPerks(skillId, level) {
        // Implement perk unlocking logic
    }
    
    update(deltaTime) {
        // Update skill-related effects
    }
    
    render(graphicsEngine) {
        // Render skill UI if needed
    }
}

/**
 * Individual Skill class
 */
class Skill {
    constructor(data) {
        this.name = data.name;
        this.level = data.level;
        this.exp = data.exp;
        this.expToNext = data.expToNext;
        this.perks = data.perks;
        this.leveledUp = false;
    }
    
    addExp(amount) {
        this.exp += amount;
        
        while (this.exp >= this.expToNext) {
            this.exp -= this.expToNext;
            this.level++;
            this.expToNext = Math.floor(this.expToNext * 1.2);
            this.leveledUp = true;
        }
    }
    
    hasLeveledUp() {
        if (this.leveledUp) {
            this.leveledUp = false;
            return true;
        }
        return false;
    }
}

/**
 * Achievement System
 */
class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.achievements = new Map();
        this.unlockedAchievements = new Set();
        this.notifications = [];
    }
    
    initialize() {
        this.loadAchievements();
    }
    
    loadAchievements() {
        const achievementData = {
            'first_harvest': {
                id: 'first_harvest',
                name: 'First Harvest',
                description: 'Harvest your first crop',
                icon: 'harvest_icon',
                condition: { type: 'harvest', count: 1 },
                reward: { exp: 25, title: 'Novice Farmer' }
            },
            'master_farmer': {
                id: 'master_farmer',
                name: 'Master Farmer',
                description: 'Reach farming level 10',
                icon: 'master_icon',
                condition: { type: 'skill_level', skill: 'farming', level: 10 },
                reward: { exp: 500, title: 'Master Farmer' }
            }
        };
        
        for (const [id, data] of Object.entries(achievementData)) {
            this.achievements.set(id, new Achievement(data));
        }
    }
    
    checkAchievements(eventType, data) {
        for (const [id, achievement] of this.achievements) {
            if (this.unlockedAchievements.has(id)) continue;
            
            if (achievement.checkCondition(eventType, data)) {
                this.unlockAchievement(achievement);
            }
        }
    }
    
    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        
        // Give rewards
        if (achievement.reward.exp) {
            this.game.player.addExp(achievement.reward.exp);
        }
        
        // Show notification
        this.notifications.push({
            achievement,
            timestamp: Date.now(),
            duration: 5000
        });
        
        this.game.eventSystem.emit('achievement.unlocked', { achievement });
    }
    
    update(deltaTime) {
        // Update notifications
        this.notifications = this.notifications.filter(notification => {
            return Date.now() - notification.timestamp < notification.duration;
        });
    }
    
    render(graphicsEngine) {
        // Render achievement notifications
        this.renderNotifications(graphicsEngine);
    }
    
    renderNotifications(graphicsEngine) {
        // Implement achievement notification rendering
    }
}

/**
 * Individual Achievement class
 */
class Achievement {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.icon = data.icon;
        this.condition = data.condition;
        this.reward = data.reward;
        this.progress = 0;
    }
    
    checkCondition(eventType, data) {
        switch (this.condition.type) {
            case 'harvest':
                if (eventType === 'harvest') {
                    this.progress++;
                    return this.progress >= this.condition.count;
                }
                break;
                
            case 'skill_level':
                if (eventType === 'skill.levelUp' && data.skillId === this.condition.skill) {
                    return data.newLevel >= this.condition.level;
                }
                break;
        }
        
        return false;
    }
}

/**
 * Tutorial System
 */
class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.currentTutorial = null;
        this.tutorialSteps = [];
        this.currentStep = 0;
        this.isActive = false;
    }
    
    initialize() {
        this.loadTutorials();
    }
    
    loadTutorials() {
        // Load tutorial data
    }
    
    startTutorial(tutorialId) {
        // Start specific tutorial
        this.isActive = true;
        this.currentStep = 0;
    }
    
    nextStep() {
        this.currentStep++;
        
        if (this.currentStep >= this.tutorialSteps.length) {
            this.endTutorial();
        }
    }
    
    endTutorial() {
        this.isActive = false;
        this.currentTutorial = null;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Update tutorial logic
    }
    
    render(graphicsEngine) {
        if (!this.isActive) return;
        
        // Render tutorial UI
    }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.fps = 0;
        this.frameTime = 0;
        this.lastFPSUpdate = 0;
        this.frameStartTime = 0;
    }
    
    startFrame() {
        this.frameStartTime = performance.now();
    }
    
    endFrame() {
        this.frameTime = performance.now() - this.frameStartTime;
        this.frameCount++;
        
        const now = performance.now();
        if (now - this.lastFPSUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = now;
        }
    }
    
    getFPS() {
        return this.fps;
    }
    
    getFrameTime() {
        return this.frameTime;
    }
}

/**
 * Error Reporter
 */
class ErrorReporter {
    constructor() {
        this.errors = [];
    }
    
    report(error) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errors.push(errorData);
        console.error('Game Error:', errorData);
        
        // Send to analytics service in production
        // this.sendToAnalytics(errorData);
    }
    
    sendToAnalytics(errorData) {
        // Implement error reporting to analytics service
    }
}

/**
 * Audio System
 */
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.music = new Map();
        this.currentMusic = null;
        this.masterVolume = 1.0;
        this.musicVolume = 0.8;
        this.sfxVolume = 1.0;
    }
    
    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    async loadSound(id, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds.set(id, audioBuffer);
        } catch (error) {
            console.warn(`Failed to load sound ${id}:`, error);
        }
    }
    
    playSound(id, volume = 1.0) {
        if (!this.audioContext) return;
        
        const audioBuffer = this.sounds.get(id);
        if (!audioBuffer) return;
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = audioBuffer;
        gainNode.gain.value = volume * this.sfxVolume * this.masterVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start();
    }
    
    playMusic(id, loop = true) {
        // Implement music playback
    }
    
    stopMusic() {
        // Implement music stopping
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    update(deltaTime) {
        // Update audio effects
    }
}

/**
 * Asset Loader
 */
class AssetLoader {
    constructor() {
        this.atlases = new Map();
        this.audio = new Map();
        this.loadedAssets = 0;
        this.totalAssets = 0;
    }
    
    async loadAtlas(name, imagePath, dataPath) {
        this.totalAssets++;
        
        try {
            const [image, data] = await Promise.all([
                this.loadImage(imagePath),
                this.loadJSON(dataPath)
            ]);
            
            this.atlases.set(name, { image, data });
            this.loadedAssets++;
        } catch (error) {
            console.warn(`Failed to load atlas ${name}:`, error);
        }
    }
    
    async loadAudio(name, path) {
        this.totalAssets++;
        
        try {
            const audio = new Audio(path);
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve);
                audio.addEventListener('error', reject);
            });
            
            this.audio.set(name, audio);
            this.loadedAssets++;
        } catch (error) {
            console.warn(`Failed to load audio ${name}:`, error);
        }
    }
    
    loadImage(path) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = path;
        });
    }
    
    loadJSON(path) {
        return fetch(path).then(response => response.json());
    }
    
    getProgress() {
        return this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 0;
    }
}

// Scene classes (simplified implementations)
class Scene {
    constructor(game) {
        this.game = game;
    }
    
    enter() {}
    exit() {}
    update(deltaTime) {}
    render(graphicsEngine) {}
    handleKeyDown(e) {}
    handleKeyUp(e) {}
    handleMouseDown(e) {}
    handleMouseMove(e) {}
    handleMouseUp(e) {}
}

class TutorialScene extends Scene {
    constructor(game) {
        super(game);
    }
    
    enter() {
        this.game.tutorialSystem.startTutorial('basic_farming');
    }
    
    update(deltaTime) {
        // Tutorial scene logic
    }
    
    render(graphicsEngine) {
        // Render tutorial scene
    }
}

class FarmScene extends Scene {
    constructor(game) {
        super(game);
    }
    
    update(deltaTime) {
        // Farm scene logic
    }
    
    render(graphicsEngine) {
        // Render farm scene
    }
}

class TownScene extends Scene {
    constructor(game) {
        super(game);
    }
}

class ForestScene extends Scene {
    constructor(game) {
        super(game);
    }
}

class MenuScene extends Scene {
    constructor(game) {
        super(game);
    }
}

/**
 * Player class
 */
class Player {
    constructor(game) {
        this.game = game;
        this.x = 400;
        this.y = 300;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        this.gold = 500;
        this.inventory = new Inventory();
        this.skills = new Map();
    }
    
    addExp(amount) {
        this.exp += amount;
        
        while (this.exp >= this.expToNext) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.exp -= this.expToNext;
        this.level++;
        this.expToNext = Math.floor(this.expToNext * 1.2);
        
        this.game.eventSystem.emit('player.levelUp', {
            newLevel: this.level,
            player: this
        });
    }
    
    addGold(amount) {
        this.gold += amount;
    }
    
    update(deltaTime) {
        // Update player logic
    }
}

/**
 * Inventory class
 */
class Inventory {
    constructor() {
        this.items = new Map();
        this.maxSlots = 36;
    }
    
    addItem(itemId, quantity = 1) {
        const current = this.items.get(itemId) || 0;
        this.items.set(itemId, current + quantity);
    }
    
    removeItem(itemId, quantity = 1) {
        const current = this.items.get(itemId) || 0;
        const newAmount = Math.max(0, current - quantity);
        
        if (newAmount === 0) {
            this.items.delete(itemId);
        } else {
            this.items.set(itemId, newAmount);
        }
        
        return current >= quantity;
    }
    
    hasItem(itemId, quantity = 1) {
        return (this.items.get(itemId) || 0) >= quantity;
    }
}

/**
 * World class
 */
class World {
    constructor(game) {
        this.game = game;
        this.maps = new Map();
        this.currentMap = null;
        this.weather = new WeatherSystem();
        this.timeSystem = new TimeSystem();
    }
    
    update(deltaTime) {
        this.weather.update(deltaTime);
        this.timeSystem.update(deltaTime);
        
        if (this.currentMap) {
            this.currentMap.update(deltaTime);
        }
    }
}

/**
 * Weather System
 */
class WeatherSystem {
    constructor() {
        this.currentWeather = 'sunny';
        this.weatherTimer = 0;
        this.weatherDuration = 300; // 5 minutes
    }
    
    update(deltaTime) {
        this.weatherTimer += deltaTime;
        
        if (this.weatherTimer >= this.weatherDuration) {
            this.changeWeather();
            this.weatherTimer = 0;
        }
    }
    
    changeWeather() {
        const weathers = ['sunny', 'cloudy', 'rainy', 'stormy'];
        this.currentWeather = weathers[Math.floor(Math.random() * weathers.length)];
    }
}

/**
 * Time System
 */
class TimeSystem {
    constructor() {
        this.hour = 6; // Start at 6 AM
        this.day = 1;
        this.season = 'spring';
        this.year = 1;
        this.timeScale = 60; // 1 real second = 1 game minute
    }
    
    update(deltaTime) {
        this.hour += (deltaTime * this.timeScale) / 3600;
        
        if (this.hour >= 24) {
            this.hour = 0;
            this.day++;
            
            if (this.day > 28) {
                this.day = 1;
                this.nextSeason();
            }
        }
    }
    
    nextSeason() {
        const seasons = ['spring', 'summer', 'fall', 'winter'];
        const currentIndex = seasons.indexOf(this.season);
        
        if (currentIndex === seasons.length - 1) {
            this.season = seasons[0];
            this.year++;
        } else {
            this.season = seasons[currentIndex + 1];
        }
    }
    
    getTimeString() {
        const hour12 = this.hour > 12 ? this.hour - 12 : this.hour;
        const ampm = this.hour >= 12 ? 'PM' : 'AM';
        return `${Math.floor(hour12)}:${String(Math.floor((this.hour % 1) * 60)).padStart(2, '0')} ${ampm}`;
    }
}