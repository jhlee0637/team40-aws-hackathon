import { GAME_DATA } from '../data/bundled-data.js';

export class DataLoader {
    static async loadGameData() {
        try {
            console.log('📦 번들된 게임 데이터 로딩...');
            return GAME_DATA;
        } catch (error) {
            console.error('❌ 게임 데이터 로딩 실패:', error);
            throw error;
        }
    }
}