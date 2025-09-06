// PNG 스프라이트 생성 스크립트
const fs = require('fs');
const { createCanvas } = require('canvas');

class SpriteGenerator {
    constructor() {
        this.tileSize = 16;
        this.spritesPath = './assets/sprites/png/';
        
        // 디렉토리 생성
        if (!fs.existsSync(this.spritesPath)) {
            fs.mkdirSync(this.spritesPath, { recursive: true });
        }
    }
    
    // 16x16 타일 스프라이트 생성
    generateTileSprites() {
        const canvas = createCanvas(256, 256); // 16x16 타일 시트
        const ctx = canvas.getContext('2d');
        
        // 잔디 타일 (0,0)
        this.drawGrassTile(ctx, 0, 0);
        
        // 물 타일 (16,0)
        this.drawWaterTile(ctx, 16, 0);
        
        // 나무 타일 (32,0)
        this.drawTreeTile(ctx, 32, 0);
        
        // 길 타일 (48,0)
        this.drawPathTile(ctx, 48, 0);
        
        // AWS 센터 (64,0)
        this.drawAWSCenterTile(ctx, 64, 0);
        
        // CP 체육관 (80,0)
        this.drawCPGymTile(ctx, 80, 0);
        
        // 숲 타일 (96,0)
        this.drawForestTile(ctx, 96, 0);
        
        // 산 타일 (112,0)
        this.drawMountainTile(ctx, 112, 0);
        
        // PNG 저장
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(this.spritesPath + 'tiles.png', buffer);
        console.log('✅ tiles.png 생성 완료');
    }
    
    // 플레이어 스프라이트 생성 (4방향 x 2프레임)
    generatePlayerSprites() {
        const canvas = createCanvas(128, 64); // 8x4 스프라이트 시트
        const ctx = canvas.getContext('2d');
        
        // 아래쪽 보기 (0,0), (16,0)
        this.drawPlayer(ctx, 0, 0, 'down', 0);
        this.drawPlayer(ctx, 16, 0, 'down', 1);
        
        // 위쪽 보기 (32,0), (48,0)
        this.drawPlayer(ctx, 32, 0, 'up', 0);
        this.drawPlayer(ctx, 48, 0, 'up', 1);
        
        // 왼쪽 보기 (64,0), (80,0)
        this.drawPlayer(ctx, 64, 0, 'left', 0);
        this.drawPlayer(ctx, 80, 0, 'left', 1);
        
        // 오른쪽 보기 (96,0), (112,0)
        this.drawPlayer(ctx, 96, 0, 'right', 0);
        this.drawPlayer(ctx, 112, 0, 'right', 1);
        
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(this.spritesPath + 'player.png', buffer);
        console.log('✅ player.png 생성 완료');
    }
    
    // 몬스터 스프라이트 생성
    generateMonsterSprites() {
        const canvas = createCanvas(128, 32); // 8x2 스프라이트 시트
        const ctx = canvas.getContext('2d');
        
        // S3 몬스터 (0,0)
        this.drawS3Monster(ctx, 0, 0);
        
        // EC2 몬스터 (16,0)
        this.drawEC2Monster(ctx, 16, 0);
        
        // Lambda 몬스터 (32,0)
        this.drawLambdaMonster(ctx, 32, 0);
        
        // VPC 몬스터 (48,0)
        this.drawVPCMonster(ctx, 48, 0);
        
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(this.spritesPath + 'monsters.png', buffer);
        console.log('✅ monsters.png 생성 완료');
    }
    
    // 잔디 타일 그리기
    drawGrassTile(ctx, x, y) {
        // 베이스 잔디
        ctx.fillStyle = '#4A7C59';
        ctx.fillRect(x, y, 16, 16);
        
        // 잔디 패턴
        ctx.fillStyle = '#5D8A6B';
        ctx.fillRect(x + 2, y + 2, 2, 6);
        ctx.fillRect(x + 6, y + 4, 2, 4);
        ctx.fillRect(x + 10, y + 2, 2, 6);
        ctx.fillRect(x + 14, y + 4, 2, 4);
        
        // 작은 꽃들
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 4, y + 8, 2, 2);
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(x + 12, y + 10, 2, 2);
    }
    
    // 물 타일 그리기
    drawWaterTile(ctx, x, y) {
        ctx.fillStyle = '#2E86AB';
        ctx.fillRect(x, y, 16, 16);
        
        // 물결 효과
        ctx.fillStyle = '#4A9FBF';
        ctx.fillRect(x, y + 4, 16, 4);
        ctx.fillRect(x, y + 10, 16, 2);
        
        // 반짝임
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 6, y + 6, 2, 2);
        ctx.fillRect(x + 12, y + 8, 1, 1);
    }
    
    // 나무 타일 그리기
    drawTreeTile(ctx, x, y) {
        // 잔디 배경
        ctx.fillStyle = '#4A7C59';
        ctx.fillRect(x, y, 16, 16);
        
        // 나무 줄기
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 6, y + 10, 4, 6);
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x + 7, y + 11, 2, 4);
        
        // 나뭇잎 (레이어드)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 2, y + 2, 12, 12);
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(x + 3, y + 3, 10, 10);
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x + 5, y + 5, 6, 6);
        
        // 과일
        ctx.fillStyle = '#FF6347';
        ctx.fillRect(x + 4, y + 7, 2, 2);
        ctx.fillRect(x + 10, y + 8, 2, 2);
    }
    
    // 길 타일 그리기
    drawPathTile(ctx, x, y) {
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(x, y, 16, 16);
        
        // 돌 패턴
        ctx.fillStyle = '#C0A080';
        ctx.fillRect(x + 2, y + 2, 4, 4);
        ctx.fillRect(x + 8, y + 6, 4, 4);
        ctx.fillRect(x + 4, y + 10, 6, 4);
        
        // 작은 자갈
        ctx.fillStyle = '#A0826D';
        ctx.fillRect(x + 1, y + 1, 2, 2);
        ctx.fillRect(x + 12, y + 3, 2, 2);
        ctx.fillRect(x + 6, y + 14, 2, 2);
    }
    
    // AWS 센터 타일 그리기
    drawAWSCenterTile(ctx, x, y) {
        ctx.fillStyle = '#FF9900';
        ctx.fillRect(x, y, 16, 16);
        
        // 건물 디테일
        ctx.fillStyle = '#FFB84D';
        ctx.fillRect(x + 2, y + 2, 12, 12);
        
        // 창문
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + 4, y + 4, 3, 3);
        ctx.fillRect(x + 9, y + 4, 3, 3);
        ctx.fillRect(x + 4, y + 9, 3, 3);
        ctx.fillRect(x + 9, y + 9, 3, 3);
        
        // AWS 로고
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 6, y + 6, 4, 2);
    }
    
    // CP 체육관 타일 그리기
    drawCPGymTile(ctx, x, y) {
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(x, y, 16, 16);
        
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x + 2, y + 2, 12, 12);
        
        // CP 마크
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 6, y + 6, 4, 4);
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(x + 7, y + 7, 2, 2);
    }
    
    // 숲 타일 그리기
    drawForestTile(ctx, x, y) {
        ctx.fillStyle = '#1B5E20';
        ctx.fillRect(x, y, 16, 16);
        
        // 숲 텍스처
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(x + 2, y + 2, 3, 5);
        ctx.fillRect(x + 7, y + 4, 3, 5);
        ctx.fillRect(x + 12, y + 2, 3, 5);
        ctx.fillRect(x + 4, y + 9, 3, 5);
        ctx.fillRect(x + 9, y + 11, 3, 5);
    }
    
    // 산 타일 그리기
    drawMountainTile(ctx, x, y) {
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x, y, 16, 16);
        
        // 바위 패턴
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(x + 2, y + 2, 6, 6);
        ctx.fillRect(x + 8, y + 8, 6, 6);
        
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x + 4, y + 4, 3, 3);
        ctx.fillRect(x + 10, y + 10, 3, 3);
    }
    
    // 플레이어 그리기
    drawPlayer(ctx, x, y, direction, frame) {
        // 그림자
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(x + 4, y + 14, 8, 2);
        
        // 다리 (애니메이션)
        ctx.fillStyle = '#1565C0';
        if (frame === 1) {
            ctx.fillRect(x + 5, y + 12, 2, 4);
            ctx.fillRect(x + 9, y + 12, 2, 4);
        } else {
            ctx.fillRect(x + 6, y + 12, 4, 4);
        }
        
        // 몸통 (AWS 티셔츠)
        ctx.fillStyle = '#FF9900';
        ctx.fillRect(x + 4, y + 8, 8, 6);
        
        // 셔츠 디테일
        ctx.fillStyle = '#FFB84D';
        ctx.fillRect(x + 4, y + 8, 2, 6);
        
        // 팔
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(x + 2, y + 9, 2, 4);
        ctx.fillRect(x + 12, y + 9, 2, 4);
        
        // 머리
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(x + 5, y + 3, 6, 6);
        
        // 머리카락
        ctx.fillStyle = '#2C1810';
        ctx.fillRect(x + 4, y + 2, 8, 4);
        
        // 눈 (방향에 따라 다르게)
        ctx.fillStyle = '#000000';
        if (direction === 'left') {
            ctx.fillRect(x + 6, y + 5, 1, 1);
        } else if (direction === 'right') {
            ctx.fillRect(x + 9, y + 5, 1, 1);
        } else {
            ctx.fillRect(x + 6, y + 5, 1, 1);
            ctx.fillRect(x + 9, y + 5, 1, 1);
        }
        
        // 입
        if (direction !== 'up') {
            ctx.fillStyle = '#D4A574';
            ctx.fillRect(x + 7, y + 7, 2, 1);
        }
        
        // 신발
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 4, y + 15, 3, 1);
        ctx.fillRect(x + 9, y + 15, 3, 1);
    }
    
    // S3 몬스터 그리기
    drawS3Monster(ctx, x, y) {
        // 베이스
        ctx.fillStyle = '#1976D2';
        ctx.fillRect(x + 2, y + 4, 12, 10);
        
        // S3 로고
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 4, y + 6, 2, 2);
        ctx.fillRect(x + 10, y + 6, 2, 2);
        ctx.fillRect(x + 7, y + 9, 2, 2);
        
        // 그림자
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 4, y + 14, 8, 2);
    }
    
    // EC2 몬스터 그리기
    drawEC2Monster(ctx, x, y) {
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 2, y + 4, 12, 10);
        
        // 서버 표시등
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x + 4, y + 6, 2, 1);
        ctx.fillStyle = '#FF9900';
        ctx.fillRect(x + 7, y + 6, 2, 1);
        ctx.fillStyle = '#F44336';
        ctx.fillRect(x + 10, y + 6, 2, 1);
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 4, y + 14, 8, 2);
    }
    
    // Lambda 몬스터 그리기
    drawLambdaMonster(ctx, x, y) {
        ctx.fillStyle = '#FFD600';
        ctx.fillRect(x + 3, y + 4, 10, 8);
        
        // Lambda 심볼
        ctx.fillStyle = '#FF6F00';
        ctx.fillRect(x + 5, y + 3, 2, 4);
        ctx.fillRect(x + 4, y + 6, 4, 2);
        ctx.fillRect(x + 8, y + 8, 2, 4);
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 4, y + 14, 8, 2);
    }
    
    // VPC 몬스터 그리기
    drawVPCMonster(ctx, x, y) {
        ctx.fillStyle = '#9C27B0';
        ctx.fillRect(x + 2, y + 4, 12, 10);
        
        // 네트워크 패턴
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 4, y + 6, 1, 1);
        ctx.fillRect(x + 7, y + 6, 1, 1);
        ctx.fillRect(x + 10, y + 6, 1, 1);
        ctx.fillRect(x + 4, y + 9, 8, 1);
        ctx.fillRect(x + 6, y + 11, 1, 1);
        ctx.fillRect(x + 9, y + 11, 1, 1);
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 4, y + 14, 8, 2);
    }
    
    // 모든 스프라이트 생성
    generateAll() {
        console.log('🎨 PNG 스프라이트 생성 시작...');
        this.generateTileSprites();
        this.generatePlayerSprites();
        this.generateMonsterSprites();
        console.log('✅ 모든 PNG 스프라이트 생성 완료!');
    }
}

// 실행
if (require.main === module) {
    const generator = new SpriteGenerator();
    generator.generateAll();
}

module.exports = SpriteGenerator;