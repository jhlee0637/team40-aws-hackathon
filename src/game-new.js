class AWSCertQuest {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 픽셀 퍼펙트 렌더링 설정
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        // 게임 상태
        this.gameState = 'overworld'; // 'overworld', 'battle', 'quiz'
        this.currentMap = 'town';
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.exp = 0;
        this.expToNext = 100;
        this.collectedStickers = new Set();
        this.currentQuiz = null;
        this.battleMonster = null;
        this.showingMessage = false;
        this.messageText = '';
        this.messageTimer = 0;
        
        // 플레이어 설정
        this.player = {
            x: 320,
            y: 240,
            width: 16,
            height: 16,
            speed: 1,
            direction: 'down',
            moving: false,
            animFrame: 0,
            stepCount: 0
        };
        
        // 카메라
        this.camera = { x: 0, y: 0 };
        this.tileSize = 16;
        this.scale = 3; // 16x16 타일을 48x48로 확대
        
        // 키 입력
        this.keys = {};
        this.lastMoveTime = 0;
        this.moveDelay = 150; // 포켓몬 스타일 격자 이동
        
        // 맵 데이터
        this.initializeMaps();
        this.initializeDoors();
        this.initializeNPCs();
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    initializeMaps() {
        this.maps = {
            town: [
                [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
                [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
                [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
                [3,1,1,1,4,4,4,1,1,1,1,1,4,4,4,1,1,1,1,3],
                [3,1,1,1,4,4,4,1,1,1,1,1,4,4,4,1,1,1,1,3],
                [3,1,1,1,4,5,4,1,1,1,1,1,4,4,4,1,1,1,1,3],
                [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
                [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
                [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
                [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
                [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,3],
                [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
                [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
                [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
                [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
            ],
            
            center: [
                [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
                [3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
                [3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
                [3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
                [3,2,2,2,2,2,5,5,5,2,2,2,2,2,3],
                [3,2,2,2,2,2,5,5,5,2,2,2,2,2,3],
                [3,2,2,2,2,2,5,5,5,2,2,2,2,2,3],
                [3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
                [3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
                [3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
                [3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
                [3,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
                [3,2,2,2,2,2,2,9,2,2,2,2,2,2,3],
                [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
            ],
            
            route1: [
                [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
                [9,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,7,0,0,0,0,0,7,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
                [3,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
                [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
            ]
        };
    }
    
    initializeDoors() {
        this.doors = {
            town: [
                { x: 6, y: 5, to: 'center', playerX: 7, playerY: 12 },
                { x: 18, y: 10, to: 'route1', playerX: 1, playerY: 1 }
            ],
            center: [
                { x: 7, y: 12, to: 'town', playerX: 6, playerY: 6 }
            ],
            route1: [
                { x: 0, y: 1, to: 'town', playerX: 17, playerY: 10 }
            ]
        };
    }
    
    initializeNPCs() {
        this.npcs = [
            { x: 8, y: 8, cert: 'cp', name: 'Cloud Practitioner Master', color: '#ff6b6b', defeated: false, map: 'route1' },
            { x: 12, y: 6, cert: 'saa', name: 'Solutions Architect Master', color: '#4ecdc4', defeated: false, map: 'route1' },
            { x: 15, y: 10, cert: 'dva', name: 'Developer Master', color: '#45b7d1', defeated: false, map: 'route1' }
        ];
        
        this.monsters = [
            { name: 'Bug Goomba', level: 1, color: '#8B4513', questions: ['cp'] },
            { name: 'Lambda Lizard', level: 2, color: '#FF6347', questions: ['saa'] },
            { name: 'S3 Slime', level: 2, color: '#4169E1', questions: ['dva'] }
        ];
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    update() {
        // 메시지 타이머 업데이트
        if (this.showingMessage && this.messageTimer > 0) {
            this.messageTimer -= 16; // 60fps 기준
            if (this.messageTimer <= 0) {
                this.showingMessage = false;
            }
        }
        
        if (this.gameState === 'overworld') {
            this.updatePlayer();
            this.checkDoors();
            this.checkNPCs();
            this.checkRandomEncounter();
            this.checkHealingSpot();
        } else if (this.gameState === 'battle') {
            if (this.keys[' '] || this.keys['Enter']) {
                this.startQuiz();
            }
        }
        
        this.updateCamera();
    }
    
    checkHealingSpot() {
        if (this.currentMap === 'center') {
            const playerTileX = Math.floor(this.player.x / this.tileSize);
            const playerTileY = Math.floor(this.player.y / this.tileSize);
            const currentMap = this.maps[this.currentMap];
            
            if (currentMap[playerTileY] && currentMap[playerTileY][playerTileX] === 5) {
                if (this.keys[' ']) {
                    this.lives = 5;
                    this.showMessage('🎉 누들누들 센터에서 치료받았습니다! HP 완전 회복!');
                }
            }
        }
    }
    
    updatePlayer() {
        const now = Date.now();
        if (now - this.lastMoveTime < this.moveDelay) return;
        
        let newX = this.player.x;
        let newY = this.player.y;
        let moved = false;
        
        if (this.keys['ArrowUp']) {
            newY -= this.tileSize;
            this.player.direction = 'up';
            moved = true;
        } else if (this.keys['ArrowDown']) {
            newY += this.tileSize;
            this.player.direction = 'down';
            moved = true;
        } else if (this.keys['ArrowLeft']) {
            newX -= this.tileSize;
            this.player.direction = 'left';
            moved = true;
        } else if (this.keys['ArrowRight']) {
            newX += this.tileSize;
            this.player.direction = 'right';
            moved = true;
        }
        
        if (moved) {
            const tileX = Math.floor(newX / this.tileSize);
            const tileY = Math.floor(newY / this.tileSize);
            
            if (this.canMoveTo(tileX, tileY)) {
                this.player.x = newX;
                this.player.y = newY;
                this.player.moving = true;
                this.player.stepCount++;
                this.lastMoveTime = now;
                
                // 애니메이션 프레임 업데이트
                this.player.animFrame = (this.player.animFrame + 1) % 4;
            }
        } else {
            this.player.moving = false;
        }
    }
    
    canMoveTo(tileX, tileY) {
        const currentMap = this.maps[this.currentMap];
        if (tileY < 0 || tileY >= currentMap.length || tileX < 0 || tileX >= currentMap[0].length) {
            return false;
        }
        
        const tile = currentMap[tileY][tileX];
        return tile !== 3 && tile !== 4; // 벽이나 건물이 아니면 이동 가능
    }
    
    checkDoors() {
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);
        
        const doors = this.doors[this.currentMap] || [];
        doors.forEach(door => {
            if (playerTileX === door.x && playerTileY === door.y) {
                this.changeMap(door.to, door.playerX * this.tileSize, door.playerY * this.tileSize);
            }
        });
    }
    
    checkNPCs() {
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);
        
        this.npcs.forEach(npc => {
            if (npc.map === this.currentMap && !npc.defeated) {
                if (Math.abs(playerTileX - npc.x) <= 1 && Math.abs(playerTileY - npc.y) <= 1) {
                    if (this.keys[' ']) {
                        this.startNPCBattle(npc);
                    }
                }
            }
        });
    }
    
    checkRandomEncounter() {
        const currentMap = this.maps[this.currentMap];
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);
        
        if (currentMap[playerTileY][playerTileX] === 0 && this.player.moving) { // 풀숲
            if (this.player.stepCount % 10 === 0 && Math.random() < 0.3) {
                this.startRandomBattle();
            }
        }
    }
    
    changeMap(newMap, newX, newY) {
        this.currentMap = newMap;
        this.player.x = newX;
        this.player.y = newY;
        console.log(`맵 변경: ${newMap}, 위치: ${newX}, ${newY}`);
    }
    
    startNPCBattle(npc) {
        if (this.collectedStickers.has(npc.cert)) {
            this.showMessage(`${npc.name}는 이미 도전했습니다!`);
            return;
        }
        
        this.battleMonster = {
            name: npc.name,
            level: this.getQuestionDifficulty(npc.cert),
            color: npc.color,
            isNPC: true,
            npc: npc,
            cert: npc.cert
        };
        
        this.gameState = 'battle';
        this.showMessage(`${npc.name}가 AWS 퀴즈 배틀을 신청했습니다!`);
    }
    
    startRandomBattle() {
        const monster = this.monsters[Math.floor(Math.random() * this.monsters.length)];
        this.battleMonster = {
            name: monster.name,
            level: monster.level,
            color: monster.color,
            isNPC: false,
            questions: monster.questions
        };
        
        this.gameState = 'battle';
        this.showMessage(`야생의 ${monster.name}가 나타났다!`);
    }
    
    getQuestionDifficulty(cert) {
        const difficulties = { cp: 1, saa: 2, dva: 2, soa: 2, sap: 3, dop: 3 };
        return difficulties[cert] || 1;
    }
    
    showMessage(text) {
        this.showingMessage = true;
        this.messageText = text;
        this.messageTimer = 3000; // 3초간 표시
    }
    
    startQuiz() {
        if (!this.battleMonster) return;
        
        let certType;
        if (this.battleMonster.isNPC) {
            certType = this.battleMonster.cert;
        } else {
            const certs = this.battleMonster.questions;
            certType = certs[Math.floor(Math.random() * certs.length)];
        }
        
        const question = getRandomQuiz(certType);
        if (!question) {
            this.showMessage('퀴즈를 불러올 수 없습니다!');
            this.gameState = 'overworld';
            return;
        }
        
        this.currentQuiz = {
            monster: this.battleMonster,
            question: question,
            cert: certType
        };
        
        this.gameState = 'quiz';
        this.showQuizUI();
    }
    
    showQuizUI() {
        const quizDiv = document.getElementById('quiz');
        const questionEl = document.getElementById('quizQuestion');
        const optionsEl = document.getElementById('quizOptions');
        
        questionEl.textContent = `${this.currentQuiz.monster.name}: ${this.currentQuiz.question.question}`;
        
        optionsEl.innerHTML = '';
        this.currentQuiz.question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = `${index + 1}. ${option}`;
            button.style.cssText = 'margin: 5px; padding: 10px; background: #00ffff; color: #1a1a2e; border: none; border-radius: 5px; cursor: pointer; font-family: monospace;';
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
                this.showMessage(`🎉 정답! ${this.currentQuiz.monster.name}를 이겼습니다! 배지 획득! EXP +${expGain}`);
            } else {
                this.showMessage(`🎉 정답! ${this.currentQuiz.monster.name}를 이겼습니다! EXP +${expGain}`);
            }
            
            this.checkLevelUp();
        } else {
            this.lives--;
            this.showMessage(`❌ 틀렸습니다! ${this.currentQuiz.monster.name}의 공격을 받았습니다! 정답: ${this.currentQuiz.question.options[this.currentQuiz.question.correct]}`);
            
            if (this.lives <= 0) {
                this.showMessage('게임 오버! 누들누들 센터에서 치료받으세요.');
                this.resetToCenter();
            }
        }
        
        document.getElementById('quiz').style.display = 'none';
        this.gameState = 'overworld';
        this.currentQuiz = null;
        this.battleMonster = null;
        
        if (this.collectedStickers.size === this.npcs.length) {
            this.showMessage('🏆 축하합니다! 모든 AWS 자격증 마스터를 이겼습니다!');
        }
    }
    
    checkLevelUp() {
        if (this.exp >= this.expToNext) {
            this.level++;
            this.exp -= this.expToNext;
            this.expToNext = this.level * 100;
            this.lives = Math.min(this.lives + 1, 5);
            this.showMessage(`🆙 레벨업! 레벨 ${this.level}이 되었습니다! 체력이 회복되었습니다!`);
        }
    }
    
    resetToCenter() {
        this.currentMap = 'center';
        this.player.x = 7 * this.tileSize;
        this.player.y = 8 * this.tileSize;
        this.lives = 5;
        this.showMessage('누들누들 센터에서 치료받았습니다!');
    }
    
    updateCamera() {
        const mapWidth = this.maps[this.currentMap][0].length * this.tileSize * this.scale;
        const mapHeight = this.maps[this.currentMap].length * this.tileSize * this.scale;
        
        this.camera.x = (this.player.x * this.scale) - (this.canvas.width / 2);
        this.camera.y = (this.player.y * this.scale) - (this.canvas.height / 2);
        
        // 카메라 경계 제한
        this.camera.x = Math.max(0, Math.min(this.camera.x, mapWidth - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, mapHeight - this.canvas.height));
    }
    
    render() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'overworld') {
            this.renderMap();
            this.renderNPCs();
            this.renderPlayer();
        } else if (this.gameState === 'battle') {
            this.renderBattle();
        }
        
        this.renderUI();
        
        if (this.showingMessage) {
            this.renderMessage();
        }
    }
    
    renderMap() {
        const currentMap = this.maps[this.currentMap];
        const startX = Math.floor(this.camera.x / (this.tileSize * this.scale));
        const startY = Math.floor(this.camera.y / (this.tileSize * this.scale));
        const endX = Math.min(startX + Math.ceil(this.canvas.width / (this.tileSize * this.scale)) + 1, currentMap[0].length);
        const endY = Math.min(startY + Math.ceil(this.canvas.height / (this.tileSize * this.scale)) + 1, currentMap.length);
        
        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                const screenX = (x * this.tileSize * this.scale) - this.camera.x;
                const screenY = (y * this.tileSize * this.scale) - this.camera.y;
                this.renderTile(currentMap[y][x], screenX, screenY);
            }
        }
    }
    
    renderTile(tileType, x, y) {
        const size = this.tileSize * this.scale;
        
        switch(tileType) {
            case 0: // 풀숲
                this.ctx.fillStyle = '#2E7D32';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#4CAF50';
                // 간단한 풀 패턴
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if ((i + j) % 2 === 0) {
                            this.ctx.fillRect(x + i * (size/4), y + j * (size/4), size/4, size/4);
                        }
                    }
                }
                break;
                
            case 1: // 도로
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#A1887F';
                this.ctx.fillRect(x + size/8, y + size/8, size - size/4, size - size/4);
                break;
                
            case 2: // 센터 바닥
                this.ctx.fillStyle = '#E3F2FD';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#BBDEFB';
                this.ctx.fillRect(x + size/6, y + size/6, size - size/3, size - size/3);
                break;
                
            case 3: // 벽/나무
                this.ctx.fillStyle = '#2E7D32';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#1B5E20';
                this.ctx.fillRect(x + size/6, y + size/6, size - size/3, size - size/3);
                break;
                
            case 4: // 건물
                this.ctx.fillStyle = '#616161';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#424242';
                this.ctx.fillRect(x + size/8, y + size/8, size - size/4, size - size/4);
                break;
                
            case 5: // 치료대/문
                this.ctx.fillStyle = '#E91E63';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#FFFFFF';
                // 십자 표시
                this.ctx.fillRect(x + size/3, y + size/4, size/3, size/8);
                this.ctx.fillRect(x + size/2.5, y + size/6, size/8, size/2);
                break;
                
            case 7: // 꽃
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#E91E63';
                this.ctx.fillRect(x + size/3, y + size/3, size/3, size/3);
                break;
                
            case 8: // 게이트
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + size/4, y + size/8, size/2, size - size/4);
                break;
                
            case 9: // 출구
                this.ctx.fillStyle = '#FFD54F';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#FFC107';
                this.ctx.fillRect(x + size/6, y + size/6, size - size/3, size - size/3);
                break;
        }
    }
    
    renderPlayer() {
        const screenX = (this.player.x * this.scale) - this.camera.x;
        const screenY = (this.player.y * this.scale) - this.camera.y;
        const size = this.tileSize * this.scale;
        
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillRect(screenX + size/6, screenY + size - size/8, size - size/3, size/8);
        
        // 몸
        this.ctx.fillStyle = '#1976D2';
        this.ctx.fillRect(screenX + size/4, screenY + size/3, size/2, size/2);
        
        // 머리
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(screenX + size/3, screenY + size/6, size/3, size/3);
        
        // 모자
        this.ctx.fillStyle = '#D32F2F';
        this.ctx.fillRect(screenX + size/4, screenY + size/8, size/2, size/6);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        if (this.player.direction === 'down') {
            this.ctx.fillRect(screenX + size/2.5, screenY + size/4, size/12, size/12);
            this.ctx.fillRect(screenX + size/1.8, screenY + size/4, size/12, size/12);
        }
        
        // 팔다리 (애니메이션)
        this.ctx.fillStyle = '#FFDBAC';
        if (this.player.moving && this.player.animFrame % 2 === 0) {
            // 걷는 애니메이션
            this.ctx.fillRect(screenX + size/6, screenY + size/2, size/8, size/3);
            this.ctx.fillRect(screenX + size - size/4, screenY + size/2, size/8, size/3);
        } else {
            this.ctx.fillRect(screenX + size/5, screenY + size/2, size/8, size/3);
            this.ctx.fillRect(screenX + size - size/3, screenY + size/2, size/8, size/3);
        }
    }
    
    renderNPCs() {
        this.npcs.forEach(npc => {
            if (npc.map === this.currentMap && !npc.defeated) {
                const screenX = (npc.x * this.tileSize * this.scale) - this.camera.x;
                const screenY = (npc.y * this.tileSize * this.scale) - this.camera.y;
                const size = this.tileSize * this.scale;
                
                // NPC 렌더링
                this.ctx.fillStyle = npc.color;
                this.ctx.fillRect(screenX + size/4, screenY + size/4, size/2, size/2);
                
                // 왕관
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(screenX + size/3, screenY + size/6, size/3, size/8);
                
                // 이름 표시
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '12px monospace';
                this.ctx.fillText(npc.cert.toUpperCase(), screenX, screenY - 5);
            }
        });
    }
    
    renderUI() {
        // 상단 UI 바
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, 60);
        
        // 맵 이름
        const mapNames = {
            town: '🏘️ 노들섬 마을',
            center: '🏥 누들누들 센터',
            route1: '🌿 1번 도로'
        };
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(mapNames[this.currentMap] || this.currentMap, 10, 25);
        
        // 플레이어 정보
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Lv.${this.level} | HP: ${this.lives}/5 | EXP: ${this.exp}/${this.expToNext}`, 10, 45);
        
        // 조작법
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.font = '10px monospace';
        this.ctx.fillText('화살표: 이동 | 스페이스: 상호작용', this.canvas.width - 200, 15);
        
        // 하단 상태바
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, this.canvas.height - 40, this.canvas.width, 40);
        
        // EXP 바
        const expPercent = this.exp / this.expToNext;
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(10, this.canvas.height - 25, 200, 10);
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(10, this.canvas.height - 25, 200 * expPercent, 10);
        
        // 수집한 배지
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`🏆 배지: ${this.collectedStickers.size}/6`, this.canvas.width - 120, this.canvas.height - 15);
    }
    
    renderBattle() {
        // 배틀 배경
        this.ctx.fillStyle = '#4B0082';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.battleMonster) {
            // 몬스터 렌더링
            const monsterSize = 120;
            const monsterX = this.canvas.width - monsterSize - 50;
            const monsterY = 100;
            
            this.ctx.fillStyle = this.battleMonster.color;
            this.ctx.fillRect(monsterX, monsterY, monsterSize, monsterSize);
            
            // 몬스터 눈
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(monsterX + 20, monsterY + 30, 20, 20);
            this.ctx.fillRect(monsterX + 80, monsterY + 30, 20, 20);
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(monsterX + 25, monsterY + 35, 10, 10);
            this.ctx.fillRect(monsterX + 85, monsterY + 35, 10, 10);
            
            // 몬스터 이름
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '18px monospace';
            this.ctx.fillText(`${this.battleMonster.name} Lv.${this.battleMonster.level}`, monsterX, monsterY - 10);
        }
        
        // 플레이어 (뒷모습)
        const playerSize = 80;
        const playerX = 100;
        const playerY = this.canvas.height - playerSize - 100;
        
        this.ctx.fillStyle = '#1976D2';
        this.ctx.fillRect(playerX, playerY, playerSize, playerSize);
        
        // 모자
        this.ctx.fillStyle = '#D32F2F';
        this.ctx.fillRect(playerX + 10, playerY + 5, playerSize - 20, 15);
        
        // 배틀 UI
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(50, this.canvas.height - 120, this.canvas.width - 100, 100);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(50, this.canvas.height - 120, this.canvas.width - 100, 100);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px monospace';
        this.ctx.fillText('스페이스바 또는 엔터를 눌러 AWS 퀴즈 배틀 시작!', 70, this.canvas.height - 80);
    }
    
    renderMessage() {
        // 메시지 박스
        const boxHeight = 80;
        const boxY = this.canvas.height - boxHeight - 20;
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.9)';
        this.ctx.fillRect(20, boxY, this.canvas.width - 40, boxHeight);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(20, boxY, this.canvas.width - 40, boxHeight);
        
        // 메시지 텍스트
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px monospace';
        
        // 긴 메시지를 여러 줄로 나누기
        const words = this.messageText.split(' ');
        const lines = [];
        let currentLine = '';
        const maxWidth = this.canvas.width - 80;
        
        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = this.ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) lines.push(currentLine);
        
        lines.forEach((line, index) => {
            this.ctx.fillText(line, 40, boxY + 25 + (index * 18));
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 게임 시작
window.addEventListener('load', () => {
    new AWSCertQuest();
});