/**
 * AWS 노들섬 퀴즈 배틀 RPG
 * 16-bit 픽셀 아트 스타일 포켓몬 스타일 퀴즈 배틀 게임
 */

class AWSNodeulQuest {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // 게임 상태
        this.gameState = 'overworld'; // overworld, battle, dialogue, menu
        this.time = 0;
        this.deltaTime = 0;
        this.lastTime = performance.now();
        
        // SVG 스프라이트 시스템
        this.sprites = {
            buildings: null,
            player: null,
            monsters: null,
            npc: null
        };
        this.spritesLoaded = false;
        
        // 플레이어
        this.player = {
            x: 400, y: 600, width: 16, height: 16, speed: 2,
            direction: 'down', moving: false, animFrame: 0, animSpeed: 0.15,
            hp: 100, maxHp: 100, level: 1, exp: 0, expToNext: 100,
            certifications: new Set(), awsCredits: 1000,
            badges: [], name: '클라우드 엔지니어'
        };
        
        // 카메라 (16-bit 스타일)
        this.camera = { 
            x: 0, y: 0, targetX: 0, targetY: 0, 
            smoothing: 0.08, shake: 0 
        };
        
        // 노들섬 맵 설정
        this.tileSize = 16;
        this.mapWidth = 80;
        this.mapHeight = 60;
        this.map = [];
        this.mapLayers = { background: [], collision: [], decoration: [] };
        this.collisionMap = []; // 별도 충돌 맵
        
        // 포켓몬 스타일 배틀 시스템
        this.battleState = {
            active: false, 
            opponent: null, 
            currentQuestion: null,
            phase: 'intro', // intro, question, result, victory, defeat
            turnCount: 0,
            correctAnswers: 0,
            damageNumbers: [], 
            screenShake: 0,
            battleMusic: null
        };
        
        // 입력 시스템
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        this.inputBuffer = [];
        
        // 엔티티들
        this.awsMonsters = [];
        this.gymLeaders = [];
        this.npcs = [];
        this.particles = [];
        this.effects = [];
        
        // AWS 퀴즈 데이터베이스
        this.quizDatabase = this.createAWSQuizDatabase();
        
        // 16-bit 픽셀 아트 색상 팔레트
        this.colorPalette = this.createColorPalette();
        
        this.loadSprites().then(() => {
            this.initializeGame();
        });
    }
    
    async loadSprites() {
        const spriteFiles = ['buildings', 'player', 'monsters', 'npc'];
        
        for (const sprite of spriteFiles) {
            try {
                const response = await fetch(`assets/sprites/${sprite}.svg`);
                const svgText = await response.text();
                const img = new Image();
                const blob = new Blob([svgText], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(blob);
                
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.src = url;
                });
                
                this.sprites[sprite] = img;
                URL.revokeObjectURL(url);
            } catch (error) {
                console.warn(`Failed to load ${sprite}.svg:`, error);
            }
        }
        
        this.spritesLoaded = true;
        console.log('🎨 스프라이트 로딩 완료!');
    }
    
    initializeGame() {
        this.generateNodeulMap();
        this.setupMonsters();
        this.setupGymLeaders();
        this.setupEventHandlers();
        
        console.log('🎮 AWS 노들섬 퀴즈 배틀 RPG 시작!');
        this.gameLoop();
    }
    
    createAWSQuizDatabase() {
        return {
            cp: [
                {
                    question: "AWS 클라우드의 6가지 장점 중 하나가 아닌 것은?",
                    options: ["민첩성 향상", "비용 절감", "데이터 소유권 보장", "글로벌 확장"],
                    correct: 2,
                    explanation: "AWS는 데이터 소유권을 보장하지 않습니다. 고객이 데이터를 소유합니다.",
                    difficulty: 1,
                    certInfo: "AWS Certified Cloud Practitioner (CLF-C01)는 AWS 클라우드의 기본 개념과 서비스를 이해하는 입문 자격증입니다. 클라우드 컴퓨팅의 기본 원리, AWS 핵심 서비스, 보안, 아키텍처, 요금 및 지원을 다룹니다."
                },
                {
                    question: "S3 버킷 이름의 특징은?",
                    options: ["리전별로 고유", "계정별로 고유", "전 세계적으로 고유", "AZ별로 고유"],
                    correct: 2,
                    explanation: "S3 버킷 이름은 전 세계적으로 고유해야 합니다.",
                    difficulty: 1,
                    certInfo: "S3는 AWS의 핵심 스토리지 서비스로, 99.999999999%(11 9's)의 내구성을 제공합니다."
                },
                {
                    question: "EC2 인스턴스의 기본 모니터링 간격은?",
                    options: ["1분", "5분", "10분", "15분"],
                    correct: 1,
                    explanation: "EC2 기본 모니터링은 5분 간격으로 수행됩니다.",
                    difficulty: 1,
                    certInfo: "EC2는 AWS의 가상 서버 서비스로, 다양한 인스턴스 타입과 운영체제를 지원합니다."
                }
            ],
            saa: [
                {
                    question: "Multi-AZ RDS 배포의 주요 목적은?",
                    options: ["성능 향상", "고가용성", "비용 절감", "보안 강화"],
                    correct: 1,
                    explanation: "Multi-AZ는 고가용성과 자동 장애 조치를 제공합니다.",
                    difficulty: 2,
                    certInfo: "AWS Certified Solutions Architect Associate (SAA-C03)는 AWS에서 확장 가능하고 안정적인 시스템을 설계하는 능력을 검증합니다. 컴퓨팅, 네트워킹, 스토리지, 데이터베이스 서비스의 아키텍처 설계를 다룹니다."
                },
                {
                    question: "ELB의 종류가 아닌 것은?",
                    options: ["Application Load Balancer", "Network Load Balancer", "Classic Load Balancer", "Database Load Balancer"],
                    correct: 3,
                    explanation: "Database Load Balancer는 존재하지 않습니다.",
                    difficulty: 2,
                    certInfo: "ELB는 트래픽을 여러 대상에 자동으로 분산하여 애플리케이션의 가용성을 높입니다."
                }
            ],
            dva: [
                {
                    question: "Lambda 함수의 최대 메모리 할당량은?",
                    options: ["1GB", "3GB", "10GB", "무제한"],
                    correct: 2,
                    explanation: "Lambda 함수는 최대 10GB까지 메모리를 할당할 수 있습니다.",
                    difficulty: 3,
                    certInfo: "AWS Certified Developer Associate (DVA-C01)는 AWS 서비스를 사용한 애플리케이션 개발 및 배포 능력을 검증합니다. 서버리스, 컨테이너, API, 데이터베이스 개발을 다룹니다."
                },
                {
                    question: "DynamoDB의 주요 특징은?",
                    options: ["관계형 데이터베이스", "NoSQL 데이터베이스", "인메모리 데이터베이스", "그래프 데이터베이스"],
                    correct: 1,
                    explanation: "DynamoDB는 완전 관리형 NoSQL 데이터베이스입니다.",
                    difficulty: 3,
                    certInfo: "DynamoDB는 한 자릿수 밀리초 성능을 제공하는 완전 관리형 NoSQL 데이터베이스입니다."
                }
            ],
            sap: [
                {
                    question: "AWS Organizations의 주요 기능은?",
                    options: ["비용 관리", "계정 통합 관리", "보안 강화", "성능 최적화"],
                    correct: 1,
                    explanation: "AWS Organizations는 여러 AWS 계정을 중앙에서 관리할 수 있게 해줍니다.",
                    difficulty: 4,
                    certInfo: "AWS Certified Solutions Architect Professional (SAP-C01)는 복잡한 엔터프라이즈 아키텍처 설계 및 구현 능력을 검증하는 고급 자격증입니다. 대규모 시스템 설계, 마이그레이션, 비용 최적화를 다룹니다."
                },
                {
                    question: "AWS Control Tower의 목적은?",
                    options: ["멀티 계정 환경 설정", "비용 최적화", "보안 감사", "성능 모니터링"],
                    correct: 0,
                    explanation: "Control Tower는 안전하고 규정을 준수하는 멀티 계정 환경을 설정합니다.",
                    difficulty: 4,
                    certInfo: "AWS Control Tower는 멀티 계정 AWS 환경을 설정하고 관리하는 서비스입니다."
                }
            ]
        };
    }
    
    createColorPalette() {
        return {
            // 16-bit 스타일 색상 팔레트
            grass: ['#2D5016', '#3E6B1F', '#4F7F28', '#6B9B37'],
            water: ['#1B4F72', '#2E86AB', '#A23B72', '#F18F01'],
            stone: ['#5D4E37', '#8B7355', '#A0826D', '#C19A6B'],
            wood: ['#3C2415', '#5D4037', '#8D6E63', '#A1887F'],
            roof: ['#8B0000', '#B22222', '#DC143C', '#FF6347'],
            skin: ['#FFDBAC', '#F5DEB3', '#DEB887', '#D2B48C'],
            hair: ['#2C1810', '#654321', '#8B4513', '#A0522D'],
            clothes: ['#1565C0', '#2E7D32', '#FF9900', '#9C27B0']
        };
    }
    
    generateNodeulMap() {
        // 노들섬 맵 레이어 초기화
        this.mapLayers.background = [];
        this.mapLayers.collision = [];
        this.mapLayers.decoration = [];
        this.collisionMap = [];
        
        for (let y = 0; y < this.mapHeight; y++) {
            const bgRow = [];
            const collisionRow = [];
            const decorationRow = [];
            
            for (let x = 0; x < this.mapWidth; x++) {
                // 지역별 기본 타일 설정
                if (x < 25) {
                    bgRow.push(1); // 초보자 구역 - 잔디
                } else if (x < 50) {
                    bgRow.push(15); // 중급자 숲 - 숲 타일
                } else {
                    bgRow.push(16); // 고급자 산 - 산 타일
                }
                collisionRow.push(0);
                decorationRow.push(0);
            }
            
            this.mapLayers.background.push(bgRow);
            this.mapLayers.collision.push(collisionRow);
            this.mapLayers.decoration.push(decorationRow);
            this.collisionMap.push([...collisionRow]);
        }
        
        this.map = this.mapLayers.background;
        
        // 한강 (노들섬을 둘러싸는 자연스러운 곡선)
        for (let x = 0; x < this.mapWidth; x++) {
            const progress = x / this.mapWidth;
            const riverTop = 8 + Math.sin(progress * Math.PI * 1.5) * 3;
            for (let offset = -3; offset <= 3; offset++) {
                const riverY = Math.floor(riverTop + offset);
                if (riverY >= 0 && riverY < this.mapHeight) {
                    this.mapLayers.background[riverY][x] = 2;
                    this.mapLayers.collision[riverY][x] = 1;
                    this.collisionMap[riverY][x] = 1;
                }
            }
            
            const riverBottom = this.mapHeight - 12 + Math.sin(progress * Math.PI * 1.8) * 2;
            for (let offset = -2; offset <= 2; offset++) {
                const riverY = Math.floor(riverBottom + offset);
                if (riverY >= 0 && riverY < this.mapHeight) {
                    this.mapLayers.background[riverY][x] = 2;
                    this.mapLayers.collision[riverY][x] = 1;
                    this.collisionMap[riverY][x] = 1;
                }
            }
        }
        
        // 초보자 구역 (0-24): 기본 AWS 서비스 (S3, EC2)
        for (let y = 15; y < 45; y++) {
            for (let x = 5; x < 20; x++) {
                if (Math.random() < 0.1) {
                    this.mapLayers.background[y][x] = 3; // 작은 나무
                    this.mapLayers.collision[y][x] = 1;
                    this.collisionMap[y][x] = 1;
                }
            }
        }
        
        // 중급자 숲 (25-49): 네트워킹 서비스 (VPC, ELB)
        for (let y = 15; y < 45; y++) {
            for (let x = 25; x < 50; x++) {
                if (Math.random() < 0.3) {
                    this.mapLayers.background[y][x] = 17; // 큰 나무
                    this.mapLayers.collision[y][x] = 1;
                    this.collisionMap[y][x] = 1;
                }
            }
        }
        
        // 고급자 산 (50-79): 고급 서비스 (Kubernetes, DevOps)
        for (let y = 15; y < 45; y++) {
            for (let x = 50; x < 75; x++) {
                if (Math.random() < 0.2) {
                    this.mapLayers.background[y][x] = 18; // 바위
                    this.mapLayers.collision[y][x] = 1;
                    this.collisionMap[y][x] = 1;
                }
            }
        }
        
        // 노들섬 산책로와 도로 네트워크
        // 메인 산책로 (가로)
        for (let x = 12; x < 68; x++) {
            this.mapLayers.background[30][x] = 7; // 산책로
            this.mapLayers.background[31][x] = 7; // 산책로 (2칸 폭)
        }
        
        // 세로 연결로
        for (let y = 18; y < 45; y++) {
            this.mapLayers.background[y][40] = 7; // 길
        }
        
        // 음악당 접근로
        for (let x = 32; x < 42; x++) {
            this.mapLayers.background[22][x] = 7; // 길
        }
        
        // AWS 센터 접근로
        for (let y = 32; y < 40; y++) {
            this.mapLayers.background[y][30] = 7; // 길
        }
        
        // 노들섬 AWS 교육센터 (더 크고 웅장하게)
        for (let y = 40; y < 48; y++) {
            for (let x = 28; x < 38; x++) {
                this.mapLayers.background[y][x] = 8; // AWS 센터
                this.mapLayers.collision[y][x] = 1; // 충돌
                this.collisionMap[y][x] = 1;
            }
        }
        
        // 노들섬 음악당 (특별한 건물)
        for (let y = 20; y < 26; y++) {
            for (let x = 35; x < 42; x++) {
                this.mapLayers.background[y][x] = 10; // 음악당
                this.mapLayers.collision[y][x] = 1; // 충돌
                this.collisionMap[y][x] = 1;
            }
        }
        
        // 집들 추가 (더 큰 크기)
        const houses = [
            // 초보자 구역 집들
            {x: 8, y: 18, w: 4, h: 3}, {x: 15, y: 22, w: 4, h: 3}, {x: 5, y: 35, w: 4, h: 3},
            // 중급자 숲 집들
            {x: 28, y: 18, w: 4, h: 3}, {x: 45, y: 22, w: 4, h: 3}, {x: 32, y: 40, w: 4, h: 3},
            // 고급자 산 집들
            {x: 52, y: 20, w: 4, h: 3}, {x: 68, y: 25, w: 4, h: 3}, {x: 58, y: 40, w: 4, h: 3}
        ];
        
        houses.forEach(house => {
            for (let y = house.y; y < house.y + house.h; y++) {
                for (let x = house.x; x < house.x + house.w; x++) {
                    if (x < this.mapWidth && y < this.mapHeight) {
                        this.mapLayers.background[y][x] = 9; // 집
                        this.mapLayers.collision[y][x] = 1; // 충돌
                        this.collisionMap[y][x] = 1;
                    }
                }
            }
        });
        
        // 관장 체육관들 - 각 지역에 배치
        const gymBuildings = [
            // CP 체육관 (초보자 구역)
            {x: 15, y: 30, type: 11}, {x: 16, y: 30, type: 11}, {x: 17, y: 30, type: 11},
            {x: 15, y: 31, type: 11}, {x: 16, y: 31, type: 11}, {x: 17, y: 31, type: 11},
            
            // SAA 체육관 (중급자 숲)
            {x: 35, y: 25, type: 12}, {x: 36, y: 25, type: 12}, {x: 37, y: 25, type: 12},
            {x: 35, y: 26, type: 12}, {x: 36, y: 26, type: 12}, {x: 37, y: 26, type: 12},
            
            // DVA 체육관 (중급자 숲)
            {x: 40, y: 35, type: 13}, {x: 41, y: 35, type: 13}, {x: 42, y: 35, type: 13},
            {x: 40, y: 36, type: 13}, {x: 41, y: 36, type: 13}, {x: 42, y: 36, type: 13},
            
            // SAP 체육관 (고급자 산)
            {x: 60, y: 30, type: 14}, {x: 61, y: 30, type: 14}, {x: 62, y: 30, type: 14},
            {x: 60, y: 31, type: 14}, {x: 61, y: 31, type: 14}, {x: 62, y: 31, type: 14}
        ];
        
        gymBuildings.forEach(building => {
            if (building.x < this.mapWidth && building.y < this.mapHeight) {
                this.mapLayers.background[building.y][building.x] = building.type;
                this.mapLayers.collision[building.y][building.x] = 1;
                this.collisionMap[building.y][building.x] = 1;
            }
        });
        
        this.map = this.mapLayers.background;
        
        // 지역 연결 도로
        for (let y = 28; y < 33; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (x === 24 || x === 49) continue; // 경계선 유지
                this.map[y][x] = 7; // 메인 도로
            }
        }
        
        // 체육관 접근로
        for (let x = 12; x < 20; x++) this.map[29][x] = 7; // CP 체육관
        for (let x = 32; x < 40; x++) this.map[24][x] = 7; // SAA 체육관
        for (let x = 37; x < 45; x++) this.map[34][x] = 7; // DVA 체육관
        for (let x = 57; x < 65; x++) this.map[29][x] = 7; // SAP 체육관
    }
    
    setupMonsters() {
        this.awsMonsters = [
            // 초보자 구역: 기본 AWS 서비스 (S3, EC2)
            {
                x: 10, y: 20, name: 'S3 버킷몬', type: 's3',
                hp: 60, maxHp: 60, level: 3, cert: 'cp', zone: 'beginner',
                defeated: false, moveTimer: 0, movePattern: 'random'
            },
            {
                x: 18, y: 25, name: 'EC2 컴퓨터', type: 'ec2',
                hp: 70, maxHp: 70, level: 4, cert: 'cp', zone: 'beginner',
                defeated: false, moveTimer: 0, movePattern: 'patrol'
            },
            {
                x: 12, y: 40, name: '람다 함수', type: 'lambda',
                hp: 50, maxHp: 50, level: 2, cert: 'cp', zone: 'beginner',
                defeated: false, moveTimer: 0, movePattern: 'teleport'
            },
            
            // 중급자 숲: 네트워킹 서비스 (VPC, ELB)
            {
                x: 30, y: 20, name: 'VPC 네트워크', type: 'vpc',
                hp: 100, maxHp: 100, level: 6, cert: 'saa', zone: 'forest',
                defeated: false, moveTimer: 0, movePattern: 'guard'
            },
            {
                x: 45, y: 35, name: 'ELB 로드밸런서', type: 'elb',
                hp: 90, maxHp: 90, level: 5, cert: 'saa', zone: 'forest',
                defeated: false, moveTimer: 0, movePattern: 'defensive'
            },
            {
                x: 38, y: 40, name: 'RDS 데이터베이스', type: 'rds',
                hp: 110, maxHp: 110, level: 7, cert: 'saa', zone: 'forest',
                defeated: false, moveTimer: 0, movePattern: 'defensive'
            },
            
            // 고급자 산: 고급 서비스 (Kubernetes, DevOps)
            {
                x: 55, y: 25, name: 'EKS 쿠버네티스', type: 'eks',
                hp: 150, maxHp: 150, level: 10, cert: 'dva', zone: 'mountain',
                defeated: false, moveTimer: 0, movePattern: 'swarm'
            },
            {
                x: 65, y: 35, name: 'CodePipeline', type: 'codepipeline',
                hp: 130, maxHp: 130, level: 9, cert: 'dva', zone: 'mountain',
                defeated: false, moveTimer: 0, movePattern: 'intercept'
            },
            {
                x: 70, y: 40, name: 'CloudFormation', type: 'cloudformation',
                hp: 140, maxHp: 140, level: 11, cert: 'sap', zone: 'mountain',
                defeated: false, moveTimer: 0, movePattern: 'guard'
            }
        ];
    }
    
    setupGymLeaders() {
        this.gymLeaders = [
            {
                x: 16, y: 30, 
                name: '박클라우드', 
                title: 'CP 관장', 
                cert: 'cp', zone: 'beginner',
                defeated: false,
                sprite: 'cp_leader',
                badge: 'Foundation Badge',
                dialogue: [
                    "안녕하세요! 노들섬 AWS 클라우드 프랙티셔너 관장 박클라우드입니다.",
                    "클라우드의 기초 개념부터 차근차근 배워보시죠!",
                    "AWS의 기본 서비스들을 마스터할 준비가 되셨나요?",
                    "💡 CP 자격증은 AWS 클라우드의 입문 자격증입니다.",
                    "📚 클라우드 컴퓨팅 기본 개념, AWS 핵심 서비스, 보안, 요금 체계를 다룹니다.",
                    "🎯 IT 배경이 없어도 도전할 수 있는 자격증이에요!"
                ],
                battleIntro: "클라우드의 기초를 보여드리겠습니다!",
                victory: "훌륭합니다! Foundation Badge를 드립니다!",
                defeat: "더 공부하고 다시 도전하세요!",
                certDetails: {
                    fullName: "AWS Certified Cloud Practitioner",
                    code: "CLF-C01",
                    duration: "90분",
                    questions: "65문항",
                    passingScore: "700/1000점",
                    cost: "$100",
                    validity: "3년",
                    domains: [
                        "클라우드 개념 (26%)",
                        "보안 및 규정 준수 (25%)", 
                        "기술 (33%)",
                        "청구 및 요금 (16%)"
                    ]
                }
            },
            {
                x: 36, y: 25, 
                name: '김아키텍트', 
                title: 'SAA 관장', 
                cert: 'saa', zone: 'forest',
                defeated: false,
                sprite: 'saa_leader',
                badge: 'Architect Badge',
                dialogue: [
                    "솔루션 아키텍트 관장 김아키텍트입니다.",
                    "확장 가능하고 안정적인 아키텍처 설계의 세계로 오신 것을 환영합니다!",
                    "고가용성과 내결함성에 대해 알아볼까요?",
                    "🏗️ SAA는 AWS에서 가장 인기 있는 자격증 중 하나입니다.",
                    "📐 시스템 설계, 아키텍처 패턴, 비용 최적화를 다룹니다.",
                    "💼 클라우드 아키텍트로 성장하는 첫 걸음이에요!"
                ],
                battleIntro: "진정한 아키텍처의 힘을 보여드리겠습니다!",
                victory: "놀랍습니다! Architect Badge를 획득하셨습니다!",
                defeat: "아키텍처는 더 깊이 있는 이해가 필요합니다.",
                certDetails: {
                    fullName: "AWS Certified Solutions Architect Associate",
                    code: "SAA-C03",
                    duration: "130분",
                    questions: "65문항",
                    passingScore: "720/1000점",
                    cost: "$150",
                    validity: "3년",
                    domains: [
                        "보안 아키텍처 설계 (30%)",
                        "복원력 있는 아키텍처 설계 (26%)",
                        "고성능 아키텍처 설계 (24%)",
                        "비용 최적화 아키텍처 설계 (20%)"
                    ]
                }
            },
            {
                x: 41, y: 35, 
                name: '이개발자', 
                title: 'DVA 관장', 
                cert: 'dva', zone: 'forest',
                defeated: false,
                sprite: 'dva_leader',
                badge: 'Developer Badge',
                dialogue: [
                    "개발자 어소시에이트 관장 이개발자입니다.",
                    "서버리스와 컨테이너, 그리고 DevOps의 세계로 떠나볼까요?",
                    "현대적인 애플리케이션 개발에 대해 배워보시죠!",
                    "👨‍💻 DVA는 AWS에서 애플리케이션을 개발하는 개발자를 위한 자격증입니다.",
                    "🚀 Lambda, API Gateway, DynamoDB 등 개발 서비스에 집중합니다.",
                    "🔧 CI/CD, 모니터링, 디버깅 기술도 중요해요!"
                ],
                battleIntro: "개발자의 진정한 실력을 보여드리겠습니다!",
                victory: "대단합니다! Developer Badge를 드립니다!",
                defeat: "개발은 끊임없는 학습이 필요합니다.",
                certDetails: {
                    fullName: "AWS Certified Developer Associate",
                    code: "DVA-C01",
                    duration: "130분",
                    questions: "65문항",
                    passingScore: "720/1000점",
                    cost: "$150",
                    validity: "3년",
                    domains: [
                        "AWS 서비스를 사용한 개발 (32%)",
                        "보안 (26%)",
                        "배포 (24%)",
                        "문제 해결 및 최적화 (18%)"
                    ]
                }
            },
            {
                x: 61, y: 30, 
                name: '최프로', 
                title: 'SAP 관장', 
                cert: 'sap', zone: 'mountain',
                defeated: false,
                sprite: 'sap_leader',
                badge: 'Professional Badge',
                dialogue: [
                    "솔루션 아키텍트 프로페셔널 관장 최프로입니다.",
                    "엔터프라이즈급 아키텍처와 고급 설계 패턴의 세계입니다.",
                    "AWS의 모든 것을 마스터할 준비가 되셨나요?",
                    "🎖️ SAP는 AWS 최고 난이도의 아키텍처 자격증입니다.",
                    "🏢 대규모 엔터프라이즈 환경의 복잡한 요구사항을 다룹니다.",
                    "🌟 AWS 전문가로 인정받는 최고 수준의 자격증이에요!"
                ],
                battleIntro: "프로페셔널의 진정한 실력을 경험하세요!",
                victory: "경이롭습니다! Professional Badge를 획득하셨습니다!",
                defeat: "프로페셔널 레벨은 더 높은 차원의 이해가 필요합니다.",
                certDetails: {
                    fullName: "AWS Certified Solutions Architect Professional",
                    code: "SAP-C01",
                    duration: "180분",
                    questions: "75문항",
                    passingScore: "750/1000점",
                    cost: "$300",
                    validity: "3년",
                    domains: [
                        "조직 복잡성을 위한 설계 (12.5%)",
                        "새로운 솔루션 설계 (31%)",
                        "기존 솔루션의 지속적 개선 (25%)",
                        "마이그레이션 계획 (15%)",
                        "비용 제어 (12.5%)"
                    ]
                }
            }
        ];
    }
    
    setupEventHandlers() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (this.gameState === 'battle' && this.battleState.battlePhase === 'question') {
                if (e.key >= '1' && e.key <= '4') {
                    this.handleQuizAnswer(parseInt(e.key) - 1);
                }
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.clicked = true;
            
            if (this.gameState === 'battle' && this.battleState.battlePhase === 'question') {
                this.handleBattleClick();
            }
        });
    }
    
    handleBattleClick() {
        if (!this.battleState.currentQuestion) return;
        
        const optionHeight = 40;
        const startY = this.canvas.height - 180;
        
        for (let i = 0; i < 4; i++) {
            const optionY = startY + i * optionHeight;
            if (this.mouse.y >= optionY && this.mouse.y <= optionY + 35) {
                this.handleQuizAnswer(i);
                break;
            }
        }
    }
    
    startBattle(monster) {
        this.battleState.active = true;
        this.battleState.monster = monster;
        this.battleState.playerTurn = true;
        this.battleState.battlePhase = 'question';
        this.gameState = 'battle';
        
        const questions = this.quizDatabase[monster.cert] || this.quizDatabase.cp;
        this.battleState.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        this.battleState.screenShake = 10;
        
        console.log(`⚔️ ${monster.name}와의 퀴즈 배틀 시작!`);
    }
    
    handleQuizAnswer(selectedOption) {
        const question = this.battleState.currentQuestion;
        const correct = selectedOption === question.correct;
        
        // 답변 결과와 함께 자격증 정보 표시
        let resultMessage = '';
        
        if (correct) {
            const damage = 25 + (question.difficulty * 10);
            this.battleState.monster.hp -= damage;
            
            this.addDamageNumber(this.canvas.width * 0.7, this.canvas.height * 0.3, damage, '#4CAF50');
            this.battleState.screenShake = 5;
            
            resultMessage = `🎉 정답입니다!\n\n💡 ${question.explanation}`;
            if (question.certInfo) {
                resultMessage += `\n\n📚 ${question.certInfo}`;
            }
            
            alert(resultMessage);
            
            if (this.battleState.monster.hp <= 0) {
                this.endBattle(true);
            } else {
                this.battleState.battlePhase = 'result';
                setTimeout(() => this.nextBattleRound(), 2000);
            }
        } else {
            const damage = 15 + (question.difficulty * 5);
            this.player.hp -= damage;
            
            this.addDamageNumber(this.canvas.width * 0.3, this.canvas.height * 0.7, damage, '#F44336');
            this.battleState.screenShake = 8;
            
            const correctAnswer = question.options[question.correct];
            resultMessage = `❌ 틀렸습니다!\n\n정답: ${correctAnswer}\n\n💡 ${question.explanation}`;
            if (question.certInfo) {
                resultMessage += `\n\n📚 ${question.certInfo}`;
            }
            
            alert(resultMessage);
            
            if (this.player.hp <= 0) {
                this.endBattle(false);
            } else {
                this.battleState.battlePhase = 'result';
                setTimeout(() => this.nextBattleRound(), 2000);
            }
        }
    }
    
    nextBattleRound() {
        if (this.battleState.active) {
            const questions = this.quizDatabase[this.battleState.monster.cert] || this.quizDatabase.cp;
            this.battleState.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
            this.battleState.battlePhase = 'question';
        }
    }
    
    endBattle(victory) {
        if (victory) {
            const expGain = 50 + (this.battleState.monster.level * 10);
            const creditsGain = 100 + (this.battleState.monster.level * 25);
            
            this.player.exp += expGain;
            this.player.awsCredits += creditsGain;
            
            if (this.player.exp >= this.player.expToNext) {
                this.player.level++;
                this.player.exp -= this.player.expToNext;
                this.player.expToNext += 50;
                this.player.maxHp += 20;
                this.player.hp = this.player.maxHp;
            }
            
            this.battleState.monster.defeated = true;
            console.log(`🎉 승리! EXP +${expGain}, AWS Credits +${creditsGain}`);
        } else {
            this.player.hp = this.player.maxHp;
            console.log('💔 패배... 체력을 회복하고 다시 도전하세요!');
        }
        
        this.battleState.active = false;
        this.gameState = 'overworld';
    }
    
    addDamageNumber(x, y, damage, color) {
        this.battleState.damageNumbers.push({
            x, y, damage, color,
            life: 1000, maxLife: 1000,
            vx: (Math.random() - 0.5) * 2,
            vy: -3
        });
    }
    
    addParticle(x, y, config = {}) {
        this.particles.push({
            x, y,
            vx: config.vx || (Math.random() - 0.5) * 4,
            vy: config.vy || (Math.random() - 0.5) * 4,
            life: config.life || 1000,
            maxLife: config.life || 1000,
            size: config.size || 2,
            color: config.color || '#FFFFFF'
        });
    }
    
    update() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.time = currentTime;
        
        this.updateParticles();
        
        if (this.gameState === 'overworld') {
            this.updatePlayer();
            this.updateMonsters();
            this.updateCamera();
            this.checkInteractions();
        }
        
        if (this.battleState.screenShake > 0) {
            this.battleState.screenShake *= 0.9;
            if (this.battleState.screenShake < 0.1) {
                this.battleState.screenShake = 0;
            }
        }
        
        this.mouse.clicked = false;
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.life -= this.deltaTime;
            particle.x += particle.vx * this.deltaTime * 0.001;
            particle.y += particle.vy * this.deltaTime * 0.001;
            return particle.life > 0;
        });
        
        this.battleState.damageNumbers = this.battleState.damageNumbers.filter(dmg => {
            dmg.life -= this.deltaTime;
            dmg.x += dmg.vx * this.deltaTime * 0.001;
            dmg.y += dmg.vy * this.deltaTime * 0.001;
            return dmg.life > 0;
        });
    }
    
    updatePlayer() {
        const oldX = this.player.x;
        const oldY = this.player.y;
        let moved = false;
        
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.player.y -= this.player.speed;
            this.player.direction = 'up';
            moved = true;
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.player.y += this.player.speed;
            this.player.direction = 'down';
            moved = true;
        }
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.player.x -= this.player.speed;
            this.player.direction = 'left';
            moved = true;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.player.x += this.player.speed;
            this.player.direction = 'right';
            moved = true;
        }
        
        if (this.checkCollision()) {
            this.player.x = oldX;
            this.player.y = oldY;
            moved = false;
        }
        
        this.player.moving = moved;
        if (moved) {
            this.player.animFrame += this.deltaTime * 0.01;
        }
        
        // 포탈 체크
        this.checkPortals();
    }
    
    updateMonsters() {
        this.awsMonsters.forEach(monster => {
            if (monster.defeated) return;
            
            monster.moveTimer += this.deltaTime;
            if (monster.moveTimer > 3000) {
                const directions = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
                const dir = directions[Math.floor(Math.random() * 4)];
                
                const newX = monster.x + dir.x;
                const newY = monster.y + dir.y;
                
                if (this.isValidPosition(newX, newY)) {
                    monster.x = newX;
                    monster.y = newY;
                }
                monster.moveTimer = 0;
            }
        });
    }
    
    updateCamera() {
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;
        
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
        
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapWidth * this.tileSize - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapHeight * this.tileSize - this.canvas.height));
    }
    
    checkCollision() {
        const corners = [
            { x: this.player.x, y: this.player.y },
            { x: this.player.x + this.player.width - 1, y: this.player.y },
            { x: this.player.x, y: this.player.y + this.player.height - 1 },
            { x: this.player.x + this.player.width - 1, y: this.player.y + this.player.height - 1 }
        ];
        
        for (let corner of corners) {
            const tileX = Math.floor(corner.x / this.tileSize);
            const tileY = Math.floor(corner.y / this.tileSize);
            
            if (tileX < 0 || tileX >= this.mapWidth || tileY < 0 || tileY >= this.mapHeight) {
                return true;
            }
            
            // 충돌 맵 체크
            if (this.collisionMap[tileY] && this.collisionMap[tileY][tileX] === 1) {
                return true;
            }
        }
        
        return false;
    }
    
    checkInteractions() {
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);
        
        // AWS 포켓몬 조우
        this.awsMonsters.forEach(monster => {
            if (monster.defeated) return;
            
            const distance = Math.sqrt(
                Math.pow(monster.x - playerTileX, 2) + 
                Math.pow(monster.y - playerTileY, 2)
            );
            
            if (distance < 1.5) {
                this.startBattle(monster);
            }
        });
        
        // 체육관 관장 상호작용
        if (this.keys[' '] || this.keys['Space']) {
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
    
    checkPortals() {
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);
        
        // 지역 간 포탈 (경계선에서 자동 이동)
        if (playerTileX === 24 && playerTileY > 15 && playerTileY < 45) {
            // 초보자 구역 → 중급자 숲
            this.player.x = 26 * this.tileSize;
            this.addParticle(this.player.x, this.player.y, {color: '#4CAF50', life: 1000});
        } else if (playerTileX === 25 && playerTileY > 15 && playerTileY < 45) {
            // 중급자 숲 → 초보자 구역
            this.player.x = 23 * this.tileSize;
            this.addParticle(this.player.x, this.player.y, {color: '#8BC34A', life: 1000});
        } else if (playerTileX === 49 && playerTileY > 15 && playerTileY < 45) {
            // 중급자 숲 → 고급자 산
            this.player.x = 51 * this.tileSize;
            this.addParticle(this.player.x, this.player.y, {color: '#607D8B', life: 1000});
        } else if (playerTileX === 50 && playerTileY > 15 && playerTileY < 45) {
            // 고급자 산 → 중급자 숲
            this.player.x = 48 * this.tileSize;
            this.addParticle(this.player.x, this.player.y, {color: '#2E7D32', life: 1000});
        }
    }
    
    startGymBattle(leader) {
        // 대화 시스템 먼저 실행
        this.showDialogue(leader);
    }
    
    showDialogue(leader) {
        const allMessages = leader.dialogue.join('\n\n');
        alert(allMessages);
        this.showCertificationDetails(leader);
    }
    
    showCertificationDetails(leader) {
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
            console.log(`🏆 ${leader.name} ${leader.title}와의 체육관 배틀!`);
            const gymMonster = {
                name: `${leader.name}의 AWS 챔피언`,
                type: 'gym',
                hp: 150,
                maxHp: 150,
                level: 5,
                cert: leader.cert,
                defeated: false
            };
            this.startBattle(gymMonster);
        }
    }
    
    isValidPosition(x, y) {
        if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
            return false;
        }
        
        const tile = this.map[y][x];
        return tile === 1 || tile === 7;
    }
    
    render() {
        const shakeX = this.battleState.screenShake > 0 ? 
            (Math.random() - 0.5) * this.battleState.screenShake : 0;
        const shakeY = this.battleState.screenShake > 0 ? 
            (Math.random() - 0.5) * this.battleState.screenShake : 0;
        
        this.ctx.save();
        this.ctx.translate(shakeX, shakeY);
        
        if (this.gameState === 'overworld') {
            this.renderOverworld();
        } else if (this.gameState === 'battle') {
            this.renderBattle();
        }
        
        this.ctx.restore();
        
        this.renderUI();
    }
    
    renderOverworld() {
        // 하늘 그라데이션
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderMap();
        this.renderEntities();
        this.renderParticles();
    }
    
    renderMap() {
        // 완전한 시야 범위 제거 - 모든 타일 렌더링
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const screenX = x * this.tileSize - this.camera.x;
                const screenY = y * this.tileSize - this.camera.y;
                this.renderTile(this.map[y][x], screenX, screenY, x, y);
            }
        }
    }
    
    renderTile(tileType, x, y, mapX, mapY) {
        const size = this.tileSize;
        
        // SVG 스프라이트 사용 가능한 경우
        if (this.spritesLoaded && this.sprites.buildings) {
            switch(tileType) {
                case 1: // 잔디
                    this.ctx.drawImage(this.sprites.buildings, 20, 48, 16, 16, x, y, size, size);
                    break;
                case 2: // 물
                    this.ctx.fillStyle = '#4682B4';
                    this.ctx.fillRect(x, y, size, size);
                    this.ctx.fillStyle = '#87CEEB';
                    this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                    break;
                case 3: // 나무
                    this.ctx.drawImage(this.sprites.buildings, 0, 48, 16, 16, x, y, size, size);
                    break;
                case 7: // 길
                    this.ctx.drawImage(this.sprites.buildings, 40, 48, 16, 16, x, y, size, size);
                    break;
                case 8: // AWS 센터
                    this.ctx.drawImage(this.sprites.buildings, 80, 0, 28, 40, x, y, size * 1.75, size * 2.5);
                    break;
                case 9: // 집
                    this.ctx.drawImage(this.sprites.buildings, 40, 0, 24, 40, x, y, size * 1.5, size * 2.5);
                    break;
                case 10: // 음악당
                    this.ctx.drawImage(this.sprites.buildings, 0, 0, 32, 40, x, y, size * 2, size * 2.5);
                    break;
                default:
                    this.renderFallbackTile(tileType, x, y, mapX, mapY, size);
                    break;
            }
        } else {
            this.renderFallbackTile(tileType, x, y, mapX, mapY, size);
        }
    }
    
    renderFallbackTile(tileType, x, y, mapX, mapY, size) {
        switch(tileType) {
            case 1: // 잔디 - 스타듀밸리 스타일 완전 개선
                // 베이스 잔디 (더 생생한 색상)
                const grassBase = Math.sin(mapX * 0.2 + mapY * 0.15) * 0.15 + 0.85;
                this.ctx.fillStyle = `hsl(${75 + grassBase * 15}, 70%, ${30 + grassBase * 15}%)`;
                this.ctx.fillRect(x, y, size, size);
                
                // 잔디 그라데이션 효과
                this.ctx.fillStyle = `hsl(${80 + grassBase * 10}, 65%, ${35 + grassBase * 10}%)`;
                this.ctx.fillRect(x, y + size - 4, size, 4);
                
                const grassSeed = (mapX * 13 + mapY * 17) % 100;
                
                // 잔디 블레이드 (더 자연스럽게)
                if (grassSeed < 35) {
                    this.ctx.fillStyle = `hsl(${85 + (grassSeed % 10)}, 75%, ${40 + (grassSeed % 8) * 2}%)`;
                    for (let i = 0; i < 4; i++) {
                        const bladeX = x + 1 + (grassSeed % 5) * 3 + i * 2;
                        const bladeY = y + 6 + (grassSeed % 3) * 2;
                        const bladeHeight = 3 + (grassSeed % 4);
                        this.ctx.fillRect(bladeX, bladeY, 1, bladeHeight);
                        // 잔디 끝 하이라이트
                        this.ctx.fillStyle = `hsl(${90 + (grassSeed % 5)}, 80%, ${50 + (grassSeed % 6) * 3}%)`;
                        this.ctx.fillRect(bladeX, bladeY, 1, 1);
                        this.ctx.fillStyle = `hsl(${85 + (grassSeed % 10)}, 75%, ${40 + (grassSeed % 8) * 2}%)`;
                    }
                }
                
                // 작은 꽃들 (스타듀밸리 스타일)
                if (grassSeed % 25 === 0) {
                    const flowers = [
                        {color: '#FF6B9D', center: '#FFE5EC'},
                        {color: '#4ECDC4', center: '#E8FFFE'},
                        {color: '#FFE66D', center: '#FFF9E5'},
                        {color: '#A8E6CF', center: '#F0FFF0'},
                        {color: '#FFB3BA', center: '#FFF0F0'}
                    ];
                    const flower = flowers[grassSeed % flowers.length];
                    const flowerX = x + (grassSeed % 13) + 1;
                    const flowerY = y + ((grassSeed * 3) % 13) + 1;
                    
                    // 꽃잎
                    this.ctx.fillStyle = flower.color;
                    this.ctx.fillRect(flowerX, flowerY, 2, 2);
                    this.ctx.fillRect(flowerX + 1, flowerY - 1, 1, 1);
                    this.ctx.fillRect(flowerX + 1, flowerY + 2, 1, 1);
                    this.ctx.fillRect(flowerX - 1, flowerY + 1, 1, 1);
                    this.ctx.fillRect(flowerX + 2, flowerY + 1, 1, 1);
                    
                    // 꽃 중심
                    this.ctx.fillStyle = flower.center;
                    this.ctx.fillRect(flowerX + 1, flowerY + 1, 1, 1);
                }
                
                // 작은 돌들
                if (grassSeed % 45 === 0) {
                    this.ctx.fillStyle = '#8D7053';
                    this.ctx.fillRect(x + (grassSeed % 14), y + ((grassSeed * 2) % 14), 2, 1);
                    this.ctx.fillStyle = '#A0826D';
                    this.ctx.fillRect(x + (grassSeed % 14), y + ((grassSeed * 2) % 14), 1, 1);
                }
                break;
                
            case 2: // 한강 - 스타듀밸리 물 스타일 완전 개선
                // 물 깊이와 투명도
                const waterDepth = Math.sin(mapX * 0.18 + mapY * 0.14) * 0.3 + 0.7;
                const baseHue = 200 + Math.sin(mapX * 0.1) * 10;
                
                // 베이스 물 색상 (더 리얼한 한강 색상)
                this.ctx.fillStyle = `hsl(${baseHue}, 75%, ${12 + waterDepth * 18}%)`;
                this.ctx.fillRect(x, y, size, size);
                
                // 물 그라데이션 (깊이감)
                this.ctx.fillStyle = `hsl(${baseHue + 5}, 70%, ${18 + waterDepth * 12}%)`;
                this.ctx.fillRect(x, y, size, size * 0.3);
                
                // 복합 물결 애니메이션
                const t = this.time * 0.001;
                const wave1 = Math.sin(t * 3 + mapX * 0.4 + mapY * 0.2) * 1.8;
                const wave2 = Math.cos(t * 2.5 + mapX * 0.3 + mapY * 0.25) * 1.2;
                const wave3 = Math.sin(t * 4 + mapX * 0.5) * 0.6;
                const microWave = Math.sin(t * 8 + mapX * 0.8 + mapY * 0.6) * 0.3;
                
                // 주요 물결층들
                this.ctx.fillStyle = `hsl(${baseHue + 8}, 68%, ${22 + waterDepth * 15}%)`;
                this.ctx.fillRect(x, y + 6 + wave1, size, 4);
                
                this.ctx.fillStyle = `hsl(${baseHue + 12}, 65%, ${28 + waterDepth * 12}%)`;
                this.ctx.fillRect(x, y + 10 + wave2, size, 3);
                
                this.ctx.fillStyle = `hsl(${baseHue + 15}, 60%, ${32 + waterDepth * 10}%)`;
                this.ctx.fillRect(x, y + 13 + wave3, size, 2);
                
                // 미세 물결
                this.ctx.fillStyle = `hsl(${baseHue + 18}, 55%, ${36 + waterDepth * 8}%)`;
                this.ctx.fillRect(x, y + 14 + microWave, size, 1);
                
                // 햇빛 반사 (더 현실적)
                const sparklePhase = Math.floor(this.time * 0.006);
                const sparkleChance = (mapX * 11 + mapY * 13 + sparklePhase) % 45;
                
                if (sparkleChance === 0) {
                    const sparkleIntensity = (Math.sin(this.time * 0.012) + 1) * 0.4 + 0.2;
                    const sparkleX = x + 4 + (sparklePhase % 8);
                    const sparkleY = y + 4 + wave1 + (sparklePhase % 6);
                    
                    // 메인 반사
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkleIntensity})`;
                    this.ctx.fillRect(sparkleX, sparkleY, 3, 2);
                    
                    // 반사 하이라이트
                    this.ctx.fillStyle = `rgba(200, 230, 255, ${sparkleIntensity * 0.7})`;
                    this.ctx.fillRect(sparkleX + 1, sparkleY, 1, 1);
                }
                
                // 물거품과 작은 파편들
                if ((mapX * 5 + mapY * 7 + sparklePhase) % 70 === 0) {
                    const bubbleX = x + 6 + wave2;
                    const bubbleY = y + 8 + wave1;
                    
                    this.ctx.fillStyle = `rgba(173, 216, 230, 0.5)`;
                    this.ctx.beginPath();
                    this.ctx.arc(bubbleX, bubbleY, 1.5, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // 거품 하이라이트
                    this.ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
                    this.ctx.fillRect(bubbleX - 0.5, bubbleY - 0.5, 1, 1);
                }
                break;
                
            case 3: // 작은 나무
                // 잔디 배경
                this.ctx.fillStyle = '#6B8E23';
                this.ctx.fillRect(x, y, size, size);
                
                // 나무 줄기
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x + 7, y + 12, 2, 4);
                
                // 나뭇잎
                this.ctx.fillStyle = '#2E7D32';
                this.ctx.fillRect(x + 4, y + 6, 8, 8);
                
                // 나뭇잎 하이라이트
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + 5, y + 7, 6, 6);
                break;
                
            case 7: // 길 - 스타듀 밸리 돌길 스타일
                // 기본 길 색상
                this.ctx.fillStyle = '#D7CCC8';
                this.ctx.fillRect(x, y, size, size);
                
                // 돌 패턴 (더 자연스럽게)
                const pathSeed = (mapX * 13 + mapY * 17) % 50;
                this.ctx.fillStyle = '#BCAAA4';
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if ((pathSeed + i + j) % 5 === 0) {
                            this.ctx.fillRect(x + 2 + i * 10, y + 2 + j * 10, 8, 8);
                        }
                    }
                }
                
                // 작은 자갈들
                if (pathSeed % 12 === 0) {
                    this.ctx.fillStyle = '#A1887F';
                    this.ctx.fillRect(x + (pathSeed % 24), y + ((pathSeed * 3) % 24), 3, 3);
                }
                break;
                
            case 8: // AWS 센터 - 깔끔한 건물
                // 건물 본체
                this.ctx.fillStyle = '#FF9900';
                this.ctx.fillRect(x, y, size, size);
                
                // 건물 테두리
                this.ctx.fillStyle = '#E67E00';
                this.ctx.fillRect(x, y, size, 2);
                this.ctx.fillRect(x, y, 2, size);
                this.ctx.fillRect(x + size - 2, y, 2, size);
                this.ctx.fillRect(x, y + size - 2, size, 2);
                
                // 창문들
                this.ctx.fillStyle = '#87CEEB';
                this.ctx.fillRect(x + 6, y + 6, 8, 8);
                this.ctx.fillRect(x + 18, y + 6, 8, 8);
                this.ctx.fillRect(x + 6, y + 18, 8, 8);
                this.ctx.fillRect(x + 18, y + 18, 8, 8);
                
                // AWS 로고
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 10px monospace';
                this.ctx.fillText('AWS', x + 10, y + 18);
                break;
                
            case 9: // 카페/휴게시설 - 16-bit 스타일
                // 건물 본체
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y + 4, size, size - 4);
                
                // 지붕
                this.ctx.fillStyle = '#D32F2F';
                this.ctx.fillRect(x, y, size, 6);
                
                // 창문
                this.ctx.fillStyle = '#87CEEB';
                this.ctx.fillRect(x + 2, y + 6, 4, 4);
                this.ctx.fillRect(x + 10, y + 6, 4, 4);
                
                // 문
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x + 6, y + 10, 4, 6);
                break;
                
            case 10: // 노들섬 음악당 - 16-bit 스타일
                // 건물 본체 (더 크고 웅장하게)
                this.ctx.fillStyle = '#4A148C';
                this.ctx.fillRect(x, y, size, size);
                
                // 음악당 장식
                this.ctx.fillStyle = '#7B1FA2';
                this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                
                // 음표 장식
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(x + 6, y + 6, 2, 2);
                this.ctx.fillRect(x + 10, y + 8, 2, 2);
                break;
                
            case 11: // CP 체육관 - Foundation Gym
                this.ctx.fillStyle = '#2E7D32';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                
                // CP 로고
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 6px monospace';
                this.ctx.fillText('CP', x + 5, y + 10);
                break;
                
            case 12: // SAA 체육관 - Architect Gym
                this.ctx.fillStyle = '#1565C0';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#2196F3';
                this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                
                // SAA 로고
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 5px monospace';
                this.ctx.fillText('SAA', x + 3, y + 10);
                break;
                
            case 13: // DVA 체육관 - Developer Gym
                this.ctx.fillStyle = '#E65100';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#FF9800';
                this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                
                // DVA 로고
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 5px monospace';
                this.ctx.fillText('DVA', x + 3, y + 10);
                break;
                
            case 14: // SAP 체육관 - Professional Gym
                this.ctx.fillStyle = '#4A148C';
                this.ctx.fillRect(x, y, size, size);
                
                this.ctx.fillStyle = '#9C27B0';
                this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                
                // SAP 로고
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 5px monospace';
                this.ctx.fillText('SAP', x + 3, y + 10);
                break;
                
            case 15: // 중급자 숲 - 진한 녹색
                const forestBase = Math.sin(mapX * 0.15 + mapY * 0.12) * 0.2 + 0.8;
                this.ctx.fillStyle = `hsl(${120 + forestBase * 10}, 60%, ${20 + forestBase * 10}%)`;
                this.ctx.fillRect(x, y, size, size);
                
                // 숲 텍스처
                const forestSeed = (mapX * 11 + mapY * 13) % 100;
                if (forestSeed < 40) {
                    this.ctx.fillStyle = `hsl(${110 + (forestSeed % 8)}, 65%, ${25 + (forestSeed % 6) * 2}%)`;
                    for (let i = 0; i < 3; i++) {
                        const leafX = x + 2 + (forestSeed % 4) * 3 + i * 2;
                        const leafY = y + 4 + (forestSeed % 3) * 3;
                        this.ctx.fillRect(leafX, leafY, 2, 3);
                    }
                }
                break;
                
            case 16: // 고급자 산 - 회색 산
                const mountainBase = Math.sin(mapX * 0.1 + mapY * 0.08) * 0.3 + 0.7;
                this.ctx.fillStyle = `hsl(${200 + mountainBase * 20}, 30%, ${40 + mountainBase * 15}%)`;
                this.ctx.fillRect(x, y, size, size);
                
                // 산 그라데이션
                this.ctx.fillStyle = `hsl(${210 + mountainBase * 15}, 25%, ${50 + mountainBase * 10}%)`;
                this.ctx.fillRect(x, y, size, size * 0.4);
                break;
                
            case 17: // 큰 나무 (숲)
                // 숲 배경
                this.ctx.fillStyle = '#1B5E20';
                this.ctx.fillRect(x, y, size, size);
                
                // 나무 줄기
                this.ctx.fillStyle = '#3E2723';
                this.ctx.fillRect(x + 6, y + 10, 4, 6);
                
                // 나뭇잎 (더 큰 나무)
                this.ctx.fillStyle = '#2E7D32';
                this.ctx.fillRect(x + 2, y + 2, 12, 12);
                
                // 나뭇잎 하이라이트
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + 3, y + 3, 10, 10);
                
                // 나뭇잎 중심
                this.ctx.fillStyle = '#66BB6A';
                this.ctx.fillRect(x + 5, y + 5, 6, 6);
                break;
                
            case 18: // 바위 (산)
                this.ctx.fillStyle = '#546E7A';
                this.ctx.fillRect(x, y, size, size);
                
                // 바위 텍스처
                this.ctx.fillStyle = '#607D8B';
                this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                
                // 바위 균열
                const rockSeed = (mapX * 7 + mapY * 5) % 20;
                if (rockSeed < 5) {
                    this.ctx.fillStyle = '#37474F';
                    this.ctx.fillRect(x + (rockSeed % 12), y + ((rockSeed * 2) % 12), 3, 1);
                }
                break;
                
            case 9: // 집 - 큰 크기 집
                // 집 본체
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x, y + 4, size, 12);
                
                // 지붕
                this.ctx.fillStyle = '#D32F2F';
                this.ctx.fillRect(x - 1, y + 2, size + 2, 4);
                
                // 지붕 하이라이트
                this.ctx.fillStyle = '#F44336';
                this.ctx.fillRect(x - 1, y + 2, size + 2, 2);
                
                // 문
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x + 6, y + 10, 4, 6);
                
                // 문 패널
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(x + 7, y + 11, 2, 4);
                
                // 창문
                this.ctx.fillStyle = '#87CEEB';
                this.ctx.fillRect(x + 2, y + 7, 3, 3);
                this.ctx.fillRect(x + 11, y + 7, 3, 3);
                
                // 창문 프레임
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(x + 2, y + 7, 3, 1);
                this.ctx.fillRect(x + 2, y + 9, 3, 1);
                this.ctx.fillRect(x + 11, y + 7, 3, 1);
                this.ctx.fillRect(x + 11, y + 9, 3, 1);
                
                // 문고리
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(x + 9, y + 13, 1, 1);
                break;
        }
    }
    
    renderEntities() {
        // 몬스터 렌더링
        this.awsMonsters.forEach(monster => {
            if (monster.defeated) return;
            
            const screenX = monster.x * this.tileSize - this.camera.x;
            const screenY = monster.y * this.tileSize - this.camera.y;
            
            this.renderMonster(monster, screenX, screenY);
        });
        
        // 체육관 관장 렌더링
        this.gymLeaders.forEach(leader => {
            if (leader.defeated) return;
            
            const screenX = leader.x * this.tileSize - this.camera.x;
            const screenY = leader.y * this.tileSize - this.camera.y;
            
            this.renderGymLeader(leader, screenX, screenY);
        });
        
        // 플레이어 렌더링
        const screenX = this.player.x - this.camera.x;
        const screenY = this.player.y - this.camera.y;
        this.renderPlayer(screenX, screenY);
    }
    
    renderPlayer(x, y) {
        // 고품질 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 8, y + 14, 6, 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // SVG 스프라이트 사용 가능한 경우
        if (this.spritesLoaded && this.sprites.player) {
            const animFrame = this.player.moving ? Math.floor(this.player.animFrame * 0.2) % 2 : 0;
            let spriteX = 0;
            let spriteY = 0;
            
            // 방향에 따른 스프라이트 선택
            switch(this.player.direction) {
                case 'down': spriteY = 0; break;
                case 'up': spriteY = 16; break;
                case 'left': spriteY = 32; break;
                case 'right': spriteY = 48; break;
            }
            
            spriteX = animFrame * 16;
            
            this.ctx.drawImage(this.sprites.player, spriteX, spriteY, 16, 16, x, y, 16, 16);
        } else {
            // 폴백 렌더링
            this.renderFallbackPlayer(x, y);
        }
    }
    
    renderFallbackPlayer(x, y) {
        // 부드러운 애니메이션
        const walkPhase = this.player.moving ? this.player.animFrame * 0.3 : 0;
        const walkCycle = Math.sin(walkPhase) * 0.8;
        const bobOffset = this.player.moving ? Math.abs(Math.sin(walkPhase * 2)) * 0.5 : 0;
        
        // 다리 (16px 스케일)
        this.ctx.fillStyle = '#1565C0';
        if (this.player.moving) {
            this.ctx.fillRect(x + 5 + walkCycle, y + 12 - bobOffset, 2, 4);
            this.ctx.fillRect(x + 9 - walkCycle, y + 12 - bobOffset, 2, 4);
        } else {
            this.ctx.fillRect(x + 6, y + 12, 4, 4);
        }
        
        // 몸통 (AWS 티셔츠)
        this.ctx.fillStyle = '#FF9900';
        this.ctx.fillRect(x + 4, y + 8 - bobOffset, 8, 6);
        
        // 셔츠 하이라이트
        this.ctx.fillStyle = '#FFB84D';
        this.ctx.fillRect(x + 4, y + 8 - bobOffset, 2, 6);
        
        // AWS 로고
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 4px monospace';
        this.ctx.fillText('AWS', x + 5, y + 12 - bobOffset);
        
        // 팔
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 3, y + 9 - bobOffset, 2, 3);
        this.ctx.fillRect(x + 11, y + 9 - bobOffset, 2, 3);
        
        // 머리
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 5, y + 3 - bobOffset, 6, 6);
        
        // 머리카락
        this.ctx.fillStyle = '#2C1810';
        this.ctx.fillRect(x + 4, y + 2 - bobOffset, 8, 4);
        
        // 눈
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 6, y + 5 - bobOffset, 1, 1);
        this.ctx.fillRect(x + 9, y + 5 - bobOffset, 1, 1);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 6, y + 5 - bobOffset, 1, 1);
        this.ctx.fillRect(x + 9, y + 5 - bobOffset, 1, 1);
        
        // 입
        this.ctx.fillStyle = '#D4A574';
        this.ctx.fillRect(x + 7, y + 7 - bobOffset, 2, 1);
        
        // 신발
        this.ctx.fillStyle = '#1A1A1A';
        this.ctx.fillRect(x + 4, y + 15 - bobOffset, 3, 2);
        this.ctx.fillRect(x + 9, y + 15 - bobOffset, 3, 2);
    }
    
    renderMonster(monster, x, y) {
        const bounce = Math.sin(this.time * 0.005) * 1;
        
        // 간단한 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 8, y + 14, 6, 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        switch(monster.type) {
            case 's3':
                this.ctx.fillStyle = '#1976D2';
                this.ctx.fillRect(x + 2, y + 4 + bounce, 12, 10);
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(x + 4, y + 6 + bounce, 2, 2);
                this.ctx.fillRect(x + 10, y + 6 + bounce, 2, 2);
                break;
                
            case 'lambda':
                this.ctx.fillStyle = '#FFD600';
                this.ctx.fillRect(x + 3, y + 4 + bounce, 10, 8);
                this.ctx.fillStyle = '#FF6F00';
                this.ctx.fillRect(x + 5, y + 3 + bounce, 2, 4);
                this.ctx.fillRect(x + 4, y + 6 + bounce, 4, 2);
                break;
                
            case 'ec2':
                this.ctx.fillStyle = '#37474F';
                this.ctx.fillRect(x + 2, y + 4 + bounce, 12, 10);
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + 4, y + 6 + bounce, 2, 1);
                this.ctx.fillStyle = '#FF9900';
                this.ctx.fillRect(x + 7, y + 6 + bounce, 2, 1);
                break;
                
            default:
                this.ctx.fillStyle = '#FF9900';
                this.ctx.fillRect(x + 2, y + 4 + bounce, 12, 10);
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(x + 4, y + 6 + bounce, 2, 2);
                this.ctx.fillRect(x + 10, y + 6 + bounce, 2, 2);
        }
        
        // 간단한 이름 표시
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '8px monospace';
        this.ctx.fillText(monster.name.substring(0, 6), x - 5, y - 2);
    }
    
    renderGymLeader(leader, x, y) {
        // 간단한 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 8, y + 14, 6, 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 체육관 관장 복장
        const colors = {
            cp: '#2E7D32',
            saa: '#1565C0', 
            dva: '#E65100',
            sap: '#4A148C'
        };
        
        // 몸통
        this.ctx.fillStyle = colors[leader.cert] || '#424242';
        this.ctx.fillRect(x + 4, y + 8, 8, 6);
        
        // 머리
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 5, y + 3, 6, 6);
        
        // 머리카락
        this.ctx.fillStyle = '#2C1810';
        this.ctx.fillRect(x + 4, y + 2, 8, 4);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 6, y + 5, 1, 1);
        this.ctx.fillRect(x + 9, y + 5, 1, 1);
        
        // 다리
        this.ctx.fillStyle = '#1565C0';
        this.ctx.fillRect(x + 6, y + 12, 4, 4);
        
        // 타이틀
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 8px monospace';
        this.ctx.fillText(leader.cert.toUpperCase(), x + 2, y - 2);
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x - this.camera.x, particle.y - this.camera.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    renderBattle() {
        // 배틀 배경
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1A237E');
        gradient.addColorStop(1, '#3F51B5');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 몬스터 (오른쪽 상단)
        if (this.battleState.monster) {
            const monsterX = this.canvas.width * 0.75;
            const monsterY = this.canvas.height * 0.25;
            this.renderMonster(this.battleState.monster, monsterX - 16, monsterY - 16);
            
            // 몬스터 HP 바
            const hpBarWidth = 180;
            const hpBarHeight = 16;
            const hpBarX = monsterX - hpBarWidth / 2;
            const hpBarY = monsterY - 50;
            
            this.ctx.fillStyle = '#424242';
            this.ctx.fillRect(hpBarX - 2, hpBarY - 2, hpBarWidth + 4, hpBarHeight + 4);
            
            this.ctx.fillStyle = '#F44336';
            this.ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
            
            const hpPercent = this.battleState.monster.hp / this.battleState.monster.maxHp;
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 12px monospace';
            this.ctx.fillText(this.battleState.monster.name, hpBarX, hpBarY - 8);
        }
        
        // 플레이어 (왼쪽 하단)
        const playerX = this.canvas.width * 0.25;
        const playerY = this.canvas.height * 0.65;
        this.renderPlayer(playerX - 16, playerY - 16);
        
        // 플레이어 HP 바
        const playerHpBarWidth = 180;
        const playerHpBarHeight = 16;
        const playerHpBarX = playerX - playerHpBarWidth / 2;
        const playerHpBarY = playerY + 50;
        
        this.ctx.fillStyle = '#424242';
        this.ctx.fillRect(playerHpBarX - 2, playerHpBarY - 2, playerHpBarWidth + 4, playerHpBarHeight + 4);
        
        this.ctx.fillStyle = '#F44336';
        this.ctx.fillRect(playerHpBarX, playerHpBarY, playerHpBarWidth, playerHpBarHeight);
        
        const playerHpPercent = this.player.hp / this.player.maxHp;
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(playerHpBarX, playerHpBarY, playerHpBarWidth * playerHpPercent, playerHpBarHeight);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 12px monospace';
        this.ctx.fillText('플레이어', playerHpBarX, playerHpBarY - 8);
        
        // 퀴즈 인터페이스
        if (this.battleState.battlePhase === 'question' && this.battleState.currentQuestion) {
            this.renderQuizInterface();
        }
        
        // 데미지 넘버
        this.battleState.damageNumbers.forEach(dmg => {
            const alpha = dmg.life / dmg.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = dmg.color;
            this.ctx.font = 'bold 20px monospace';
            this.ctx.fillText(`-${dmg.damage}`, dmg.x, dmg.y);
            this.ctx.restore();
        });
    }
    
    renderQuizInterface() {
        const question = this.battleState.currentQuestion;
        
        // 질문 패널
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(50, this.canvas.height - 220, this.canvas.width - 100, 170);
        
        // 질문 텍스트
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(question.question, 70, this.canvas.height - 190);
        
        // 선택지
        question.options.forEach((option, index) => {
            const optionY = this.canvas.height - 160 + index * 35;
            const optionX = 70;
            
            // 선택지 배경
            const isHovered = this.mouse.y >= optionY - 15 && this.mouse.y <= optionY + 15;
            this.ctx.fillStyle = isHovered ? 'rgba(255, 153, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(optionX - 10, optionY - 15, this.canvas.width - 140, 30);
            
            // 선택지 텍스트
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '14px monospace';
            this.ctx.fillText(`${index + 1}. ${option}`, optionX, optionY);
        });
        
        // 안내 텍스트
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('클릭하거나 1-4 키를 눌러 답을 선택하세요', 70, this.canvas.height - 70);
    }
    
    renderUI() {
        // 최적화된 UI - 간결하고 깔끔하게
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, 50);
        
        // 플레이어 상태 바
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 12px monospace';
        this.ctx.fillText(`Lv.${this.player.level}`, 10, 20);
        
        // HP 바
        const hpBarWidth = 100;
        const hpPercent = this.player.hp / this.player.maxHp;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(50, 10, hpBarWidth, 12);
        this.ctx.fillStyle = hpPercent > 0.3 ? '#4CAF50' : '#F44336';
        this.ctx.fillRect(50, 10, hpBarWidth * hpPercent, 12);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(`${this.player.hp}/${this.player.maxHp}`, 55, 20);
        
        // EXP 바
        const expBarWidth = 120;
        const expPercent = this.player.exp / this.player.expToNext;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(160, 10, expBarWidth, 12);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(160, 10, expBarWidth * expPercent, 12);
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText(`EXP: ${this.player.exp}/${this.player.expToNext}`, 165, 20);
        
        // 자격증 카운트
        this.ctx.fillStyle = '#FF9900';
        this.ctx.font = 'bold 12px monospace';
        this.ctx.fillText(`🏆 ${this.player.certifications.size}/4`, 300, 20);
        
        // 크레딧
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillText(`💰 ${this.player.awsCredits}`, 400, 20);
        
        // 간단한 조작법
        this.ctx.fillStyle = '#CCC';
        this.ctx.font = '10px monospace';
        this.ctx.fillText('WASD: 이동 | SPACE: 상호작용', this.canvas.width - 200, 15);
        
        // 하단 지역 정보 표시
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, this.canvas.height - 30, this.canvas.width, 30);
        
        // 현재 지역 표시
        const playerX = Math.floor(this.player.x / this.tileSize);
        let currentZone = '노들섬';
        if (playerX < 25) currentZone = '초보자 구역 (S3, EC2)';
        else if (playerX < 50) currentZone = '중급자 숲 (VPC, ELB)';
        else currentZone = '고급자 산 (Kubernetes, DevOps)';
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`${this.player.name} - ${currentZone}`, 10, this.canvas.height - 10);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 게임 시작
window.addEventListener('load', () => {
    new AWSNodeulQuest();
});