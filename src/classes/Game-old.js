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
        
        this.init();
    }
    
    async init() {
        console.log('🎮 AWS 노들섬 퀴즈 RPG 초기화 시작...');
        
        try {
            // 데이터 로딩 (번들된 데이터 사용)
            this.updateLoadingProgress(10, '데이터 로딩 중...');
            this.gameData = await DataLoader.loadGameData();
            console.log('✅ 게임 데이터 로딩 완료:', this.gameData);
            
            // 스프라이트 로딩
            this.updateLoadingProgress(30, '스프라이트 로딩 중...');
            await this.loadSprites();
            
            // 게임 시스템 초기화
            this.updateLoadingProgress(50, '게임 시스템 초기화 중...');
            this.initializeGameSystems();
            
            // 맵 생성
            this.updateLoadingProgress(70, '노들섬 맵 생성 중...');
            this.generateEnhancedMap();
            
            // 엔티티 설정
            this.updateLoadingProgress(90, '몬스터 및 NPC 배치 중...');
            this.entityManager.init(this.gameData);
            
            this.updateLoadingProgress(100, '게임 시작!');
            this.gameState = 'overworld';
            
            console.log('🎉 게임 초기화 완료!');
            this.gameLoop();
            
        } catch (error) {
            console.error('❌ 게임 초기화 실패:', error);
            this.gameState = 'error';
        }
    }
    
    updateLoadingProgress(progress, message) {
        this.loadingProgress = progress;
        this.loadingMessage = message;
        this.renderLoading();
    }
    
    async loadSprites() {
        return new Promise((resolve) => {
            // 실제 프로젝트에서는 SVG 스프라이트를 로딩하지만
            // 현재는 간단한 픽셀 아트로 대체
            this.spritesLoaded = true;
            console.log('✅ 스프라이트 로딩 완료 (픽셀 아트 모드)');
            resolve();
        });
    }
    
    initializeGameSystems() {
        const playerConfig = this.gameData.config.game.player;
        this.player = new Player(playerConfig.startX, playerConfig.startY, playerConfig);
        this.battleSystem = new BattleSystem(this, this.gameData);
        this.mapRenderer = new MapRenderer(this, this.gameData);
        this.entityManager = new EntityManager(this);
        this.inputManager = new InputManager(this);
        
        console.log('✅ 게임 시스템 초기화 완료');
    }
    
    generateEnhancedMap() {
        console.log('🗺️ 노들섬 맵 생성 중...');
        
        // 맵 데이터 로딩
        const mapData = this.gameData.maps['nodeul-island'];
        const tileData = this.gameData.maps.tiles;
        
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
            {x: 35, y: 15, w: 8, h: 6, type: 'concert_hall'},
            {x: 20, y: 25, w: 6, h: 6, type: 'aws_center'},
            {x: 50, y: 30, w: 4, h: 4, type: 'cafe'},
            {x: 10, y: 35, w: 5, h: 4, type: 'shop'}
        ];
        
        buildings.forEach(building => {
            for (let y = building.y; y < building.y + building.h; y++) {
                for (let x = building.x; x < building.x + building.w; x++) {
                    if (x < this.mapWidth && y < this.mapHeight) {
                        this.map[y][x] = 20; // 건물 타일
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
            if (this.map[y][x] !== 2 && this.map[y][x] !== 20) {
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
                if (this.map[y][path.x] !== 2 && this.map[y][path.x] !== 20) {
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
    
    generateMap() {
        this.collisionMap = [];
        this.map = [];
        
        for (let y = 0; y < this.mapHeight; y++) {
            const mapRow = [];
            const collisionRow = [];
            
            for (let x = 0; x < this.mapWidth; x++) {
                if (x < 25) mapRow.push(1);
                else if (x < 50) mapRow.push(15);
                else mapRow.push(16);
                collisionRow.push(0);
            }
            
            this.map.push(mapRow);
            this.collisionMap.push(collisionRow);
        }
        
        this.addRivers();
        this.addTrees();
        this.addBuildings();
    }
    
    addRivers() {
        for (let x = 0; x < this.mapWidth; x++) {
            const progress = x / this.mapWidth;
            const riverTop = 8 + Math.sin(progress * Math.PI * 1.5) * 3;
            for (let offset = -3; offset <= 3; offset++) {
                const riverY = Math.floor(riverTop + offset);
                if (riverY >= 0 && riverY < this.mapHeight) {
                    this.map[riverY][x] = 2;
                    this.collisionMap[riverY][x] = 1;
                }
            }
        }
    }
    
    addTrees() {
        for (let y = 15; y < 45; y++) {
            for (let x = 5; x < 75; x++) {
                if (Math.random() < 0.1) {
                    this.map[y][x] = 3;
                    this.collisionMap[y][x] = 1;
                }
            }
        }
    }
    
    addBuildings() {
        const buildings = [
            {x: 30, y: 25, w: 6, h: 4, type: 8},
            {x: 16, y: 30, w: 3, h: 2, type: 11},
            {x: 36, y: 25, w: 3, h: 2, type: 12}
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
    
    update() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.time = currentTime;
        
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
        
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapWidth * this.tileSize - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapHeight * this.tileSize - this.canvas.height));
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'overworld') {
            this.mapRenderer.renderOverworld();
            this.entityManager.render(this.mapRenderer);
            
            const screenX = this.player.x - this.camera.x;
            const screenY = this.player.y - this.camera.y;
            this.player.render(this.ctx, screenX, screenY, this.sprites, this.spritesLoaded);
        } else if (this.gameState === 'battle') {
            this.battleSystem.render();
        }
        
        this.renderUI();
    }
    
    renderUI() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, 50);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 12px monospace';
        this.ctx.fillText(`Lv.${this.player.level}`, 10, 20);
        
        const hpBarWidth = 100;
        const hpPercent = this.player.hp / this.player.maxHp;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(50, 10, hpBarWidth, 12);
        this.ctx.fillStyle = hpPercent > 0.3 ? '#4CAF50' : '#F44336';
        this.ctx.fillRect(50, 10, hpBarWidth * hpPercent, 12);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(`${this.player.hp}/${this.player.maxHp}`, 55, 20);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}