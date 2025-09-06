/**
 * 게임 엔진 - 핵심 게임 로직 관리
 */

export class GameEngine {
    constructor(dataManager, renderer, inputManager, battleSystem) {
        this.dataManager = dataManager;
        this.renderer = renderer;
        this.inputManager = inputManager;
        this.battleSystem = battleSystem;
        
        this.gameState = 'exploration'; // exploration, battle, menu
        this.player = null;
        this.world = null;
        this.entities = [];
        this.camera = { x: 0, y: 0 };
        
        this.tileSize = 32;
        this.viewportWidth = 800;
        this.viewportHeight = 600;
    }
    
    init() {
        // 플레이어 초기화 (점프 기능 추가)
        this.player = {
            x: 100,
            y: 400,
            level: 1,
            exp: 0,
            maxExp: 100,
            credits: 0,
            sprite: 'player',
            width: 32,
            height: 32,
            speed: 3,
            velocityY: 0,
            onGround: false,
            jumpPower: -12,
            gravity: 0.5
        };
        
        // 지면 높이 설정
        this.groundY = 550;
        
        // 월드 데이터 로드
        this.world = this.dataManager.getMapData('nodeul-island');
        
        // 엔티티 생성
        this.createEntities();
        
        // UI 업데이트
        this.updateUI();
        
        // 배틀 시스템 이벤트 리스너
        this.battleSystem.on('battleStart', () => {
            this.gameState = 'battle';
            document.getElementById('battleUI').style.display = 'block';
        });
        
        this.battleSystem.on('battleEnd', (result) => {
            this.gameState = 'exploration';
            document.getElementById('battleUI').style.display = 'none';
            
            if (result.victory) {
                this.player.exp += result.expGained;
                this.player.credits += result.creditsGained;
                this.checkLevelUp();
                this.updateUI();
            }
        });
    }
    
    createEntities() {
        const monsters = this.dataManager.getEntityData('monsters');
        
        // 몬스터 배치 (플레이어와 떨어진 위치에)
        for (let i = 0; i < 6; i++) {
            const monster = monsters[Math.floor(Math.random() * monsters.length)];
            let x;
            do {
                x = Math.random() * (this.viewportWidth - 100) + 50;
            } while (Math.abs(x - this.player.x) < 150); // 플레이어와 최소 150px 거리
            
            this.entities.push({
                ...monster,
                x: x,
                y: this.groundY - 32,
                width: 32,
                height: 32,
                type: 'monster',
                velocityY: 0,
                onGround: true,
                gravity: 0.3
            });
        }
    }
    
    update(deltaTime) {
        if (this.gameState === 'exploration') {
            this.updateExploration(deltaTime);
        } else if (this.gameState === 'battle') {
            this.battleSystem.update(deltaTime);
        }
        
        this.updateCamera();
    }
    
    updateExploration(deltaTime) {
        const input = this.inputManager.getInput();
        let moved = false;
        
        // 좌우 이동
        if (input.left) {
            this.player.x -= this.player.speed;
            moved = true;
        }
        if (input.right) {
            this.player.x += this.player.speed;
            moved = true;
        }
        
        // 점프
        if (input.space && this.player.onGround) {
            this.player.velocityY = this.player.jumpPower;
            this.player.onGround = false;
        }
        
        // 플레이어 물리 업데이트
        this.updateEntityPhysics(this.player);
        
        // 좌우 경계 체크
        this.player.x = Math.max(0, Math.min(this.viewportWidth - this.player.width, this.player.x));
        
        // 몬스터 물리 업데이트
        this.entities.forEach(entity => {
            if (entity.type === 'monster') {
                this.updateEntityPhysics(entity);
            }
        });
        
        // 엔티티와의 충돌 체크
        if (moved) {
            this.checkEntityCollisions();
        }
    }
    
    checkEntityCollisions() {
        for (const entity of this.entities) {
            if (entity.type === 'monster' && this.isColliding(this.player, entity)) {
                // 배틀 시작
                this.battleSystem.startBattle(entity);
                break;
            }
        }
    }
    
    isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
    
    updateCamera() {
        // 플레이어를 중심으로 카메라 이동
        this.camera.x = this.player.x - this.viewportWidth / 2;
        this.camera.y = this.player.y - this.viewportHeight / 2;
        
        // 카메라 경계 제한
        this.camera.x = Math.max(0, Math.min(1600 - this.viewportWidth, this.camera.x));
        this.camera.y = Math.max(0, Math.min(1200 - this.viewportHeight, this.camera.y));
    }
    
    updateEntityPhysics(entity) {
        // 중력 적용
        entity.velocityY += entity.gravity;
        entity.y += entity.velocityY;
        
        // 지면 충돌 체크
        if (entity.y + entity.height >= this.groundY) {
            entity.y = this.groundY - entity.height;
            entity.velocityY = 0;
            entity.onGround = true;
        } else {
            entity.onGround = false;
        }
    }
    
    checkLevelUp() {
        while (this.player.exp >= this.player.maxExp) {
            this.player.exp -= this.player.maxExp;
            this.player.level++;
            this.player.maxExp = Math.floor(this.player.maxExp * 1.2);
        }
    }
    
    updateUI() {
        document.getElementById('playerLevel').textContent = this.player.level;
        document.getElementById('playerExp').textContent = this.player.exp;
        document.getElementById('playerMaxExp').textContent = this.player.maxExp;
        document.getElementById('playerCredits').textContent = this.player.credits;
    }
    
    render() {
        this.renderer.clear();
        
        if (this.gameState === 'exploration') {
            this.renderExploration();
        } else if (this.gameState === 'battle') {
            this.renderBattle();
        }
    }
    
    renderExploration() {
        // 투명 배경 (CSS 배경이 보이도록)
        this.renderer.clear();
        
        // 지면만 그리기 (반투명)
        this.renderer.fillRect(0, this.groundY, this.viewportWidth, this.viewportHeight - this.groundY, 'rgba(144, 238, 144, 0.3)');
        
        // 엔티티 렌더링
        for (const entity of this.entities) {
            if (entity.type === 'monster') {
                this.drawMonster(entity);
            }
        }
        
        // 플레이어 렌더링 (픽셀 아트 스타일)
        this.drawPlayer();
    }
    
    drawPlayer() {
        if (!this.playerImg) {
            this.playerImg = new Image();
            this.playerImg.src = 'assets/images/Cha.PNG';
        }
        
        const x = this.player.x;
        const y = this.player.y;
        
        if (this.playerImg.complete) {
            this.renderer.drawImage(this.playerImg, x, y, this.player.width, this.player.height);
        } else {
            // 폴백 그리기
            this.renderer.fillRect(x + 8, y + 8, 16, 20, '#27ae60');
            this.renderer.fillRect(x + 10, y + 4, 12, 12, '#f4c2a1');
            this.renderer.fillRect(x + 12, y + 8, 2, 2, '#000');
            this.renderer.fillRect(x + 18, y + 8, 2, 2, '#000');
        }
    }
    
    drawMonster(entity) {
        if (!this.dragonImg) {
            this.dragonImg = new Image();
            this.dragonImg.src = 'assets/images/dragon.PNG';
        }
        
        const x = entity.x;
        const y = entity.y;
        
        if (this.dragonImg.complete) {
            this.renderer.drawImage(this.dragonImg, x, y, entity.width, entity.height);
        } else {
            // 폴백 그리기
            this.renderer.fillRect(x + 4, y + 8, 24, 20, '#e74c3c');
            this.renderer.fillRect(x + 8, y + 12, 4, 4, '#fff');
            this.renderer.fillRect(x + 20, y + 12, 4, 4, '#fff');
            this.renderer.fillRect(x + 10, y + 14, 2, 2, '#000');
            this.renderer.fillRect(x + 22, y + 14, 2, 2, '#000');
        }
        
        // 이름 표시
        this.renderer.fillText(entity.name, x, y - 5, '#fff', '12px Arial');
    }
    
    renderBattle() {
        // 배틀 배경
        this.renderer.fillRect(0, 0, this.viewportWidth, this.viewportHeight, '#2c3e50');
        this.renderer.fillText('배틀 중...', this.viewportWidth / 2, this.viewportHeight / 2, '#fff', '24px Arial', 'center');
    }
    
    isInViewport(entity) {
        return entity.x + entity.width > this.camera.x &&
               entity.x < this.camera.x + this.viewportWidth &&
               entity.y + entity.height > this.camera.y &&
               entity.y < this.camera.y + this.viewportHeight;
    }
}