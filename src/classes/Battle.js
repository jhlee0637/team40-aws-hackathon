export class Battle {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.monster = null;
        this.currentQuestion = null;
        this.battlePhase = 'question';
        this.damageNumbers = [];
        this.screenShake = 0;
    }
    
    start(monster) {
        this.active = true;
        this.monster = monster;
        this.battlePhase = 'question';
        this.game.gameState = 'battle';
        
        const questions = this.game.gameData.quiz[monster.cert] || this.game.gameData.quiz.cp;
        this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        this.screenShake = 10;
        console.log(`⚔️ ${monster.name}와의 퀴즈 배틀 시작!`);
    }
    
    startGymBattle(leader) {
        const allMessages = leader.dialogue.join('\\n\\n');
        alert(allMessages);
        
        const details = leader.certDetails;
        const detailMessage = `
🎓 ${details.fullName} (${details.code})

📋 시험 정보:
• 시험 시간: ${details.duration}
• 문항 수: ${details.questions}
• 합격 점수: ${details.passingScore}
• 시험 비용: ${details.cost}
• 유효 기간: ${details.validity}

📚 출제 영역:
${details.domains.map(domain => `• ${domain}`).join('\\n')}

배틀을 시작하시겠습니까?`;
        
        if (confirm(detailMessage)) {
            const gymMonster = {
                name: `${leader.name}의 AWS 챔피언`,
                type: 'gym',
                hp: 150,
                maxHp: 150,
                level: 5,
                cert: leader.cert,
                defeated: false
            };
            this.start(gymMonster);
        }
    }
    
    handleQuizAnswer(selectedOption) {
        const question = this.currentQuestion;
        const correct = selectedOption === question.correct;
        
        let resultMessage = '';
        
        if (correct) {
            const damage = 25 + (question.difficulty * 10);
            this.monster.hp -= damage;
            
            this.addDamageNumber(this.game.canvas.width * 0.7, this.game.canvas.height * 0.3, damage, '#4CAF50');
            this.screenShake = 5;
            
            resultMessage = `🎉 정답입니다!\\n\\n💡 ${question.explanation}`;
            if (question.certInfo) {
                resultMessage += `\\n\\n📚 ${question.certInfo}`;
            }
            
            alert(resultMessage);
            
            if (this.monster.hp <= 0) {
                this.end(true);
            } else {
                this.nextRound();
            }
        } else {
            const damage = 15 + (question.difficulty * 5);
            this.game.player.hp -= damage;
            
            this.addDamageNumber(this.game.canvas.width * 0.3, this.game.canvas.height * 0.7, damage, '#F44336');
            this.screenShake = 8;
            
            const correctAnswer = question.options[question.correct];
            resultMessage = `❌ 틀렸습니다!\\n\\n정답: ${correctAnswer}\\n\\n💡 ${question.explanation}`;
            if (question.certInfo) {
                resultMessage += `\\n\\n📚 ${question.certInfo}`;
            }
            
            alert(resultMessage);
            
            if (this.game.player.hp <= 0) {
                this.end(false);
            } else {
                this.nextRound();
            }
        }
    }
    
    nextRound() {
        if (this.active) {
            const questions = this.game.gameData.quiz[this.monster.cert] || this.game.gameData.quiz.cp;
            this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
            this.battlePhase = 'question';
        }
    }
    
    end(victory) {
        if (victory) {
            const expGain = 50 + (this.monster.level * 10);
            const creditsGain = 100 + (this.monster.level * 25);
            
            this.game.player.exp += expGain;
            this.game.player.awsCredits += creditsGain;
            
            if (this.game.player.exp >= this.game.player.expToNext) {
                this.game.player.level++;
                this.game.player.exp -= this.game.player.expToNext;
                this.game.player.expToNext += 50;
                this.game.player.maxHp += 20;
                this.game.player.hp = this.game.player.maxHp;
            }
            
            this.monster.defeated = true;
            console.log(`🎉 승리! EXP +${expGain}, AWS Credits +${creditsGain}`);
        } else {
            this.game.player.hp = this.game.player.maxHp;
            console.log('💔 패배... 체력을 회복하고 다시 도전하세요!');
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
    
    render() {
        const ctx = this.game.ctx;
        const canvas = this.game.canvas;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1A237E');
        gradient.addColorStop(1, '#3F51B5');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.monster) {
            const monsterX = canvas.width * 0.75;
            const monsterY = canvas.height * 0.25;
            this.renderMonster(ctx, monsterX - 16, monsterY - 16);
            
            const hpBarWidth = 180;
            const hpBarHeight = 16;
            const hpBarX = monsterX - hpBarWidth / 2;
            const hpBarY = monsterY - 50;
            
            ctx.fillStyle = '#424242';
            ctx.fillRect(hpBarX - 2, hpBarY - 2, hpBarWidth + 4, hpBarHeight + 4);
            
            ctx.fillStyle = '#F44336';
            ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
            
            const hpPercent = this.monster.hp / this.monster.maxHp;
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(this.monster.name, hpBarX, hpBarY - 8);
        }
        
        const playerX = canvas.width * 0.25;
        const playerY = canvas.height * 0.65;
        this.game.player.render(ctx, playerX - 16, playerY - 16, this.game.sprites, this.game.spritesLoaded);
        
        if (this.battlePhase === 'question' && this.currentQuestion) {
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
            
            const isHovered = this.game.mouse.y >= optionY - 15 && this.game.mouse.y <= optionY + 15;
            ctx.fillStyle = isHovered ? 'rgba(255, 153, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(optionX - 10, optionY - 15, canvas.width - 140, 30);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px monospace';
            ctx.fillText(`${index + 1}. ${option}`, optionX, optionY);
        });
        
        ctx.fillStyle = '#FFD700';
        ctx.font = '12px monospace';
        ctx.fillText('클릭하거나 1-4 키를 눌러 답을 선택하세요', 70, canvas.height - 70);
    }
}