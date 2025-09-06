class AWSCertQuest {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        this.player = {
            x: 5,
            y: 5,
            direction: 'down'
        };
        
        this.tileSize = 48;
        this.keys = {};
        this.gameState = 'overworld';
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.exp = 0;
        this.expToNext = 100;
        
        this.map = [
            [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
            [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
            [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
            [3,1,1,1,4,4,4,1,1,1,1,1,4,4,4,1,1,1,1,3],
            [3,1,1,1,4,4,4,1,1,1,1,1,4,4,4,1,1,1,1,3],
            [3,1,1,1,4,5,4,1,1,1,1,1,4,4,4,1,1,1,1,3],
            [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
            [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
            [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
            [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
            [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,3],
            [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,3],
            [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,3],
            [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
            [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
        ];
        
        this.npcs = [
            { x: 8, y: 8, cert: 'cp', name: 'Cloud Practitioner Master', defeated: false },
            { x: 12, y: 6, cert: 'saa', name: 'Solutions Architect Master', defeated: false }
        ];
        
        this.setupEvents();
        this.gameLoop();
    }
    
    setupEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleInput(e.key);
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    handleInput(key) {
        if (this.gameState !== 'overworld') return;
        
        let newX = this.player.x;
        let newY = this.player.y;
        
        switch(key) {
            case 'ArrowUp':
                newY--;
                this.player.direction = 'up';
                break;
            case 'ArrowDown':
                newY++;
                this.player.direction = 'down';
                break;
            case 'ArrowLeft':
                newX--;
                this.player.direction = 'left';
                break;
            case 'ArrowRight':
                newX++;
                this.player.direction = 'right';
                break;
            case ' ':
                this.interact();
                return;
        }
        
        if (this.canMoveTo(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            this.checkRandomEncounter();
        }
    }
    
    canMoveTo(x, y) {
        if (y < 0 || y >= this.map.length || x < 0 || x >= this.map[0].length) {
            return false;
        }
        const tile = this.map[y][x];
        return tile !== 3 && tile !== 4;
    }
    
    interact() {
        // 치료대 체크
        if (this.map[this.player.y][this.player.x] === 5) {
            this.lives = 5;
            alert('🎉 HP가 완전 회복되었습니다!');
            return;
        }
        
        // NPC 체크
        this.npcs.forEach(npc => {
            if (Math.abs(npc.x - this.player.x) <= 1 && Math.abs(npc.y - this.player.y) <= 1) {
                if (!npc.defeated) {
                    this.startQuiz(npc);
                }
            }
        });
    }
    
    checkRandomEncounter() {
        const tile = this.map[this.player.y][this.player.x];
        if (tile === 0 && Math.random() < 0.3) { // 풀숲
            this.startRandomQuiz();
        }
    }
    
    startQuiz(npc) {
        const quiz = getRandomQuiz(npc.cert);
        if (!quiz) return;
        
        this.gameState = 'quiz';
        this.showQuiz(quiz, npc);
    }
    
    startRandomQuiz() {
        const quiz = getRandomQuiz('cp');
        if (!quiz) return;
        
        this.gameState = 'quiz';
        this.showQuiz(quiz, null);
    }
    
    showQuiz(quiz, npc) {
        const quizDiv = document.getElementById('quiz');
        const questionEl = document.getElementById('quizQuestion');
        const optionsEl = document.getElementById('quizOptions');
        
        questionEl.textContent = quiz.question;
        optionsEl.innerHTML = '';
        
        quiz.options.forEach((option, i) => {
            const btn = document.createElement('button');
            btn.textContent = `${i+1}. ${option}`;
            btn.style.cssText = 'margin: 5px; padding: 10px; background: #00ffff; color: #000; border: none; border-radius: 5px; cursor: pointer; font-family: monospace;';
            btn.onclick = () => this.answerQuiz(i, quiz, npc);
            optionsEl.appendChild(btn);
        });
        
        quizDiv.style.display = 'block';
    }
    
    answerQuiz(answer, quiz, npc) {
        const correct = answer === quiz.correct;
        
        if (correct) {
            this.exp += 50;
            this.score += 100;
            if (npc) {
                npc.defeated = true;
                document.getElementById(npc.cert).classList.add('collected');
            }
            alert('🎉 정답! EXP +50');
        } else {
            this.lives--;
            alert(`❌ 틀렸습니다! 정답: ${quiz.options[quiz.correct]}`);
        }
        
        if (this.exp >= this.expToNext) {
            this.level++;
            this.exp = 0;
            this.expToNext += 50;
            alert(`🆙 레벨업! 레벨 ${this.level}`);
        }
        
        document.getElementById('quiz').style.display = 'none';
        this.gameState = 'overworld';
    }
    
    render() {
        // 배경
        this.ctx.fillStyle = '#2E7D32';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 맵 렌더링
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const screenX = x * this.tileSize;
                const screenY = y * this.tileSize;
                this.renderTile(this.map[y][x], screenX, screenY);
            }
        }
        
        // NPC 렌더링
        this.npcs.forEach(npc => {
            if (!npc.defeated) {
                const screenX = npc.x * this.tileSize;
                const screenY = npc.y * this.tileSize;
                
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(screenX + 8, screenY + 8, this.tileSize - 16, this.tileSize - 16);
                
                this.ctx.fillStyle = '#000';
                this.ctx.font = '12px monospace';
                this.ctx.fillText(npc.cert.toUpperCase(), screenX + 12, screenY + 28);
            }
        });
        
        // 플레이어 렌더링
        const playerScreenX = this.player.x * this.tileSize;
        const playerScreenY = this.player.y * this.tileSize;
        
        this.ctx.fillStyle = '#1976D2';
        this.ctx.fillRect(playerScreenX + 8, playerScreenY + 8, this.tileSize - 16, this.tileSize - 16);
        
        // UI
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, 60);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`🏘️ 노들섬 마을`, 10, 25);
        this.ctx.fillText(`Lv.${this.level} | HP: ${this.lives}/5 | EXP: ${this.exp}/${this.expToNext}`, 10, 45);
        
        this.ctx.font = '12px monospace';
        this.ctx.fillText('화살표: 이동 | 스페이스: 상호작용', this.canvas.width - 250, 25);
    }
    
    renderTile(tileType, x, y) {
        switch(tileType) {
            case 0: // 풀숲
                this.ctx.fillStyle = '#1B5E20';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#4CAF50';
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if ((i + j) % 2 === 0) {
                            this.ctx.fillRect(x + i * 12, y + j * 12, 8, 8);
                        }
                    }
                }
                break;
            case 1: // 도로
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                break;
            case 3: // 벽
                this.ctx.fillStyle = '#2E7D32';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                break;
            case 4: // 건물
                this.ctx.fillStyle = '#616161';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                break;
            case 5: // 치료대
                this.ctx.fillStyle = '#E91E63';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(x + 16, y + 12, 16, 4);
                this.ctx.fillRect(x + 22, y + 6, 4, 16);
                break;
        }
    }
    
    gameLoop() {
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new AWSCertQuest();
});