/**
 * 통합 데이터 로더
 * 번들된 데이터와 개별 JSON 파일 로딩을 지원합니다.
 */

import { GAME_DATA } from '../data/bundled-data.js';

export class DataLoader {
    static bundledData = null;
    static loadingPromise = null;
    
    /**
     * 게임 데이터를 로드합니다 (번들 우선, 실패시 개별 파일)
     */
    static async loadGameData() {
        if (this.bundledData) {
            return this.bundledData;
        }
        
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        
        this.loadingPromise = this._loadData();
        this.bundledData = await this.loadingPromise;
        return this.bundledData;
    }
    
    static async _loadData() {
        try {
            // 번들된 데이터 사용
            console.log('📦 번들된 데이터 로딩 중...');
            return GAME_DATA;
            
        } catch (error) {
            console.warn('번들 데이터 로딩 실패, 개별 파일 로딩 시도:', error);
            return this._loadIndividualFiles();
        }
    }
    
    static async _loadIndividualFiles() {
        console.log('📁 개별 JSON 파일 로딩 중...');
        
        const data = {
            config: {},
            entities: {},
            quiz: {},
            maps: {}
        };
        
        try {
            // 병렬 로딩으로 성능 최적화
            const [
                gameConfig,
                uiConfig,
                monsters,
                gymLeaders,
                npcs,
                cpQuiz,
                saaQuiz,
                dvaQuiz,
                sapQuiz,
                mapData,
                tileData
            ] = await Promise.all([
                this._fetchJSON('/data/config/game.json'),
                this._fetchJSON('/data/config/ui.json'),
                this._fetchJSON('/data/entities/monsters.json'),
                this._fetchJSON('/data/entities/gymLeaders.json'),
                this._fetchJSON('/data/entities/npcs.json'),
                this._fetchJSON('/data/quiz/cp.json'),
                this._fetchJSON('/data/quiz/saa.json'),
                this._fetchJSON('/data/quiz/dva.json'),
                this._fetchJSON('/data/quiz/sap.json'),
                this._fetchJSON('/data/maps/nodeul-island.json'),
                this._fetchJSON('/data/maps/tiles.json')
            ]);
            
            // 데이터 구조화
            data.config.game = gameConfig;
            data.config.ui = uiConfig;
            data.entities.monsters = monsters;
            data.entities.gymLeaders = gymLeaders;
            data.entities.npcs = npcs;
            data.quiz.cp = cpQuiz;
            data.quiz.saa = saaQuiz;
            data.quiz.dva = dvaQuiz;
            data.quiz.sap = sapQuiz;
            data.maps['nodeul-island'] = mapData;
            data.maps.tiles = tileData;
            
            console.log('✅ 개별 파일 로딩 완료!');
            return data;
            
        } catch (error) {
            console.error('❌ 데이터 로딩 실패:', error);
            throw new Error('게임 데이터를 로드할 수 없습니다.');
        }
    }
    
    static async _fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${url}`);
        }
        return response.json();
    }
    
    /**
     * 특정 퀴즈 카테고리의 문제를 가져옵니다
     */
    static getQuizData(category = 'cp') {
        return this.bundledData?.quiz[category] || [];
    }
    
    /**
     * 몬스터 데이터를 가져옵니다
     */
    static getMonsters() {
        return this.bundledData?.entities?.monsters || [];
    }
    
    /**
     * 체육관 관장 데이터를 가져옵니다
     */
    static getGymLeaders() {
        return this.bundledData?.entities?.gymLeaders || [];
    }
    
    /**
     * 게임 설정을 가져옵니다
     */
    static getGameConfig() {
        return this.bundledData?.config?.game || {};
    }
}
