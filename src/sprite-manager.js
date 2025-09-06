class SpriteManager {
    constructor() {
        this.sprites = {};
        this.loaded = false;
        this.loadPromises = [];
    }
    
    async loadSprites() {
        const spriteFiles = [
            'assets/sprites/player.svg',
            'assets/sprites/npc.svg', 
            'assets/sprites/monsters.svg',
            'assets/sprites/buildings.svg'
        ];
        
        this.loadPromises = spriteFiles.map(file => this.loadSVG(file));
        await Promise.all(this.loadPromises);
        this.loaded = true;
    }
    
    async loadSVG(url) {
        try {
            const response = await fetch(url);
            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            
            const fileName = url.split('/').pop().replace('.svg', '');
            this.sprites[fileName] = svgDoc;
            
            return svgDoc;
        } catch (error) {
            console.error(`Failed to load sprite: ${url}`, error);
        }
    }
    
    drawSprite(ctx, spriteName, spriteId, x, y, scale = 1) {
        if (!this.loaded || !this.sprites[spriteName]) return;
        
        const svgDoc = this.sprites[spriteName];
        const sprite = svgDoc.getElementById(spriteId);
        
        if (!sprite) return;
        
        // SVG를 Canvas에 그리기 위해 임시 캔버스 사용
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = 16 * scale;
        tempCanvas.height = 16 * scale;
        
        // SVG 요소들을 픽셀로 변환
        this.renderSVGToCanvas(sprite, tempCtx, scale);
        
        // 메인 캔버스에 그리기
        ctx.drawImage(tempCanvas, x, y);
    }
    
    renderSVGToCanvas(svgElement, ctx, scale) {
        const rects = svgElement.querySelectorAll('rect');
        
        rects.forEach(rect => {
            const x = parseInt(rect.getAttribute('x')) * scale;
            const y = parseInt(rect.getAttribute('y')) * scale;
            const width = parseInt(rect.getAttribute('width')) * scale;
            const height = parseInt(rect.getAttribute('height')) * scale;
            const fill = rect.getAttribute('fill');
            
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, width, height);
        });
    }
    
    // 애니메이션 프레임 계산
    getAnimationFrame(direction, frameCount, totalFrames = 4) {
        const frame = Math.floor(frameCount / 15) % totalFrames;
        return `${direction}-${frame}`;
    }
}

// 전역 스프라이트 매니저
window.spriteManager = new SpriteManager();