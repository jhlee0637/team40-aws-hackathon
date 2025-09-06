export class EntityManager {
    constructor(game) {
        this.game = game;
        this.monsters = [];
        this.npcs = [];
    }
    
    init(gameData) {
        if (gameData && gameData.entities) {
            this.monsters = gameData.entities.monsters || [];
            this.npcs = gameData.entities.npcs || [];
        }
    }
    
    update() {
        // 몬스터 업데이트 로직
    }
    
    render() {
        // 엔티티 렌더링 로직
    }
}