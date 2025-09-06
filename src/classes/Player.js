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
        this.awsCredits = 1000;
        this.badges = [];
        this.name = '클라우드 엔지니어';
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
    }
    
    render(ctx, x, y, sprites, spritesLoaded) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(x + 8, y + 14, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        this.renderFallback(ctx, x, y);
    }
    
    renderFallback(ctx, x, y) {
        ctx.fillStyle = '#FF9900';
        ctx.fillRect(x + 4, y + 8, 8, 6);
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(x + 5, y + 3, 6, 6);
        ctx.fillStyle = '#2C1810';
        ctx.fillRect(x + 4, y + 2, 8, 4);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 6, y + 5, 1, 1);
        ctx.fillRect(x + 9, y + 5, 1, 1);
        ctx.fillStyle = '#1565C0';
        ctx.fillRect(x + 6, y + 12, 4, 4);
    }
}