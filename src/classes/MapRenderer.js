export class MapRenderer {
    constructor(game, gameData) {
        this.game = game;
        this.gameData = gameData;
    }
    
    renderOverworld() {
        // 기본 맵 렌더링은 Game 클래스에서 처리
        this.game.renderMap();
    }
}