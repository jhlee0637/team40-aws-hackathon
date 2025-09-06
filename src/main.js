/**
 * AWS 서티 RPG - 메인 엔트리 포인트
 * 스타듀밸리 16-bit 픽셀 아트 스타일의 AWS 교육용 RPG
 */

import { GameEngine } from './core/GameEngine.js';
import { Renderer } from './core/Renderer.js';
import { InputManager } from './core/InputManager.js';
import { BattleSystem } from './systems/BattleSystem.js';
import { DataManager } from './data/DataManager.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.loadingScreen = document.getElementById('loadingScreen');
        
        this.engine = null;
        this.renderer = null;
        this.inputManager = null;
        this.battleSystem = null;
        this.dataManager = null;
        
        this.isRunning = false;
        this.lastTime = 0;
    }
    
    async init() {
        try {
            this.updateLoadingProgress('게임 초기화 중...');
            
            // 데이터 매니저 초기화
            this.dataManager = new DataManager();
            this.dataManager.init();
            
            // 렌더러 초기화
            this.renderer = new Renderer(this.ctx, this.canvas.width, this.canvas.height);
            this.renderer.init();
            
            // 입력 매니저 초기화
            this.inputManager = new InputManager(this.canvas);
            
            // 배틀 시스템 초기화
            this.battleSystem = new BattleSystem(this.dataManager);
            
            // 게임 엔진 초기화
            this.engine = new GameEngine(
                this.dataManager,
                this.renderer,
                this.inputManager,
                this.battleSystem
            );
            
            this.engine.init();
            
            this.updateLoadingProgress('게임 시작!');
            
            // 로딩 화면 숨기기
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                this.start();
            }, 500);
            
        } catch (error) {
            console.error('게임 초기화 실패:', error);
            this.updateLoadingProgress('로딩 실패: ' + error.message);
        }
    }
    
    updateLoadingProgress(message) {
        const progressElement = document.getElementById('loadingProgress');
        if (progressElement) {
            progressElement.textContent = message;
        }
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop(0);
    }
    
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 게임 업데이트
        this.engine.update(deltaTime);
        
        // 렌더링
        this.engine.render();
        
        // 다음 프레임 요청
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    stop() {
        this.isRunning = false;
    }
}

// 게임 시작
const game = new Game();
game.init();

// 전역 게임 인스턴스 (디버깅용)
window.game = game;