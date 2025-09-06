class AWSCertQuest {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.exp =  0;
        this.expToNext = 100;
        this.collectedStickers = new Set();
        
        this.gameState = 'overworld';
        this.battleTransition = 0;
        this.currentMap = 'town';
        
        this.player = {
            x: 400,
            y: 300,
            width: 24,
            height: 24,
            speed: 2,
            direction: 'down',
            moving: false,
            stepCount: 0,
            animFrame: 0
        };
        
        this.camera = { x: 0, y: 0 };
        this.tileSize = 32;
        
        this.maps = {
            town: this.generateTownMap(),
            route1: this.generateRouteMap(),
            center: this.generateCenterMap()
        };
        
        this.buildings = {
            town: [
                { x: 200, y: 150, width: 96, height: 96, type: 'center', name: '누들누들 센터' },
                { x: 400, y: 200, width: 64, height: 64, type: 'house', name: '플레이어 집' },
                { x: 600, y: 180, width: 80, height: 80, type: 'shop', name: 'AWS 상점' }
            ]
        };
        
        this.doors = {
            town: [
                { x: 248, y: 246, width: 32, height: 16, to: 'center', playerX: 400, playerY: 350 },
                { x: 432, y: 264, width: 32, height: 16, to: 'route1', playerX: 100, playerY: 300 }
            ],
            center: [
                { x: 400, y: 350, width: 32, height: 16, to: 'town', playerX: 248, playerY: 280 }
            ],
            route1: [
                { x: 100, y: 300, width: 32, height: 16, to: 'town', playerX: 432, playerY: 230 }
            ]
        };
        
        this.currentBattle = null;
        this.battleMonster = null;
        
        this.npcs = [
            { x: 200, y: 300, cert: 'cp', name: 'Cloud Practitioner', color: '#ff6b6b', defeated: false, map: 'route1' },
            { x: 400, y: 200, cert: 'saa', name: 'Solutions Architect', color: '#4ecdc4', defeated: false, map: 'route1' },
            { x: 600, y: 400, cert: 'dva', name: 'Developer Associate', color: '#45b7d1', defeated: false, map: 'route1' },
            { x: 300, y: 450, cert: 'soa', name: 'SysOps Admin', color: '#f9ca24', defeated: false, map: 'route1' },
            { x: 500, y: 150, cert: 'sap', name: 'Solutions Architect Pro', color: '#a55eea', defeated: false, map: 'route1' },
            { x: 150, y: 500, cert: 'dop', name: 'DevOps Engineer Pro', color: '#26de81', defeated: false, map: 'route1' }
        ];
        
        this.monsters = [
            { name: 'Bug Goomba', level: 1, color: '#8B4513', questions: ['cp'] },
            { name: 'Code Koopa', level: 2, color: '#228B22', questions: ['cp', 'saa'] },
            { name: 'Lambda Lizard', level: 3, color: '#FF6347', questions: ['saa', 'dva'] },
            { name: 'S3 Slime', level: 2, color: '#4169E1', questions: ['cp', 'saa'] },
            { name: 'EC2 Eagle', level: 4, color: '#DAA520', questions: ['saa', 'dva', 'soa'] },
            { name: 'VPC Viper', level: 5, color: '#9932CC', questions: ['saa', 'soa', 'sap'] }
        ];
        
        this.keys = {};
        this.currentQuiz = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
    }
    
    generateTownMap() {
        const map = [];
        for (let y = 0; y < 20; y++) {
            const row = [];
            for (let x = 0; x < 25; x++) {
                if (x === 0 || x === 24 || y === 0 || y === 19) {
                    row.push(3); // 경계
                } else if ((x >= 6 && x <= 9 && y >= 4 && y <= 7) || 
                          (x >= 12 && x <= 15 && y >= 6 && y <= 8) ||
                          (x >= 18 && x <= 20 && y >= 5 && y <= 7)) {
                    row.push(4); // 건물
                } else {
                    row.push(1); // 길
                }
            }
            map.push(row);
        }
        return map;
    }
    
    generateRouteMap() {
        const map = [];
        for (let y = 0; y < 20; y++) {
            const row = [];
            for (let x = 0; x < 25; x++) {
                if (x === 0 || x === 24 || y === 0 || y === 19) {
                    row.push(3);
                } else if (x >= 3 && x <= 21 && y >= 3 && y <= 16) {
                    row.push(Math.random() < 0.7 ? 0 : 1); // 풀숲
                } else {
                    row.push(1);
                }
            }
            map.push(row);
        }
        return map;
    }
    
    generateCenterMap() {
        const map = [];
        for (let y = 0; y < 15; y++) {
            const row = [];
            for (let x = 0; x < 20; x++) {
                if (x === 0 || x === 19 || y === 0 || y === 14) {
                    row.push(3);
                } else if (x >= 8 && x <= 11 && y >= 3 && y <= 5) {
                    row.push(5); // 치료대
                } else {
                    row.push(2); // 센터 바닥
                }
            }
            map.push(row);
        }
        return map;
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (this.gameState === 'overworld') {
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
            }
            
            if (this.gameState === 'battle' && (e.key === ' ' || e.key === 'Enter')) {
                this.startQuizFromBattle();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    update() {
        if (this.gameState === 'overworld') {
            this.updateOverworld();
        } else if (this.gameState === 'battle') {
            this.updateBattle();
        }
        
        this.updateCamera();
    }
    
    updateOverworld() {
        let moving = false;
        const oldX = this.player.x;
        const oldY = this.player.y;
        
        if (this.keys['ArrowUp']) {
            this.player.y -= this.player.speed;
            this.player.direction = 'up';
            moving = true;
        }
        if (this.keys['ArrowDown']) {
            this.player.y += this.player.speed;
            this.player.direction = 'down';
            moving = true;
        }
        if (this.keys['ArrowLeft']) {
            this.player.x -= this.player.speed;
            this.player.direction = 'left';
            moving = true;
        }
        if (this.keys['ArrowRight']) {
            this.player.x += this.player.speed;
            this.player.direction = 'right';
            moving = true;
        }
        
        // 충돌 검사
        if (this.checkMapCollision()) {
            this.player.x = oldX;
            this.player.y = oldY;
            moving = false;
        }
        
        this.player.moving = moving;
        
        if (moving) {
            this.player.animFrame = (this.player.animFrame + 1) % 60;
            this.player.stepCount++;
            
            // 풀숲에서 랜덤 인카운터
            if (this.isInGrass() && this.player.stepCount % 15 === 0) {
                if (Math.random() < 0.25) {
                    this.startRandomBattle();
                }
            }
        }
        
        // 문 체크
        this.checkDoors();
        
        // 누들누들 센터 치료
        if (this.currentMap === 'center' && this.checkHealingSpot()) {
            if (this.keys[' ']) {
                this.healPlayer();
            }
        }
        
        // NPC 상호작용
        this.checkNPCInteraction();
    }
    
    updateBattle() {
        if (this.battleTransition < 60) {
            this.battleTransition++;
        }
    }
    
    updateCamera() {
        const currentMapData = this.maps[this.currentMap];
        const mapWidth = currentMapData[0].length * this.tileSize;
        const mapHeight = currentMapData.length * this.tileSize;
        
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;
        
        if (this.camera.x < 0) this.camera.x = 0;
        if (this.camera.y < 0) this.camera.y = 0;
        if (this.camera.x > mapWidth - this.canvas.width) {
            this.camera.x = mapWidth - this.canvas.width;
        }
        if (this.camera.y > mapHeight - this.canvas.height) {
            this.camera.y = mapHeight - this.canvas.height;
        }
    }
    
    checkMapCollision() {
        const currentMapData = this.maps[this.currentMap];
        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        
        if (tileY < 0 || tileY >= currentMapData.length || tileX < 0 || tileX >= currentMapData[0].length) {
            return true;
        }
        
        const tile = currentMapData[tileY][tileX];
        return tile === 3 || tile === 4; // 나무나 건물
    }
    
    isInGrass() {
        if (this.currentMap !== 'route1') return false;
        const currentMapData = this.maps[this.currentMap];
        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        
        if (tileY < 0 || tileY >= currentMapData.length || tileX < 0 || tileX >= currentMapData[0].length) {
            return false;
        }
        
        return currentMapData[tileY][tileX] === 0;
    }
    
    checkDoors() {
        const doors = this.doors[this.currentMap] || [];
        doors.forEach(door => {
            if (this.checkCollision(this.player, door)) {
                this.changeMap(door.to, door.playerX, door.playerY);
            }
        });
    }
    
    changeMap(newMap, newX, newY) {
        this.currentMap = newMap;
        this.player.x = newX;
        this.player.y = newY;
        this.playSound(330, 0.2);
    }
    
    checkHealingSpot() {
        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        const currentMapData = this.maps[this.currentMap];
        
        return currentMapData[tileY] && currentMapData[tileY][tileX] === 5;
    }
    
    healPlayer() {
        this.lives = 5;
        this.playSound(660, 0.3);
        alert('🎉 누들누들 센터에서 치료받았습니다! HP 완전 회복!');
        this.updateUI();
    }
    
    checkNPCInteraction() {
        const npcsInCurrentMap = this.npcs.filter(npc => npc.map === this.currentMap || (!npc.map && this.currentMap === 'route1'));
        npcsInCurrentMap.forEach(npc => {
            if (!npc.defeated && this.checkCollision(this.player, { x: npc.x, y: npc.y, width: 24, height: 24 })) {
                this.startNPCBattle(npc);
            }
        });
    }
    
    startRandomBattle() {
        const availableMonsters = this.monsters.filter(m => m.level <= this.level + 2);
        this.battleMonster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
        this.gameState = 'battle';
        this.battleTransition = 0;
        this.playSound(150, 0.5);
    }
    
    startNPCBattle(npc) {
        if (this.collectedStickers.has(npc.cert)) return;
        
        this.battleMonster = {
            name: `${npc.name} Master`,
            level: this.getQuestionDifficulty(npc.cert),
            color: npc.color,
            questions: [npc.cert],
            isNPC: true,
            npc: npc
        };
        this.gameState = 'battle';
        this.battleTransition = 0;
        this.playSound(220, 0.5);
    }
    
    startQuizFromBattle() {
        if (this.battleTransition < 60) return;
        
        const certTypes = this.battleMonster.questions;
        const randomCert = certTypes[Math.floor(Math.random() * certTypes.length)];
        const question = getRandomQuiz(randomCert);
        
        if (!question) return;
        
        this.currentQuiz = {
            monster: this.battleMonster,
            question: question,
            cert: randomCert
        };
        
        this.gameState = 'quiz';
        this.showQuizUI();
    }
    
    showQuizUI() {
        const quizDiv = document.getElementById('quiz');
        const questionEl = document.getElementById('quizQuestion');
        const optionsEl = document.getElementById('quizOptions');
        
        questionEl.textContent = `${this.currentQuiz.monster.name} (Lv.${this.currentQuiz.monster.level}): ${this.currentQuiz.question.question}`;
        
        optionsEl.innerHTML = '';
        this.currentQuiz.question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = `${index + 1}. ${option}`;
            button.style.cssText = 'margin: 5px; padding: 10px; background: #00ffff; color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer;';
            button.onclick = () => this.answerQuiz(index);
            optionsEl.appendChild(button);
        });
        
        quizDiv.style.display = 'block';
    }
    
    answerQuiz(selectedIndex) {
        const correct = selectedIndex === this.currentQuiz.question.correct;
        
        if (correct) {
            const expGain = this.currentQuiz.monster.level * 20;
            this.exp += expGain;
            this.score += 100 * this.currentQuiz.monster.level;
            
            if (this.currentQuiz.monster.isNPC) {
                this.collectedStickers.add(this.currentQuiz.cert);
                this.currentQuiz.monster.npc.defeated = true;
                this.updateStickerDisplay();
                alert(`🎉 정답! ${this.currentQuiz.monster.name}를 이겼습니다!\\n${this.currentQuiz.question.explanation}\\n스티커 획득! EXP +${expGain}`);
            } else {
                alert(`🎉 정답! ${this.currentQuiz.monster.name}를 이겼습니다!\\n${this.currentQuiz.question.explanation}\\nEXP +${expGain}`);
            }
            
            this.checkLevelUp();
        } else {
            this.lives--;
            alert(`❌ 틀렸습니다! ${this.currentQuiz.monster.name}의 공격을 받았습니다!\\n정답: ${this.currentQuiz.question.options[this.currentQuiz.question.correct]}\\n${this.currentQuiz.question.explanation}`);
            
            if (this.lives <= 0) {
                alert('게임 오버! 포켓몬 센터에서 치료받으세요.');
                this.resetGame();
            }
        }
        
        document.getElementById('quiz').style.display = 'none';
        this.gameState = 'overworld';
        this.currentQuiz = null;
        this.battleMonster = null;
        this.updateUI();
        
        if (this.collectedStickers.size === this.npcs.length) {
            alert('🏆 축하합니다! 모든 AWS 자격증 마스터를 이겼습니다!');
        }
    }
    
    checkLevelUp() {
        if (this.exp >= this.expToNext) {
            this.level++;
            this.exp -= this.expToNext;
            this.expToNext = this.level * 100;
            this.lives = Math.min(this.lives + 1, 5);
            alert(`🆙 레벨업! 레벨 ${this.level}이 되었습니다!\\n체력이 회복되었습니다!`);
        }
    }
    
    getQuestionDifficulty(cert) {
        const difficulties = { cp: 1, saa: 2, dva: 2, soa: 2, sap: 3, dop: 3 };
        return difficulties[cert] || 1;
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    playSound(frequency, duration) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {}
    }
    
    updateStickerDisplay() {
        this.collectedStickers.forEach(cert => {
            const stickerEl = document.getElementById(cert);
            if (stickerEl) {
                stickerEl.classList.add('collected');
            }
        });
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('levelValue').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('exp').textContent = this.exp;
        document.getElementById('expNext').textContent = this.expToNext;
        
        const expBar = document.getElementById('expBar');
        if (expBar) {
            const expPercent = (this.exp / this.expToNext) * 100;
            expBar.style.width = expPercent + '%';
        }
    }
    
    render() {
        if (this.gameState === 'overworld') {
            this.renderOverworld();
        } else if (this.gameState === 'battle') {
            this.renderBattle();
        }
    }
    
    renderOverworld() {
        const currentMapData = this.maps[this.currentMap];
        
        // 배경
        this.ctx.fillStyle = this.currentMap === 'center' ? '#F0F8FF' : '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 맵 타일 렌더링
        for (let y = 0; y < currentMapData.length; y++) {
            for (let x = 0; x < currentMapData[y].length; x++) {
                const screenX = x * this.tileSize - this.camera.x;
                const screenY = y * this.tileSize - this.camera.y;
                
                if (screenX > -this.tileSize && screenX < this.canvas.width && 
                    screenY > -this.tileSize && screenY < this.canvas.height) {
                    
                    this.renderTile(currentMapData[y][x], screenX, screenY);
                }
            }
        }
        
        // 건물 렌더링
        if (this.buildings[this.currentMap]) {
            this.buildings[this.currentMap].forEach(building => {
                const screenX = building.x - this.camera.x;
                const screenY = building.y - this.camera.y;
                this.renderBuilding(building, screenX, screenY);
            });
        }
        
        // NPC 렌더링
        this.npcs.forEach(npc => {
            if (npc.defeated || (npc.map && npc.map !== this.currentMap)) return;
            if (!npc.map && this.currentMap !== 'route1') return;
            
            const screenX = npc.x - this.camera.x;
            const screenY = npc.y - this.camera.y;
            
            if (screenX > -32 && screenX < this.canvas.width && 
                screenY > -32 && screenY < this.canvas.height) {
                this.renderNPC(npc, screenX, screenY);
            }
        });
        
        // 플레이어 렌더링
        const playerScreenX = this.player.x - this.camera.x;
        const playerScreenY = this.player.y - this.camera.y;
        this.renderPlayer(playerScreenX, playerScreenY);
        
        // UI
        this.renderUI();
    }
    
    renderTile(tileType, x, y) {
        switch(tileType) {
            case 0: // 풀
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                // 풀 텍스처
                this.ctx.fillStyle = '#32CD32';
                for (let i = 0; i < 8; i++) {
                    const grassX = x + (i % 4) * 8 + 4;
                    const grassY = y + Math.floor(i / 4) * 16 + 8;
                    this.ctx.fillRect(grassX, grassY, 2, 6);
                    this.ctx.fillRect(grassX + 2, grassY + 2, 2, 4);
                }
                break;
            case 1: // 길
                this.ctx.fillStyle = '#DEB887';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.strokeStyle = '#CD853F';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
                break;
            case 2: // 센터 바닥
                this.ctx.fillStyle = '#E6E6FA';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#D8BFD8';
                this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
                break;
            case 3: // 나무/벽
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#A0522D';
                this.ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
                break;
            case 4: // 건물
                this.ctx.fillStyle = '#696969';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                break;
            case 5: // 치료대
                this.ctx.fillStyle = '#FFB6C1';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#FF69B4';
                this.ctx.fillRect(x + 8, y + 8, 16, 16);
                break;
        }
    }
    
    renderBuilding(building, x, y) {
        if (building.type === 'center') {
            // 누들누들 센터
            this.ctx.fillStyle = '#FF69B4';
            this.ctx.fillRect(x, y, building.width, building.height);
            this.ctx.fillStyle = '#FF1493';
            this.ctx.fillRect(x + 8, y + 8, building.width - 16, building.height - 16);
            
            // 십자 마크
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x + 40, y + 20, 16, 4);
            this.ctx.fillRect(x + 46, y + 14, 4, 16);
            
            // 간판
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Courier New';
            this.ctx.fillText('누들누들 센터', x, y - 5);
        } else if (building.type === 'house') {
            // 집
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(x, y, building.width, building.height);
            this.ctx.fillStyle = '#A0522D';
            this.ctx.fillRect(x + 4, y + 4, building.width - 8, building.height - 8);
            
            // 지붕
            this.ctx.fillStyle = '#DC143C';
            this.ctx.fillRect(x - 8, y - 16, building.width + 16, 20);
        }
    }
    
    renderPlayer(x, y) {
        const animOffset = this.player.moving ? Math.floor(this.player.animFrame / 15) % 2 : 0;
        
        // 몸
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(x + 4, y + 8, 16, 16);
        
        // 머리
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 6, y + 2, 12, 10);
        
        // 모자
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x + 4, y, 16, 6);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        if (this.player.direction === 'up') {
            this.ctx.fillRect(x + 8, y + 4, 2, 2);
            this.ctx.fillRect(x + 14, y + 4, 2, 2);
        } else if (this.player.direction === 'down') {
            this.ctx.fillRect(x + 8, y + 6, 2, 2);
            this.ctx.fillRect(x + 14, y + 6, 2, 2);
        } else {
            this.ctx.fillRect(x + 10, y + 5, 2, 2);
            this.ctx.fillRect(x + 12, y + 5, 2, 2);
        }
        
        // 다리 (애니메이션)
        this.ctx.fillStyle = '#000080';
        if (this.player.moving) {
            this.ctx.fillRect(x + 6 + animOffset, y + 20, 4, 4);
            this.ctx.fillRect(x + 14 - animOffset, y + 20, 4, 4);
        } else {
            this.ctx.fillRect(x + 7, y + 20, 4, 4);
            this.ctx.fillRect(x + 13, y + 20, 4, 4);
        }
    }
    
    renderNPC(npc, x, y) {
        // 몸
        this.ctx.fillStyle = npc.color;
        this.ctx.fillRect(x + 2, y + 6, 20, 18);
        
        // 머리
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 4, y, 16, 12);
        
        // 왕관
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x + 6, y - 4, 12, 6);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 7, y + 3, 2, 2);
        this.ctx.fillRect(x + 15, y + 3, 2, 2);
        
        // 이름
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '10px Courier New';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(npc.cert.toUpperCase(), x, y - 8);
        this.ctx.fillText(npc.cert.toUpperCase(), x, y - 8);
    }
    
    renderUI() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Courier New';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        
        let instructions = '화살표: 이동';
        if (this.currentMap === 'center') {
            instructions += ', 치료대에서 스페이스: 치료';
        } else if (this.isInGrass()) {
            instructions = '풀숲 지역 - 몬스터 조우 가능!';
        }
        
        this.ctx.strokeText(instructions, 10, 25);
        this.ctx.fillText(instructions, 10, 25);
        
        // 맵 이름
        const mapNames = { town: '마을', route1: '1번 도로', center: '누들누들 센터' };
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '16px Courier New';
        this.ctx.strokeText(mapNames[this.currentMap], this.canvas.width - 150, 25);
        this.ctx.fillText(mapNames[this.currentMap], this.canvas.width - 150, 25);
    }
    
    renderBattle() {
        // 배틀 배경 (화면 전환 효과)
        const transitionProgress = this.battleTransition / 60;
        
        if (transitionProgress < 1) {
            // 화면 전환 애니메이션
            this.ctx.fillStyle = '#000000';
            const stripeHeight = this.canvas.height * transitionProgress;
            for (let i = 0; i < 10; i++) {
                this.ctx.fillRect(0, i * (this.canvas.height / 10), this.canvas.width, stripeHeight / 10);
            }
        } else {
            // 배틀 화면
            this.ctx.fillStyle = '#4B0082';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 몬스터
            if (this.battleMonster) {
                this.ctx.fillStyle = this.battleMonster.color;
                this.ctx.fillRect(this.canvas.width - 200, 100, 80, 80);
                
                // 몬스터 눈
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(this.canvas.width - 180, 120, 8, 8);
                this.ctx.fillRect(this.canvas.width - 160, 120, 8, 8);
                
                // 몬스터 정보
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '16px Courier New';
                this.ctx.fillText(`${this.battleMonster.name} Lv.${this.battleMonster.level}`, this.canvas.width - 250, 50);
            }
            
            // 플레이어 (뒷모습)
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillRect(100, this.canvas.height - 150, 60, 60);
            
            // 배틀 UI
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(50, this.canvas.height - 100, this.canvas.width - 100, 80);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(50, this.canvas.height - 100, this.canvas.width - 100, 80);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '18px Courier New';
            this.ctx.fillText('스페이스바 또는 엔터를 눌러 AWS 퀴즈 배틀 시작!', 70, this.canvas.height - 60);
        }
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.exp = 0;
        this.expToNext = 100;
        this.collectedStickers.clear();
        this.player.x = 400;
        this.player.y = 300;
        this.gameState = 'overworld';
        this.npcs.forEach(npc => npc.defeated = false);
        this.updateStickerDisplay();
        this.updateUI();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new AWSCertQuest();
});