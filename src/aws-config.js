// AWS SDK 설정 (나중에 실제 AWS 서비스 연동 시 사용)
const AWS_CONFIG = {
    region: 'ap-northeast-2',
    
    // DynamoDB 테이블 설정
    dynamodb: {
        tableName: 'aws-cert-quest-players',
        endpoint: 'https://dynamodb.ap-northeast-2.amazonaws.com'
    },
    
    // S3 버킷 설정
    s3: {
        bucketName: 'aws-cert-quest-assets',
        region: 'ap-northeast-2'
    },
    
    // API Gateway 설정
    api: {
        baseUrl: 'https://api.aws-cert-quest.com',
        endpoints: {
            saveProgress: '/save-progress',
            loadProgress: '/load-progress',
            leaderboard: '/leaderboard'
        }
    }
};

// 로컬 스토리지를 사용한 간단한 데이터 저장 (MVP용)
class GameStorage {
    static saveProgress(playerData) {
        localStorage.setItem('aws-cert-quest-progress', JSON.stringify(playerData));
    }
    
    static loadProgress() {
        const data = localStorage.getItem('aws-cert-quest-progress');
        return data ? JSON.parse(data) : null;
    }
    
    static clearProgress() {
        localStorage.removeItem('aws-cert-quest-progress');
    }
}

// 향후 AWS 서비스 연동을 위한 API 클래스
class AWSGameAPI {
    constructor() {
        // AWS SDK 초기화는 나중에 구현
        this.isConnected = false;
    }
    
    async savePlayerProgress(playerData) {
        if (this.isConnected) {
            // DynamoDB에 저장
            console.log('Saving to DynamoDB:', playerData);
        } else {
            // 로컬 스토리지에 저장
            GameStorage.saveProgress(playerData);
        }
    }
    
    async loadPlayerProgress(playerId) {
        if (this.isConnected) {
            // DynamoDB에서 로드
            console.log('Loading from DynamoDB:', playerId);
            return null;
        } else {
            // 로컬 스토리지에서 로드
            return GameStorage.loadProgress();
        }
    }
}