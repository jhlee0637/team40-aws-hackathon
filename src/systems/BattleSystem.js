/**
 * 배틀 시스템 - 포켓몬 스타일 퀴즈 배틀
 */

export class BattleSystem {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentBattle = null;
        this.eventListeners = {};
        
        this.setupUI();
    }
    
    setupUI() {
        const battleOptions = document.getElementById('battleOptions');
        battleOptions.addEventListener('click', (e) => {
            if (e.target.classList.contains('battle-option')) {
                this.selectAnswer(parseInt(e.target.dataset.index));
            }
        });
    }
    
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
    
    startBattle(monster) {
        // 퀴즈 선택
        const quizCategory = this.getQuizCategory(monster);
        const questions = this.dataManager.getQuizData(quizCategory);
        const question = questions[Math.floor(Math.random() * questions.length)];
        
        this.currentBattle = {
            monster,
            question,
            answered: false,
            startTime: Date.now()
        };
        
        this.displayQuestion();
        this.emit('battleStart', { monster, question });
    }
    
    getQuizCategory(monster) {
        // 몬스터 레벨에 따른 퀴즈 카테고리 결정
        const categories = ['cp', 'saa', 'dva', 'sap'];
        return categories[Math.min(monster.level - 1, categories.length - 1)] || 'cp';
    }
    
    displayQuestion() {
        if (!this.currentBattle) return;
        
        const { question } = this.currentBattle;
        
        // 질문 표시
        document.getElementById('battleQuestion').textContent = question.question;
        
        // 선택지 표시
        const optionsContainer = document.getElementById('battleOptions');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'battle-option';
            button.textContent = option;
            button.dataset.index = index;
            optionsContainer.appendChild(button);
        });
    }
    
    selectAnswer(selectedIndex) {
        if (!this.currentBattle || this.currentBattle.answered) return;
        
        this.currentBattle.answered = true;
        const { question, monster } = this.currentBattle;
        const isCorrect = selectedIndex === question.correctAnswer;
        
        // 선택지 색상 변경
        const options = document.querySelectorAll('.battle-option');
        options.forEach((option, index) => {
            if (index === question.correctAnswer) {
                option.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
        
        // 결과 처리
        setTimeout(() => {
            this.endBattle(isCorrect);
        }, 2000);
    }
    
    endBattle(victory) {
        if (!this.currentBattle) return;
        
        const { monster } = this.currentBattle;
        const battleTime = Date.now() - this.currentBattle.startTime;
        
        let expGained = 0;
        let creditsGained = 0;
        
        if (victory) {
            expGained = monster.level * 20;
            creditsGained = monster.level * 10;
        }
        
        const result = {
            victory,
            expGained,
            creditsGained,
            battleTime,
            monster
        };
        
        this.currentBattle = null;
        this.emit('battleEnd', result);
    }
    
    update(deltaTime) {
        // 배틀 시스템 업데이트 (필요시)
    }
}