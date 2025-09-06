/**
 * 입력 매니저 - 키보드/마우스 입력 처리
 */

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });
        
        // 마우스 이벤트
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.clicked = true;
            e.preventDefault();
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.mouse.clicked = false;
            e.preventDefault();
        });
        
        // 포커스 잃을 때 모든 키 해제
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }
    
    getInput() {
        return {
            left: this.keys['KeyA'] || this.keys['ArrowLeft'],
            right: this.keys['KeyD'] || this.keys['ArrowRight'],
            up: this.keys['KeyW'] || this.keys['ArrowUp'],
            down: this.keys['KeyS'] || this.keys['ArrowDown'],
            space: this.keys['Space'] || this.keys['ArrowUp'],
            enter: this.keys['Enter'],
            escape: this.keys['Escape']
        };
    }
    
    getMouse() {
        return { ...this.mouse };
    }
    
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }
}