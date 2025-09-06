class AWSFarmQuest {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        this.player = {
            x: 400,
            y: 300,
            width: 32,
            height: 32,
            speed: 2,
            direction: 'down',
            moving: false,
            animFrame: 0
        };
        
        this.camera = { x: 0, y: 0 };
        this.tileSize = 32;
        this.keys = {};
        this.gameState = 'overworld';
        this.time = 0;
        
        // 게임 상태
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.exp = 0;
        this.expToNext = 100;
        this.collectedCerts = new Set();
        
        // 스타듀밸리 스타일 맵 (더 크고 자연스럽게)
        this.generateMap();
        this.setupNPCs();
        this.setupMonsters();
        this.setupEvents();
        this.gameLoop();
    }
    
    generateMap() {
        this.mapWidth = 50;
        this.mapHeight = 40;
        this.map = [];
        
        // 기본 잔디로 채우기
        for (let y = 0; y < this.mapHeight; y++) {
            const row = [];
            for (let x = 0; x < this.mapWidth; x++) {
                row.push(1); // 잔디
            }
            this.map.push(row);
        }
        
        // 자연스러운 강 추가 (사선형)
        for (let x = 2; x < 48; x++) {
            const riverY = Math.floor(6 + Math.sin(x * 0.3) * 2);
            for (let y = riverY; y < riverY + 3; y++) {
                if (y >= 0 && y < this.mapHeight) {
                    this.map[y][x] = 2; // 물
                }
            }
        }
        
        // 작은 연못 추가
        for (let x = 30; x < 38; x++) {
            for (let y = 25; y < 32; y++) {
                const distance = Math.sqrt(Math.pow(x - 34, 2) + Math.pow(y - 28.5, 2));
                if (distance < 4) {
                    this.map[y][x] = 2; // 물
                }
            }
        }
        
        // 자연스러운 나무 클러스터
        const treeCenters = [
            {x: 35, y: 18, radius: 6},
            {x: 42, y: 25, radius: 4},
            {x: 5, y: 30, radius: 5},
            {x: 15, y: 35, radius: 3}
        ];
        
        treeCenters.forEach(center => {
            for (let x = center.x - center.radius; x <= center.x + center.radius; x++) {
                for (let y = center.y - center.radius; y <= center.y + center.radius; y++) {
                    if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
                        const distance = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
                        const treeChance = Math.max(0, 1 - (distance / center.radius)) * 0.7;
                        
                        if (Math.random() < treeChance && this.map[y][x] === 1) {
                            this.map[y][x] = 3; // 나무
                        }
                    }
                }
            }
        });
        
        // 농장 지역
        for (let x = 8; x < 25; x++) {
            for (let y = 20; y < 35; y++) {
                if (Math.random() < 0.3) {
                    this.map[y][x] = 4; // 농작물
                } else {
                    this.map[y][x] = 5; // 경작지
                }
            }
        }
        
        // 마을 건물들
        this.buildings = [
            { x: 15, y: 5, width: 4, height: 3, type: 'house', name: 'AWS 학습센터' },
            { x: 25, y: 4, width: 3, height: 3, type: 'shop', name: '자격증 상점' },
            { x: 5, y: 15, width: 2, height: 2, type: 'well', name: '지식의 우물' }
        ];
        
        // 건물 위치에 건물 타일 배치
        this.buildings.forEach(building => {
            for (let y = building.y; y < building.y + building.height; y++) {
                for (let x = building.x; x < building.x + building.width; x++) {
                    this.map[y][x] = 6; // 건물
                }
            }
        });
        
        // 길 추가
        for (let x = 0; x < this.mapWidth; x++) {
            this.map[14][x] = 7; // 가로 길
        }
        for (let y = 0; y < this.mapHeight; y++) {
            this.map[y][12] = 7; // 세로 길
        }
    }
    
    setupNPCs() {
        this.npcs = [
            { x: 16, y: 16, cert: 'cp', name: 'AWS 농부 클라우드', color: '#4CAF50', defeated: false, direction: 'down' },
            { x: 28, y: 12, cert: 'saa', name: '건축가 아키텍트', color: '#2196F3', defeated: false, direction: 'left' },
            { x: 25, y: 16, cert: 'dva', name: '개발자 데브', color: '#FF9800', defeated: false, direction: 'right' },
            { x: 12, y: 25, cert: 'soa', name: '운영자 옵스', color: '#9C27B0', defeated: false, direction: 'up' }
        ];
    }
    
    setupMonsters() {
        this.monsters = [
            { x: 20, y: 30, name: 'Bug 슬라임', color: '#8B4513', cert: 'cp', defeated: false, moveTimer: 0 },
            { x: 30, y: 15, name: 'Lambda 리자드', color: '#FF6347', cert: 'saa', defeated: false, moveTimer: 0 },
            { x: 25, y: 25, name: 'S3 스파이더', color: '#4169E1', cert: 'dva', defeated: false, moveTimer: 0 },
            { x: 18, y: 20, name: 'EC2 이글', color: '#DAA520', cert: 'soa', defeated: false, moveTimer: 0 }
        ];
    }
    
    setupEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    update() {
        this.time += 0.016;
        
        if (this.gameState === 'overworld') {
            this.updatePlayer();
            this.updateMonsters();
            this.checkInteractions();
            this.checkMonsterCollisions();
        }
        
        this.updateCamera();
    }
    
    updateMonsters() {
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            monster.moveTimer += 0.016;
            
            // 몬스터 랜덤 이동
            if (monster.moveTimer > 2) { // 2초마다 이동
                const directions = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
                const dir = directions[Math.floor(Math.random() * 4)];
                
                const newX = monster.x + dir.x;
                const newY = monster.y + dir.y;
                
                // 몬스터 이동 (전체 맵)
                if (newX >= 0 && newX < this.mapWidth && newY >= 0 && newY < this.mapHeight) {
                    if (this.map[newY] && this.map[newY][newX] === 1) { // 잔디에만 이동 가능
                        monster.x = newX;
                        monster.y = newY;
                    }
                }
                
                monster.moveTimer = 0;
            }
        });
    }
    
    checkMonsterCollisions() {
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);
        
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            const distance = Math.sqrt(Math.pow(monster.x - playerTileX, 2) + Math.pow(monster.y - playerTileY, 2));
            if (distance < 1.5) {
                this.startMonsterBattle(monster);
            }
        });
    }
    
    startMonsterBattle(monster) {
        const quiz = getRandomQuiz(monster.cert);
        if (!quiz) return;
        
        this.gameState = 'quiz';
        this.currentMonster = monster;
        this.showQuiz(quiz);
    }
    
    updatePlayer() {
        const oldX = this.player.x;
        const oldY = this.player.y;
        let moved = false;
        
        if (this.keys['ArrowUp']) {
            this.player.y -= this.player.speed;
            this.player.direction = 'up';
            moved = true;
        }
        if (this.keys['ArrowDown']) {
            this.player.y += this.player.speed;
            this.player.direction = 'down';
            moved = true;
        }
        if (this.keys['ArrowLeft']) {
            this.player.x -= this.player.speed;
            this.player.direction = 'left';
            moved = true;
        }
        if (this.keys['ArrowRight']) {
            this.player.x += this.player.speed;
            this.player.direction = 'right';
            moved = true;
        }
        
        // 충돌 검사
        if (this.checkCollision()) {
            this.player.x = oldX;
            this.player.y = oldY;
            moved = false;
        }
        
        this.player.moving = moved;
        if (moved) {
            this.player.animFrame += 0.2;
        }
        
        // 상호작용
        if (this.keys[' ']) {
            this.interact();
        }
    }
    
    checkCollision() {
        // 플레이어의 4모서리 체크
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
            if (tile === 2 || tile === 3 || tile === 6) { // 물, 나무, 건물
                return true;
            }
        }
        
        // NPC 충돌 체크
        for (let npc of this.npcs) {
            if (!npc.defeated && Math.abs(this.player.x - npc.x * this.tileSize) < 24 && Math.abs(this.player.y - npc.y * this.tileSize) < 24) {
                return true;
            }
        }
        
        // 몬스터 충돌 체크
        for (let monster of this.monsters) {
            if (!monster.defeated && Math.abs(this.player.x - monster.x * this.tileSize) < 24 && Math.abs(this.player.y - monster.y * this.tileSize) < 24) {
                return true;
            }
        }
        
        return false;
    }
    
    interact() {
        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        
        // NPC 체크
        this.npcs.forEach(npc => {
            const distance = Math.sqrt(Math.pow(npc.x - tileX, 2) + Math.pow(npc.y - tileY, 2));
            if (distance < 2 && !npc.defeated) {
                this.startQuiz(npc);
            }
        });
        
        // 우물에서 회복
        if (this.map[tileY] && this.map[tileY][tileX] === 6) {
            const building = this.buildings.find(b => 
                tileX >= b.x && tileX < b.x + b.width && 
                tileY >= b.y && tileY < b.y + b.height && 
                b.type === 'well'
            );
            if (building) {
                this.lives = 5;
                this.showMessage('🌟 지식의 우물에서 에너지를 회복했습니다!');
            }
        }
    }
    
    checkInteractions() {
        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        
        // 농작물에서 랜덤 퀴즈
        if (this.map[tileY] && this.map[tileY][tileX] === 4 && Math.random() < 0.01) {
            this.startRandomQuiz();
        }
    }
    
    startQuiz(npc) {
        const quiz = getRandomQuiz(npc.cert);
        if (!quiz) return;
        
        this.gameState = 'quiz';
        this.currentNPC = npc;
        this.showQuiz(quiz);
    }
    
    startRandomQuiz() {
        const certs = ['cp', 'saa'];
        const cert = certs[Math.floor(Math.random() * certs.length)];
        const quiz = getRandomQuiz(cert);
        if (!quiz) return;
        
        this.gameState = 'quiz';
        this.currentNPC = null;
        this.showQuiz(quiz);
    }
    
    showQuiz(quiz) {
        const quizDiv = document.getElementById('quiz');
        const questionEl = document.getElementById('quizQuestion');
        const optionsEl = document.getElementById('quizOptions');
        
        questionEl.textContent = quiz.question;
        optionsEl.innerHTML = '';
        
        quiz.options.forEach((option, i) => {
            const btn = document.createElement('button');
            btn.textContent = `${i+1}. ${option}`;
            btn.style.cssText = 'margin: 8px; padding: 12px 20px; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; border-radius: 8px; cursor: pointer; font-family: monospace; font-size: 14px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);';
            btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
            btn.onmouseout = () => btn.style.transform = 'translateY(0)';
            btn.onclick = () => this.answerQuiz(i, quiz);
            optionsEl.appendChild(btn);
        });
        
        quizDiv.style.display = 'block';
    }
    
    answerQuiz(answer, quiz) {
        const correct = answer === quiz.correct;
        
        if (correct) {
            this.exp += 75;
            this.score += 150;
            
            if (this.currentNPC) {
                this.currentNPC.defeated = true;
                this.collectedCerts.add(this.currentNPC.cert);
                document.getElementById(this.currentNPC.cert).classList.add('collected');
                this.showMessage(`🎉 ${this.currentNPC.name}에게서 ${this.currentNPC.cert.toUpperCase()} 자격증을 획득했습니다!`);
            } else if (this.currentMonster) {
                this.currentMonster.defeated = true;
                this.showMessage(`⚔️ ${this.currentMonster.name}을 처치했습니다! EXP +75`);
            } else {
                this.showMessage('🌱 농작물에서 지식을 얻었습니다! EXP +75');
            }
            
            this.checkLevelUp();
        } else {
            this.lives--;
            this.showMessage(`💔 틀렸습니다. 정답: ${quiz.options[quiz.correct]}`);
            
            if (this.lives <= 0) {
                this.showMessage('😵 기력이 다했습니다. 지식의 우물에서 회복하세요!');
                this.lives = 1;
            }
        }
        
        document.getElementById('quiz').style.display = 'none';
        this.gameState = 'overworld';
        this.currentNPC = null;
        this.currentMonster = null;
    }
    
    checkLevelUp() {
        if (this.exp >= this.expToNext) {
            this.level++;
            this.exp -= this.expToNext;
            this.expToNext += 100;
            this.lives = Math.min(this.lives + 1, 5);
            this.showMessage(`🌟 레벨 ${this.level}로 성장했습니다! 최대 에너지 증가!`);
        }
    }
    
    showMessage(text) {
        // 간단한 알림 (나중에 스타듀밸리 스타일 메시지박스로 개선 가능)
        setTimeout(() => alert(text), 100);
    }
    
    updateCamera() {
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;
        
        // 카메라 경계 제한
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapWidth * this.tileSize - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapHeight * this.tileSize - this.canvas.height));
    }
    
    render() {
        // 하늘 배경
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderMap();
        this.renderBuildings();
        this.renderNPCs();
        this.renderMonsters();
        this.renderPlayer();
        this.renderUI();
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
            case 1: // 부드러운 스타듀밸리 잔디
                // 부드러운 색상 변화
                const smoothNoise = (Math.sin(mapX * 0.05) + Math.cos(mapY * 0.05)) * 0.1 + 0.9;
                const grassHue = 85; // 고정된 녹색
                const grassSat = 45 + smoothNoise * 10; // 45-55 사이
                const grassLight = 40 + smoothNoise * 8; // 40-48 사이
                
                this.ctx.fillStyle = `hsl(${grassHue}, ${grassSat}%, ${grassLight}%)`;
                this.ctx.fillRect(x, y, size, size);
                
                // 미묘한 음영
                this.ctx.fillStyle = `hsl(${grassHue}, ${grassSat + 5}%, ${grassLight - 5}%)`;
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
                this.ctx.globalAlpha = 1;
                
                // 적은 양의 풀잎
                const grassChance = (mapX + mapY * 3) % 7;
                if (grassChance === 0) {
                    this.ctx.fillStyle = `hsl(${grassHue + 5}, ${grassSat + 10}%, ${grassLight + 8}%)`;
                    this.ctx.fillRect(x + 8, y + 12, 2, 6);
                    this.ctx.fillRect(x + 20, y + 8, 2, 8);
                }
                
                // 드문 꽃
                if ((mapX * 7 + mapY * 11) % 23 === 0) {
                    this.ctx.fillStyle = '#FFEB3B';
                    this.ctx.fillRect(x + 12, y + 16, 2, 2);
                }
                break;
                
            case 2: // 자연스러운 물
                // 깊이에 따른 물 색상
                const waterDepth = Math.sin(mapX * 0.2) * Math.cos(mapY * 0.2) * 0.3 + 0.7;
                const waterHue = 200 + Math.sin(this.time * 0.5 + mapX * 0.1) * 10;
                const waterSat = 60 + waterDepth * 20;
                const waterLight = 25 + waterDepth * 15;
                
                this.ctx.fillStyle = `hsl(${waterHue}, ${waterSat}%, ${waterLight}%)`;
                this.ctx.fillRect(x, y, size, size);
                
                // 물결 효과
                const wave1 = Math.sin(this.time * 2 + mapX * 0.3 + mapY * 0.2) * 3;
                const wave2 = Math.cos(this.time * 1.5 + mapX * 0.4) * 2;
                
                this.ctx.fillStyle = `hsl(${waterHue + 20}, ${waterSat}%, ${waterLight + 15}%)`;
                this.ctx.globalAlpha = 0.6;
                this.ctx.fillRect(x, y + 8 + wave1, size, 4);
                this.ctx.fillRect(x, y + 16 + wave2, size, 2);
                
                // 반짝임
                if (Math.sin(this.time * 3 + mapX + mapY) > 0.7) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    this.ctx.fillRect(x + 8 + wave1, y + 6 + wave2, 4, 2);
                }
                
                this.ctx.globalAlpha = 1;
                break;
                
            case 3: // 자연스러운 나무
                // 바닥 잔디 먼저 그리기
                const grassHue = 85;
                const grassSat = 50;
                const grassLight = 42;
                this.ctx.fillStyle = `hsl(${grassHue}, ${grassSat}%, ${grassLight}%)`;
                this.ctx.fillRect(x, y, size, size);
                
                // 나무 줄기
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x + 14, y + 20, 4, 12);
                this.ctx.fillStyle = '#6D4C41';
                this.ctx.fillRect(x + 15, y + 21, 2, 10);
                
                // 나무 잠자리
                const leafSize = 12;
                
                // 외곽 잠자리
                this.ctx.fillStyle = '#2E7D32';
                this.ctx.beginPath();
                this.ctx.arc(x + 16, y + 14, leafSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 내부 잠자리
                this.ctx.fillStyle = '#388E3C';
                this.ctx.beginPath();
                this.ctx.arc(x + 16, y + 14, leafSize - 2, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 4: // 농작물
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + 8, y + 16, 6, 12);
                this.ctx.fillRect(x + 18, y + 12, 4, 16);
                
                // 작물 열매
                this.ctx.fillStyle = '#FF5722';
                this.ctx.fillRect(x + 9, y + 14, 4, 4);
                break;
                
            case 5: // 경작지
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#6D4C41';
                for (let i = 0; i < 4; i++) {
                    this.ctx.fillRect(x + i * 8, y + 8, 6, 2);
                    this.ctx.fillRect(x + i * 8, y + 20, 6, 2);
                }
                break;
                
            case 6: // 건물
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#A1887F';
                this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                break;
                
            case 7: // 길
                this.ctx.fillStyle = '#D7CCC8';
                this.ctx.fillRect(x, y, size, size);
                this.ctx.fillStyle = '#BCAAA4';
                this.ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
                break;
        }
    }
    
    renderBuildings() {
        this.buildings.forEach(building => {
            const screenX = building.x * this.tileSize - this.camera.x;
            const screenY = building.y * this.tileSize - this.camera.y;
            const width = building.width * this.tileSize;
            const height = building.height * this.tileSize;
            
            if (building.type === 'house') {
                // 지붕
                this.ctx.fillStyle = '#D32F2F';
                this.ctx.fillRect(screenX - 8, screenY - 16, width + 16, 20);
                
                // 벽
                this.ctx.fillStyle = '#FFF3E0';
                this.ctx.fillRect(screenX, screenY, width, height);
                
                // 문
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(screenX + width/2 - 8, screenY + height - 16, 16, 16);
                
            } else if (building.type === 'shop') {
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(screenX, screenY, width, height);
                
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '12px monospace';
                this.ctx.fillText('SHOP', screenX + 8, screenY + 20);
                
            } else if (building.type === 'well') {
                this.ctx.fillStyle = '#616161';
                this.ctx.fillRect(screenX, screenY, width, height);
                
                this.ctx.fillStyle = '#2196F3';
                this.ctx.fillRect(screenX + 8, screenY + 8, width - 16, height - 16);
            }
        });
    }
    
    renderNPCs() {
        this.npcs.forEach(npc => {
            if (npc.defeated) return;
            
            const screenX = npc.x * this.tileSize - this.camera.x;
            const screenY = npc.y * this.tileSize - this.camera.y;
            
            // 그림자
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.fillRect(screenX + 4, screenY + 28, 24, 4);
            
            // 몸
            this.ctx.fillStyle = npc.color;
            this.ctx.fillRect(screenX + 8, screenY + 12, 16, 16);
            
            // 머리
            this.ctx.fillStyle = '#FFDBAC';
            this.ctx.fillRect(screenX + 10, screenY + 4, 12, 12);
            
            // 모자 (농부 스타일)
            this.ctx.fillStyle = '#8D6E63';
            this.ctx.fillRect(screenX + 8, screenY + 2, 16, 6);
            
            // 방향별 눈과 입
            this.ctx.fillStyle = '#000000';
            if (npc.direction === 'down') {
                this.ctx.fillRect(screenX + 12, screenY + 10, 2, 2);
                this.ctx.fillRect(screenX + 18, screenY + 10, 2, 2);
                this.ctx.fillStyle = '#D32F2F';
                this.ctx.fillRect(screenX + 14, screenY + 14, 4, 1);
            } else if (npc.direction === 'up') {
                this.ctx.fillRect(screenX + 12, screenY + 8, 2, 2);
                this.ctx.fillRect(screenX + 18, screenY + 8, 2, 2);
            } else if (npc.direction === 'left') {
                this.ctx.fillRect(screenX + 11, screenY + 10, 2, 2);
                this.ctx.fillStyle = '#D32F2F';
                this.ctx.fillRect(screenX + 12, screenY + 14, 2, 1);
            } else if (npc.direction === 'right') {
                this.ctx.fillRect(screenX + 19, screenY + 10, 2, 2);
                this.ctx.fillStyle = '#D32F2F';
                this.ctx.fillRect(screenX + 18, screenY + 14, 2, 1);
            }
            
            // 이름
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.font = '10px monospace';
            this.ctx.strokeText(npc.cert.toUpperCase(), screenX + 6, screenY - 2);
            this.ctx.fillText(npc.cert.toUpperCase(), screenX + 6, screenY - 2);
        });
    }
    
    renderMonsters() {
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            const screenX = monster.x * this.tileSize - this.camera.x;
            const screenY = monster.y * this.tileSize - this.camera.y;
            
            // 그림자
            this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
            this.ctx.fillRect(screenX + 6, screenY + 26, 20, 6);
            
            // 몬스터 몸체 (스타듀밸리 스타일)
            this.ctx.fillStyle = monster.color;
            this.ctx.fillRect(screenX + 4, screenY + 8, 24, 20);
            
            // 몬스터 눈
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(screenX + 10, screenY + 12, 4, 4);
            this.ctx.fillRect(screenX + 18, screenY + 12, 4, 4);
            
            // 몬스터 입
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(screenX + 12, screenY + 20, 8, 2);
            
            // 이름 표시
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.font = '8px monospace';
            this.ctx.strokeText(monster.name, screenX - 5, screenY - 2);
            this.ctx.fillText(monster.name, screenX - 5, screenY - 2);
            
            // 위협적인 오라 효과
            const pulseSize = Math.sin(this.time * 4) * 2;
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            this.ctx.fillRect(screenX + 2 - pulseSize, screenY + 6 - pulseSize, 28 + pulseSize * 2, 24 + pulseSize * 2);
        });
    }
    
    renderPlayer() {
        const screenX = this.player.x - this.camera.x;
        const screenY = this.player.y - this.camera.y;
        
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillRect(screenX + 6, screenY + 28, 20, 4);
        
        // 몸
        this.ctx.fillStyle = '#1976D2';
        this.ctx.fillRect(screenX + 8, screenY + 16, 16, 12);
        
        // 머리
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(screenX + 10, screenY + 6, 12, 12);
        
        // 모자
        this.ctx.fillStyle = '#D32F2F';
        this.ctx.fillRect(screenX + 8, screenY + 4, 16, 6);
        
        // 방향별 눈과 입
        this.ctx.fillStyle = '#000000';
        if (this.player.direction === 'down') {
            this.ctx.fillRect(screenX + 12, screenY + 10, 2, 2);
            this.ctx.fillRect(screenX + 18, screenY + 10, 2, 2);
            this.ctx.fillRect(screenX + 14, screenY + 14, 4, 1);
        } else if (this.player.direction === 'up') {
            this.ctx.fillRect(screenX + 12, screenY + 8, 2, 2);
            this.ctx.fillRect(screenX + 18, screenY + 8, 2, 2);
        } else if (this.player.direction === 'left') {
            this.ctx.fillRect(screenX + 11, screenY + 10, 2, 2);
            this.ctx.fillRect(screenX + 12, screenY + 14, 2, 1);
        } else if (this.player.direction === 'right') {
            this.ctx.fillRect(screenX + 19, screenY + 10, 2, 2);
            this.ctx.fillRect(screenX + 18, screenY + 14, 2, 1);
        }
        
        // 팔 (애니메이션)
        this.ctx.fillStyle = '#FFDBAC';
        const armOffset = this.player.moving ? Math.sin(this.player.animFrame) * 1 : 0;
        this.ctx.fillRect(screenX + 4, screenY + 18 + armOffset, 6, 8);
        this.ctx.fillRect(screenX + 22, screenY + 18 - armOffset, 6, 8);
        
        // 다리 (애니메이션)
        this.ctx.fillStyle = '#1565C0';
        const legOffset = this.player.moving ? Math.sin(this.player.animFrame + Math.PI) * 1 : 0;
        this.ctx.fillRect(screenX + 10, screenY + 26 + legOffset, 5, 6);
        this.ctx.fillRect(screenX + 17, screenY + 26 - legOffset, 5, 6);
    }
    
    renderUI() {
        // 상단 UI (스타듀밸리 스타일)
        this.ctx.fillStyle = 'rgba(139, 69, 19, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, 80);
        
        // 테두리
        this.ctx.strokeStyle = '#8D6E63';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this.canvas.width, 80);
        
        // 제목
        this.ctx.fillStyle = '#FFEB3B';
        this.ctx.font = 'bold 20px serif';
        this.ctx.fillText('🌾 AWS 농장 퀘스트', 20, 30);
        
        // 상태 정보
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`레벨 ${this.level} 농부`, 20, 55);
        this.ctx.fillText(`❤️ ${this.lives}/5`, 150, 55);
        this.ctx.fillText(`⭐ ${this.exp}/${this.expToNext}`, 220, 55);
        this.ctx.fillText(`🏆 ${this.collectedCerts.size}/4`, 320, 55);
        
        // EXP 바
        this.ctx.fillStyle = '#4E342E';
        this.ctx.fillRect(400, 45, 200, 12);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(400, 45, (this.exp / this.expToNext) * 200, 12);
        
        // 조작법
        this.ctx.fillStyle = '#E8F5E8';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('화살표: 이동 | 스페이스: 상호작용', this.canvas.width - 280, 25);
        this.ctx.fillText('농작물 근처에서 랜덤 퀴즈 발생!', this.canvas.width - 280, 45);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new AWSFarmQuest();
});