export class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.context = 'overworld';
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    isPressed(key) {
        return this.keys[key] || false;
    }
    
    setContext(context) {
        this.context = context;
    }
    
    getAnswerKey() {
        if (this.keys['1']) return 0;
        if (this.keys['2']) return 1;
        if (this.keys['3']) return 2;
        if (this.keys['4']) return 3;
        return -1;
    }
    
    update() {
        // 입력 상태 업데이트
    }
}