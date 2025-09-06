#!/usr/bin/env python3
"""
AWS 노들섬 퀴즈 RPG - 데이터 번들링 스크립트 (Python 버전)
모든 JSON 파일을 하나로 합쳐서 로딩 성능을 최적화합니다.
"""

import os
import json
import datetime
from pathlib import Path

def bundle_data():
    """모든 JSON 데이터를 번들링하여 JavaScript 파일로 출력"""
    
    print("🔧 데이터 번들링 시작...")
    
    # 경로 설정
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    data_dir = project_dir / "data"
    output_dir = project_dir / "src" / "data"
    output_file = output_dir / "bundled-data.js"
    
    # 출력 디렉토리 생성
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 번들 데이터 구조 초기화
    bundled_data = {
        "config": {},
        "entities": {},
        "quiz": {},
        "maps": {},
        "version": int(datetime.datetime.now().timestamp() * 1000),
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    try:
        # Config 데이터 로딩
        print("📋 Config 데이터 로딩...")
        config_dir = data_dir / "config"
        if config_dir.exists():
            for file_path in config_dir.glob("*.json"):
                file_name = file_path.stem
                with open(file_path, 'r', encoding='utf-8') as f:
                    bundled_data["config"][file_name] = json.load(f)
                print(f"  ✅ {file_path.name}")
        
        # Entities 데이터 로딩
        print("👾 Entities 데이터 로딩...")
        entities_dir = data_dir / "entities"
        if entities_dir.exists():
            for file_path in entities_dir.glob("*.json"):
                file_name = file_path.stem
                with open(file_path, 'r', encoding='utf-8') as f:
                    bundled_data["entities"][file_name] = json.load(f)
                print(f"  ✅ {file_path.name}")
        
        # Quiz 데이터 로딩
        print("🧠 Quiz 데이터 로딩...")
        quiz_dir = data_dir / "quiz"
        if quiz_dir.exists():
            for file_path in quiz_dir.glob("*.json"):
                file_name = file_path.stem
                with open(file_path, 'r', encoding='utf-8') as f:
                    bundled_data["quiz"][file_name] = json.load(f)
                print(f"  ✅ {file_path.name}")
        
        # Maps 데이터 로딩
        print("🗺️ Maps 데이터 로딩...")
        maps_dir = data_dir / "maps"
        if maps_dir.exists():
            for file_path in maps_dir.glob("*.json"):
                file_name = file_path.stem
                with open(file_path, 'r', encoding='utf-8') as f:
                    bundled_data["maps"][file_name] = json.load(f)
                print(f"  ✅ {file_path.name}")
        
        # ES6 모듈로 내보내기
        export_content = f"""/**
 * 자동 생성된 번들 데이터 파일
 * 생성 시간: {bundled_data["timestamp"]}
 * 
 * 이 파일은 자동으로 생성됩니다. 직접 편집하지 마세요.
 * 대신 data/ 폴더의 JSON 파일을 편집하고 python scripts/bundle-data.py를 실행하세요.
 */

export const GAME_DATA = {json.dumps(bundled_data, ensure_ascii=False, indent=2)};

export default GAME_DATA;
"""
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(export_content)
        
        # 통계 계산
        stats = {
            "config_files": len(bundled_data["config"]),
            "entity_types": len(bundled_data["entities"]),
            "quiz_categories": len(bundled_data["quiz"]),
            "map_files": len(bundled_data["maps"]),
            "total_questions": sum(len(questions) for questions in bundled_data["quiz"].values()),
            "total_monsters": len(bundled_data["entities"].get("monsters", [])),
            "total_gym_leaders": len(bundled_data["entities"].get("gymLeaders", []))
        }
        
        # 결과 출력
        print("\n🎉 번들링 완료!")
        print("📊 통계:")
        print(f"  📋 Config 파일: {stats['config_files']}개")
        print(f"  👾 Entity 타입: {stats['entity_types']}개")
        print(f"  🧠 퀴즈 카테고리: {stats['quiz_categories']}개")
        print(f"  🗺️ 맵 파일: {stats['map_files']}개")
        print(f"  📝 총 퀴즈 문제: {stats['total_questions']}개")
        print(f"  👹 총 몬스터: {stats['total_monsters']}마리")
        print(f"  🏆 총 체육관 관장: {stats['total_gym_leaders']}명")
        print(f"\n💾 출력 파일: {output_file}")
        
        # DataLoader 클래스 생성
        generate_data_loader(project_dir, bundled_data)
        
    except Exception as error:
        print(f"❌ 번들링 오류: {error}")
        return False
    
    return True

def generate_data_loader(project_dir, bundled_data):
    """데이터 로더 클래스를 생성합니다"""
    
    loader_file = project_dir / "src" / "utils" / "DataLoader.js"
    loader_dir = loader_file.parent
    loader_dir.mkdir(parents=True, exist_ok=True)
    
    loader_content = """/**
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
"""
    
    with open(loader_file, 'w', encoding='utf-8') as f:
        f.write(loader_content)
    
    print(f"  🔧 DataLoader 생성: {loader_file}")

if __name__ == "__main__":
    success = bundle_data()
    if success:
        print("\n🎮 번들링이 완료되었습니다! 이제 게임을 실행해보세요.")
        print("   python -m http.server 8000")
    else:
        print("\n❌ 번들링에 실패했습니다.")
        exit(1)
