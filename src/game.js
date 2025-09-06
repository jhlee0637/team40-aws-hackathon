class AWSCertQuest {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.exp = 0;
        this.expToNext = 100;
        this.collectedStickers = new Set();
        
        this.gameState = 'overworld';
        this.battleTransition = 0;
        this.currentMap = 'town';
        
        this.player = {
            x: 200,
            y: 200,
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
            center: this.generateCenterMap(),
            forest: this.generateForestMap(),
            lake: this.generateLakeMap(),
            mountain: this.generateMountainMap(),
            cave: this.generateCaveMap(),
            beach: this.generateBeachMap()
        };
        
        this.buildings = {
            town: [
                { x: 300, y: 200, width: 128, height: 96, type: 'center', name: '누들누들 센터' },
                { x: 150, y: 350, width: 96, height: 80, type: 'house', name: '플레이어 집' },
                { x: 500, y: 320, width: 96, height: 80, type: 'shop', name: 'AWS 상점' }
            ]
        };
        
        this.doors = {
            town: [
                { x: 356, y: 296, width: 32, height: 32, to: 'center', playerX: 300, playerY: 400, type: 'building' },
                { x: 198, y: 430, width: 32, height: 32, to: 'house', playerX: 300, playerY: 200, type: 'building' },
                { x: 736, y: 320, width: 32, height: 32, to: 'route1', playerX: 100, playerY: 300, type: 'gate' }
            ],
            center: [
                { x: 300, y: 400, width: 32, height: 32, to: 'town', playerX: 356, playerY: 260, type: 'exit' }
            ],
            house: [
                { x: 300, y: 200, width: 32, height: 32, to: 'town', playerX: 198, playerY: 400, type: 'exit' }
            ],
            route1: [
                { x: 100, y: 300, width: 32, height: 32, to: 'town', playerX: 700, playerY: 320, type: 'gate' }
            ]
        };
        
        this.maps.house = this.generateHouseMap();
        
        // 문 시스템 업데이트
        this.updateDoorSystem();
        
        this.currentBattle = null;
        this.battleMonster = null;
        
        this.npcs = [
            { x: 200, y: 300, cert: 'cp', name: 'Cloud Practitioner', color: '#ff6b6b', defeated: false, map: 'route1' },
            { x: 400, y: 200, cert: 'saa', name: 'Solutions Architect', color: '#4ecdc4', defeated: false, map: 'forest' },
            { x: 600, y: 400, cert: 'dva', name: 'Developer Associate', color: '#45b7d1', defeated: false, map: 'lake' },
            { x: 300, y: 450, cert: 'soa', name: 'SysOps Admin', color: '#f9ca24', defeated: false, map: 'mountain' },
            { x: 500, y: 150, cert: 'sap', name: 'Solutions Architect Pro', color: '#a55eea', defeated: false, map: 'cave' },
            { x: 400, y: 500, cert: 'dop', name: 'DevOps Engineer Pro', color: '#26de81', defeated: false, map: 'beach' }
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
        for (let y = 0; y < 25; y++) {
            const row = [];
            for (let x = 0; x < 30; x++) {
                if (y >= 0 && y <= 2) {
                    row.push(2); // 한강
                } else if (x === 0 || x === 29 || y === 24) {
                    row.push(3); // 경계
                } else if ((x >= 12 && x <= 17 && y >= 8 && y <= 12) || 
                          (x >= 5 && x <= 9 && y >= 15 && y <= 18) ||
                          (x >= 20 && x <= 24 && y >= 14 && y <= 17)) {
                    row.push(4); // 건물
                } else if (x === 28 && y >= 11 && y <= 13) {
                    row.push(8); // 게이트 (1번 도로로)
                } else if (y >= 20 && y <= 22 && x >= 10 && x <= 19) {
                    row.push(8); // 게이트 (숲으로)
                } else {
                    row.push(1); // 모래/도로
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
                if (y >= 0 && y <= 1) {
                    row.push(2); // 한강
                } else if (x === 0 || x === 24 || y === 19) {
                    row.push(3); // 나무/바위
                } else if (y === 2 || y === 18) {
                    row.push(6); // 모래사장
                } else if (x >= 3 && x <= 21 && y >= 4 && y <= 16) {
                    if (Math.random() < 0.6) {
                        row.push(0); // 풀숲
                    } else if (Math.random() < 0.8) {
                        row.push(7); // 꽃밭
                    } else {
                        row.push(1); // 산책로
                    }
                } else {
                    row.push(1); // 산책로
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
    
    generateHouseMap() {
        const map = [];
        for (let y = 0; y < 15; y++) {
            const row = [];
            for (let x = 0; x < 20; x++) {
                if (x === 0 || x === 19 || y === 0 || y === 14) {
                    row.push(3); // 벽
                } else {
                    row.push(9); // 집 바닥
                }
            }
            map.push(row);
        }
        return map;
    }
    
    generateForestMap() {
        const map = [];
        for (let y = 0; y < 25; y++) {
            const row = [];
            for (let x = 0; x < 30; x++) {
                if (x === 0 || x === 29 || y === 0 || y === 24) {
                    row.push(3); // 나무 경계
                } else {
                    const rand = Math.random();
                    if (rand < 0.7) {
                        row.push(0); // 풀숲
                    } else if (rand < 0.85) {
                        row.push(3); // 나무
                    } else {
                        row.push(7); // 꽃밭
                    }
                }
            }
            map.push(row);
        }
        return map;
    }
    
    generateLakeMap() {
        const map = [];
        for (let y = 0; y < 20; y++) {
            const row = [];
            for (let x = 0; x < 25; x++) {
                if (x === 0 || x === 24 || y === 0 || y === 19) {
                    row.push(3); // 경계
                } else if (x >= 5 && x <= 19 && y >= 5 && y <= 14) {
                    row.push(2); // 호수
                } else {
                    row.push(6); // 모래사장
                }
            }
            map.push(row);
        }
        return map;
    }
    
    generateMountainMap() {
        const map = [];
        for (let y = 0; y < 30; y++) {
            const row = [];
            for (let x = 0; x < 35; x++) {
                if (x === 0 || x === 34 || y === 0 || y === 29) {
                    row.push(3); // 산 경계
                } else {
                    const distanceFromCenter = Math.sqrt(Math.pow(x - 17, 2) + Math.pow(y - 15, 2));
                    const rand = Math.random();
                    
                    if (distanceFromCenter < 5) {
                        row.push(3); // 산정 바위
                    } else if (distanceFromCenter < 10) {
                        if (rand < 0.7) row.push(3); // 바위
                        else if (rand < 0.9) row.push(0); // 풀숲
                        else row.push(1); // 산길
                    } else {
                        if (rand < 0.4) row.push(0); // 풀숲
                        else if (rand < 0.6) row.push(3); // 나무
                        else if (rand < 0.8) row.push(7); // 산꽃
                        else row.push(1); // 산길
                    }
                }
            }
            map.push(row);
        }
        return map;
    }
    
    generateCaveMap() {
        const map = [];
        for (let y = 0; y < 20; y++) {
            const row = [];
            for (let x = 0; x < 25; x++) {
                if (x === 0 || x === 24 || y === 0 || y === 19) {
                    row.push(3); // 동굴 벽
                } else {
                    const rand = Math.random();
                    if (rand < 0.1) {
                        row.push(3); // 동굴 기둥
                    } else if (rand < 0.3) {
                        row.push(4); // 바위 더미
                    } else {
                        row.push(10); // 동굴 바닥 (새로운 타일)
                    }
                }
            }
            map.push(row);
        }
        return map;
    }
    
    generateBeachMap() {
        const map = [];
        for (let y = 0; y < 25; y++) {
            const row = [];
            for (let x = 0; x < 30; x++) {
                if (y >= 0 && y <= 3) {
                    row.push(2); // 바다
                } else if (y >= 4 && y <= 8) {
                    const rand = Math.random();
                    if (rand < 0.3) row.push(2); // 에어진 바다
                    else row.push(6); // 모래사장
                } else if (y >= 9 && y <= 15) {
                    row.push(6); // 모래사장
                } else {
                    const rand = Math.random();
                    if (rand < 0.6) row.push(0); // 해안 풀숲
                    else if (rand < 0.8) row.push(7); // 해안 꽃
                    else row.push(1); // 해안 산책로
                }
                
                // 경계 처리
                if (x === 0 || x === 29 || y === 24) {
                    row[row.length - 1] = 3;
                }
            }
            map.push(row);
        }
        return map;
    }
    
    updateDoorSystem() {
        this.doors = {
            town: [
                // 누들누들 센터 입구 (15*10 타일 위치)
                { x: 15 * 32, y: 10 * 32, width: 32, height: 32, to: 'center', playerX: 300, playerY: 400, type: 'building' },
                // 집 입구 (7*17 타일 위치)
                { x: 7 * 32, y: 17 * 32, width: 32, height: 32, to: 'house', playerX: 300, playerY: 200, type: 'building' },
                // 1번 도로로 가는 게이트 (28*12 타일 위치)
                { x: 28 * 32, y: 12 * 32, width: 32, height: 32, to: 'route1', playerX: 64, playerY: 300, type: 'gate' },
                // 숲으로 가는 게이트 (15*22 타일 위치)
                { x: 15 * 32, y: 22 * 32, width: 64, height: 32, to: 'forest', playerX: 400, playerY: 64, type: 'gate' }
            ],
            center: [
                { x: 300, y: 400, width: 32, height: 32, to: 'town', playerX: 15 * 32, playerY: 9 * 32, type: 'exit' }
            ],
            house: [
                { x: 300, y: 200, width: 32, height: 32, to: 'town', playerX: 7 * 32, playerY: 16 * 32, type: 'exit' }
            ],
            route1: [
                { x: 64, y: 300, width: 32, height: 32, to: 'town', playerX: 27 * 32, playerY: 12 * 32, type: 'gate' },
                { x: 25 * 32, y: 6 * 32, width: 32, height: 32, to: 'forest', playerX: 64, playerY: 500, type: 'gate' },
                { x: 28 * 32, y: 20 * 32, width: 32, height: 32, to: 'mountain', playerX: 64, playerY: 400, type: 'gate' }
            ],
            forest: [
                { x: 400, y: 64, width: 64, height: 32, to: 'town', playerX: 15 * 32, playerY: 21 * 32, type: 'gate' },
                { x: 64, y: 500, width: 32, height: 32, to: 'route1', playerX: 24 * 32, playerY: 6 * 32, type: 'gate' },
                { x: 25 * 32, y: 12 * 32, width: 32, height: 32, to: 'lake', playerX: 64, playerY: 300, type: 'gate' },
                { x: 15 * 32, y: 23 * 32, width: 32, height: 32, to: 'cave', playerX: 400, playerY: 64, type: 'gate' }
            ],
            lake: [
                { x: 64, y: 300, width: 32, height: 32, to: 'forest', playerX: 24 * 32, playerY: 12 * 32, type: 'gate' },
                { x: 18 * 32, y: 64, width: 32, height: 32, to: 'beach', playerX: 400, playerY: 22 * 32, type: 'gate' }
            ],
            mountain: [
                { x: 64, y: 400, width: 32, height: 32, to: 'route1', playerX: 27 * 32, playerY: 20 * 32, type: 'gate' },
                { x: 17 * 32, y: 15 * 32, width: 32, height: 32, to: 'cave', playerX: 200, playerY: 300, type: 'gate' }
            ],
            cave: [
                { x: 400, y: 64, width: 32, height: 32, to: 'forest', playerX: 15 * 32, playerY: 22 * 32, type: 'gate' },
                { x: 200, y: 300, width: 32, height: 32, to: 'mountain', playerX: 16 * 32, playerY: 15 * 32, type: 'gate' }
            ],
            beach: [
                { x: 400, y: 22 * 32, width: 32, height: 32, to: 'lake', playerX: 18 * 32, playerY: 128, type: 'gate' }
            ]
        };
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
        
        // 맵 경계 강제 제한
        const currentMapData = this.maps[this.currentMap];
        const mapWidth = currentMapData[0].length * this.tileSize;
        const mapHeight = currentMapData.length * this.tileSize;
        
        if (this.player.x < 32) this.player.x = 32;
        if (this.player.y < 32) this.player.y = 32;
        if (this.player.x > mapWidth - this.player.width - 32) this.player.x = mapWidth - this.player.width - 32;
        if (this.player.y > mapHeight - this.player.height - 32) this.player.y = mapHeight - this.player.height - 32;
        
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
        
        // 플레이어의 네 모서리 체크
        const corners = [
            { x: this.player.x, y: this.player.y }, // 왼쪽 위
            { x: this.player.x + this.player.width - 1, y: this.player.y }, // 오른쪽 위
            { x: this.player.x, y: this.player.y + this.player.height - 1 }, // 왼쪽 아래
            { x: this.player.x + this.player.width - 1, y: this.player.y + this.player.height - 1 } // 오른쪽 아래
        ];
        
        for (let corner of corners) {
            const tileX = Math.floor(corner.x / this.tileSize);
            const tileY = Math.floor(corner.y / this.tileSize);
            
            if (tileY < 0 || tileY >= currentMapData.length || tileX < 0 || tileX >= currentMapData[0].length) {
                return true;
            }
            
            const tile = currentMapData[tileY][tileX];
            if (tile === 3 || tile === 4) { // 나무나 건물
                return true;
            }
        }
        
        return false;
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
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            
            if (playerCenterX >= door.x && playerCenterX <= door.x + door.width &&
                playerCenterY >= door.y && playerCenterY <= door.y + door.height) {
                
                console.log(`문 발견: ${this.currentMap} -> ${door.to}`);
                
                if (door.type === 'building') {
                    this.playDoorSound();
                    this.showDoorAnimation(() => {
                        this.changeMap(door.to, door.playerX, door.playerY);
                    });
                } else {
                    this.changeMap(door.to, door.playerX, door.playerY);
                }
            }
        });
    }
    
    playDoorSound() {
        this.playSound(440, 0.1);
    }
    
    showDoorAnimation(callback) {
        // 간단한 페이드 애니메이션
        let fadeAlpha = 0;
        const fadeInterval = setInterval(() => {
            fadeAlpha += 0.1;
            this.ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (fadeAlpha >= 1) {
                clearInterval(fadeInterval);
                callback();
                // 페이드 인
                let fadeInAlpha = 1;
                const fadeInInterval = setInterval(() => {
                    fadeInAlpha -= 0.1;
                    if (fadeInAlpha <= 0) {
                        clearInterval(fadeInInterval);
                    }
                }, 50);
            }
        }, 50);
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
        
        // 게이트 표시
        if (this.currentMap === 'town') {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Courier New';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            const gateText = '→ 1번 도로 (풀숲)';
            this.ctx.strokeText(gateText, this.canvas.width - 200, this.canvas.height - 100);
            this.ctx.fillText(gateText, this.canvas.width - 200, this.canvas.height - 100);
        }
    }
    
    renderTile(tileType, x, y) {
        switch(tileType) {
            case 0: // 풀숲
                this.ctx.fillStyle = '#2E7D32';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#4CAF50';
                // 간단한 풀 패턴
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if ((i + j) % 2 === 0) {
                            this.ctx.fillRect(x + i * 8 + 2, y + j * 8 + 2, 4, 4);
                        }
                    }
                }
                break;
                
            case 1: // 도로
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#A1887F';
                this.ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
                break;
                
            case 2: // 물
                this.ctx.fillStyle = '#1976D2';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#2196F3';
                this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
                this.ctx.fillStyle = '#64B5F6';
                this.ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
                break;
                
            case 3: // 나무/바위
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#6D4C41';
                this.ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x + 8, y + 8, this.tileSize - 16, this.tileSize - 16);
                break;
                
            case 4: // 건물
                this.ctx.fillStyle = '#616161';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#757575';
                this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
                this.ctx.fillStyle = '#9E9E9E';
                this.ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
                break;
                
            case 5: // 치료대
                this.ctx.fillStyle = '#E91E63';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#F48FB1';
                this.ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
                // 십자
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(x + 12, y + 8, 8, 4);
                this.ctx.fillRect(x + 14, y + 6, 4, 8);
                break;
                
            case 6: // 모래
                this.ctx.fillStyle = '#FFECB3';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#FFE082';
                this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
                break;
                
            case 7: // 꽃밭
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                // 꽃들
                const flowers = ['#E91E63', '#9C27B0', '#FF9800', '#FFEB3B'];
                for (let i = 0; i < 4; i++) {
                    this.ctx.fillStyle = flowers[i];
                    this.ctx.fillRect(x + (i % 2) * 16 + 8, y + Math.floor(i / 2) * 16 + 8, 4, 4);
                }
                break;
                
            case 8: // 게이트
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + 8, y + 4, 16, 24);
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(x + 12, y + 12, 8, 4);
                this.ctx.fillRect(x + 14, y + 8, 4, 12);
                break;
                
            case 9: // 집 바닥
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#A1887F';
                this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
                break;
                
            case 10: // 동굴 바닥
                this.ctx.fillStyle = '#424242';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#616161';
                this.ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
                break;
        }
    }
    

    
    renderBuilding(building, x, y) {
        if (building.type === 'center') {
            // 누들누들 센터 (한국식 병원)
            this.ctx.fillStyle = '#E8F5E8';
            this.ctx.fillRect(x, y, building.width, building.height);
            this.ctx.fillStyle = '#C8E6C9';
            this.ctx.fillRect(x + 8, y + 8, building.width - 16, building.height - 16);
            
            // 지붕 (한국 전통 기와)
            this.ctx.fillStyle = '#8BC34A';
            this.ctx.fillRect(x - 8, y - 12, building.width + 16, 16);
            this.ctx.fillStyle = '#689F38';
            this.ctx.fillRect(x - 6, y - 10, building.width + 12, 12);
            
            // 십자 마크
            this.ctx.fillStyle = '#E53935';
            this.ctx.fillRect(x + 56, y + 32, 16, 4);
            this.ctx.fillRect(x + 62, y + 26, 4, 16);
            
            // 문
            this.ctx.fillStyle = '#6D4C41';
            this.ctx.fillRect(x + 56, y + 80, 16, 16);
            this.ctx.fillStyle = '#5D4037';
            this.ctx.fillRect(x + 58, y + 82, 12, 12);
            
            // 간판
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '10px Courier New';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeText('누들누들 센터', x + 10, y - 5);
            this.ctx.fillText('누들누들 센터', x + 10, y - 5);
            
        } else if (building.type === 'house') {
            // 한국 전통 가옥
            this.ctx.fillStyle = '#D7CCC8';
            this.ctx.fillRect(x, y, building.width, building.height);
            this.ctx.fillStyle = '#BCAAA4';
            this.ctx.fillRect(x + 4, y + 4, building.width - 8, building.height - 8);
            
            // 지붕 (한국 전통 기와)
            this.ctx.fillStyle = '#8BC34A';
            this.ctx.fillRect(x - 8, y - 16, building.width + 16, 20);
            this.ctx.fillStyle = '#689F38';
            this.ctx.fillRect(x - 6, y - 14, building.width + 12, 16);
            
            // 창문 (한지)
            this.ctx.fillStyle = '#FFF8E1';
            this.ctx.fillRect(x + 12, y + 20, 20, 20);
            this.ctx.fillStyle = '#F57F17';
            // 창문 격자
            this.ctx.fillRect(x + 20, y + 20, 2, 20);
            this.ctx.fillRect(x + 12, y + 28, 20, 2);
            
            // 문
            this.ctx.fillStyle = '#6D4C41';
            this.ctx.fillRect(x + 40, y + 56, 16, 24);
            this.ctx.fillStyle = '#5D4037';
            this.ctx.fillRect(x + 42, y + 58, 12, 20);
            
        } else if (building.type === 'shop') {
            // AWS 상점 (모던 빌딩)
            this.ctx.fillStyle = '#263238';
            this.ctx.fillRect(x, y, building.width, building.height);
            this.ctx.fillStyle = '#37474F';
            this.ctx.fillRect(x + 4, y + 4, building.width - 8, building.height - 8);
            
            // 유리창
            this.ctx.fillStyle = '#B3E5FC';
            this.ctx.fillRect(x + 8, y + 12, building.width - 16, 24);
            this.ctx.fillStyle = '#81D4FA';
            for (let i = 0; i < 3; i++) {
                this.ctx.fillRect(x + 12 + i * 24, y + 12, 2, 24);
            }
            
            // AWS 로고
            this.ctx.fillStyle = '#FF9900';
            this.ctx.fillRect(x + 20, y + 40, 56, 12);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '8px Courier New';
            this.ctx.fillText('AWS', x + 38, y + 48);
            
            // 문
            this.ctx.fillStyle = '#424242';
            this.ctx.fillRect(x + 40, y + 64, 16, 16);
        }
    }
    
    renderPlayer(x, y) {
        const animOffset = this.player.moving ? Math.floor(this.player.animFrame / 15) % 2 : 0;
        
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillRect(x + 2, y + 22, 20, 2);
        
        // 몸 (한복 스타일)
        this.ctx.fillStyle = '#1976D2';
        this.ctx.fillRect(x + 6, y + 10, 12, 12);
        this.ctx.fillStyle = '#2196F3';
        this.ctx.fillRect(x + 7, y + 11, 10, 10);
        
        // 머리 (자연스러운 피부색)
        this.ctx.fillStyle = '#FFCC9A';
        this.ctx.fillRect(x + 7, y + 2, 10, 10);
        this.ctx.fillStyle = '#FFB74D';
        this.ctx.fillRect(x + 8, y + 3, 8, 8);
        
        // 머리카락 (갈색)
        this.ctx.fillStyle = '#5D4037';
        this.ctx.fillRect(x + 6, y, 12, 6);
        this.ctx.fillStyle = '#6D4C41';
        this.ctx.fillRect(x + 7, y + 1, 10, 4);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        if (this.player.direction === 'up') {
            this.ctx.fillRect(x + 9, y + 5, 2, 1);
            this.ctx.fillRect(x + 13, y + 5, 2, 1);
        } else if (this.player.direction === 'down') {
            this.ctx.fillRect(x + 9, y + 7, 2, 2);
            this.ctx.fillRect(x + 13, y + 7, 2, 2);
            // 입
            this.ctx.fillStyle = '#D32F2F';
            this.ctx.fillRect(x + 11, y + 9, 2, 1);
        } else if (this.player.direction === 'left') {
            this.ctx.fillRect(x + 9, y + 6, 2, 2);
            this.ctx.fillRect(x + 11, y + 8, 2, 1);
        } else {
            this.ctx.fillRect(x + 13, y + 6, 2, 2);
            this.ctx.fillRect(x + 11, y + 8, 2, 1);
        }
        
        // 팔
        this.ctx.fillStyle = '#FFCC9A';
        this.ctx.fillRect(x + 4, y + 12, 3, 8);
        this.ctx.fillRect(x + 17, y + 12, 3, 8);
        
        // 다리 (자연스러운 걸음)
        this.ctx.fillStyle = '#424242';
        if (this.player.moving) {
            this.ctx.fillRect(x + 7 + animOffset, y + 20, 3, 4);
            this.ctx.fillRect(x + 14 - animOffset, y + 20, 3, 4);
        } else {
            this.ctx.fillRect(x + 8, y + 20, 3, 4);
            this.ctx.fillRect(x + 13, y + 20, 3, 4);
        }
        
        // 신발
        this.ctx.fillStyle = '#795548';
        if (this.player.moving) {
            this.ctx.fillRect(x + 6 + animOffset, y + 22, 4, 2);
            this.ctx.fillRect(x + 14 - animOffset, y + 22, 4, 2);
        } else {
            this.ctx.fillRect(x + 7, y + 22, 4, 2);
            this.ctx.fillRect(x + 13, y + 22, 4, 2);
        }
    }
    
    renderNPC(npc, x, y) {
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillRect(x + 2, y + 22, 20, 2);
        
        // 로브 (자격증별 색상)
        this.ctx.fillStyle = npc.color;
        this.ctx.fillRect(x + 4, y + 8, 16, 16);
        this.ctx.fillStyle = this.lightenColor(npc.color, 20);
        this.ctx.fillRect(x + 5, y + 9, 14, 14);
        
        // 머리
        this.ctx.fillStyle = '#FFCC9A';
        this.ctx.fillRect(x + 6, y + 2, 12, 10);
        this.ctx.fillStyle = '#FFB74D';
        this.ctx.fillRect(x + 7, y + 3, 10, 8);
        
        // 왕관 (더 세밀하게)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x + 5, y - 2, 14, 4);
        this.ctx.fillStyle = '#FFC107';
        this.ctx.fillRect(x + 6, y - 1, 12, 2);
        // 왕관 장식
        this.ctx.fillStyle = '#FF5722';
        this.ctx.fillRect(x + 8, y - 1, 2, 1);
        this.ctx.fillRect(x + 12, y - 1, 2, 1);
        this.ctx.fillRect(x + 16, y - 1, 2, 1);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 8, y + 5, 2, 2);
        this.ctx.fillRect(x + 14, y + 5, 2, 2);
        
        // 입
        this.ctx.fillStyle = '#D32F2F';
        this.ctx.fillRect(x + 11, y + 8, 2, 1);
        
        // 팔
        this.ctx.fillStyle = '#FFCC9A';
        this.ctx.fillRect(x + 2, y + 10, 3, 8);
        this.ctx.fillRect(x + 19, y + 10, 3, 8);
        
        // 다리
        this.ctx.fillStyle = '#424242';
        this.ctx.fillRect(x + 7, y + 20, 3, 4);
        this.ctx.fillRect(x + 14, y + 20, 3, 4);
        
        // 이름 표시
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '8px Courier New';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(npc.cert.toUpperCase(), x + 2, y - 6);
        this.ctx.fillText(npc.cert.toUpperCase(), x + 2, y - 6);
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    renderUI() {
        // 게임 UI 패널
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, 70);
        this.ctx.fillRect(0, this.canvas.height - 90, this.canvas.width, 90);
        
        // 상단 UI
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Courier New';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        
        let instructions = '화살표: 이동';
        if (this.currentMap === 'center') {
            instructions += ' | 치료대에서 스페이스: 치료';
        } else if (this.isInGrass()) {
            instructions = '⚠️ 풀숲 지역 - 몬스터 조우 가능!';
            this.ctx.fillStyle = '#ffff00';
        }
        
        this.ctx.strokeText(instructions, 10, 25);
        this.ctx.fillText(instructions, 10, 25);
        
        // 맵 이름과 좌표
        const mapNames = { 
            town: '🏠 노들섬 마을', 
            route1: '🌿 1번 도로', 
            center: '🏥 누들누들 센터',
            forest: '🌲 신비한 숲',
            lake: '🏖️ 평화로운 호수',
            house: '🏠 플레이어의 집',
            mountain: '⛰️ 높은 산',
            cave: '🕳️ 어두운 동굴',
            beach: '🏖️ 아름다운 해변'
        };
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '18px Courier New';
        this.ctx.strokeText(mapNames[this.currentMap] || this.currentMap, this.canvas.width - 300, 30);
        this.ctx.fillText(mapNames[this.currentMap] || this.currentMap, this.canvas.width - 300, 30);
        
        // 미니맵
        this.renderMiniMap();
        
        // 하단 상태 바
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Courier New';
        
        // HP 바
        this.ctx.fillText('❤️ HP:', 10, this.canvas.height - 60);
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(70, this.canvas.height - 70, 120, 12);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(70, this.canvas.height - 70, (this.lives / 5) * 120, 12);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Courier New';
        this.ctx.fillText(`${this.lives}/5`, 75, this.canvas.height - 62);
        
        // EXP 바
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Courier New';
        this.ctx.fillText('⭐ EXP:', 210, this.canvas.height - 60);
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(270, this.canvas.height - 70, 150, 12);
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(270, this.canvas.height - 70, (this.exp / this.expToNext) * 150, 12);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Courier New';
        this.ctx.fillText(`${this.exp}/${this.expToNext}`, 275, this.canvas.height - 62);
        
        // 레벨과 점수
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Courier New';
        this.ctx.fillText(`Lv.${this.level}`, 450, this.canvas.height - 60);
        this.ctx.fillText(`점수: ${this.score}`, 520, this.canvas.height - 60);
        
        // 수집한 배지 수
        this.ctx.fillText(`🏆 ${this.collectedStickers.size}/6`, 700, this.canvas.height - 60);
        
        // 게임 팁
        this.ctx.fillStyle = '#cccccc';
        this.ctx.font = '10px Courier New';
        this.ctx.fillText('팁: 풀숲에서 걸으면 몬스터와 만날 수 있어요!', 10, this.canvas.height - 20);
    }
    
    renderMiniMap() {
        const miniMapSize = 120;
        const miniMapX = this.canvas.width - miniMapSize - 20;
        const miniMapY = 80;
        
        // 미니맵 배경
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(miniMapX - 5, miniMapY - 5, miniMapSize + 10, miniMapSize + 10);
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(miniMapX - 5, miniMapY - 5, miniMapSize + 10, miniMapSize + 10);
        
        // 현재 맵 표시
        const currentMapData = this.maps[this.currentMap];
        const tileScale = miniMapSize / Math.max(currentMapData.length, currentMapData[0].length);
        
        for (let y = 0; y < currentMapData.length; y++) {
            for (let x = 0; x < currentMapData[y].length; x++) {
                const tile = currentMapData[y][x];
                let color = '#333333';
                
                switch(tile) {
                    case 0: color = '#228B22'; break; // 풀숲
                    case 1: color = '#D2B48C'; break; // 도로
                    case 2: color = '#4169E1'; break; // 물
                    case 3: color = '#8B4513'; break; // 나무/바위
                    case 4: color = '#696969'; break; // 건물
                    case 6: color = '#F4A460'; break; // 모래
                    case 7: color = '#FF69B4'; break; // 꽃
                    case 8: color = '#FFD700'; break; // 게이트
                    case 9: color = '#DEB887'; break; // 집 바닥
                }
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    miniMapX + x * tileScale, 
                    miniMapY + y * tileScale, 
                    tileScale, 
                    tileScale
                );
            }
        }
        
        // 플레이어 위치
        const playerMiniX = miniMapX + (this.player.x / this.tileSize) * tileScale;
        const playerMiniY = miniMapY + (this.player.y / this.tileSize) * tileScale;
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(playerMiniX - 1, playerMiniY - 1, 3, 3);
        
        // NPC 위치
        this.npcs.forEach(npc => {
            if (npc.defeated || (npc.map && npc.map !== this.currentMap)) return;
            if (!npc.map && this.currentMap !== 'route1') return;
            
            const npcMiniX = miniMapX + (npc.x / this.tileSize) * tileScale;
            const npcMiniY = miniMapY + (npc.y / this.tileSize) * tileScale;
            
            this.ctx.fillStyle = npc.color;
            this.ctx.fillRect(npcMiniX - 1, npcMiniY - 1, 2, 2);
        });
        
        // 미니맵 제목
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Courier New';
        this.ctx.fillText('미니맵', miniMapX, miniMapY - 10);
    }
    
    renderBattle() {
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
            
            // 몬스터 - 16x16 픽셀 아트
            if (this.battleMonster) {
                this.renderBattleMonster(this.battleMonster, this.canvas.width - 200, 100);
                
                // 몬스터 정보
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '16px Courier New';
                this.ctx.fillText(`${this.battleMonster.name} Lv.${this.battleMonster.level}`, this.canvas.width - 250, 50);
            }
            
            // 플레이어 (뒷모습) - 16x16 픽셀 아트
            this.renderBattlePlayer(100, this.canvas.height - 150);
            
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
    
    renderBattleMonster(monster, x, y) {
        const scale = 5; // 16x16을 80x80으로 확대
        
        if (monster.name.includes('Bug Goomba')) {
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(x + 2*scale, y + 2*scale, 12*scale, 8*scale);
            this.ctx.fillStyle = '#A0522D';
            this.ctx.fillRect(x + 4*scale, y + 10*scale, 8*scale, 6*scale);
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(x + 6*scale, y + 4*scale, 2*scale, 2*scale);
            this.ctx.fillRect(x + 10*scale, y + 4*scale, 2*scale, 2*scale);
        } else if (monster.name.includes('Lambda Lizard')) {
            this.ctx.fillStyle = '#FF6347';
            this.ctx.fillRect(x + 4*scale, y, 8*scale, 4*scale);
            this.ctx.fillStyle = '#FF4500';
            this.ctx.fillRect(x + 2*scale, y + 4*scale, 12*scale, 8*scale);
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.fillRect(x + 6*scale, y + 6*scale, 2*scale, 2*scale);
            this.ctx.fillRect(x + 10*scale, y + 6*scale, 2*scale, 2*scale);
        } else {
            // 기본 몬스터
            this.ctx.fillStyle = monster.color;
            this.ctx.fillRect(x, y, 16*scale, 16*scale);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(x + 4*scale, y + 4*scale, 2*scale, 2*scale);
            this.ctx.fillRect(x + 10*scale, y + 4*scale, 2*scale, 2*scale);
        }
    }
    
    renderBattlePlayer(x, y) {
        const scale = 4; // 16x16을 64x64로 확대
        
        // 몸
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(x + 4*scale, y + 8*scale, 8*scale, 8*scale);
        
        // 머리
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 6*scale, y + 2*scale, 6*scale, 6*scale);
        
        // 모자
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x + 4*scale, y, 8*scale, 4*scale);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 6*scale, y + 4*scale, 2*scale, 2*scale);
        this.ctx.fillRect(x + 10*scale, y + 4*scale, 2*scale, 2*scale);
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