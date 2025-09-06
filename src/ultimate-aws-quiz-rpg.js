/**
 * ULTIMATE AWS NODEUL ISLAND QUIZ BATTLE RPG
 * 🏝️ Professional 16-bit pixel art quiz battle system
 * 🇰🇷 Korean cultural integration with AWS learning
 * ⚔️ Turn-based quiz battles without Pokemon mechanics
 */

class UltimateAWSQuizRPG {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // Game state
        this.gameState = 'overworld'; // overworld, battle, menu, dialogue
        this.time = 0;
        this.deltaTime = 0;
        this.lastTime = performance.now();
        
        // Player system
        this.player = {
            x: 480, y: 360, width: 32, height: 32, speed: 3,
            direction: 'down', moving: false, animFrame: 0,
            hp: 100, maxHp: 100, level: 1, exp: 0, expToNext: 100,
            certifications: new Set(), awsCredits: 500
        };
        
        // Camera system
        this.camera = { x: 0, y: 0, targetX: 0, targetY: 0, smoothing: 0.1 };
        
        // Map system
        this.tileSize = 32;
        this.mapWidth = 60;
        this.mapHeight = 45;
        this.currentArea = 'village';
        
        // Battle system
        this.battleState = {
            active: false, monster: null, currentQuestion: null,
            playerTurn: true, battlePhase: 'question', // question, result, victory
            damageNumbers: [], screenShake: 0
        };
        
        // Input system
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        
        // Professional sprite system
        this.sprites = new Map();
        this.animations = new Map();
        
        // Korean cultural elements
        this.dialogue = {
            korean: true,
            currentSpeaker: null,
            currentText: '',
            textSpeed: 50
        };
        
        this.initializeGame();
    }

    initializeGame() {
        this.createProfessionalSprites();
        this.generateNodeulIslandMap();
        this.setupAWSMonsters();
        this.setupGymLeaders();
        this.setupQuizDatabase();
        this.setupEventHandlers();
        this.createParticleSystem();
        
        console.log('🎮 ULTIMATE AWS NODEUL ISLAND QUIZ BATTLE RPG 시작!');
        this.gameLoop();
    }

    // PHASE 1: PROFESSIONAL SPRITE SYSTEM
    createProfessionalSprites() {
        // Player sprite (Modern Korean IT professional)
        this.sprites.set('player', {
            width: 32, height: 32,
            animations: {
                idle_down: [0], idle_up: [12], idle_left: [24], idle_right: [36],
                walk_down: [0, 1, 2, 1], walk_up: [12, 13, 14, 13],
                walk_left: [24, 25, 26, 25], walk_right: [36, 37, 38, 37]
            }
        });
        
        // AWS Gym Leaders
        this.sprites.set('gym_cp', { width: 32, height: 32, frame: 48 }); // 이재용
        this.sprites.set('gym_saa', { width: 32, height: 32, frame: 49 }); // 김아키텍트
        this.sprites.set('gym_dva', { width: 32, height: 32, frame: 50 }); // 박개발자
        this.sprites.set('gym_soa', { width: 32, height: 32, frame: 51 }); // 최운영자
        
        // Helper NPCs
        this.sprites.set('npc_guide', { width: 32, height: 32, frame: 52 }); // 박노들
        this.sprites.set('npc_shop', { width: 32, height: 32, frame: 53 }); // 김클라우드
        this.sprites.set('npc_nurse', { width: 32, height: 32, frame: 54 }); // 이서버
        
        // AWS Monsters
        this.sprites.set('s3bucket', { width: 24, height: 24, frame: 60 });
        this.sprites.set('lambda', { width: 24, height: 24, frame: 61 });
        this.sprites.set('ec2', { width: 24, height: 24, frame: 62 });
        this.sprites.set('rds', { width: 24, height: 24, frame: 63 });
        this.sprites.set('vpc_turtle', { width: 32, height: 32, frame: 64 });
        this.sprites.set('elb_elephant', { width: 32, height: 32, frame: 65 });
    }

    // Professional pixel art rendering
    renderSprite(spriteId, x, y, frame = 0, scale = 1) {
        const sprite = this.sprites.get(spriteId);
        if (!sprite) return;
        
        const size = sprite.width * scale;
        
        // Hand-crafted pixel art rendering
        switch(spriteId) {
            case 'player':
                this.renderPlayerSprite(x, y, frame, scale);
                break;
            case 'gym_cp':
                this.renderGymLeaderCP(x, y, scale);
                break;
            case 's3bucket':
                this.renderS3Monster(x, y, scale);
                break;
            case 'lambda':
                this.renderLambdaMonster(x, y, scale);
                break;
            default:
                this.renderBasicSprite(x, y, size, '#FF9900');
        }
    }

    renderPlayerSprite(x, y, frame, scale) {
        const size = 32 * scale;
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.ellipse(x + size/2, y + size - 4, size/3, size/8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Body (Professional casual - jeans and polo)
        this.ctx.fillStyle = '#2E7D32'; // Polo shirt
        this.ctx.fillRect(x + 8*scale, y + 16*scale, 16*scale, 12*scale);
        
        this.ctx.fillStyle = '#1565C0'; // Jeans
        this.ctx.fillRect(x + 10*scale, y + 20*scale, 12*scale, 8*scale);
        
        // Head (Korean skin tone)
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 10*scale, y + 6*scale, 12*scale, 12*scale);
        
        // Hair (Modern Korean style)
        this.ctx.fillStyle = '#2C1810';
        this.ctx.fillRect(x + 8*scale, y + 4*scale, 16*scale, 8*scale);
        
        // Eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 12*scale, y + 10*scale, 2*scale, 2*scale);
        this.ctx.fillRect(x + 18*scale, y + 10*scale, 2*scale, 2*scale);
        
        // Sneakers
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 8*scale, y + 28*scale, 6*scale, 4*scale);
        this.ctx.fillRect(x + 18*scale, y + 28*scale, 6*scale, 4*scale);
        
        // Walking animation
        if (this.player.moving) {
            const walkOffset = Math.sin(this.player.animFrame * 0.3) * 2;
            this.ctx.translate(0, walkOffset);
            this.ctx.translate(0, -walkOffset);
        }
    }

    renderGymLeaderCP(x, y, scale) {
        const size = 32 * scale;
        
        // 이재용 - Business suit with cloud badge
        this.ctx.fillStyle = '#1A237E'; // Navy suit
        this.ctx.fillRect(x + 6*scale, y + 14*scale, 20*scale, 16*scale);
        
        // White shirt
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 10*scale, y + 16*scale, 12*scale, 8*scale);
        
        // Tie
        this.ctx.fillStyle = '#FF9900'; // AWS orange
        this.ctx.fillRect(x + 14*scale, y + 18*scale, 4*scale, 8*scale);
        
        // Head
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 10*scale, y + 4*scale, 12*scale, 12*scale);
        
        // Professional hair
        this.ctx.fillStyle = '#2C1810';
        this.ctx.fillRect(x + 8*scale, y + 2*scale, 16*scale, 8*scale);
        
        // Cloud badge
        this.ctx.fillStyle = '#4FC3F7';
        this.ctx.fillRect(x + 6*scale, y + 16*scale, 4*scale, 4*scale);
    }

    renderS3Monster(x, y, scale) {
        const size = 24 * scale;
        const bounce = Math.sin(this.time * 0.005) * 2;
        
        // S3 Bucket body (cute blue cube)
        this.ctx.fillStyle = '#1976D2';
        this.ctx.fillRect(x, y + bounce, size, size);
        
        // Bucket handle
        this.ctx.fillStyle = '#0D47A1';
        this.ctx.fillRect(x + 2*scale, y - 2*scale + bounce, size - 4*scale, 4*scale);
        
        // Cute eyes
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 6*scale, y + 8*scale + bounce, 4*scale, 4*scale);
        this.ctx.fillRect(x + 14*scale, y + 8*scale + bounce, 4*scale, 4*scale);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 8*scale, y + 10*scale + bounce, 2*scale, 2*scale);
        this.ctx.fillRect(x + 16*scale, y + 10*scale + bounce, 2*scale, 2*scale);
        
        // S3 logo
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `${6*scale}px monospace`;
        this.ctx.fillText('S3', x + 8*scale, y + 20*scale + bounce);
    }

    renderLambdaMonster(x, y, scale) {
        const size = 24 * scale;
        const spark = Math.sin(this.time * 0.01) * 3;
        
        // Lambda body (yellow lightning creature)
        this.ctx.fillStyle = '#FFD600';
        this.ctx.fillRect(x + 4*scale, y + 4*scale, 16*scale, 16*scale);
        
        // Lightning bolt shape
        this.ctx.fillStyle = '#FF6F00';
        this.ctx.fillRect(x + 8*scale, y + 2*scale, 4*scale, 8*scale);
        this.ctx.fillRect(x + 6*scale, y + 8*scale, 8*scale, 4*scale);
        this.ctx.fillRect(x + 10*scale, y + 12*scale, 4*scale, 8*scale);
        
        // Electric eyes
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 8*scale, y + 8*scale, 2*scale, 2*scale);
        this.ctx.fillRect(x + 14*scale, y + 8*scale, 2*scale, 2*scale);
        
        // Electric sparks
        this.ctx.fillStyle = '#00E5FF';
        this.ctx.fillRect(x - 2*scale + spark, y + 6*scale, 2*scale, 2*scale);
        this.ctx.fillRect(x + size + spark, y + 10*scale, 2*scale, 2*scale);
        
        // Lambda symbol
        this.ctx.fillStyle = '#000000';
        this.ctx.font = `${8*scale}px monospace`;
        this.ctx.fillText('λ', x + 10*scale, y + 18*scale);
    }

    // PHASE 2: BATTLE SYSTEM
    setupQuizDatabase() {
        this.quizDatabase = {
            cp: [
                {
                    question: "AWS의 핵심 가치 제안은 무엇인가요?",
                    options: ["비용 절감만", "확장성만", "보안만", "비용 절감, 확장성, 보안 모두"],
                    correct: 3,
                    explanation: "AWS는 비용 절감, 확장성, 보안을 모두 제공하는 클라우드 플랫폼입니다.",
                    difficulty: 1
                },
                {
                    question: "S3의 주요 용도는 무엇인가요?",
                    options: ["컴퓨팅", "객체 스토리지", "데이터베이스", "네트워킹"],
                    correct: 1,
                    explanation: "S3는 확장 가능한 객체 스토리지 서비스입니다.",
                    difficulty: 1
                }
            ],
            saa: [
                {
                    question: "고가용성을 위한 EC2 배치 전략은?",
                    options: ["단일 AZ", "여러 AZ", "단일 리전", "온프레미스"],
                    correct: 1,
                    explanation: "고가용성을 위해서는 여러 가용 영역에 인스턴스를 분산 배치해야 합니다.",
                    difficulty: 2
                }
            ],
            dva: [
                {
                    question: "Lambda 함수의 최대 실행 시간은?",
                    options: ["5분", "10분", "15분", "30분"],
                    correct: 2,
                    explanation: "Lambda 함수는 최대 15분까지 실행할 수 있습니다.",
                    difficulty: 3
                }
            ]
        };
    }

    startBattle(monster) {
        this.battleState.active = true;
        this.battleState.monster = monster;
        this.battleState.playerTurn = true;
        this.battleState.battlePhase = 'question';
        this.gameState = 'battle';
        
        // Get random question based on monster's certification level
        const questions = this.quizDatabase[monster.cert] || this.quizDatabase.cp;
        this.battleState.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        // Screen shake for battle start
        this.battleState.screenShake = 10;
        
        console.log(`⚔️ ${monster.name}와의 퀴즈 배틀 시작!`);
    }

    handleQuizAnswer(selectedOption) {
        const question = this.battleState.currentQuestion;
        const correct = selectedOption === question.correct;
        
        if (correct) {
            // Player wins this round
            const damage = 25 + (question.difficulty * 10);
            this.battleState.monster.hp -= damage;
            
            this.addDamageNumber(this.canvas.width * 0.7, this.canvas.height * 0.3, damage, '#4CAF50');
            this.battleState.screenShake = 5;
            
            if (this.battleState.monster.hp <= 0) {
                this.endBattle(true);
            } else {
                this.battleState.battlePhase = 'result';
                setTimeout(() => this.nextBattleRound(), 2000);
            }
        } else {
            // Player takes damage
            const damage = 15 + (question.difficulty * 5);
            this.player.hp -= damage;
            
            this.addDamageNumber(this.canvas.width * 0.3, this.canvas.height * 0.7, damage, '#F44336');
            this.battleState.screenShake = 8;
            
            if (this.player.hp <= 0) {
                this.endBattle(false);
            } else {
                this.battleState.battlePhase = 'result';
                setTimeout(() => this.nextBattleRound(), 2000);
            }
        }
    }

    nextBattleRound() {
        if (this.battleState.active) {
            // Get new question
            const questions = this.quizDatabase[this.battleState.monster.cert] || this.quizDatabase.cp;
            this.battleState.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
            this.battleState.battlePhase = 'question';
        }
    }

    endBattle(victory) {
        if (victory) {
            const expGain = 50 + (this.battleState.monster.level * 10);
            const creditsGain = 100 + (this.battleState.monster.level * 25);
            
            this.player.exp += expGain;
            this.player.awsCredits += creditsGain;
            
            // Check level up
            if (this.player.exp >= this.player.expToNext) {
                this.player.level++;
                this.player.exp -= this.player.expToNext;
                this.player.expToNext += 50;
                this.player.maxHp += 20;
                this.player.hp = this.player.maxHp;
            }
            
            this.battleState.monster.defeated = true;
            console.log(`🎉 승리! EXP +${expGain}, AWS Credits +${creditsGain}`);
        } else {
            console.log('💔 패배... 다시 도전해보세요!');
        }
        
        this.battleState.active = false;
        this.gameState = 'overworld';
    }

    addDamageNumber(x, y, damage, color) {
        this.battleState.damageNumbers.push({
            x, y, damage, color,
            life: 1000, maxLife: 1000,
            vx: (Math.random() - 0.5) * 2,
            vy: -3
        });
    }

    // PHASE 3: NODEUL ISLAND WORLD
    generateNodeulIslandMap() {
        this.map = [];
        for (let y = 0; y < this.mapHeight; y++) {
            const row = [];
            for (let x = 0; x < this.mapWidth; x++) {
                row.push(1); // Grass
            }
            this.map.push(row);
        }
        
        // Han River (authentic flowing pattern)
        for (let x = 0; x < this.mapWidth; x++) {
            const progress = x / this.mapWidth;
            const riverCenter = 10 + Math.sin(progress * Math.PI * 2) * 5;
            for (let offset = -4; offset <= 4; offset++) {
                const riverY = Math.floor(riverCenter + offset);
                if (riverY >= 0 && riverY < this.mapHeight) {
                    this.map[riverY][x] = 2; // Water
                }
            }
        }
        
        // Village Center
        for (let y = 35; y < 42; y++) {
            for (let x = 25; x < 35; x++) {
                this.map[y][x] = 8; // Village building
            }
        }
        
        // AWS Learning Center
        for (let y = 20; y < 25; y++) {
            for (let x = 40; x < 48; x++) {
                this.map[y][x] = 9; // AWS Center
            }
        }
        
        // Traditional Korean pavilions
        const pavilions = [
            {x: 15, y: 30}, {x: 45, y: 35}, {x: 10, y: 15}
        ];
        pavilions.forEach(p => {
            for (let y = p.y; y < p.y + 3; y++) {
                for (let x = p.x; x < p.x + 4; x++) {
                    if (x < this.mapWidth && y < this.mapHeight) {
                        this.map[y][x] = 10; // Pavilion
                    }
                }
            }
        });
        
        // Cherry blossom trees (Korean aesthetic)
        const trees = [
            {x: 12, y: 5}, {x: 18, y: 7}, {x: 35, y: 8}, {x: 42, y: 12},
            {x: 8, y: 38}, {x: 50, y: 40}, {x: 22, y: 25}
        ];
        trees.forEach(t => {
            if (t.x < this.mapWidth && t.y < this.mapHeight) {
                this.map[t.y][t.x] = 3; // Cherry tree
            }
        });
        
        // Stone pathways (traditional Korean garden)
        for (let x = 20; x < 50; x++) {
            const pathY = 32 + Math.sin(x * 0.2) * 2;
            if (pathY >= 0 && pathY < this.mapHeight) {
                this.map[Math.floor(pathY)][x] = 7; // Stone path
            }
        }
    }

    setupAWSMonsters() {
        this.monsters = [
            // Grass area monsters (CP level)
            { 
                x: 20, y: 25, name: 'S3버킷', sprite: 's3bucket', 
                hp: 60, maxHp: 60, level: 1, cert: 'cp',
                defeated: false, moveTimer: 0, area: 'grass'
            },
            { 
                x: 35, y: 28, name: '람다함수', sprite: 'lambda', 
                hp: 50, maxHp: 50, level: 1, cert: 'cp',
                defeated: false, moveTimer: 0, area: 'grass'
            },
            { 
                x: 15, y: 20, name: 'EC2인스턴스', sprite: 'ec2', 
                hp: 70, maxHp: 70, level: 2, cert: 'cp',
                defeated: false, moveTimer: 0, area: 'grass'
            },
            
            // Forest area monsters (SAA level)
            { 
                x: 45, y: 15, name: 'VPC거북이', sprite: 'vpc_turtle', 
                hp: 100, maxHp: 100, level: 3, cert: 'saa',
                defeated: false, moveTimer: 0, area: 'forest'
            },
            { 
                x: 50, y: 20, name: 'ELB코끼리', sprite: 'elb_elephant', 
                hp: 120, maxHp: 120, level: 4, cert: 'saa',
                defeated: false, moveTimer: 0, area: 'forest'
            }
        ];
    }

    setupGymLeaders() {
        this.gymLeaders = [
            {
                x: 28, y: 38, name: '이재용', title: 'CP 관장님',
                sprite: 'gym_cp', cert: 'cp', defeated: false,
                dialogue: [
                    "안녕하세요! AWS 클라우드 프랙티셔너 관장 이재용입니다.",
                    "클라우드의 기초부터 차근차근 배워보시죠!",
                    "준비되셨다면 배틀을 시작하겠습니다!"
                ]
            },
            {
                x: 42, y: 22, name: '김아키텍트', title: 'SAA 관장님',
                sprite: 'gym_saa', cert: 'saa', defeated: false,
                dialogue: [
                    "솔루션 아키텍트 관장 김아키텍트입니다.",
                    "확장 가능한 아키텍처 설계에 대해 알아볼까요?",
                    "고가용성과 내결함성이 핵심입니다!"
                ]
            }
        ];
    }

    // PHASE 4: POLISH & PROFESSIONAL FEATURES
    createParticleSystem() {
        this.particles = [];
        this.maxParticles = 200;
    }

    addParticle(x, y, type, config = {}) {
        if (this.particles.length >= this.maxParticles) return;
        
        const particle = {
            x, y, type,
            vx: config.vx || (Math.random() - 0.5) * 4,
            vy: config.vy || (Math.random() - 0.5) * 4,
            life: config.life || 1000,
            maxLife: config.life || 1000,
            size: config.size || 2,
            color: config.color || '#FFFFFF',
            gravity: config.gravity || 0
        };
        
        this.particles.push(particle);
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.life -= deltaTime;
            particle.x += particle.vx * deltaTime * 0.001;
            particle.y += particle.vy * deltaTime * 0.001;
            particle.vy += particle.gravity * deltaTime * 0.001;
            
            return particle.life > 0;
        });
        
        // Update damage numbers
        this.battleState.damageNumbers = this.battleState.damageNumbers.filter(dmg => {
            dmg.life -= deltaTime;
            dmg.x += dmg.vx * deltaTime * 0.001;
            dmg.y += dmg.vy * deltaTime * 0.001;
            
            return dmg.life > 0;
        });
    }

    setupEventHandlers() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (this.gameState === 'battle' && this.battleState.battlePhase === 'question') {
                if (e.key >= '1' && e.key <= '4') {
                    this.handleQuizAnswer(parseInt(e.key) - 1);
                }
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.clicked = true;
            
            if (this.gameState === 'battle' && this.battleState.battlePhase === 'question') {
                this.handleBattleClick();
            }
        });
    }

    handleBattleClick() {
        const optionHeight = 50;
        const startY = this.canvas.height - 200;
        
        for (let i = 0; i < 4; i++) {
            const optionY = startY + i * optionHeight;
            if (this.mouse.y >= optionY && this.mouse.y <= optionY + 40) {
                this.handleQuizAnswer(i);
                break;
            }
        }
    }

    update() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.time = currentTime;
        
        this.updateParticles(this.deltaTime);
        
        if (this.gameState === 'overworld') {
            this.updatePlayer();
            this.updateMonsters();
            this.updateCamera();
            this.checkInteractions();
        } else if (this.gameState === 'battle') {
            this.updateBattle();
        }
        
        // Screen shake decay
        if (this.battleState.screenShake > 0) {
            this.battleState.screenShake *= 0.9;
            if (this.battleState.screenShake < 0.1) {
                this.battleState.screenShake = 0;
            }
        }
        
        this.mouse.clicked = false;
    }

    updatePlayer() {
        const oldX = this.player.x;
        const oldY = this.player.y;
        let moved = false;
        
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.player.y -= this.player.speed;
            this.player.direction = 'up';
            moved = true;
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.player.y += this.player.speed;
            this.player.direction = 'down';
            moved = true;
        }
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x -= this.player.speed;
            this.player.direction = 'left';
            moved = true;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x += this.player.speed;
            this.player.direction = 'right';
            moved = true;
        }
        
        if (this.checkCollision()) {
            this.player.x = oldX;
            this.player.y = oldY;
            moved = false;
        }
        
        this.player.moving = moved;
        if (moved) {
            this.player.animFrame += this.deltaTime * 0.01;
            
            // Walking particles
            if (Math.random() < 0.05) {
                this.addParticle(this.player.x + 16, this.player.y + 28, 'dust', {
                    vx: (Math.random() - 0.5) * 2,
                    vy: -1,
                    life: 500,
                    size: 1,
                    color: '#8BC34A'
                });
            }
        }
    }

    updateMonsters() {
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            monster.moveTimer += this.deltaTime;
            if (monster.moveTimer > 3000) {
                const directions = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
                const dir = directions[Math.floor(Math.random() * 4)];
                
                const newX = monster.x + dir.x;
                const newY = monster.y + dir.y;
                
                if (this.isValidPosition(newX, newY)) {
                    monster.x = newX;
                    monster.y = newY;
                }
                monster.moveTimer = 0;
            }
        });
    }

    updateBattle() {
        // Battle animations and effects
    }

    updateCamera() {
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;
        
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
        
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapWidth * this.tileSize - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapHeight * this.tileSize - this.canvas.height));
    }

    checkCollision() {
        const corners = [
            { x: this.player.x, y: this.player.y },
            { x: this.player.x + this.player.width - 1, y: this.player.y },
            { x: this.player.x, y: this.player.y + this.player.height - 1 },
            { x: this.player.x + this.player.width - 1, y: this.player.y + this.player.height - 1 }
        ];
        
        for (let corner of corners) {
            const tileX = Math.floor(corner.x / this.tileSize);
            const tileY = Math.floor(corner.y / this.tileSize);
            
            if (tileX < 0 || tileX >= this.mapWidth || tileY < 0 || tileY >= this.mapHeight) {
                return true;
            }
            
            const tile = this.map[tileY][tileX];
            if (tile === 2 || tile === 3 || tile >= 8) {
                return true;
            }
        }
        
        return false;
    }

    checkInteractions() {
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);
        
        // Check monster encounters
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            const distance = Math.sqrt(
                Math.pow(monster.x - playerTileX, 2) + 
                Math.pow(monster.y - playerTileY, 2)
            );
            
            if (distance < 1.5) {
                this.startBattle(monster);
            }
        });
        
        // Check gym leader interactions
        if (this.keys[' ']) {
            this.gymLeaders.forEach(leader => {
                const distance = Math.sqrt(
                    Math.pow(leader.x - playerTileX, 2) + 
                    Math.pow(leader.y - playerTileY, 2)
                );
                
                if (distance < 2) {
                    this.startGymBattle(leader);
                }
            });
        }
    }

    startGymBattle(leader) {
        console.log(`🏆 ${leader.name} ${leader.title}와의 체육관 배틀!`);
        // Create special gym battle monster
        const gymMonster = {
            name: `${leader.name}의 AWS 챔피언`,
            sprite: leader.sprite,
            hp: 150,
            maxHp: 150,
            level: 5,
            cert: leader.cert,
            defeated: false
        };
        this.startBattle(gymMonster);
    }

    isValidPosition(x, y) {
        if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
            return false;
        }
        
        const tile = this.map[y][x];
        return tile === 1 || tile === 7;
    }

    render() {
        // Screen shake effect
        const shakeX = this.battleState.screenShake > 0 ? 
            (Math.random() - 0.5) * this.battleState.screenShake : 0;
        const shakeY = this.battleState.screenShake > 0 ? 
            (Math.random() - 0.5) * this.battleState.screenShake : 0;
        
        this.ctx.save();
        this.ctx.translate(shakeX, shakeY);
        
        if (this.gameState === 'overworld') {
            this.renderOverworld();
        } else if (this.gameState === 'battle') {
            this.renderBattle();
        }
        
        this.ctx.restore();
        
        this.renderUI();
    }

    renderOverworld() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderMap();
        this.renderEntities();
        this.renderParticles();
    }

    renderMap() {
        const startX = Math.floor(this.camera.x / this.tileSize);
        const startY = Math.floor(this.camera.y / this.tileSize);
        const endX = Math.min(startX + Math.ceil(this.canvas.width / this.tileSize) + 1, this.mapWidth);
        const endY = Math.min(startY + Math.ceil(this.canvas.height / this.tileSize) + 1, this.mapHeight);
        
        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                const screenX = x * this.tileSize - this.camera.x;
                const screenY = y * this.tileSize - this.camera.y;
                this.renderTile(this.map[y][x], screenX, screenY, x, y);
            }
        }
    }

    renderTile(tileType, x, y, mapX, mapY) {
        const size = this.tileSize;
        
        switch(tileType) {
            case 1: // Korean grass
                this.ctx.fillStyle = '#7CB342';
                this.ctx.fillRect(x, y, size, size);
                
                // Grass texture
                const grassSeed = (mapX * 7 + mapY * 11) % 100;
                if (grassSeed < 20) {
                    this.ctx.fillStyle = '#8BC34A';
                    const grassX = x + (grassSeed % 4) * 8;
                    const grassY = y + Math.floor(grassSeed / 4) * 8;
                    this.ctx.fillRect(grassX, grassY, 2, 6);
                }
                break;
                
            case 2: // Han River
                const waterDepth = Math.sin(mapX * 0.1) * Math.cos(mapY * 0.1) * 0.3 + 0.7;
                this.ctx.fillStyle = `hsl(210, 70%, ${20 + waterDepth * 15}%)`;
                this.ctx.fillRect(x, y, size, size);
                
                // Water animation
                const wave = Math.sin(this.time * 0.002 + mapX * 0.2) * 2;
                this.ctx.fillStyle = `hsl(210, 60%, ${35 + waterDepth * 10}%)`;
                this.ctx.fillRect(x, y + 12 + wave, size, 4);
                break;
                
            case 3: // Cherry blossom tree
                this.ctx.fillStyle = '#7CB342';
                this.ctx.fillRect(x, y, size, size);
                
                // Tree trunk
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x + 14, y + 18, 4, 14);
                
                // Cherry blossoms (pink)
                this.ctx.fillStyle = '#F8BBD9';
                this.ctx.beginPath();
                this.ctx.arc(x + 16, y + 12, 12, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Falling petals
                if (Math.random() < 0.02) {
                    this.addParticle(x + 16, y + 12, 'petal', {
                        vx: (Math.random() - 0.5) * 2,
                        vy: 1 + Math.random(),
                        life: 3000,
                        size: 2,
                        color: '#F8BBD9',
                        gravity: 0.5
                    });
                }
                break;
                
            case 7: // Stone path
                this.ctx.fillStyle = '#D7CCC8';
                this.ctx.fillRect(x, y, size, size);
                
                // Stone pattern
                this.ctx.fillStyle = '#BCAAA4';
                this.ctx.fillRect(x + 4, y + 4, 8, 8);
                this.ctx.fillRect(x + 20, y + 12, 8, 8);
                this.ctx.fillRect(x + 12, y + 20, 8, 8);
                break;
                
            case 8: // Village building
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y, size, size);
                
                // Traditional Korean roof
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x, y, size, 8);
                break;
                
            case 9: // AWS Learning Center
                this.ctx.fillStyle = '#FF9900';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#232F3E';
                this.ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
                
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '8px monospace';
                this.ctx.fillText('AWS', x + 8, y + 20);
                break;
                
            case 10: // Korean pavilion
                this.ctx.fillStyle = '#7CB342';
                this.ctx.fillRect(x, y, size, size);
                
                // Pavilion structure
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x + 8, y + 8, 16, 16);
                
                // Traditional roof
                this.ctx.fillStyle = '#D32F2F';
                this.ctx.fillRect(x + 4, y + 4, 24, 8);
                break;
        }
    }

    renderEntities() {
        // Render monsters
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            const screenX = monster.x * this.tileSize - this.camera.x;
            const screenY = monster.y * this.tileSize - this.camera.y;
            
            this.renderSprite(monster.sprite, screenX, screenY, 0, 1);
            
            // Monster name
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(monster.name, screenX - 10, screenY - 5);
        });
        
        // Render gym leaders
        this.gymLeaders.forEach(leader => {
            if (leader.defeated) return;
            
            const screenX = leader.x * this.tileSize - this.camera.x;
            const screenY = leader.y * this.tileSize - this.camera.y;
            
            this.renderSprite(leader.sprite, screenX, screenY, 0, 1);
            
            // Leader title
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 10px monospace';
            this.ctx.fillText(leader.title, screenX - 15, screenY - 5);
        });
        
        // Render player
        const screenX = this.player.x - this.camera.x;
        const screenY = this.player.y - this.camera.y;
        this.renderSprite('player', screenX, screenY, 0, 1);
    }

    renderParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x - this.camera.x, particle.y - this.camera.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    renderBattle() {
        // Battle background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1A237E');
        gradient.addColorStop(1, '#3F51B5');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Monster
        if (this.battleState.monster) {
            const monsterX = this.canvas.width * 0.7;
            const monsterY = this.canvas.height * 0.3;
            this.renderSprite(this.battleState.monster.sprite, monsterX, monsterY, 0, 2);
            
            // Monster HP bar
            const hpBarWidth = 200;
            const hpBarHeight = 20;
            const hpBarX = monsterX - hpBarWidth / 2;
            const hpBarY = monsterY - 40;
            
            this.ctx.fillStyle = '#F44336';
            this.ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
            
            const hpPercent = this.battleState.monster.hp / this.battleState.monster.maxHp;
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '14px monospace';
            this.ctx.fillText(this.battleState.monster.name, hpBarX, hpBarY - 10);
        }
        
        // Player
        const playerX = this.canvas.width * 0.3;
        const playerY = this.canvas.height * 0.7;
        this.renderSprite('player', playerX, playerY, 0, 1.5);
        
        // Player HP bar
        const playerHpBarWidth = 200;
        const playerHpBarHeight = 20;
        const playerHpBarX = playerX - playerHpBarWidth / 2;
        const playerHpBarY = playerY + 60;
        
        this.ctx.fillStyle = '#F44336';
        this.ctx.fillRect(playerHpBarX, playerHpBarY, playerHpBarWidth, playerHpBarHeight);
        
        const playerHpPercent = this.player.hp / this.player.maxHp;
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(playerHpBarX, playerHpBarY, playerHpBarWidth * playerHpPercent, playerHpBarHeight);
        
        // Quiz interface
        if (this.battleState.battlePhase === 'question' && this.battleState.currentQuestion) {
            this.renderQuizInterface();
        }
        
        // Damage numbers
        this.battleState.damageNumbers.forEach(dmg => {
            const alpha = dmg.life / dmg.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = dmg.color;
            this.ctx.font = 'bold 24px monospace';
            this.ctx.fillText(`-${dmg.damage}`, dmg.x, dmg.y);
            this.ctx.restore();
        });
    }

    renderQuizInterface() {
        const question = this.battleState.currentQuestion;
        
        // Question panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(50, this.canvas.height - 250, this.canvas.width - 100, 200);
        
        // Question text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(question.question, 70, this.canvas.height - 220);
        
        // Options
        question.options.forEach((option, index) => {
            const optionY = this.canvas.height - 180 + index * 40;
            const optionX = 70;
            
            // Option background
            const isHovered = this.mouse.y >= optionY - 15 && this.mouse.y <= optionY + 15;
            this.ctx.fillStyle = isHovered ? 'rgba(255, 153, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(optionX - 10, optionY - 15, this.canvas.width - 140, 30);
            
            // Option text
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '14px monospace';
            this.ctx.fillText(`${index + 1}. ${option}`, optionX, optionY);
        });
        
        // Instructions
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('클릭하거나 1-4 키를 눌러 답을 선택하세요', 70, this.canvas.height - 30);
    }

    renderUI() {
        // Top UI panel
        this.ctx.fillStyle = 'rgba(35, 47, 62, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, 80);
        
        // Title
        this.ctx.fillStyle = '#FF9900';
        this.ctx.font = 'bold 20px serif';
        this.ctx.fillText('🏝️ ULTIMATE AWS NODEUL ISLAND QUIZ BATTLE RPG', 20, 30);
        
        // Player stats
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`레벨 ${this.player.level} 클라우드 엔지니어`, 20, 55);
        this.ctx.fillText(`❤️ HP: ${this.player.hp}/${this.player.maxHp}`, 200, 55);
        this.ctx.fillText(`⭐ EXP: ${this.player.exp}/${this.player.expToNext}`, 350, 55);
        this.ctx.fillText(`💰 AWS Credits: ${this.player.awsCredits}`, 500, 55);
        this.ctx.fillText(`🏆 자격증: ${this.player.certifications.size}/4`, 700, 55);
        
        // Controls
        this.ctx.fillStyle = '#E8F5E8';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('WASD/화살표: 이동 | 스페이스: 상호작용', this.canvas.width - 300, 25);
        
        // Performance info
        if (this.deltaTime > 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(10, this.canvas.height - 50, 150, 40);
            
            this.ctx.fillStyle = '#00FF00';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(`FPS: ${Math.round(1000 / this.deltaTime)}`, 15, this.canvas.height - 35);
            this.ctx.fillText(`Particles: ${this.particles.length}`, 15, this.canvas.height - 20);
        }
    }

    renderBasicSprite(x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, size, size);
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the ultimate AWS quiz battle RPG
window.addEventListener('load', () => {
    new UltimateAWSQuizRPG();
});