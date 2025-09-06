/**
 * 데이터 매니저 - JSON 기반 게임 데이터 관리
 */

export class DataManager {
    constructor() {
        this.gameData = null;
        this.isLoaded = false;
    }
    
    async init() {
        try {
            // 개발 환경에서는 개별 JSON 파일 로딩, 프로덕션에서는 번들 데이터 사용
            if (this.isDevelopment()) {
                await this.loadDevelopmentData();
            } else {
                await this.loadBundledData();
            }
            
            this.isLoaded = true;
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            // 폴백 데이터 사용
            this.loadFallbackData();
        }
    }
    
    isDevelopment() {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }
    
    async loadDevelopmentData() {
        // 개발 모드에서는 개별 파일 로딩 (수정 시 즉시 반영)
        this.gameData = {
            config: {},
            entities: {},
            quiz: {},
            maps: {}
        };
        
        // 기본 데이터만 로딩 (실제 파일이 없으므로 폴백)
        this.loadFallbackData();
    }
    
    async loadBundledData() {
        // 프로덕션에서는 번들된 데이터 사용
        const { GAME_DATA } = await import('./bundled-data.js');
        this.gameData = GAME_DATA;
    }
    
    loadFallbackData() {
        // 폴백 데이터 (개발용)
        this.gameData = {
            config: {
                game: {
                    title: "AWS 서티 RPG",
                    version: "1.0.0",
                    tileSize: 32
                }
            },
            entities: {
                monsters: [
                    {
                        id: 1,
                        name: "EC2 인스턴스",
                        level: 1,
                        sprite: "ec2",
                        quizCategory: "cp"
                    },
                    {
                        id: 2,
                        name: "S3 버킷",
                        level: 2,
                        sprite: "s3",
                        quizCategory: "saa"
                    },
                    {
                        id: 3,
                        name: "Lambda 함수",
                        level: 3,
                        sprite: "lambda",
                        quizCategory: "dva"
                    },
                    {
                        id: 4,
                        name: "VPC 네트워크",
                        level: 4,
                        sprite: "vpc",
                        quizCategory: "sap"
                    }
                ]
            },
            quiz: {
                cp: [
                    {
                        question: "AWS의 컴퓨팅 서비스는 무엇입니까?",
                        options: ["EC2", "S3", "RDS", "CloudFront"],
                        correctAnswer: 0,
                        explanation: "EC2는 AWS의 대표적인 컴퓨팅 서비스입니다."
                    },
                    {
                        question: "AWS의 객체 스토리지 서비스는 무엇입니까?",
                        options: ["EBS", "EFS", "S3", "Glacier"],
                        correctAnswer: 2,
                        explanation: "S3는 AWS의 객체 스토리지 서비스입니다."
                    }
                ],
                saa: [
                    {
                        question: "고가용성을 위해 여러 AZ에 배포하는 것은?",
                        options: ["단일 장애점 제거", "비용 절감", "성능 향상", "보안 강화"],
                        correctAnswer: 0,
                        explanation: "여러 AZ 배포는 단일 장애점을 제거하여 고가용성을 제공합니다."
                    }
                ],
                dva: [
                    {
                        question: "서버리스 컴퓨팅 서비스는?",
                        options: ["EC2", "Lambda", "ECS", "EKS"],
                        correctAnswer: 1,
                        explanation: "Lambda는 서버리스 컴퓨팅 서비스입니다."
                    }
                ],
                sap: [
                    {
                        question: "대규모 데이터 마이그레이션에 적합한 서비스는?",
                        options: ["DataSync", "Snowball", "Direct Connect", "VPN"],
                        correctAnswer: 1,
                        explanation: "Snowball은 대용량 데이터 마이그레이션에 적합합니다."
                    }
                ]
            },
            maps: {
                'nodeul-island': {
                    width: 1600,
                    height: 1200,
                    tileSize: 32,
                    layers: [
                        {
                            name: "background",
                            data: []
                        }
                    ]
                }
            }
        };
    }
    
    getConfigData(key) {
        return this.gameData?.config?.[key] || {};
    }
    
    getEntityData(type) {
        return this.gameData?.entities?.[type] || [];
    }
    
    getQuizData(category) {
        return this.gameData?.quiz?.[category] || [];
    }
    
    getMapData(mapName) {
        return this.gameData?.maps?.[mapName] || {};
    }
    
    isDataLoaded() {
        return this.isLoaded;
    }
}