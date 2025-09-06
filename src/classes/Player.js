export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.speed = 2;
        this.direction = 'down';
        this.moving = false;
        this.animFrame = 0;
        
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        this.certifications = new Set();
        this.awsCredits = 500;
        this.badges = [];
        this.name = 'AWS 트레이너';
    }
    
    update(inputManager, game) {
        const oldX = this.x;
        const oldY = this.y;
        let moved = false;
        
        if (inputManager.isPressed('up')) {
            this.y -= this.speed;
            this.direction = 'up';
            moved = true;
        }
        if (inputManager.isPressed('down')) {
            this.y += this.speed;
            this.direction = 'down';
            moved = true;
        }
        if (inputManager.isPressed('left')) {
            this.x -= this.speed;
            this.direction = 'left';
            moved = true;
        }
        if (inputManager.isPressed('right')) {
            this.x += this.speed;
            this.direction = 'right';
            moved = true;
        }
        
        if (this.checkCollision(game)) {
            this.x = oldX;
            this.y = oldY;
            moved = false;
        }
        
        this.moving = moved;
        if (moved) {
            this.animFrame += game.deltaTime * 0.01;
        }
    }
    
    checkCollision(game) {
        const corners = [
            { x: this.x, y: this.y },
            { x: this.x + this.width - 1, y: this.y },
            { x: this.x, y: this.y + this.height - 1 },
            { x: this.x + this.width - 1, y: this.y + this.height - 1 }
        ];
        
        for (let corner of corners) {
            const tileX = Math.floor(corner.x / game.tileSize);
            const tileY = Math.floor(corner.y / game.tileSize);
            
            if (tileX < 0 || tileX >= game.mapWidth || tileY < 0 || tileY >= game.mapHeight) {
                return true;
            }
            
            if (game.collisionMap[tileY] && game.collisionMap[tileY][tileX] === 1) {
                return true;
            }
        }
        
        return false;
    }
    
    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.expToNext) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.exp -= this.expToNext;
        this.expToNext += 50;
        this.maxHp += 20;
        this.hp = this.maxHp;
        
        // 레벨업 이팩트 (스타듀밸리 스타일)
        console.log(`🎉 레벨 업! Lv.${this.level} 달성!`);
        
        // 특정 레벨에서 새로운 능력 해제
        if (this.level === 5) {
            console.log('🎩 전문가 모자 획득!');
        }
        if (this.level === 10) {
            console.log('👓 전문가 안경 획득!');
        }
        if (this.level === 15) {
            this.speed += 0.5; // 이동 속도 증가
            console.log('🏃 이동 속도 증가!');
        }
    }
    
    render(ctx, x, y, sprites, spritesLoaded) {
        // 그림자 렌더링
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(x + 8, y + 14, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 스타듀밸리 스타일 플레이어 렌더링
        this.renderStardewStylePlayer(ctx, x, y);
    }
    
    renderStardewStylePlayer(ctx, x, y) {
        const walkCycle = Math.floor(this.animFrame) % 4;
        const isWalking = this.moving;
        
        // 머리 (갈색)
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x + 4, y + 2, 8, 6);
        
        // 얼굴 (살색)
        ctx.fillStyle = '#FFDBCB';
        ctx.fillRect(x + 5, y + 4, 6, 4);
        
        // 눈
        ctx.fillStyle = '#000000';
        if (this.direction === 'left') {
            ctx.fillRect(x + 6, y + 5, 1, 1);
        } else if (this.direction === 'right') {
            ctx.fillRect(x + 9, y + 5, 1, 1);
        } else {
            ctx.fillRect(x + 6, y + 5, 1, 1);
            ctx.fillRect(x + 9, y + 5, 1, 1);
        }
        
        // 상의 (파란 셔츠)
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(x + 4, y + 8, 8, 6);
        
        // 팔 렌더링 (방향별)
        ctx.fillStyle = '#FFDBCB'; // 살색
        if (this.direction === 'up') {
            // 위를 보는 경우 팔이 보임
            ctx.fillRect(x + 2, y + 9, 3, 4);
            ctx.fillRect(x + 11, y + 9, 3, 4);
        } else if (this.direction === 'down') {
            // 아래를 보는 경우
            ctx.fillRect(x + 2, y + 9, 3, 4);
            ctx.fillRect(x + 11, y + 9, 3, 4);
        } else if (this.direction === 'left') {
            // 왼쪽을 보는 경우
            ctx.fillRect(x + 1, y + 9, 3, 4);
            if (isWalking && walkCycle % 2 === 0) {
                ctx.fillRect(x + 12, y + 10, 2, 3);
            }
        } else if (this.direction === 'right') {
            // 오른쪽을 보는 경우
            ctx.fillRect(x + 12, y + 9, 3, 4);
            if (isWalking && walkCycle % 2 === 0) {
                ctx.fillRect(x + 2, y + 10, 2, 3);
            }
        }
        
        // 바지 (검은색)
        ctx.fillStyle = '#424242';
        ctx.fillRect(x + 5, y + 12, 6, 4);
        
        // 다리 렌더링 (걸음 애니메이션)
        ctx.fillStyle = '#FFDBCB';
        if (isWalking) {
            // 걸음 애니메이션
            if (walkCycle === 0 || walkCycle === 2) {
                ctx.fillRect(x + 5, y + 14, 2, 2);
                ctx.fillRect(x + 9, y + 14, 2, 2);
            } else {
                ctx.fillRect(x + 6, y + 14, 2, 2);
                ctx.fillRect(x + 8, y + 14, 2, 2);
            }
        } else {
            // 정지 상태
            ctx.fillRect(x + 6, y + 14, 2, 2);
            ctx.fillRect(x + 8, y + 14, 2, 2);
        }
        
        // 신발 (갈색)
        ctx.fillStyle = '#5D4037';
        if (isWalking) {
            if (walkCycle === 0 || walkCycle === 2) {
                ctx.fillRect(x + 5, y + 15, 2, 1);
                ctx.fillRect(x + 9, y + 15, 2, 1);
            } else {
                ctx.fillRect(x + 6, y + 15, 2, 1);
                ctx.fillRect(x + 8, y + 15, 2, 1);
            }
        } else {
            ctx.fillRect(x + 6, y + 15, 2, 1);
            ctx.fillRect(x + 8, y + 15, 2, 1);
        }
        
        // AWS 배지 (셔츠에)
        ctx.fillStyle = '#FF9900';
        ctx.fillRect(x + 6, y + 9, 4, 2);
        
        // 레벨에 따른 추가 액세서리
        if (this.level >= 5) {
            // 모자 (고레벨)
            ctx.fillStyle = '#1565C0';
            ctx.fillRect(x + 4, y + 1, 8, 2);
        }
        
        if (this.level >= 10) {
            // 안경 (전문가)
            ctx.fillStyle = '#000000';
            ctx.fillRect(x + 4, y + 4, 8, 1);
        }
        
        // 자격증 배지 표시
        if (this.certifications.size > 0) {
            let badgeY = y - 5;
            Array.from(this.certifications).slice(0, 3).forEach((cert, index) => {
                ctx.fillStyle = this.getCertBadgeColor(cert);
                ctx.fillRect(x + 12 + (index * 3), badgeY, 2, 2);
            });
        }
    }
    
    getCertBadgeColor(cert) {
        switch(cert) {
            case 'cp': return '#87CEEB';
            case 'saa': return '#FF9900';
            case 'dva': return '#4CAF50';
            case 'sap': return '#9C27B0';
            default: return '#607D8B';
        }
    }
}