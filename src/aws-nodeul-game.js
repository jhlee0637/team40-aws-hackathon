class AWSNodeulQuest {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // Initialize pixel renderer if available
        if (typeof PixelRenderer !== 'undefined') {
            this.pixelRenderer = new PixelRenderer(this.canvas);
            this.animationController = new AnimationController();
            this.particleSystem = new ParticleSystem();
        }
        
        // Enhanced farming mode
        this.enhancedFarmingRPG = null;
        this.enhancedMode = false;
        
        // Commercial RPG mode
        this.commercialRPG = null;
        this.commercialMode = false;
        
        this.player = {
            x: 400, y: 300, width: 32, height: 32, speed: 2,
            direction: 'down', moving: false, animFrame: 0
        };
        
        this.camera = { x: 0, y: 0 };
        this.tileSize = 32;
        this.keys = {};
        this.gameState = 'overworld';
        this.time = 0;
        
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.exp = 0;
        this.expToNext = 100;
        this.collectedCerts = new Set();
        
        // 에디터 모드
        this.editorMode = false;
        this.selectedTile = 1;
        this.editorScale = 1;
        this.currentMap = 0;
        this.maps = [
            { name: '노들섬 마을', data: null },
            { name: 'AWS 숲', data: null },
            { name: '클라우드 산', data: null }
        ];
        
        this.generateMap();
        this.loadMapData();
        this.setupNPCs();
        this.setupMonsters();
        this.setupEvents();
        
        // Initialize professional map editor
        if (typeof EditorIntegration !== 'undefined') {
            this.editorIntegration = new EditorIntegration(this);
        }
        
        // Initialize enhanced farming RPG
        if (typeof EnhancedFarmingRPG !== 'undefined') {
            this.enhancedMode = false;
            this.createEnhancedModeToggle();
        }
        
        // Initialize commercial RPG
        if (typeof CommercialFarmingRPG !== 'undefined') {
            this.commercialMode = false;
            this.createCommercialModeToggle();
        }
        
        this.gameLoop();
    }
    
    generateMap() {
        this.mapWidth = 50;
        this.mapHeight = 40;
        this.generateNodeulMap();
        this.maps[0].data = JSON.parse(JSON.stringify(this.map));
    }
    
    generateNodeulMap() {
        this.map = [];
        for (let y = 0; y < this.mapHeight; y++) {
            const row = [];
            for (let x = 0; x < this.mapWidth; x++) {
                row.push(1); // 기본 잔디
            }
            this.map.push(row);
        }
        
        // 한강 (곡선)
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
        
        // AWS 센터 건물
        for (let y = 32; y < 36; y++) {
            for (let x = 20; x < 26; x++) {
                this.map[y][x] = 8; // AWS 센터
            }
        }
        
        // 클라우드 카페
        for (let y = 15; y < 18; y++) {
            for (let x = 35; x < 39; x++) {
                this.map[y][x] = 9; // 카페
            }
        }
        
        // 데이터 센터
        for (let y = 18; y < 21; y++) {
            for (let x = 10; x < 13; x++) {
                this.map[y][x] = 10; // 데이터센터
            }
        }
        
        // 산책로
        for (let x = 5; x < 45; x++) {
            const pathY = Math.floor(18 + Math.sin(x * 0.2) * 2);
            if (pathY >= 0 && pathY < this.mapHeight) {
                this.map[pathY][x] = 7; // 길
            }
        }
        
        // 세로 길
        for (let y = 15; y < 35; y++) {
            this.map[y][25] = 7;
        }
        
        // 다양한 나무들 (더 많이 배치)
        const treePositions = [
            // 강 위쪽 숲
            {x: 15, y: 2}, {x: 18, y: 3}, {x: 22, y: 2}, {x: 25, y: 4}, {x: 30, y: 3},
            {x: 17, y: 1}, {x: 20, y: 4}, {x: 28, y: 2}, {x: 32, y: 5}, {x: 14, y: 4},
            
            // 강 아래쪽 숲
            {x: 12, y: 35}, {x: 16, y: 36}, {x: 20, y: 37}, {x: 35, y: 35}, {x: 38, y: 36},
            {x: 14, y: 37}, {x: 18, y: 35}, {x: 22, y: 38}, {x: 33, y: 37}, {x: 40, y: 34},
            
            // 중간 지역 나무들
            {x: 5, y: 15}, {x: 8, y: 17}, {x: 45, y: 20}, {x: 47, y: 18}, {x: 3, y: 22}
        ];
        
        treePositions.forEach(tree => {
            if (tree.x >= 0 && tree.x < this.mapWidth && tree.y >= 0 && tree.y < this.mapHeight) {
                this.map[tree.y][tree.x] = 3;
            }
        });
        
        // 서버 농장
        for (let x = 10; x < 40; x++) {
            for (let y = 25; y < 32; y++) {
                if (y % 2 === 0 && x % 4 === 0) {
                    this.map[y][x] = 4; // 서버랙
                } else if (y % 2 === 0 && x % 4 === 2) {
                    this.map[y][x] = 5; // 케이블
                }
            }
        }
        
        // 꽃밭 (AWS 색상)
        const flowers = [
            {x: 5, y: 5}, {x: 45, y: 5}, {x: 5, y: 35}, {x: 45, y: 35}
        ];
        flowers.forEach(flower => {
            this.map[flower.y][flower.x] = 11; // 꽃
        });
    }
    
    setupNPCs() {
        this.npcs = [
            { x: 23, y: 37, cert: 'cp', name: 'AWS 가이드', color: '#FF9900', defeated: false, direction: 'down' },
            { x: 40, y: 16, cert: 'saa', name: '솔루션 아키텍트', color: '#232F3E', defeated: false, direction: 'left' },
            { x: 26, y: 22, cert: 'dva', name: '개발자 전문가', color: '#FF9900', defeated: false, direction: 'right' },
            { x: 8, y: 19, cert: 'soa', name: 'SysOps 관리자', color: '#232F3E', defeated: false, direction: 'up' }
        ];
    }
    
    setupMonsters() {
        this.monsters = [
            { x: 15, y: 33, name: 'Bug Goomba', color: '#8B4513', cert: 'cp', defeated: false, moveTimer: 0 },
            { x: 35, y: 33, name: 'Lambda Lizard', color: '#FF6347', cert: 'saa', defeated: false, moveTimer: 0 },
            { x: 8, y: 33, name: 'S3 Slime', color: '#4169E1', cert: 'dva', defeated: false, moveTimer: 0 },
            { x: 42, y: 33, name: 'EC2 Eagle', color: '#DAA520', cert: 'soa', defeated: false, moveTimer: 0 }
        ];
    }
    
    setupEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            
            if (e.key === 'e' || e.key === 'E') {
                this.editorMode = !this.editorMode;
            }
            
            if (this.editorMode && e.key >= '1' && e.key <= '9') {
                this.selectedTile = parseInt(e.key);
            }
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (this.editorMode) {
                const rect = this.canvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                
                if (clickX < 200) {
                    // 타일 선택
                    const tileIndex = Math.floor((clickY - 50) / 40) + 1;
                    if (tileIndex >= 1 && tileIndex <= 15) {
                        this.selectedTile = tileIndex;
                    }
                    
                    // 맵 선택
                    if (clickY > this.canvas.height - 120) {
                        const mapIndex = Math.floor((clickY - (this.canvas.height - 120)) / 30);
                        if (mapIndex >= 0 && mapIndex < this.maps.length) {
                            this.switchMap(mapIndex);
                        }
                    }
                } else {
                    // 맵 편집
                    const worldX = ((clickX - 200) / this.editorScale) + this.camera.x;
                    const worldY = (clickY / this.editorScale) + this.camera.y;
                    
                    const tileX = Math.floor(worldX / this.tileSize);
                    const tileY = Math.floor(worldY / this.tileSize);
                    
                    if (tileX >= 0 && tileX < this.mapWidth && tileY >= 0 && tileY < this.mapHeight) {
                        this.map[tileY][tileX] = this.selectedTile;
                        this.saveMapData();
                    }
                }
            }
        });
    }
    
    getNeighbors(mapX, mapY, tileType) {
        const neighbors = {
            top: mapY > 0 && this.map[mapY - 1][mapX] === tileType,
            bottom: mapY < this.mapHeight - 1 && this.map[mapY + 1][mapX] === tileType,
            left: mapX > 0 && this.map[mapY][mapX - 1] === tileType,
            right: mapX < this.mapWidth - 1 && this.map[mapY][mapX + 1] === tileType
        };
        neighbors.all = neighbors.top && neighbors.bottom && neighbors.left && neighbors.right;
        return neighbors;
    }
    
    update() {
        this.time += 0.016;
        
        // Update professional editor if active
        if (this.editorIntegration && this.editorIntegration.isEditorActive) {
            this.editorIntegration.update();
            return;
        }
        
        // Update commercial RPG mode if active
        if (this.commercialMode && this.commercialRPG) {
            this.commercialRPG.update();
            return;
        }
        
        // Update enhanced farming mode if active
        if (this.enhancedMode && this.enhancedFarmingRPG) {
            this.enhancedFarmingRPG.update();
            return;
        }
        
        if (this.gameState === 'overworld') {
            if (!this.editorMode) {
                this.updatePlayer();
                this.updateMonsters();
                this.checkInteractions();
                this.checkMonsterCollisions();
            }
        }
        
        this.updateCamera();
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
        
        if (this.checkCollision()) {
            this.player.x = oldX;
            this.player.y = oldY;
            moved = false;
        }
        
        this.player.moving = moved;
        if (moved) {
            this.player.animFrame += 0.2;
        }
        
        if (this.keys[' ']) {
            this.interact();
        }
    }
    
    updateMonsters() {
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            monster.moveTimer += 0.016;
            if (monster.moveTimer > 2) {
                const directions = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
                const dir = directions[Math.floor(Math.random() * 4)];
                
                const newX = monster.x + dir.x;
                const newY = monster.y + dir.y;
                
                if (newX >= 0 && newX < this.mapWidth && newY >= 0 && newY < this.mapHeight) {
                    if (this.map[newY] && this.map[newY][newX] === 1) {
                        monster.x = newX;
                        monster.y = newY;
                    }
                }
                monster.moveTimer = 0;
            }
        });
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
            if (tile === 2 || tile === 3 || tile >= 8) { // 물, 나무, 건물들
                return true;
            }
        }
        
        // NPC 충돌
        for (let npc of this.npcs) {
            if (!npc.defeated && Math.abs(this.player.x - npc.x * this.tileSize) < 24 && Math.abs(this.player.y - npc.y * this.tileSize) < 24) {
                return true;
            }
        }
        
        // 몬스터 충돌
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
        
        this.npcs.forEach(npc => {
            const distance = Math.sqrt(Math.pow(npc.x - tileX, 2) + Math.pow(npc.y - tileY, 2));
            if (distance < 2 && !npc.defeated) {
                this.startQuiz(npc);
            }
        });
        
        if (this.map[tileY] && (this.map[tileY][tileX] === 8 || this.map[tileY][tileX] === 10)) {
            this.lives = 5;
            alert('🌟 AWS 센터에서 에너지를 회복했습니다!');
        }
    }
    
    checkInteractions() {
        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        
        if (this.map[tileY] && this.map[tileY][tileX] === 4 && Math.random() < 0.01) {
            this.startRandomQuiz();
        }
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
    
    startMonsterBattle(monster) {
        const quiz = getRandomQuiz(monster.cert);
        if (!quiz) return;
        
        this.gameState = 'quiz';
        this.currentMonster = monster;
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
            btn.style.cssText = 'margin: 8px; padding: 12px 20px; background: #FF9900; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: monospace;';
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
                alert(`🎉 ${this.currentNPC.name}에게서 ${this.currentNPC.cert.toUpperCase()} 자격증을 획득했습니다!`);
            } else if (this.currentMonster) {
                this.currentMonster.defeated = true;
                alert(`⚔️ ${this.currentMonster.name}을 처치했습니다! EXP +75`);
            } else {
                alert('🖥️ 서버에서 지식을 얻었습니다! EXP +75');
            }
            
            this.checkLevelUp();
        } else {
            this.lives--;
            alert(`💔 틀렸습니다. 정답: ${quiz.options[quiz.correct]}`);
            
            if (this.lives <= 0) {
                alert('😵 기력이 다했습니다. AWS 센터에서 회복하세요!');
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
            alert(`🌟 레벨 ${this.level}로 성장했습니다!`);
        }
    }
    
    updateCamera() {
        if (this.editorMode) {
            const mapAreaWidth = this.canvas.width - 200;
            const mapPixelWidth = this.mapWidth * this.tileSize;
            const mapPixelHeight = this.mapHeight * this.tileSize;
            
            const scaleX = mapAreaWidth / mapPixelWidth;
            const scaleY = this.canvas.height / mapPixelHeight;
            this.editorScale = Math.min(scaleX, scaleY, 0.8);
            
            this.camera.x = (mapPixelWidth - mapAreaWidth / this.editorScale) / 2;
            this.camera.y = (mapPixelHeight - this.canvas.height / this.editorScale) / 2;
        } else {
            this.editorScale = 1;
            this.camera.x = this.player.x - this.canvas.width / 2;
            this.camera.y = this.player.y - this.canvas.height / 2;
            
            this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapWidth * this.tileSize - this.canvas.width));
            this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapHeight * this.tileSize - this.canvas.height));
        }
    }
    
    render() {
        // Check if professional editor is active
        if (this.editorIntegration && this.editorIntegration.isEditorActive) {
            this.editorIntegration.render();
            return;
        }
        
        // Check if commercial RPG mode is active
        if (this.commercialMode && this.commercialRPG) {
            this.commercialRPG.render();
            return;
        }
        
        // Check if enhanced farming mode is active
        if (this.enhancedMode && this.enhancedFarmingRPG) {
            this.enhancedFarmingRPG.render();
            return;
        }
        
        // 배경
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.editorMode) {
            this.renderEditorUI();
            this.ctx.save();
            this.ctx.translate(200, 0);
            this.ctx.scale(this.editorScale, this.editorScale);
        }
        
        this.renderMap();
        this.renderNPCs();
        this.renderMonsters();
        if (!this.editorMode) this.renderPlayer();
        
        if (this.editorMode) {
            this.renderGrid();
            this.ctx.restore();
        }
        
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
            case 1: // 자연스러운 잔디
                this.ctx.fillStyle = '#7CB342';
                this.ctx.fillRect(x, y, size, size);
                
                const grassSeed = (mapX * 7 + mapY * 11) % 100;
                if (grassSeed < 30) {
                    this.ctx.fillStyle = '#8BC34A';
                    const grassX = x + (grassSeed % 5) * 6;
                    const grassY = y + Math.floor(grassSeed / 5) * 6;
                    this.ctx.beginPath();
                    this.ctx.arc(grassX + 3, grassY + 3, 2 + Math.sin(grassSeed) * 1, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                if (grassSeed > 85) {
                    const flowerColors = ['#FF9900', '#232F3E', '#FF6B6B', '#4ECDC4'];
                    this.ctx.fillStyle = flowerColors[grassSeed % flowerColors.length];
                    const flowerX = x + 8 + Math.sin(grassSeed) * 8;
                    const flowerY = y + 8 + Math.cos(grassSeed) * 8;
                    this.ctx.beginPath();
                    this.ctx.arc(flowerX, flowerY, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.fillStyle = '#FFFFFF';
                    for (let i = 0; i < 4; i++) {
                        const angle = (i * Math.PI) / 2;
                        const petalX = flowerX + Math.cos(angle) * 3;
                        const petalY = flowerY + Math.sin(angle) * 3;
                        this.ctx.beginPath();
                        this.ctx.arc(petalX, petalY, 1, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
                break;
                
            case 2: // 한강 물
                const waterDepth = Math.sin(mapX * 0.1) * Math.cos(mapY * 0.1) * 0.3 + 0.7;
                this.ctx.fillStyle = `hsl(210, 70%, ${20 + waterDepth * 15}%)`;
                
                const neighbors = this.getNeighbors(mapX, mapY, 2);
                const radius = 8;
                
                this.ctx.beginPath();
                let path = new Path2D();
                
                if (!neighbors.top && !neighbors.left) {
                    path.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
                } else {
                    path.moveTo(x, y + (neighbors.left ? 0 : radius));
                    path.lineTo(x + (neighbors.top ? 0 : radius), y);
                }
                
                if (!neighbors.top && !neighbors.right) {
                    path.arc(x + size - radius, y + radius, radius, Math.PI * 1.5, 0);
                } else {
                    path.lineTo(x + size - (neighbors.top ? 0 : radius), y);
                    path.lineTo(x + size, y + (neighbors.right ? 0 : radius));
                }
                
                if (!neighbors.bottom && !neighbors.right) {
                    path.arc(x + size - radius, y + size - radius, radius, 0, Math.PI * 0.5);
                } else {
                    path.lineTo(x + size, y + size - (neighbors.right ? 0 : radius));
                    path.lineTo(x + size - (neighbors.bottom ? 0 : radius), y + size);
                }
                
                if (!neighbors.bottom && !neighbors.left) {
                    path.arc(x + radius, y + size - radius, radius, Math.PI * 0.5, Math.PI);
                } else {
                    path.lineTo(x + (neighbors.bottom ? 0 : radius), y + size);
                    path.lineTo(x, y + size - (neighbors.left ? 0 : radius));
                }
                
                path.closePath();
                this.ctx.fill(path);
                
                if (!neighbors.top || !neighbors.bottom || !neighbors.left || !neighbors.right) {
                    this.ctx.fillStyle = '#7CB342';
                    if (!neighbors.top) this.ctx.fillRect(x, y, size, 4);
                    if (!neighbors.bottom) this.ctx.fillRect(x, y + size - 4, size, 4);
                    if (!neighbors.left) this.ctx.fillRect(x, y, 4, size);
                    if (!neighbors.right) this.ctx.fillRect(x + size - 4, y, 4, size);
                }
                
                const wave = Math.sin(this.time * 2 + mapX * 0.2) * 2;
                this.ctx.fillStyle = `hsl(210, 60%, ${35 + waterDepth * 10}%)`;
                this.ctx.fillRect(x + 6, y + 12 + wave, size - 12, 4);
                break;
                
            case 3: // AWS 나무 (오렌지 색상)
                this.ctx.fillStyle = '#7CB342';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x + 14, y + 18, 4, 14);
                
                this.ctx.fillStyle = '#FF9900';
                this.ctx.beginPath();
                this.ctx.arc(x + 16, y + 12, 14, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#232F3E';
                this.ctx.beginPath();
                this.ctx.arc(x + 16, y + 12, 11, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#FF9900';
                this.ctx.beginPath();
                this.ctx.arc(x + 14, y + 10, 8, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 4: // 서버랙
                const serverNeighbors = this.getNeighbors(mapX, mapY, 4);
                this.ctx.fillStyle = '#37474F';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#FF9900';
                if (serverNeighbors.all) {
                    for (let i = 0; i < 6; i++) {
                        const serverX = x + 4 + (i % 3) * 8;
                        const serverY = y + 6 + Math.floor(i / 3) * 10;
                        this.ctx.fillRect(serverX, serverY, 2, 12);
                    }
                } else {
                    for (let i = 0; i < 3; i++) {
                        const serverX = x + 8 + i * 6;
                        const serverY = y + 8;
                        this.ctx.fillRect(serverX, serverY, 2, 16);
                    }
                }
                
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + 10, y + 6, 3, 3);
                break;
                
            case 5: // 케이블
                const cableNeighbors = this.getNeighbors(mapX, mapY, 5);
                this.ctx.fillStyle = '#263238';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#FF9900';
                if (cableNeighbors.left || cableNeighbors.right) {
                    this.ctx.fillRect(x, y + 12, size, 8);
                } else {
                    this.ctx.fillRect(x + 12, y, 8, size);
                }
                
                this.ctx.fillStyle = '#232F3E';
                for (let i = 0; i < 4; i++) {
                    const cableX = x + 4 + (i % 2) * 16;
                    const cableY = y + 4 + Math.floor(i / 2) * 16;
                    this.ctx.fillRect(cableX, cableY, 6, 6);
                }
                break;
                
            case 6: // 일반 건물
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y, size, size);
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
                
            case 9: // 클라우드 카페
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '6px monospace';
                this.ctx.fillText('CAFE', x + 6, y + 18);
                break;
                
            case 10: // 데이터센터
                this.ctx.fillStyle = '#607D8B';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#FF9900';
                for (let i = 0; i < 4; i++) {
                    const ledX = x + 6 + (i % 2) * 12;
                    const ledY = y + 6 + Math.floor(i / 2) * 12;
                    this.ctx.fillRect(ledX, ledY, 8, 8);
                }
                break;
                
            case 11: // AWS 꽃밭
                this.ctx.fillStyle = '#7CB342';
                this.ctx.fillRect(x, y, size, size);
                
                const flowerPattern = (mapX + mapY) % 4;
                const awsColors = ['#FF9900', '#232F3E', '#FF6B6B', '#4ECDC4'];
                
                for (let i = 0; i < 9; i++) {
                    const flowerX = x + 4 + (i % 3) * 8;
                    const flowerY = y + 4 + Math.floor(i / 3) * 8;
                    
                    this.ctx.fillStyle = awsColors[(flowerPattern + i) % awsColors.length];
                    this.ctx.beginPath();
                    this.ctx.arc(flowerX, flowerY, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.beginPath();
                    this.ctx.arc(flowerX, flowerY, 1, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
        }
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
            
            // 얼굴
            this.ctx.fillStyle = '#FFDBAC';
            this.ctx.fillRect(screenX + 10, screenY + 4, 12, 12);
            
            // 모자 (AWS 색상)
            this.ctx.fillStyle = npc.color === '#FF9900' ? '#232F3E' : '#FF9900';
            this.ctx.fillRect(screenX + 8, screenY + 2, 16, 6);
            
            // 눈
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(screenX + 12, screenY + 8, 2, 2);
            this.ctx.fillRect(screenX + 18, screenY + 8, 2, 2);
            
            // 자격증 표시
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '10px monospace';
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
            
            // 몸체
            this.ctx.fillStyle = monster.color;
            this.ctx.fillRect(screenX + 4, screenY + 8, 24, 20);
            
            // AWS 로고 스타일 눈
            this.ctx.fillStyle = '#FF9900';
            this.ctx.fillRect(screenX + 10, screenY + 12, 4, 4);
            this.ctx.fillRect(screenX + 18, screenY + 12, 4, 4);
            
            // 이름
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '8px monospace';
            this.ctx.fillText(monster.name, screenX - 5, screenY - 2);
        });
    }
    
    renderPlayer() {
        const screenX = this.player.x - this.camera.x;
        const screenY = this.player.y - this.camera.y;
        
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillRect(screenX + 6, screenY + 28, 20, 4);
        
        // 몸 (AWS 블루)
        this.ctx.fillStyle = '#232F3E';
        this.ctx.fillRect(screenX + 8, screenY + 16, 16, 12);
        
        // 얼굴
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(screenX + 10, screenY + 6, 12, 12);
        
        // 모자 (AWS 오렌지)
        this.ctx.fillStyle = '#FF9900';
        this.ctx.fillRect(screenX + 8, screenY + 4, 16, 6);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(screenX + 12, screenY + 10, 2, 2);
        this.ctx.fillRect(screenX + 18, screenY + 10, 2, 2);
        
        // 입
        this.ctx.fillRect(screenX + 14, screenY + 14, 4, 1);
    }
    
    renderGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.mapWidth; x++) {
            const screenX = x * this.tileSize - this.camera.x;
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, -this.camera.y);
            this.ctx.lineTo(screenX, this.mapHeight * this.tileSize - this.camera.y);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.mapHeight; y++) {
            const screenY = y * this.tileSize - this.camera.y;
            this.ctx.beginPath();
            this.ctx.moveTo(-this.camera.x, screenY);
            this.ctx.lineTo(this.mapWidth * this.tileSize - this.camera.x, screenY);
            this.ctx.stroke();
        }
    }
    
    renderEditorUI() {
        // 왼쪽 패널 배경
        this.ctx.fillStyle = 'rgba(35, 47, 62, 0.95)';
        this.ctx.fillRect(0, 0, 200, this.canvas.height);
        
        // 제목
        this.ctx.fillStyle = '#FF9900';
        this.ctx.font = 'bold 16px monospace';
        this.ctx.fillText('🛠️ AWS 맵 에디터', 10, 25);
        
        // 타일 선택
        const tileNames = ['', '잔디', '한강', 'AWS나무', '서버랙', '케이블', '건물', '길', 'AWS센터', '카페', '데이터센터', '꽃밭'];
        for (let i = 1; i <= 11; i++) {
            const y = 50 + (i - 1) * 35;
            const selected = this.selectedTile === i;
            
            this.ctx.fillStyle = selected ? 'rgba(255, 153, 0, 0.3)' : 'rgba(100, 100, 100, 0.3)';
            this.ctx.fillRect(10, y - 15, 180, 30);
            
            // 타일 미리보기
            this.renderTile(i, 20, y - 10, 0, 0);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(`${i}. ${tileNames[i]}`, 60, y + 5);
        }
        
        // 맵 레이어
        const mapY = this.canvas.height - 120;
        this.ctx.fillStyle = '#FF9900';
        this.ctx.font = 'bold 14px monospace';
        this.ctx.fillText('맵 레이어', 10, mapY - 10);
        
        for (let i = 0; i < this.maps.length; i++) {
            const y = mapY + i * 30;
            const selected = this.currentMap === i;
            
            this.ctx.fillStyle = selected ? 'rgba(255, 153, 0, 0.3)' : 'rgba(100, 100, 100, 0.3)';
            this.ctx.fillRect(20, y, 160, 25);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(this.maps[i].name, 25, y + 16);
        }
    }
    
    switchMap(mapIndex) {
        this.maps[this.currentMap].data = JSON.parse(JSON.stringify(this.map));
        this.currentMap = mapIndex;
        
        if (this.maps[mapIndex].data) {
            this.map = JSON.parse(JSON.stringify(this.maps[mapIndex].data));
        } else {
            this.generateMapByType(mapIndex);
        }
    }
    
    generateMapByType(type) {
        this.map = [];
        for (let y = 0; y < this.mapHeight; y++) {
            const row = [];
            for (let x = 0; x < this.mapWidth; x++) {
                if (type === 1) {
                    // AWS 숲
                    row.push(Math.random() < 0.7 ? 3 : 1);
                } else if (type === 2) {
                    // 클라우드 산
                    row.push(Math.random() < 0.3 ? 10 : (Math.random() < 0.5 ? 3 : 1));
                } else {
                    row.push(1);
                }
            }
            this.map.push(row);
        }
        this.maps[type].data = JSON.parse(JSON.stringify(this.map));
    }
    
    saveMapData() {
        this.maps[this.currentMap].data = JSON.parse(JSON.stringify(this.map));
        localStorage.setItem('awsNodeulMaps', JSON.stringify(this.maps));
    }
    
    loadMapData() {
        const saved = localStorage.getItem('awsNodeulMaps');
        if (saved) {
            this.maps = JSON.parse(saved);
            if (this.maps[0].data) {
                this.map = JSON.parse(JSON.stringify(this.maps[0].data));
            }
        }
    }
    
    renderUI() {
        if (this.editorMode) return;
        
        // 상단 UI
        this.ctx.fillStyle = 'rgba(35, 47, 62, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, 80);
        
        this.ctx.fillStyle = '#FF9900';
        this.ctx.font = 'bold 20px serif';
        this.ctx.fillText('🏝️ AWS 노들노들 이야기', 20, 30);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`레벨 ${this.level} 개발자`, 20, 55);
        this.ctx.fillText(`❤️ ${this.lives}/5`, 150, 55);
        this.ctx.fillText(`⭐ ${this.exp}/${this.expToNext}`, 220, 55);
        this.ctx.fillText(`🏆 ${this.collectedCerts.size}/4`, 320, 55);
        
        // EXP 바
        this.ctx.fillStyle = '#232F3E';
        this.ctx.fillRect(400, 45, 200, 12);
        this.ctx.fillStyle = '#FF9900';
        this.ctx.fillRect(400, 45, (this.exp / this.expToNext) * 200, 12);
        
        this.ctx.fillStyle = '#E8F5E8';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('화살표: 이동 | 스페이스: 상호작용 | E: 에디터', this.canvas.width - 320, 25);
    }
    
    createEnhancedModeToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '🚀 Enhanced Farming Mode';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 1000;
            padding: 10px 15px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            font-family: monospace;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        `;
        
        toggleBtn.addEventListener('click', () => {
            this.toggleEnhancedMode();
        });
        
        document.body.appendChild(toggleBtn);
        this.enhancedModeToggle = toggleBtn;
    }
    
    createCommercialModeToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '👑 Commercial RPG Mode';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 60px;
            left: 10px;
            z-index: 1000;
            padding: 10px 15px;
            background: #9C27B0;
            color: white;
            border: none;
            border-radius: 5px;
            font-family: monospace;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        `;
        
        toggleBtn.addEventListener('click', () => {
            this.toggleCommercialMode();
        });
        
        document.body.appendChild(toggleBtn);
        this.commercialModeToggle = toggleBtn;
    }
    
    toggleCommercialMode() {
        this.commercialMode = !this.commercialMode;
        
        if (this.commercialMode) {
            if (!this.commercialRPG) {
                this.commercialRPG = new CommercialFarmingRPG(this.canvas);
            }
            this.commercialModeToggle.innerHTML = '🎮 Classic Mode';
            this.commercialModeToggle.style.background = '#FF5722';
        } else {
            this.commercialModeToggle.innerHTML = '👑 Commercial RPG Mode';
            this.commercialModeToggle.style.background = '#9C27B0';
        }
    }
    
    toggleEnhancedMode() {
        this.enhancedMode = !this.enhancedMode;
        
        if (this.enhancedMode) {
            if (!this.enhancedFarmingRPG) {
                this.enhancedFarmingRPG = new EnhancedFarmingRPG(this.canvas);
            }
            this.enhancedModeToggle.innerHTML = '🎮 Classic Mode';
            this.enhancedModeToggle.style.background = '#FF5722';
        } else {
            this.enhancedModeToggle.innerHTML = '🚀 Enhanced Farming Mode';
            this.enhancedModeToggle.style.background = '#4CAF50';
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new AWSNodeulQuest();
});