export class MapRenderer {
    constructor(game) {
        this.game = game;
    }
    
    renderOverworld() {
        const ctx = this.game.ctx;
        const canvas = this.game.canvas;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.renderMap();
    }
    
    renderMap() {
        const camera = this.game.camera;
        const tileSize = this.game.tileSize;
        
        const startX = Math.max(0, Math.floor(camera.x / tileSize));
        const endX = Math.min(this.game.mapWidth, Math.ceil((camera.x + this.game.canvas.width) / tileSize));
        const startY = Math.max(0, Math.floor(camera.y / tileSize));
        const endY = Math.min(this.game.mapHeight, Math.ceil((camera.y + this.game.canvas.height) / tileSize));
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const screenX = x * tileSize - camera.x;
                const screenY = y * tileSize - camera.y;
                this.renderTile(this.game.map[y][x], screenX, screenY, x, y);
            }
        }
    }
    
    renderTile(tileType, x, y, mapX, mapY) {
        const ctx = this.game.ctx;
        const size = this.game.tileSize;
        
        switch(tileType) {
            case 1: // 잔디
                const grassBase = Math.sin(mapX * 0.2 + mapY * 0.15) * 0.15 + 0.85;
                ctx.fillStyle = `hsl(${75 + grassBase * 15}, 70%, ${30 + grassBase * 15}%)`;
                ctx.fillRect(x, y, size, size);
                break;
            case 2: // 물
                ctx.fillStyle = '#4682B4';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                break;
            case 3: // 나무
                ctx.fillStyle = '#6B8E23';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(x + 7, y + 12, 2, 4);
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(x + 4, y + 6, 8, 8);
                break;
            case 8: // AWS 센터
                ctx.fillStyle = '#FF9900';
                ctx.fillRect(x, y, size, size);
                break;
            case 11: // CP 체육관
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(x, y, size, size);
                break;
            case 12: // SAA 체육관
                ctx.fillStyle = '#1565C0';
                ctx.fillRect(x, y, size, size);
                break;
            case 15: // 숲
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(x, y, size, size);
                break;
            case 16: // 산
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(x, y, size, size);
                break;
            default:
                ctx.fillStyle = '#90EE90';
                ctx.fillRect(x, y, size, size);
                break;
        }
    }
    
    renderMonster(monster, x, y) {
        const ctx = this.game.ctx;
        const bounce = Math.sin(this.game.time * 0.005) * 1;
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x + 8, y + 14, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FF9900';
        ctx.fillRect(x + 2, y + 4 + bounce, 12, 10);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 4, y + 6 + bounce, 2, 2);
        ctx.fillRect(x + 10, y + 6 + bounce, 2, 2);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px monospace';
        ctx.fillText(monster.name.substring(0, 6), x - 5, y - 2);
    }
    
    renderGymLeader(leader, x, y) {
        const ctx = this.game.ctx;
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x + 8, y + 14, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const colors = {
            cp: '#2E7D32',
            saa: '#1565C0', 
            dva: '#E65100',
            sap: '#4A148C'
        };
        
        ctx.fillStyle = colors[leader.cert] || '#424242';
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
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(leader.cert.toUpperCase(), x + 2, y - 2);
    }
}