export class SpriteLoader {
    constructor() {
        this.sprites = {};
        this.loaded = false;
    }
    
    async loadAllSprites() {
        console.log('🎨 PNG 스프라이트 로딩 시작...');
        
        const spriteFiles = {
            tiles: 'assets/sprites/png/tiles.png',
            player: 'assets/sprites/png/player.png',
            monsters: 'assets/sprites/png/monsters.png'
        };
        
        try {
            for (const [name, path] of Object.entries(spriteFiles)) {
                this.sprites[name] = await this.loadImage(path);
                console.log(`✅ ${name}.png 로딩 완료`);
            }
            
            this.loaded = true;
            console.log('🎉 모든 스프라이트 로딩 완료!');
            return this.sprites;
            
        } catch (error) {
            console.warn('⚠️ PNG 스프라이트 로딩 실패, 폴백 모드 사용:', error);
            this.loaded = false;
            return null;
        }
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    // 타일 스프라이트 가져오기
    getTileSprite(tileId) {
        if (!this.loaded || !this.sprites.tiles) return null;
        
        const tileMap = {
            1: { x: 0, y: 0 },    // 잔디
            2: { x: 16, y: 0 },   // 물
            3: { x: 32, y: 0 },   // 나무
            4: { x: 48, y: 0 },   // 길
            8: { x: 64, y: 0 },   // AWS 센터
            11: { x: 80, y: 0 },  // CP 체육관
            15: { x: 96, y: 0 },  // 숲
            16: { x: 112, y: 0 }  // 산
        };
        
        return {
            image: this.sprites.tiles,
            ...tileMap[tileId],
            width: 16,
            height: 16
        };
    }
    
    // 플레이어 스프라이트 가져오기
    getPlayerSprite(direction, frame) {
        if (!this.loaded || !this.sprites.player) return null;
        
        const directionMap = {
            down: 0,
            up: 32,
            left: 64,
            right: 96
        };
        
        const x = directionMap[direction] + (frame * 16);
        
        return {
            image: this.sprites.player,
            x: x,
            y: 0,
            width: 16,
            height: 16
        };
    }
    
    // 몬스터 스프라이트 가져오기
    getMonsterSprite(type) {
        if (!this.loaded || !this.sprites.monsters) return null;
        
        const monsterMap = {
            s3: { x: 0, y: 0 },
            ec2: { x: 16, y: 0 },
            lambda: { x: 32, y: 0 },
            vpc: { x: 48, y: 0 }
        };
        
        return {
            image: this.sprites.monsters,
            ...monsterMap[type],
            width: 16,
            height: 16
        };
    }
}