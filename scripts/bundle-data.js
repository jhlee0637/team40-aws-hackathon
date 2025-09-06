#!/usr/bin/env node

/**
 * AWS 노들섬 퀴즈 RPG - 데이터 번들링 스크립트
 * 모든 JSON 파일을 하나로 합쳐서 로딩 성능을 최적화합니다.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const outputFile = path.join(__dirname, '../src/data/bundled-data.js');

// 출력 디렉토리 생성
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function bundleData() {
    console.log('🔧 데이터 번들링 시작...');
    
    const bundledData = {
        config: {},
        entities: {},
        quiz: {},
        maps: {},
        version: Date.now(),
        timestamp: new Date().toISOString()
    };
    
    try {
        // Config 데이터 로딩
        console.log('📋 Config 데이터 로딩...');
        const configDir = path.join(dataDir, 'config');
        if (fs.existsSync(configDir)) {
            const configFiles = fs.readdirSync(configDir);
            for (const file of configFiles) {
                if (file.endsWith('.json')) {
                    const fileName = path.basename(file, '.json');
                    const filePath = path.join(configDir, file);
                    bundledData.config[fileName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    console.log(`  ✅ ${file}`);
                }
            }
        }
        
        // Entities 데이터 로딩
        console.log('👾 Entities 데이터 로딩...');
        const entitiesDir = path.join(dataDir, 'entities');
        if (fs.existsSync(entitiesDir)) {
            const entityFiles = fs.readdirSync(entitiesDir);
            for (const file of entityFiles) {
                if (file.endsWith('.json')) {
                    const fileName = path.basename(file, '.json');
                    const filePath = path.join(entitiesDir, file);
                    bundledData.entities[fileName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    console.log(`  ✅ ${file}`);
                }
            }
        }
        
        // Quiz 데이터 로딩
        console.log('🧠 Quiz 데이터 로딩...');
        const quizDir = path.join(dataDir, 'quiz');
        if (fs.existsSync(quizDir)) {
            const quizFiles = fs.readdirSync(quizDir);
            for (const file of quizFiles) {
                if (file.endsWith('.json')) {
                    const fileName = path.basename(file, '.json');
                    const filePath = path.join(quizDir, file);
                    bundledData.quiz[fileName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    console.log(`  ✅ ${file}`);
                }
            }
        }
        
        // Maps 데이터 로딩
        console.log('🗺️ Maps 데이터 로딩...');
        const mapsDir = path.join(dataDir, 'maps');
        if (fs.existsSync(mapsDir)) {
            const mapFiles = fs.readdirSync(mapsDir);
            for (const file of mapFiles) {
                if (file.endsWith('.json')) {
                    const fileName = path.basename(file, '.json');
                    const filePath = path.join(mapsDir, file);
                    bundledData.maps[fileName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    console.log(`  ✅ ${file}`);
                }
            }
        }
        
        // ES6 모듈로 내보내기
        const exportContent = `/**
 * 자동 생성된 번들 데이터 파일
 * 생성 시간: ${bundledData.timestamp}
 * 
 * 이 파일은 자동으로 생성됩니다. 직접 편집하지 마세요.
 * 대신 data/ 폴더의 JSON 파일을 편집하고 npm run bundle을 실행하세요.
 */

export const GAME_DATA = ${JSON.stringify(bundledData, null, 2)};

export default GAME_DATA;
`;
        
        fs.writeFileSync(outputFile, exportContent, 'utf8');
        
        // 통계 출력
        const stats = {
            configFiles: Object.keys(bundledData.config).length,
            entityTypes: Object.keys(bundledData.entities).length,
            quizCategories: Object.keys(bundledData.quiz).length,
            mapFiles: Object.keys(bundledData.maps).length,
            totalQuestions: Object.values(bundledData.quiz).reduce((total, questions) => total + questions.length, 0),
            totalMonsters: bundledData.entities.monsters ? bundledData.entities.monsters.length : 0,
            totalGymLeaders: bundledData.entities.gymLeaders ? bundledData.entities.gymLeaders.length : 0
        };
        
        console.log('\n🎉 번들링 완료!');
        console.log('📊 통계:');
        console.log(`  📋 Config 파일: ${stats.configFiles}개`);
        console.log(`  👾 Entity 타입: ${stats.entityTypes}개`);
        console.log(`  🧠 퀴즈 카테고리: ${stats.quizCategories}개`);
        console.log(`  🗺️ 맵 파일: ${stats.mapFiles}개`);
        console.log(`  📝 총 퀴즈 문제: ${stats.totalQuestions}개`);
        console.log(`  👹 총 몬스터: ${stats.totalMonsters}마리`);
        console.log(`  🏆 총 체육관 관장: ${stats.totalGymLeaders}명`);
        console.log(`\n💾 출력 파일: ${outputFile}`);
        
        // 개발/프로덕션 모드 파일도 생성
        await generateModeFiles(bundledData);
        
    } catch (error) {
        console.error('❌ 번들링 오류:', error);
        process.exit(1);
    }
}

async function generateModeFiles(bundledData) {
    // 개발 모드 (분리된 파일로 개발 편의성 유지)
    const devFile = path.join(__dirname, '../src/data/data-dev.js');
    const devContent = `/**
 * 개발 모드 데이터 로더
 * 개발 시에는 개별 JSON 파일을 동적으로 로딩합니다.
 */

export class DevDataLoader {
    static async loadData() {
        const data = { config: {}, entities: {}, quiz: {}, maps: {} };
        
        try {
            // 실제 환경에서는 fetch를 사용하여 개별 파일 로딩
            const responses = await Promise.all([
                fetch('/data/config/game.json'),
                fetch('/data/config/ui.json'),
                fetch('/data/entities/monsters.json'),
                fetch('/data/entities/gymLeaders.json'),
                fetch('/data/entities/npcs.json'),
                fetch('/data/quiz/cp.json'),
                fetch('/data/quiz/saa.json'),
                fetch('/data/quiz/dva.json'),
                fetch('/data/quiz/sap.json'),
                fetch('/data/maps/nodeul-island.json'),
                fetch('/data/maps/tiles.json')
            ]);
            
            const files = await Promise.all(responses.map(r => r.json()));
            
            data.config.game = files[0];
            data.config.ui = files[1];
            data.entities.monsters = files[2];
            data.entities.gymLeaders = files[3];
            data.entities.npcs = files[4];
            data.quiz.cp = files[5];
            data.quiz.saa = files[6];
            data.quiz.dva = files[7];
            data.quiz.sap = files[8];
            data.maps['nodeul-island'] = files[9];
            data.maps.tiles = files[10];
            
            return data;
        } catch (error) {
            console.warn('개발 모드 로딩 실패, 번들 데이터 사용:', error);
            return bundledData;
        }
    }
}
`;
    
    fs.writeFileSync(devFile, devContent);
    console.log(`  🔧 개발 모드 파일: ${devFile}`);
}

// 실행
if (require.main === module) {
    bundleData();
}

module.exports = { bundleData };
