export class BattleSystem {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.monster = null;
        this.currentQuestion = null;
        this.damageNumbers = [];
        this.screenShake = 0;
    }
    
    start(monster) {
        this.active = true;
        this.monster = monster;
        this.game.gameState = 'battle';
        
        const questions = this.game.gameData.quiz[monster.cert] || this.game.gameData.quiz.cp;
        this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        this.screenShake = 10;
    }
    
    handleAnswer(selectedOption) {
        const question = this.currentQuestion;
        const correct = selectedOption === question.correct;
        
        if (correct) {
            const damage = 25 + (question.difficulty * 10);
            this.monster.hp -= damage;
            this.addDamageNumber(this.game.canvas.width * 0.7, this.game.canvas.height * 0.3, damage, '#4CAF50');
            
            if (this.monster.hp <= 0) {
                this.end(true);
            } else {
                this.nextRound();
            }
        } else {
            const damage = 15 + (question.difficulty * 5);
            this.game.player.hp -= damage;
            this.addDamageNumber(this.game.canvas.width * 0.3, this.game.canvas.height * 0.7, damage, '#F44336');
            
            if (this.game.player.hp <= 0) {
                this.end(false);
            } else {
                this.nextRound();
            }
        }
        
        alert(correct ? `정답! ${question.explanation}` : `오답! 정답: ${question.options[question.correct]}`);
    }
    
    nextRound() {
        const questions = this.game.gameData.quiz[this.monster.cert] || this.game.gameData.quiz.cp;
        this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    }
    
    end(victory) {
        if (victory) {
            const expGain = 50 + (this.monster.level * 10);
            const creditsGain = 100 + (this.monster.level * 25);
            
            this.game.player.gainExp(expGain);
            this.game.player.awsCredits += creditsGain;
            this.monster.defeated = true;
        } else {
            this.game.player.hp = this.game.player.maxHp;
        }
        
        this.active = false;
        this.game.gameState = 'overworld';
    }
    
    addDamageNumber(x, y, damage, color) {
        this.damageNumbers.push({
            x, y, damage, color,
            life: 1000, maxLife: 1000,
            vx: (Math.random() - 0.5) * 2,
            vy: -3
        });
    }
    
    update() {
        this.damageNumbers = this.damageNumbers.filter(dmg => {
            dmg.life -= this.game.deltaTime;
            dmg.x += dmg.vx * this.game.deltaTime * 0.001;
            dmg.y += dmg.vy * this.game.deltaTime * 0.001;
            return dmg.life > 0;
        });
        
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
            if (this.screenShake < 0.1) this.screenShake = 0;
        }
    }
    
    render() {
        const ctx = this.game.ctx;
        const canvas = this.game.canvas;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1A237E');
        gradient.addColorStop(1, '#3F51B5');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.monster) {
            this.renderMonster(ctx, canvas.width * 0.75 - 16, canvas.height * 0.25 - 16);
            this.renderMonsterHP(ctx, canvas.width * 0.75, canvas.height * 0.25 - 50);
        }
        
        this.game.player.render(ctx, canvas.width * 0.25 - 16, canvas.height * 0.65 - 16, this.game.sprites, this.game.spritesLoaded);
        
        if (this.currentQuestion) {
            this.renderQuizInterface(ctx, canvas);
        }
        
        this.damageNumbers.forEach(dmg => {
            const alpha = dmg.life / dmg.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = dmg.color;
            ctx.font = 'bold 20px monospace';
            ctx.fillText(`-${dmg.damage}`, dmg.x, dmg.y);
            ctx.restore();
        });
    }
    
    renderMonster(ctx, x, y) {
        ctx.fillStyle = '#FF9900';
        ctx.fillRect(x + 2, y + 4, 12, 10);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 4, y + 6, 2, 2);
        ctx.fillRect(x + 10, y + 6, 2, 2);
    }
    
    renderMonsterHP(ctx, x, y) {
        const hpBarWidth = 180;
        const hpBarHeight = 16;
        const hpBarX = x - hpBarWidth / 2;
        
        ctx.fillStyle = '#424242';
        ctx.fillRect(hpBarX - 2, y - 2, hpBarWidth + 4, hpBarHeight + 4);
        
        ctx.fillStyle = '#F44336';
        ctx.fillRect(hpBarX, y, hpBarWidth, hpBarHeight);
        
        const hpPercent = this.monster.hp / this.monster.maxHp;
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(hpBarX, y, hpBarWidth * hpPercent, hpBarHeight);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(this.monster.name, hpBarX, y - 8);
    }
    
    renderQuizInterface(ctx, canvas) {
        const question = this.currentQuestion;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(50, canvas.height - 220, canvas.width - 100, 170);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px monospace';
        ctx.fillText(question.question, 70, canvas.height - 190);
        
        question.options.forEach((option, index) => {
            const optionY = canvas.height - 160 + index * 35;
            const optionX = 70;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(optionX - 10, optionY - 15, canvas.width - 140, 30);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px monospace';
            ctx.fillText(`${index + 1}. ${option}`, optionX, optionY);
        });
        
        ctx.fillStyle = '#FFD700';
        ctx.font = '12px monospace';
        ctx.fillText('1-4 키를 눌러 답을 선택하세요', 70, canvas.height - 70);
    }
}