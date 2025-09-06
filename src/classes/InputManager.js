export class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        this.context = 'overworld';
        
        this.keyMappings = {
            up: ['ArrowUp', 'w', 'W'],
            down: ['ArrowDown', 's', 'S'],
            left: ['ArrowLeft', 'a', 'A'],
            right: ['ArrowRight', 'd', 'D'],
            interact: [' ', 'Space'],
            answer1: ['1'],
            answer2: ['2'],
            answer3: ['3'],
            answer4: ['4']
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        document.addEventListener('click', (e) => {
            this.mouse.clicked = true;
        });
    }
    
    setContext(context) {
        this.context = context;
    }
    
    isPressed(action) {
        const mappedKeys = this.keyMappings[action];
        if (!mappedKeys) return false;
        
        return mappedKeys.some(key => this.keys[key]);
    }
    
    getAnswerKey() {
        for (let i = 1; i <= 4; i++) {
            if (this.isPressed(`answer${i}`)) {
                return i - 1;
            }
        }
        return -1;
    }
    
    update() {
        this.mouse.clicked = false;
    }
}