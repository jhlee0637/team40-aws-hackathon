import { Player } from './Player.js';
import { BattleSystem } from './BattleSystem.js';
import { MapRenderer } from './MapRenderer.js';
import { EntityManager } from './EntityManager.js';
import { InputManager } from './InputManager.js';
import { DataLoader } from '../utils/DataLoader.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        this.gameState = 'loading';
        this.time = 0;
        this.deltaTime = 0;
        this.lastTime = performance.now();
        
        this.sprites = {};
        this.spritesLoaded = false;
        
        this.camera = { x: 0, y: 0, targetX: 0, targetY: 0, smoothing: 0.08 };
        
        this.tileSize = 16;
        this.mapWidth = 80;
        this.mapHeight = 60;
        this.map = [];
        this.collisionMap = [];
        
        this.gameData = null;
        this.loadingProgress = 0;
        this.loadingMessage = '';
        
        this.init();
    }
    
    async init() {
        console.log('🎮 AWS 노들섬 퀴즈 RPG 초기화 시작...');
        
        try {
            this.updateLoadingProgress(10, '데이터 로딩 중...');
            await this.delay(100);
            
            this.updateLoadingProgress(30, '게임 데이터 로딩...');
            this.gameData = await DataLoader.loadGameData();
            console.log('✅ 게임 데이터 로딩 완료');
            await this.delay(200);
            
            this.updateLoadingProgress(50, '게임 시스템 초기화...');
            this.initializeGameSystems();
            await this.delay(200);
            
            this.updateLoadingProgress(70, '맵 생성 중...');
            this.generateEnhancedMap();
            await this.delay(200);
            
            this.updateLoadingProgress(90, '엔티티 초기화...');
            this.entityManager.init(this.gameData);
            await this.delay(200);
            
            this.updateLoadingProgress(100, '게임 시작!');
            await this.delay(500);
            
            this.gameState = 'overworld';
            console.log('🎉 게임 초기화 완료!');
            this.gameLoop();
            
        } catch (error) {
            console.error('❌ 게임 초기화 실패:', error);
            this.gameState = 'error';
            this.gameLoop();
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    updateLoadingProgress(progress, message) {
        this.loadingProgress = progress;
        this.loadingMessage = message;
    }
    

    
    initializeGameSystems() {
        const playerConfig = this.gameData?.config?.game?.player || {
            startX: 400,
            startY: 300,
            speed: 2
        };
        
        this.player = new Player(playerConfig.startX, playerConfig.startY);
        this.battleSystem = new BattleSystem(this);
        this.mapRenderer = new MapRenderer(this, this.gameData);
        this.entityManager = new EntityManager(this);
        this.inputManager = new InputManager(this);
        
        console.log('✅ 게임 시스템 초기화 완료');
    }
    
    generateEnhancedMap() {
        console.log('🗺️ 노들섬 맵 생성 중...');
        
        // 맵 데이터 로딩
        const mapData = this.gameData.maps['nodeul-island'];
        
        if (mapData && mapData.layout) {
            // JSON에서 로딩된 맵 사용
            this.map = mapData.layout;
            this.collisionMap = mapData.collision || [];
            this.mapWidth = mapData.width;
            this.mapHeight = mapData.height;
            console.log('✅ JSON 맵 데이터 로딩 완료');
        } else {
            // 프로시저럴 맵 생성 (폴백)
            this.generateProceduralMap();
        }
        
        // 특별한 지역 표시
        this.addSpecialZones();
    }
    
    generateProceduralMap() {
        this.collisionMap = [];
        this.map = [];
        
        // 기본 지형 생성
        for (let y = 0; y < this.mapHeight; y++) {
            const mapRow = [];
            const collisionRow = [];
            
            for (let x = 0; x < this.mapWidth; x++) {
                // 지역별 타일 설정
                if (x < 25) {
                    mapRow.push(1); // 초보자 구역 (풀)
                } else if (x < 50) {
                    mapRow.push(15); // 중급자 구역 (어두운 풀)
                } else {
                    mapRow.push(16); // 고급자 구역 (산)
                }
                collisionRow.push(0);
            }
            
            this.map.push(mapRow);
            this.collisionMap.push(collisionRow);
        }
        
        // 노들섬의 특징적인 지형 추가
        this.addNodeulIslandFeatures();
        
        // 테스트용 몬스터 추가
        this.addTestMonster();
    }
    
    addTestMonster() {
        // 간단한 테스트 몬스터
        this.testMonster = {
            x: 15 * this.tileSize,
            y: 25 * this.tileSize,
            name: "AWS 테스트 몬스터",
            cert: "cp",
            hp: 50,
            maxHp: 50,
            level: 1
        };
    }
    
    addNodeulIslandFeatures() {
        // 한강 (상단, 자연스러운 곡선)
        for (let x = 0; x < this.mapWidth; x++) {
            const progress = x / this.mapWidth;
            const riverTop = 8 + Math.sin(progress * Math.PI * 1.5) * 3;
            
            for (let offset = -2; offset <= 2; offset++) {
                const riverY = Math.floor(riverTop + offset);
                if (riverY >= 0 && riverY < this.mapHeight) {
                    this.map[riverY][x] = 2; // 물 타일
                    this.collisionMap[riverY][x] = 1; // 충돌
                }
            }
        }
        
        // 노들섬 특별 건물들
        this.addBuildings();
        
        // 자연스러운 나무 배치
        this.addNaturalTrees();
        
        // 산책로 네트워크
        this.addWalkingPaths();
    }
    
    addBuildings() {
        // 노들라이브하우스 (중앙 상단)
        const buildings = [
            {x: 35, y: 15, w: 8, h: 6, type: 20, name: '노들라이브하우스'},
            {x: 20, y: 25, w: 6, h: 6, type: 21, name: 'AWS 센터'},
            {x: 50, y: 30, w: 4, h: 4, type: 22, name: '카페'},
            {x: 10, y: 35, w: 5, h: 4, type: 23, name: '상점'}
        ];
        
        buildings.forEach(building => {
            for (let y = building.y; y < building.y + building.h; y++) {
                for (let x = building.x; x < building.x + building.w; x++) {
                    if (x < this.mapWidth && y < this.mapHeight) {
                        this.map[y][x] = building.type;
                        this.collisionMap[y][x] = 1;
                    }
                }
            }
        });
    }
    
    addNaturalTrees() {
        // 클러스터 형태의 자연스러운 나무 배치
        const forestClusters = [
            {centerX: 15, centerY: 20, radius: 6, density: 0.3},
            {centerX: 40, centerY: 35, radius: 8, density: 0.25},
            {centerX: 60, centerY: 18, radius: 5, density: 0.4},
            {centerX: 8, centerY: 45, radius: 4, density: 0.35}
        ];
        
        forestClusters.forEach(cluster => {
            for (let dy = -cluster.radius; dy <= cluster.radius; dy++) {
                for (let dx = -cluster.radius; dx <= cluster.radius; dx++) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= cluster.radius) {
                        const x = cluster.centerX + dx;
                        const y = cluster.centerY + dy;
                        
                        if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
                            const probability = cluster.density * (1 - distance / cluster.radius);
                            if (Math.random() < probability && this.map[y][x] !== 2) {
                                this.map[y][x] = 3; // 나무 타일
                                this.collisionMap[y][x] = 1;
                            }
                        }
                    }
                }
            }
        });
    }
    
    addWalkingPaths() {
        // 메인 가로 산책로
        for (let x = 5; x < 75; x++) {
            const y = 30;
            if (this.map[y][x] !== 2 && this.map[y][x] < 20) {
                this.map[y][x] = 4; // 산책로 타일
                this.collisionMap[y][x] = 0;
            }
        }
        
        // 세로 연결로들
        const verticalPaths = [
            {x: 20, startY: 15, endY: 45},
            {x: 40, startY: 20, endY: 40},
            {x: 60, startY: 15, endY: 35}
        ];
        
        verticalPaths.forEach(path => {
            for (let y = path.startY; y <= path.endY; y++) {
                if (this.map[y] && this.map[y][path.x] !== 2 && this.map[y][path.x] < 20) {
                    this.map[y][path.x] = 4;
                    this.collisionMap[y][path.x] = 0;
                }
            }
        });
    }
    
    addSpecialZones() {
        // AWS 자격증별 특별 구역 표시
        this.specialZones = [
            {
                name: 'CP 초보자 구역',
                x: 5, y: 20, width: 20, height: 15,
                difficulty: 1,
                color: '#2E7D32'
            },
            {
                name: 'SAA 중급자 숲',
                x: 25, y: 15, width: 25, height: 20,
                difficulty: 2,
                color: '#1565C0'
            },
            {
                name: 'DVA/SAP 고급자 산',
                x: 50, y: 10, width: 25, height: 25,
                difficulty: 3,
                color: '#E65100'
            }
        ];
    }
    
    update() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.time = currentTime;
        
        if (this.gameState === 'loading' || this.gameState === 'error') {
            return;
        }
        
        this.inputManager.setContext(this.gameState);
        
        if (this.gameState === 'overworld') {
            this.player.update(this.inputManager, this);
            this.entityManager.update();
            this.updateCamera();
        } else if (this.gameState === 'battle') {
            this.battleSystem.update();
            
            const answerKey = this.inputManager.getAnswerKey();
            if (answerKey !== -1) {
                this.battleSystem.handleAnswer(answerKey);
            }
        }
        
        this.inputManager.update();
    }
    
    updateCamera() {
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;
        
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
        
        // 카메라 경계 제한
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapWidth * this.tileSize - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapHeight * this.tileSize - this.canvas.height));
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch (this.gameState) {
            case 'loading':
                this.renderLoading();
                break;
            case 'overworld':
                this.renderOverworld();
                break;
            case 'battle':
                this.renderBattle();
                break;
            case 'dialogue':
                this.renderOverworld();
                this.renderDialogue();
                break;
            case 'menu':
                this.renderOverworld();
                this.renderMenu();
                break;
            case 'error':
                this.renderError();
                break;
        }
        
        if (this.gameState !== 'loading' && this.gameState !== 'error') {
            this.renderUI();
        }
    }
    
    renderLoading() {
        // 로딩 화면 배경
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0D47A1');
        gradient.addColorStop(1, '#1565C0');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // AWS 로고 스타일 장식
        this.ctx.fillStyle = '#FF9900';
        this.ctx.fillRect(this.canvas.width / 2 - 100, this.canvas.height / 2 - 120, 200, 10);
        
        // 제목
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('AWS 노들섬 퀴즈 RPG', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        // 부제목
        this.ctx.font = '14px monospace';
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.fillText('포켓몬 스타일 AWS 자격증 학습 게임', this.canvas.width / 2, this.canvas.height / 2 - 35);
        
        // 로딩 바
        const barWidth = 300;
        const barHeight = 20;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = this.canvas.height / 2;
        
        // 바 외곽
        this.ctx.fillStyle = '#424242';
        this.ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // 바 배경
        this.ctx.fillStyle = '#212121';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 진행률
        this.ctx.fillStyle = '#FF9900';
        this.ctx.fillRect(barX, barY, (barWidth * this.loadingProgress) / 100, barHeight);
        
        // 로딩 메시지
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(this.loadingMessage || '로딩 중...', this.canvas.width / 2, barY + 40);
        this.ctx.fillText(`${this.loadingProgress}%`, this.canvas.width / 2, barY + 60);
        
        // 팁
        if (this.loadingProgress > 70) {
            this.ctx.fillStyle = '#FFFF99';
            this.ctx.font = '12px monospace';
            this.ctx.fillText('💡 WASD로 이동, Space로 상호작용, 1-4로 퀴즈 답변!', this.canvas.width / 2, barY + 90);
        }
    }
    
    renderError() {
        this.ctx.fillStyle = '#B71C1C';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 20px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('❌ 게임 로딩 실패', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '14px monospace';
        this.ctx.fillText('페이지를 새로고침해주세요', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
    
    renderOverworld() {
        // 하늘 그라데이션 (시간대별 변화)
        const timeOfDay = (this.time * 0.001) % (24 * 60); // 24분 = 24시간
        const hour = Math.floor(timeOfDay / 60) % 24;
        
        let skyColor1, skyColor2;
        if (hour >= 6 && hour < 18) {
            // 낮
            skyColor1 = '#87CEEB';
            skyColor2 = '#98FB98';
        } else if (hour >= 18 && hour < 20) {
            // 석양
            skyColor1 = '#FF6347';
            skyColor2 = '#FFD700';
        } else {
            // 밤
            skyColor1 = '#191970';
            skyColor2 = '#000080';
        }
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, skyColor1);
        gradient.addColorStop(1, skyColor2);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 맵 렌더링
        if (this.mapRenderer) {
            this.mapRenderer.renderOverworld();
        } else {
            this.renderMap();
        }
        
        // 엔티티 렌더링
        if (this.entityManager) {
            this.entityManager.render(this.mapRenderer);
        }
        
        // 플레이어 렌더링
        if (this.player) {
            const screenX = this.player.x - this.camera.x;
            const screenY = this.player.y - this.camera.y;
            this.player.render(this.ctx, screenX, screenY, this.sprites, this.spritesLoaded);
        }
        
        // 테스트 몬스터 렌더링
        if (this.testMonster) {
            const screenX = this.testMonster.x - this.camera.x;
            const screenY = this.testMonster.y - this.camera.y;
            
            if (screenX > -32 && screenX < this.canvas.width + 32 && 
                screenY > -32 && screenY < this.canvas.height + 32) {
                this.ctx.fillStyle = '#FF9900';
                this.ctx.fillRect(screenX, screenY, 16, 16);
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '8px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('AWS', screenX + 8, screenY + 10);
                
                // 몬스터와 충돌 검사
                const dx = this.player.x - this.testMonster.x;
                const dy = this.player.y - this.testMonster.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 20 && this.gameState === 'overworld') {
                    this.battleSystem.start(this.testMonster);
                }
            }
        }
        
        // 특별 구역 렌더링
        this.renderSpecialZones();
    }
    
    renderMap() {
        const camera = this.camera;
        const tileSize = this.tileSize;
        
        const startX = Math.max(0, Math.floor(camera.x / tileSize));
        const endX = Math.min(this.mapWidth, Math.ceil((camera.x + this.canvas.width) / tileSize));
        const startY = Math.max(0, Math.floor(camera.y / tileSize));
        const endY = Math.min(this.mapHeight, Math.ceil((camera.y + this.canvas.height) / tileSize));
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (this.map[y] && this.map[y][x] !== undefined) {
                    const screenX = x * tileSize - camera.x;
                    const screenY = y * tileSize - camera.y;
                    this.renderTile(this.map[y][x], screenX, screenY);
                }
            }
        }
    }
    
    renderTile(tileType, x, y) {
        const size = this.tileSize;
        
        switch(tileType) {
            case 1: // 풀
                this.ctx.fillStyle = '#4CAF50';
                break;
            case 2: // 물
                this.ctx.fillStyle = '#2196F3';
                break;
            case 3: // 나무
                this.ctx.fillStyle = '#2E7D32';
                break;
            case 4: // 길
                this.ctx.fillStyle = '#8D6E63';
                break;
            case 15: // 어두운 풀
                this.ctx.fillStyle = '#2E7D32';
                break;
            case 16: // 산
                this.ctx.fillStyle = '#5D4037';
                break;
            case 20: // 노들라이브하우스
                this.ctx.fillStyle = '#9C27B0';
                break;
            case 21: // AWS 센터
                this.ctx.fillStyle = '#FF9900';
                break;
            case 22: // 카페
                this.ctx.fillStyle = '#795548';
                break;
            case 23: // 상점
                this.ctx.fillStyle = '#607D8B';
                break;
            default:
                this.ctx.fillStyle = '#4CAF50';
        }
        
        this.ctx.fillRect(x, y, size, size);
        
        // 타일 디테일 추가
        if (tileType === 2) { // 물 애니메이션
            const wave = Math.sin(this.time * 0.003 + x * 0.1) * 2;
            this.ctx.fillStyle = '#64B5F6';
            this.ctx.fillRect(x, y + wave, size, 2);
        } else if (tileType === 3) { // 나무 그림자
            this.ctx.fillStyle = '#1B5E20';
            this.ctx.fillRect(x + 2, y + size - 4, size - 4, 4);
        }
    }
    
    renderSpecialZones() {
        if (!this.specialZones) return;
        
        this.specialZones.forEach(zone => {
            const screenX = zone.x * this.tileSize - this.camera.x;
            const screenY = zone.y * this.tileSize - this.camera.y;
            const screenW = zone.width * this.tileSize;
            const screenH = zone.height * this.tileSize;
            
            // 구역 경계만 표시 (투명한 오버레이)
            this.ctx.strokeStyle = zone.color + '80'; // 50% 투명도
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(screenX, screenY, screenW, screenH);
            
            // 구역 이름 표시 (화면에 보이는 경우만)
            if (screenX > -100 && screenX < this.canvas.width + 100 && 
                screenY > -50 && screenY < this.canvas.height + 50) {
                this.ctx.fillStyle = zone.color;
                this.ctx.font = 'bold 12px monospace';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(zone.name, screenX + 10, screenY + 20);
            }
        });
    }
    
    renderBattle() {
        if (this.battleSystem) {
            this.battleSystem.render();
        }
    }
    
    renderDialogue() {
        // 대화창 구현 (추후 확장)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(50, this.canvas.height - 150, this.canvas.width - 100, 100);
    }
    
    renderMenu() {
        // 메뉴 구현 (추후 확장)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(100, 100, this.canvas.width - 200, this.canvas.height - 200);
    }
    
    renderUI() {
        if (!this.player) return;
        
        // 상단 UI 바
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, 50);
        
        // 플레이어 레벨
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Lv.${this.player.level}`, 10, 20);
        
        // HP 바
        const hpBarWidth = 100;
        const hpPercent = this.player.hp / this.player.maxHp;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(10, 25, hpBarWidth, 12);
        this.ctx.fillStyle = hpPercent > 0.3 ? '#4CAF50' : '#F44336';
        this.ctx.fillRect(10, 25, hpBarWidth * hpPercent, 12);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(`HP: ${this.player.hp}/${this.player.maxHp}`, 12, 34);
        
        // EXP 바
        const expPercent = this.player.exp / this.player.expToNext;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(120, 25, 80, 8);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(120, 25, 80 * expPercent, 8);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '8px monospace';
        this.ctx.fillText(`EXP: ${Math.floor(expPercent * 100)}%`, 122, 31);
        
        // AWS Credits
        this.ctx.fillStyle = '#FF9900';
        this.ctx.font = 'bold 12px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`💰 ${this.player.awsCredits || 0} Credits`, this.canvas.width - 10, 20);
        
        // 현재 시간 (게임 내)
        const hour = Math.floor((this.time * 0.001) % (24 * 60) / 60) % 24;
        const minute = Math.floor((this.time * 0.001) % 60);
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, this.canvas.width - 10, 35);
    }
    
    // 충돌 검사
    isValidPosition(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX < 0 || tileX >= this.mapWidth || tileY < 0 || tileY >= this.mapHeight) {
            return false;
        }
        
        return this.collisionMap[tileY] && this.collisionMap[tileY][tileX] === 0;
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}
