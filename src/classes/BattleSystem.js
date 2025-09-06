export class BattleSystem {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.monster = null;
        this.currentQuestion = null;
        this.damageNumbers = [];
        this.screenShake = 0;
        this.battleMessage = null;
    }
    
    start(monster) {
        this.active = true;
        this.monster = monster;
        this.game.gameState = 'battle';
        
        const questions = this.game.gameData?.quiz?.[monster.cert] || this.game.gameData?.quiz?.cp || [];
        if (questions.length > 0) {
            this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        } else {
            // 기본 질문
            this.currentQuestion = {
                question: "AWS의 핵심 서비스는?",
                options: ["EC2", "S3", "Lambda", "모두 정답"],
                correct: 3,
                explanation: "EC2, S3, Lambda 모두 AWS의 핵심 서비스입니다.",
                difficulty: 1
            };
        }
        
        this.screenShake = 10;
    }
    
    handleAnswer(selectedOption) {
        const question = this.currentQuestion;
        const correct = selectedOption === question.correct;
        
        // 화면 흔들림 효과
        this.screenShake = correct ? 5 : 15;
        
        if (correct) {
            const damage = 25 + (question.difficulty * 10);
            this.monster.hp -= damage;
            this.addDamageNumber(this.game.canvas.width * 0.7, this.game.canvas.height * 0.3, damage, '#4CAF50');
            
            // 포켓몬 스타일 효과음 시뮬레이션
            this.showBattleMessage(`정답! 효과적이다! ${damage} 데미지!`, '#4CAF50');
            
            if (this.monster.hp <= 0) {
                setTimeout(() => {
                    this.showBattleMessage(`${this.monster.name}을(를) 쓰러뜨렸다!`, '#FFD700');
                    setTimeout(() => this.end(true), 2000);
                }, 1500);
            } else {
                setTimeout(() => this.nextRound(), 2000);
            }
        } else {
            const damage = 15 + (question.difficulty * 5);
            this.game.player.hp -= damage;
            this.addDamageNumber(this.game.canvas.width * 0.3, this.game.canvas.height * 0.7, damage, '#F44336');
            
            this.showBattleMessage(`오답! ${this.monster.name}의 반격! ${damage} 데미지!`, '#F44336');
            
            if (this.game.player.hp <= 0) {
                setTimeout(() => {
                    this.showBattleMessage('쓰러졌다... 다시 도전하자!', '#FF6B6B');
                    setTimeout(() => this.end(false), 2000);
                }, 1500);
            } else {
                setTimeout(() => this.nextRound(), 2000);
            }
        }
        
        // 설명 표시
        setTimeout(() => {
            this.showBattleMessage(question.explanation, '#87CEEB');
        }, 1000);
    }
    
    showBattleMessage(message, color) {
        this.battleMessage = {
            text: message,
            color: color,
            life: 3000,
            maxLife: 3000
        };
    }
    
    nextRound() {
        const questions = this.game.gameData?.quiz?.[this.monster.cert] || this.game.gameData?.quiz?.cp || [];
        if (questions.length > 0) {
            this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        }
    }
    
    end(victory) {
        if (victory) {
            const expGain = 50 + (this.monster.level * 10);
            const creditsGain = 100 + (this.monster.level * 25);
            
            this.game.player.gainExp(expGain);
            this.game.player.awsCredits += creditsGain;
            this.monster.defeated = true;
            
            // 승리 메시지
            this.showBattleMessage(
                `승리! EXP +${expGain}, AWS 크레딧 +${creditsGain} 획득!`,
                '#FFD700'
            );
        } else {
            this.game.player.hp = this.game.player.maxHp;
            this.showBattleMessage('패배... 다시 도전하자!', '#FF6B6B');
        }
        
        // 3초 후 오버월드로 복귀
        setTimeout(() => {
            this.active = false;
            this.game.gameState = 'overworld';
            this.battleMessage = null;
        }, 3000);
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
        // 데미지 숫자 업데이트
        this.damageNumbers = this.damageNumbers.filter(dmg => {
            dmg.life -= this.game.deltaTime;
            dmg.x += dmg.vx * this.game.deltaTime * 0.001;
            dmg.y += dmg.vy * this.game.deltaTime * 0.001;
            return dmg.life > 0;
        });
        
        // 화면 흔들림 업데이트
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
            if (this.screenShake < 0.1) this.screenShake = 0;
        }
        
        // 배틀 메시지 업데이트
        if (this.battleMessage) {
            this.battleMessage.life -= this.game.deltaTime;
            if (this.battleMessage.life <= 0) {
                this.battleMessage = null;
            }
        }
    }
    
    render() {
        const ctx = this.game.ctx;
        const canvas = this.game.canvas;
        
        // 화면 흔들림 적용
        if (this.screenShake > 0) {
            ctx.save();
            ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }
        
        // 포켓몬 스타일 배틀 배경
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width
        );
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#4682B4');
        gradient.addColorStop(1, '#191970');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 배틀 필드 라인
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.6);
        ctx.lineTo(canvas.width, canvas.height * 0.6);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 몬스터 렌더링
        if (this.monster) {
            this.renderMonster(ctx, canvas.width * 0.7 - 16, canvas.height * 0.25 - 16);
            this.renderMonsterHP(ctx, canvas.width * 0.7, canvas.height * 0.15);
        }
        
        // 플레이어 렌더링 (뒷모습)
        this.renderPlayerBack(ctx, canvas.width * 0.25 - 16, canvas.height * 0.65 - 16);
        this.renderPlayerHP(ctx, canvas.width * 0.3, canvas.height * 0.75);
        
        // 퀴즈 인터페이스
        if (this.currentQuestion && !this.battleMessage) {
            this.renderQuizInterface(ctx, canvas);
        }
        
        // 배틀 메시지 렌더링
        if (this.battleMessage) {
            this.renderBattleMessage(ctx, canvas);
        }
        
        if (this.screenShake > 0) {
            ctx.restore();
        }
        
        // 데미지 숫자 렌더링 (포켓몬 스타일)
        this.damageNumbers.forEach(dmg => {
            const alpha = dmg.life / dmg.maxLife;
            const scale = 1 + (1 - alpha) * 0.5; // 크기 애니메이션
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(dmg.x, dmg.y);
            ctx.scale(scale, scale);
            
            // 데미지 텍스트 외곽선
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.font = 'bold 20px monospace';
            ctx.strokeText(`-${dmg.damage}`, 0, 0);
            
            // 데미지 텍스트
            ctx.fillStyle = dmg.color;
            ctx.fillText(`-${dmg.damage}`, 0, 0);
            
            ctx.restore();
        });
    }
    
    renderPlayerBack(ctx, x, y) {
        // 플레이어 뒷모습 (포켓몬 트레이너 스타일)
        ctx.fillStyle = '#2196F3'; // 파란 셔츠
        ctx.fillRect(x + 6, y + 8, 20, 16);
        
        // 머리
        ctx.fillStyle = '#8D6E63'; // 갈색 머리
        ctx.fillRect(x + 8, y + 2, 16, 10);
        
        // 바지
        ctx.fillStyle = '#424242'; // 검은 바지
        ctx.fillRect(x + 8, y + 20, 16, 12);
        
        // 팔
        ctx.fillStyle = '#FFDBCB'; // 살색
        ctx.fillRect(x + 2, y + 10, 6, 8);
        ctx.fillRect(x + 24, y + 10, 6, 8);
        
        // 다리
        ctx.fillStyle = '#FFDBCB';
        ctx.fillRect(x + 10, y + 28, 4, 6);
        ctx.fillRect(x + 18, y + 28, 4, 6);
    }
    
    renderPlayerHP(ctx, x, y) {
        const player = this.game.player;
        const hpBarWidth = 120;
        const hpBarHeight = 12;
        const hpBarX = x - hpBarWidth / 2;
        
        // HP 바 배경
        ctx.fillStyle = '#424242';
        ctx.fillRect(hpBarX - 2, y - 2, hpBarWidth + 4, hpBarHeight + 4);
        
        // HP 바 (빨간색 배경)
        ctx.fillStyle = '#F44336';
        ctx.fillRect(hpBarX, y, hpBarWidth, hpBarHeight);
        
        // 현재 HP (초록색)
        const hpPercent = player.hp / player.maxHp;
        ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.2 ? '#FF9800' : '#F44336';
        ctx.fillRect(hpBarX, y, hpBarWidth * hpPercent, hpBarHeight);
        
        // 플레이어 이름
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${player.name} Lv.${player.level}`, hpBarX, y - 8);
        
        // HP 수치
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${player.hp}/${player.maxHp}`, hpBarX + hpBarWidth, y + 10);
    }
    
    renderBattleMessage(ctx, canvas) {
        const message = this.battleMessage;
        if (!message) return;
        
        const alpha = message.life / message.maxLife;
        
        // 메시지 박스
        ctx.save();
        ctx.globalAlpha = alpha;
        
        const boxHeight = 80;
        const boxY = canvas.height - boxHeight - 20;
        
        // 메시지 박스 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(20, boxY, canvas.width - 40, boxHeight);
        
        // 메시지 박스 테두리
        ctx.strokeStyle = message.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(20, boxY, canvas.width - 40, boxHeight);
        
        // 메시지 텍스트
        ctx.fillStyle = message.color;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        
        // 텍스트 줄바꿈 처리
        const maxWidth = canvas.width - 80;
        const words = message.text.split(' ');
        let line = '';
        let y = boxY + 35;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, canvas.width / 2, y);
                line = words[n] + ' ';
                y += 20;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, canvas.width / 2, y);
        
        ctx.restore();
    }
    }
    
    renderMonster(ctx, x, y) {
        const monster = this.monster;
        const time = this.game.time * 0.001;
        
        // 몬스터 바운스 애니메이션
        const bounce = Math.sin(time * 4) * 2;
        const actualY = y + bounce;
        
        // AWS 서비스별 몬스터 디자인
        switch(monster.cert) {
            case 'saa':
                this.renderSAAMonster(ctx, x, actualY);
                break;
            case 'cp':
                this.renderCPMonster(ctx, x, actualY);
                break;
            case 'dva':
                this.renderDVAMonster(ctx, x, actualY);
                break;
            case 'sap':
                this.renderSAPMonster(ctx, x, actualY);
                break;
            default:
                this.renderDefaultMonster(ctx, x, actualY);
        }
        
        // 몬스터 그림자
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.ellipse(x + 16, y + 32, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderSAAMonster(ctx, x, y) {
        // Solutions Architect 몬스터 (구름 모양)
        ctx.fillStyle = '#FF9900';
        ctx.fillRect(x + 4, y + 8, 24, 16);
        ctx.fillRect(x + 8, y + 4, 16, 8);
        ctx.fillRect(x + 2, y + 12, 28, 8);
        
        // 눈
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 10, y + 10, 3, 3);
        ctx.fillRect(x + 19, y + 10, 3, 3);
        
        // 눈동자
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 11, y + 11, 1, 1);
        ctx.fillRect(x + 20, y + 11, 1, 1);
    }
    
    renderCPMonster(ctx, x, y) {
        // Cloud Practitioner 몬스터 (간단한 구름)
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + 6, y + 10, 20, 12);
        ctx.fillRect(x + 10, y + 6, 12, 8);
        
        // 눈
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 12, y + 12, 2, 2);
        ctx.fillRect(x + 18, y + 12, 2, 2);
    }
    
    renderDVAMonster(ctx, x, y) {
        // Developer Associate 몬스터 (코드 블록 모양)
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x + 4, y + 6, 24, 20);
        
        // 코드 라인들
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(x + 6, y + 10, 8, 2);
        ctx.fillRect(x + 6, y + 14, 12, 2);
        ctx.fillRect(x + 6, y + 18, 6, 2);
        
        // 눈
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 18, y + 10, 3, 3);
        ctx.fillRect(x + 22, y + 10, 3, 3);
    }
    
    renderSAPMonster(ctx, x, y) {
        // Solutions Architect Professional 몬스터 (복잡한 아키텍처)
        ctx.fillStyle = '#9C27B0';
        ctx.fillRect(x + 2, y + 4, 28, 24);
        
        // 아키텍처 패턴
        ctx.fillStyle = '#E1BEE7';
        ctx.fillRect(x + 4, y + 8, 6, 6);
        ctx.fillRect(x + 12, y + 8, 6, 6);
        ctx.fillRect(x + 20, y + 8, 6, 6);
        ctx.fillRect(x + 8, y + 16, 12, 6);
        
        // 연결선
        ctx.fillStyle = '#7B1FA2';
        ctx.fillRect(x + 10, y + 14, 2, 2);
        ctx.fillRect(x + 18, y + 14, 2, 2);
        
        // 눈
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 10, y + 6, 3, 3);
        ctx.fillRect(x + 19, y + 6, 3, 3);
    }
    
    renderDefaultMonster(ctx, x, y) {
        // 기본 AWS 몬스터
        ctx.fillStyle = '#FF9900';
        ctx.fillRect(x + 8, y + 8, 16, 16);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 12, y + 12, 2, 2);
        ctx.fillRect(x + 18, y + 12, 2, 2);
    }
    
    renderMonsterHP(ctx, x, y) {
        const hpBarWidth = 180;
        const hpBarHeight = 16;
        const hpBarX = x - hpBarWidth / 2;
        
        // HP 바 배경
        ctx.fillStyle = '#424242';
        ctx.fillRect(hpBarX - 2, y - 2, hpBarWidth + 4, hpBarHeight + 4);
        
        // HP 바 (빨간색 배경)
        ctx.fillStyle = '#F44336';
        ctx.fillRect(hpBarX, y, hpBarWidth, hpBarHeight);
        
        // 현재 HP (초록색)
        const hpPercent = this.monster.hp / this.monster.maxHp;
        ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.2 ? '#FF9800' : '#F44336';
        ctx.fillRect(hpBarX, y, hpBarWidth * hpPercent, hpBarHeight);
        
        // 몬스터 이름 및 레벨
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${this.monster.name} Lv.${this.monster.level}`, hpBarX, y - 8);
        
        // HP 수치
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${this.monster.hp}/${this.monster.maxHp}`, hpBarX + hpBarWidth, y + 10);
        
        // 자격증 배지
        ctx.fillStyle = this.getCertColor(this.monster.cert);
        ctx.fillRect(hpBarX + hpBarWidth + 10, y - 5, 40, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.monster.cert.toUpperCase(), hpBarX + hpBarWidth + 30, y + 7);
    }
    
    getCertColor(cert) {
        switch(cert) {
            case 'cp': return '#87CEEB';
            case 'saa': return '#FF9900';
            case 'dva': return '#4CAF50';
            case 'sap': return '#9C27B0';
            default: return '#607D8B';
        }
    }
    
    renderQuizInterface(ctx, canvas) {
        const question = this.currentQuestion;
        
        // 포켓몬 스타일 배틀 UI 배경
        const uiHeight = 200;
        const uiY = canvas.height - uiHeight;
        
        // UI 배경 그라데이션
        const gradient = ctx.createLinearGradient(0, uiY, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(30, 30, 30, 0.95)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, uiY, canvas.width, uiHeight);
        
        // UI 테두리
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, uiY + 10, canvas.width - 20, uiHeight - 20);
        
        // 질문 배경
        ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        ctx.fillRect(20, uiY + 20, canvas.width - 40, 50);
        
        // 질문 텍스트
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        
        // 질문 텍스트 줄바꿈 처리
        const maxWidth = canvas.width - 60;
        const words = question.question.split(' ');
        let line = '';
        let y = uiY + 45;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, 30, y);
                line = words[n] + ' ';
                y += 20;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 30, y);
        
        // 선택지 렌더링 (포켓몬 스타일)
        question.options.forEach((option, index) => {
            const optionY = uiY + 90 + index * 25;
            const optionX = 30;
            
            // 선택지 배경
            ctx.fillStyle = index % 2 === 0 ? 'rgba(70, 130, 180, 0.3)' : 'rgba(100, 149, 237, 0.3)';
            ctx.fillRect(optionX - 5, optionY - 15, canvas.width - 70, 22);
            
            // 선택지 테두리
            ctx.strokeStyle = '#4682B4';
            ctx.lineWidth = 1;
            ctx.strokeRect(optionX - 5, optionY - 15, canvas.width - 70, 22);
            
            // 선택지 번호 (포켓몬 스타일 버튼)
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(optionX - 3, optionY - 13, 18, 18);
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.strokeRect(optionX - 3, optionY - 13, 18, 18);
            
            // 선택지 번호 텍스트
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${index + 1}`, optionX + 6, optionY - 2);
            
            // 선택지 텍스트
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(option, optionX + 25, optionY);
        });
        
        // 하단 안내 메시지
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 1-4 키를 눌러 답을 선택하세요!', canvas.width / 2, canvas.height - 15);
        
        // 자격증 정보 표시
        if (question.certInfo) {
            ctx.fillStyle = '#87CEEB';
            ctx.font = '10px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`💡 ${this.monster.cert.toUpperCase()}`, canvas.width - 20, uiY + 30);
        }
    }
}