/**
 * 렌더러 - 최적화된 2D 렌더링
 */

export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        
        // 렌더링 최적화
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.textBaseline = 'top';
    }
    
    init() {
        // 렌더러 초기화
        this.clear();
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    fillRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    
    strokeRect(x, y, width, height) {
        this.ctx.strokeRect(x, y, width, height);
    }
    
    setStrokeStyle(color) {
        this.ctx.strokeStyle = color;
    }
    
    fillText(text, x, y, color = '#000', font = '16px Arial', align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }
    
    drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (arguments.length === 5) {
            // drawImage(image, dx, dy, dw, dh)
            this.ctx.drawImage(image, sx, sy, sw, sh);
        } else if (arguments.length === 9) {
            // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
            this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        } else {
            // drawImage(image, dx, dy)
            this.ctx.drawImage(image, sx, sy);
        }
    }
}