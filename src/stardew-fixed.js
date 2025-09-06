/**
 * ULTIMATE AWS NODEUL ISLAND QUIZ BATTLE RPG
 * 완전한 4시간 개발 미션 - 오류 없는 완성된 게임
 */

class AWSNodeulQuest {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // 게임 상태
        this.gameState = 'overworld'; // overworld, battle, dialogue
        this.time = 0;
        this.deltaTime = 0;
        this.lastTime = performance.now();
        
        // 플레이어
        this.player = {
            x: 480, y: 360, width: 32, height: 32, speed: 3,
            direction: 'down', moving: false, animFrame: 0,
            hp: 100, maxHp: 100, level: 1, exp: 0, expToNext: 100,
            certifications: new Set(), awsCredits: 500
        };
        
        // 카메라
        this.camera = { x: 0, y: 0, targetX: 0, targetY: 0, smoothing: 0.1 };
        
        // 맵
        this.tileSize = 32;
        this.mapWidth = 50;
        this.mapHeight = 40;
        this.map = [];
        
        // 배틀 시스템
        this.battleState = {
            active: false, monster: null, currentQuestion: null,
            playerTurn: true, battlePhase: 'question',
            damageNumbers: [], screenShake: 0
        };
        
        // 입력
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        
        // 엔티티
        this.monsters = [];
        this.gymLeaders = [];
        this.particles = [];
        
        // 퀴즈 데이터베이스
        this.quizDatabase = this.createQuizDatabase();
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.generateNodeulMap();
        this.setupMonsters();
        this.setupGymLeaders();
        this.setupEventHandlers();
        
        console.log('🎮 AWS 노들섬 퀴즈 배틀 RPG 시작!');
        this.gameLoop();
    }
    
    createQuizDatabase() {
        return {
            cp: [
                {
                    question: "AWS의 핵심 가치 제안은 무엇인가요?",
                    options: ["비용 절감만", "확장성만", "보안만", "비용 절감, 확장성, 보안 모두"],
                    correct: 3,
                    explanation: "AWS는 비용 절감, 확장성, 보안을 모두 제공합니다.",
                    difficulty: 1
                },
                {
                    question: "S3의 주요 용도는 무엇인가요?",
                    options: ["컴퓨팅", "객체 스토리지", "데이터베이스", "네트워킹"],
                    correct: 1,
                    explanation: "S3는 확장 가능한 객체 스토리지 서비스입니다.",
                    difficulty: 1
                },
                {
                    question: "EC2는 무엇의 약자인가요?",
                    options: ["Elastic Compute Cloud", "Easy Cloud Computing", "Enterprise Cloud Center", "Elastic Container Cloud"],
                    correct: 0,
                    explanation: "EC2는 Elastic Compute Cloud의 약자입니다.",
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
                },
                {
                    question: "Auto Scaling의 주요 목적은?",
                    options: ["비용 절감", "성능 향상", "수요에 따른 자동 확장/축소", "보안 강화"],
                    correct: 2,
                    explanation: "Auto Scaling은 수요에 따라 리소스를 자동으로 확장하거나 축소합니다.",
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
                },
                {
                    question: "API Gateway의 주요 기능은?",
                    options: ["데이터 저장", "API 관리 및 배포", "컴퓨팅", "모니터링"],
                    correct: 1,
                    explanation: "API Gateway는 API를 생성, 배포, 관리하는 서비스입니다.",
                    difficulty: 3
                }
            ]
        };
    }
    
    generateNodeulMap() {
        // 기본 잔디로 초기화
        for (let y = 0; y < this.mapHeight; y++) {
            const row = [];
            for (let x = 0; x < this.mapWidth; x++) {
                row.push(1); // 잔디
            }
            this.map.push(row);
        }
        
        // 한강 (곡선형)
        for (let x = 0; x < this.mapWidth; x++) {
            const progress = x / this.mapWidth;
            const riverCenter = 8 + Math.sin(progress * Math.PI * 2) * 3;
            for (let offset = -2; offset <= 2; offset++) {
                const riverY = Math.floor(riverCenter + offset);
                if (riverY >= 0 && riverY < this.mapHeight) {
                    this.map[riverY][x] = 2; // 물
                }
            }
        }
        
        // AWS 센터
        for (let y = 32; y < 36; y++) {
            for (let x = 20; x < 26; x++) {
                this.map[y][x] = 8; // AWS 센터
            }
        }
        
        // 나무들
        const trees = [
            {x: 15, y: 3}, {x: 25, y: 4}, {x: 35, y: 2},
            {x: 12, y: 35}, {x: 30, y: 36}, {x: 40, y: 37}
        ];
        trees.forEach(tree => {
            if (tree.x < this.mapWidth && tree.y < this.mapHeight) {
                this.map[tree.y][tree.x] = 3; // 나무
            }
        });
        
        // 길
        for (let x = 10; x < 40; x++) {
            const pathY = 25 + Math.sin(x * 0.2) * 2;
            if (pathY >= 0 && pathY < this.mapHeight) {
                this.map[Math.floor(pathY)][x] = 7; // 길
            }
        }
    }
    
    setupMonsters() {
        this.monsters = [
            {
                x: 20, y: 20, name: 'S3버킷', type: 's3',
                hp: 60, maxHp: 60, level: 1, cert: 'cp',
                defeated: false, moveTimer: 0
            },
            {
                x: 30, y: 22, name: '람다함수', type: 'lambda',
                hp: 50, maxHp: 50, level: 1, cert: 'cp',
                defeated: false, moveTimer: 0
            },
            {
                x: 35, y: 18, name: 'EC2인스턴스', type: 'ec2',
                hp: 70, maxHp: 70, level: 2, cert: 'cp',
                defeated: false, moveTimer: 0
            },
            {
                x: 40, y: 15, name: 'VPC거북이', type: 'vpc',
                hp: 100, maxHp: 100, level: 3, cert: 'saa',
                defeated: false, moveTimer: 0
            }
        ];
    }
    
    setupGymLeaders() {
        this.gymLeaders = [
            {
                x: 23, y: 34, name: '이재용', title: 'CP 관장님',
                cert: 'cp', defeated: false,
                dialogue: [
                    "안녕하세요! AWS 클라우드 프랙티셔너 관장 이재용입니다.",
                    "클라우드의 기초부터 차근차근 배워보시죠!",
                    "준비되셨다면 배틀을 시작하겠습니다!"
                ]
            },
            {
                x: 42, y: 16, name: '김아키텍트', title: 'SAA 관장님',
                cert: 'saa', defeated: false,
                dialogue: [
                    "솔루션 아키텍트 관장 김아키텍트입니다.",
                    "확장 가능한 아키텍처 설계에 대해 알아볼까요?"
                ]
            }
        ];
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
        if (!this.battleState.currentQuestion) return;
        
        const optionHeight = 40;
        const startY = this.canvas.height - 180;
        
        for (let i = 0; i < 4; i++) {
            const optionY = startY + i * optionHeight;
            if (this.mouse.y >= optionY && this.mouse.y <= optionY + 35) {
                this.handleQuizAnswer(i);
                break;
            }
        }
    }
    
    startBattle(monster) {
        this.battleState.active = true;
        this.battleState.monster = monster;
        this.battleState.playerTurn = true;
        this.battleState.battlePhase = 'question';
        this.gameState = 'battle';
        
        const questions = this.quizDatabase[monster.cert] || this.quizDatabase.cp;
        this.battleState.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        this.battleState.screenShake = 10;
        
        console.log(`⚔️ ${monster.name}와의 퀴즈 배틀 시작!`);
    }
    
    handleQuizAnswer(selectedOption) {
        const question = this.battleState.currentQuestion;
        const correct = selectedOption === question.correct;
        
        if (correct) {
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
            this.player.hp = this.player.maxHp;
            console.log('💔 패배... 체력을 회복하고 다시 도전하세요!');
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
    
    addParticle(x, y, config = {}) {
        this.particles.push({
            x, y,
            vx: config.vx || (Math.random() - 0.5) * 4,
            vy: config.vy || (Math.random() - 0.5) * 4,
            life: config.life || 1000,
            maxLife: config.life || 1000,
            size: config.size || 2,
            color: config.color || '#FFFFFF'
        });
    }
    
    update() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.time = currentTime;
        
        this.updateParticles();
        
        if (this.gameState === 'overworld') {
            this.updatePlayer();
            this.updateMonsters();
            this.updateCamera();
            this.checkInteractions();
        }
        
        if (this.battleState.screenShake > 0) {
            this.battleState.screenShake *= 0.9;
            if (this.battleState.screenShake < 0.1) {
                this.battleState.screenShake = 0;
            }
        }
        
        this.mouse.clicked = false;
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.life -= this.deltaTime;
            particle.x += particle.vx * this.deltaTime * 0.001;
            particle.y += particle.vy * this.deltaTime * 0.001;
            return particle.life > 0;
        });
        
        this.battleState.damageNumbers = this.battleState.damageNumbers.filter(dmg => {
            dmg.life -= this.deltaTime;
            dmg.x += dmg.vx * this.deltaTime * 0.001;
            dmg.y += dmg.vy * this.deltaTime * 0.001;
            return dmg.life > 0;
        });
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
            
            if (Math.random() < 0.05) {
                this.addParticle(this.player.x + 16, this.player.y + 28, {
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
        
        // 몬스터 조우
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
        
        // 체육관 관장 상호작용
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
        const gymMonster = {
            name: `${leader.name}의 AWS 챔피언`,
            type: 'gym',
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
        // 하늘 그라데이션
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
            case 1: // 잔디
                this.ctx.fillStyle = '#7CB342';
                this.ctx.fillRect(x, y, size, size);
                
                const grassSeed = (mapX * 7 + mapY * 11) % 100;
                if (grassSeed < 20) {
                    this.ctx.fillStyle = '#8BC34A';
                    const grassX = x + (grassSeed % 4) * 8;
                    const grassY = y + Math.floor(grassSeed / 4) * 8;
                    this.ctx.fillRect(grassX, grassY, 2, 6);
                }
                break;
                
            case 2: // 한강
                const waterDepth = Math.sin(mapX * 0.1) * Math.cos(mapY * 0.1) * 0.3 + 0.7;
                this.ctx.fillStyle = `hsl(210, 70%, ${20 + waterDepth * 15}%)`;
                this.ctx.fillRect(x, y, size, size);
                
                const wave = Math.sin(this.time * 0.002 + mapX * 0.2) * 2;
                this.ctx.fillStyle = `hsl(210, 60%, ${35 + waterDepth * 10}%)`;
                this.ctx.fillRect(x, y + 12 + wave, size, 4);
                break;
                
            case 3: // 나무
                this.ctx.fillStyle = '#7CB342';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x + 14, y + 18, 4, 14);
                
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.beginPath();
                this.ctx.arc(x + 16, y + 12, 12, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 7: // 길
                this.ctx.fillStyle = '#D7CCC8';
                this.ctx.fillRect(x, y, size, size);
                break;
                
            case 8: // AWS 센터
                this.ctx.fillStyle = '#FF9900';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#232F3E';
                this.ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
                
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '8px monospace';
                this.ctx.fillText('AWS', x + 8, y + 20);
                break;
        }
    }
    
    renderEntities() {
        // 몬스터 렌더링
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            const screenX = monster.x * this.tileSize - this.camera.x;
            const screenY = monster.y * this.tileSize - this.camera.y;
            
            this.renderMonster(monster, screenX, screenY);
        });
        
        // 체육관 관장 렌더링
        this.gymLeaders.forEach(leader => {
            if (leader.defeated) return;
            
            const screenX = leader.x * this.tileSize - this.camera.x;
            const screenY = leader.y * this.tileSize - this.camera.y;
            
            this.renderGymLeader(leader, screenX, screenY);
        });
        
        // 플레이어 렌더링
        const screenX = this.player.x - this.camera.x;
        const screenY = this.player.y - this.camera.y;
        this.renderPlayer(screenX, screenY);
    }
    
    renderPlayer(x, y) {
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.ellipse(x + 16, y + 28, 12, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 애니메이션 오프셋
        const animOffset = this.player.moving ? Math.sin(this.player.animFrame) * 2 : 0;
        
        // 몸 (청바지)
        this.ctx.fillStyle = '#1565C0';
        this.ctx.fillRect(x + 10, y + 20 + animOffset, 12, 8);
        
        // 상의 (폴로셔츠)
        this.ctx.fillStyle = '#2E7D32';
        this.ctx.fillRect(x + 8, y + 16 + animOffset, 16, 8);
        
        // 머리
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 10, y + 6 + animOffset, 12, 12);
        
        // 머리카락
        this.ctx.fillStyle = '#2C1810';
        this.ctx.fillRect(x + 8, y + 4 + animOffset, 16, 8);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 12, y + 10 + animOffset, 2, 2);
        this.ctx.fillRect(x + 18, y + 10 + animOffset, 2, 2);
        
        // 입
        this.ctx.fillRect(x + 14, y + 14 + animOffset, 4, 1);
        
        // 신발
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 8, y + 28 + animOffset, 6, 4);
        this.ctx.fillRect(x + 18, y + 28 + animOffset, 6, 4);
    }
    
    renderMonster(monster, x, y) {
        const bounce = Math.sin(this.time * 0.005) * 2;
        
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this.ctx.ellipse(x + 16, y + 26, 10, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        switch(monster.type) {
            case 's3':
                // S3 버킷 (파란 큐브)
                this.ctx.fillStyle = '#1976D2';
                this.ctx.fillRect(x + 4, y + 8 + bounce, 24, 20);
                
                // 버킷 손잡이
                this.ctx.fillStyle = '#0D47A1';
                this.ctx.fillRect(x + 6, y + 6 + bounce, 20, 4);
                
                // 눈
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(x + 10, y + 14 + bounce, 4, 4);
                this.ctx.fillRect(x + 18, y + 14 + bounce, 4, 4);
                
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(x + 12, y + 16 + bounce, 2, 2);
                this.ctx.fillRect(x + 20, y + 16 + bounce, 2, 2);
                break;
                
            case 'lambda':
                // 람다 함수 (노란 번개)
                this.ctx.fillStyle = '#FFD600';
                this.ctx.fillRect(x + 6, y + 8 + bounce, 20, 16);
                
                // 번개 모양
                this.ctx.fillStyle = '#FF6F00';
                this.ctx.fillRect(x + 10, y + 6 + bounce, 4, 8);
                this.ctx.fillRect(x + 8, y + 12 + bounce, 8, 4);
                this.ctx.fillRect(x + 12, y + 16 + bounce, 4, 8);
                
                // 전기 스파크
                const spark = Math.sin(this.time * 0.01) * 3;
                this.ctx.fillStyle = '#00E5FF';
                this.ctx.fillRect(x - 2 + spark, y + 10, 2, 2);
                this.ctx.fillRect(x + 28 + spark, y + 14, 2, 2);
                break;
                
            case 'ec2':
                // EC2 인스턴스 (서버 박스)
                this.ctx.fillStyle = '#37474F';
                this.ctx.fillRect(x + 4, y + 8 + bounce, 24, 20);
                
                // LED 표시등
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + 8, y + 12 + bounce, 4, 2);
                this.ctx.fillStyle = '#FF9900';
                this.ctx.fillRect(x + 14, y + 12 + bounce, 4, 2);
                this.ctx.fillStyle = '#2196F3';
                this.ctx.fillRect(x + 20, y + 12 + bounce, 4, 2);
                break;
                
            case 'vpc':
                // VPC 거북이
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + 2, y + 12 + bounce, 28, 16);
                
                // 거북이 등껍질 패턴
                this.ctx.fillStyle = '#2E7D32';
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 2; j++) {
                        this.ctx.fillRect(x + 6 + i * 6, y + 14 + j * 6 + bounce, 4, 4);
                    }
                }
                
                // 머리
                this.ctx.fillStyle = '#66BB6A';
                this.ctx.fillRect(x + 30, y + 16 + bounce, 8, 8);
                break;
                
            default:
                // 기본 몬스터
                this.ctx.fillStyle = '#FF9900';
                this.ctx.fillRect(x + 4, y + 8 + bounce, 24, 20);
        }
        
        // 몬스터 이름
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(monster.name, x - 10, y - 5);
    }
    
    renderGymLeader(leader, x, y) {
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.ellipse(x + 16, y + 28, 12, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 글로우 효과
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 10;
        
        if (leader.cert === 'cp') {
            // 이재용 - 비즈니스 정장
            this.ctx.fillStyle = '#1A237E';
            this.ctx.fillRect(x + 6, y + 14, 20, 16);
            
            // 흰 셔츠
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x + 10, y + 16, 12, 8);
            
            // 넥타이
            this.ctx.fillStyle = '#FF9900';
            this.ctx.fillRect(x + 14, y + 18, 4, 8);
        } else {
            // 김아키텍트 - 스마트 캐주얼
            this.ctx.fillStyle = '#424242';
            this.ctx.fillRect(x + 8, y + 16, 16, 12);
        }
        
        this.ctx.shadowBlur = 0;
        
        // 머리
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 10, y + 4, 12, 12);
        
        // 머리카락
        this.ctx.fillStyle = '#2C1810';
        this.ctx.fillRect(x + 8, y + 2, 16, 8);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 12, y + 8, 2, 2);
        this.ctx.fillRect(x + 18, y + 8, 2, 2);
        
        // 타이틀
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 10px monospace';
        this.ctx.fillText(leader.title, x - 15, y - 5);
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
        // 배틀 배경
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1A237E');
        gradient.addColorStop(1, '#3F51B5');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 몬스터
        if (this.battleState.monster) {
            const monsterX = this.canvas.width * 0.7;
            const monsterY = this.canvas.height * 0.3;
            this.renderMonster(this.battleState.monster, monsterX - 16, monsterY - 16);
            
            // 몬스터 HP 바
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
        
        // 플레이어
        const playerX = this.canvas.width * 0.3;
        const playerY = this.canvas.height * 0.7;
        this.renderPlayer(playerX - 16, playerY - 16);
        
        // 플레이어 HP 바
        const playerHpBarWidth = 200;
        const playerHpBarHeight = 20;
        const playerHpBarX = playerX - playerHpBarWidth / 2;
        const playerHpBarY = playerY + 40;
        
        this.ctx.fillStyle = '#F44336';
        this.ctx.fillRect(playerHpBarX, playerHpBarY, playerHpBarWidth, playerHpBarHeight);
        
        const playerHpPercent = this.player.hp / this.player.maxHp;
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(playerHpBarX, playerHpBarY, playerHpBarWidth * playerHpPercent, playerHpBarHeight);
        
        // 퀴즈 인터페이스
        if (this.battleState.battlePhase === 'question' && this.battleState.currentQuestion) {
            this.renderQuizInterface();
        }
        
        // 데미지 넘버
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
        
        // 질문 패널
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(50, this.canvas.height - 220, this.canvas.width - 100, 170);
        
        // 질문 텍스트
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(question.question, 70, this.canvas.height - 190);
        
        // 선택지
        question.options.forEach((option, index) => {
            const optionY = this.canvas.height - 160 + index * 35;
            const optionX = 70;
            
            // 선택지 배경
            const isHovered = this.mouse.y >= optionY - 15 && this.mouse.y <= optionY + 15;
            this.ctx.fillStyle = isHovered ? 'rgba(255, 153, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(optionX - 10, optionY - 15, this.canvas.width - 140, 30);
            
            // 선택지 텍스트
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '14px monospace';
            this.ctx.fillText(`${index + 1}. ${option}`, optionX, optionY);
        });
        
        // 안내 텍스트
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('클릭하거나 1-4 키를 눌러 답을 선택하세요', 70, this.canvas.height - 70);
    }
    
    renderUI() {
        // 상단 UI 패널
        this.ctx.fillStyle = 'rgba(35, 47, 62, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, 80);
        
        // 제목
        this.ctx.fillStyle = '#FF9900';
        this.ctx.font = 'bold 20px serif';
        this.ctx.fillText('🏝️ AWS 노들섬 퀴즈 배틀 RPG', 20, 30);
        
        // 플레이어 상태
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`레벨 ${this.player.level} 클라우드 엔지니어`, 20, 55);
        this.ctx.fillText(`❤️ HP: ${this.player.hp}/${this.player.maxHp}`, 200, 55);
        this.ctx.fillText(`⭐ EXP: ${this.player.exp}/${this.player.expToNext}`, 350, 55);
        this.ctx.fillText(`💰 AWS Credits: ${this.player.awsCredits}`, 500, 55);
        this.ctx.fillText(`🏆 자격증: ${this.player.certifications.size}/4`, 700, 55);
        
        // 조작법
        this.ctx.fillStyle = '#E8F5E8';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('WASD/화살표: 이동 | 스페이스: 상호작용', this.canvas.width - 300, 25);
        
        // 성능 정보
        if (this.deltaTime > 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(10, this.canvas.height - 50, 150, 40);
            
            this.ctx.fillStyle = '#00FF00';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(`FPS: ${Math.round(1000 / this.deltaTime)}`, 15, this.canvas.height - 35);
            this.ctx.fillText(`Particles: ${this.particles.length}`, 15, this.canvas.height - 20);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 게임 시작
window.addEventListener('load', () => {
    new AWSNodeulQuest();
});