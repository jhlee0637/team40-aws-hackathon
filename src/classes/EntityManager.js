export class EntityManager {
    constructor(game) {
        this.game = game;
        this.monsters = [];
        this.gymLeaders = [];
        this.npcs = [];
    }
    
    init(gameData) {
        this.monsters = gameData.entities.monsters;
        this.gymLeaders = gameData.entities.gymLeaders;
        this.npcs = gameData.entities.npcs || [];
    }
    
    update() {
        this.updateMonsters();
        this.checkInteractions();
    }
    
    updateMonsters() {
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            monster.moveTimer += this.game.deltaTime;
            if (monster.moveTimer > 3000) {
                this.moveMonster(monster);
                monster.moveTimer = 0;
            }
        });
    }
    
    moveMonster(monster) {
        const directions = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
        const dir = directions[Math.floor(Math.random() * 4)];
        
        const newX = monster.x + dir.x;
        const newY = monster.y + dir.y;
        
        if (this.isValidPosition(newX, newY)) {
            monster.x = newX;
            monster.y = newY;
        }
    }
    
    isValidPosition(x, y) {
        if (x < 0 || x >= this.game.mapWidth || y < 0 || y >= this.game.mapHeight) {
            return false;
        }
        
        return this.game.collisionMap[y][x] === 0;
    }
    
    checkInteractions() {
        const playerTileX = Math.floor(this.game.player.x / this.game.tileSize);
        const playerTileY = Math.floor(this.game.player.y / this.game.tileSize);
        
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            const distance = Math.sqrt(
                Math.pow(monster.x - playerTileX, 2) + 
                Math.pow(monster.y - playerTileY, 2)
            );
            
            if (distance < 1.5) {
                this.game.battleSystem.start(monster);
            }
        });
        
        if (this.game.inputManager.isPressed('interact')) {
            this.gymLeaders.forEach(leader => {
                const distance = Math.sqrt(
                    Math.pow(leader.x - playerTileX, 2) + 
                    Math.pow(leader.y - playerTileY, 2)
                );
                
                if (distance < 2) {
                    this.startGymBattle(leader);
                }
            });
        }
    }
    
    startGymBattle(leader) {
        const dialogueText = leader.dialogue.join('\n\n');
        alert(dialogueText);
        
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
${details.domains.map(domain => `• ${domain}`).join('\n')}

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
            this.game.battleSystem.start(gymMonster);
        }
    }
    
    render(mapRenderer) {
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            const screenX = monster.x * this.game.tileSize - this.game.camera.x;
            const screenY = monster.y * this.game.tileSize - this.game.camera.y;
            
            mapRenderer.renderMonster(monster, screenX, screenY);
        });
        
        this.gymLeaders.forEach(leader => {
            if (leader.defeated) return;
            
            const screenX = leader.x * this.game.tileSize - this.game.camera.x;
            const screenY = leader.y * this.game.tileSize - this.game.camera.y;
            
            mapRenderer.renderGymLeader(leader, screenX, screenY);
        });
    }
}