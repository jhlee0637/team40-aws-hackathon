// Professional 16x16 Pixel Art Rendering System
class PixelRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // Pixel art settings
        this.pixelSize = 2; // 2x scaling for crisp pixels
        this.tileSize = 16;
        this.scaledTileSize = this.tileSize * this.pixelSize;
        
        // Color palette (AWS themed)
        this.palette = {
            grass: ['#4A7C59', '#5D8B6A', '#70A07B', '#83B58C'],
            water: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA'],
            aws_orange: ['#FF9900', '#FFB84D', '#FFC266', '#FFCC80'],
            aws_dark: ['#232F3E', '#2D3748', '#4A5568', '#718096'],
            dirt: ['#8B4513', '#A0522D', '#CD853F', '#DEB887'],
            stone: ['#696969', '#808080', '#A9A9A9', '#C0C0C0']
        };
        
        // Sprite cache
        this.spriteCache = new Map();
        this.animationFrames = new Map();
        
        this.initializeSprites();
    }
    
    initializeSprites() {
        // Create base sprites
        this.createGrassSprite();
        this.createWaterSprite();
        this.createTreeSprite();
        this.createPlayerSprite();
        this.createNPCSprite();
        this.createMonsterSprite();
        this.createBuildingSprites();
    }
    
    createGrassSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Base grass
        ctx.fillStyle = this.palette.grass[0];
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Grass details
        ctx.fillStyle = this.palette.grass[1];
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(Math.random() * 14) + 1;
            const y = Math.floor(Math.random() * 14) + 1;
            ctx.fillRect(x, y, 1, 2);
        }
        
        // Flowers (AWS colors)
        ctx.fillStyle = this.palette.aws_orange[0];
        ctx.fillRect(3, 3, 1, 1);
        ctx.fillRect(12, 8, 1, 1);
        
        this.spriteCache.set('grass', canvas);
    }
    
    createWaterSprite() {
        // Create animated water frames
        const frames = [];
        for (let frame = 0; frame < 4; frame++) {
            const canvas = document.createElement('canvas');
            canvas.width = this.tileSize;
            canvas.height = this.tileSize;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            
            // Base water
            ctx.fillStyle = this.palette.water[0];
            ctx.fillRect(0, 0, this.tileSize, this.tileSize);
            
            // Wave animation
            const waveOffset = frame * 2;
            ctx.fillStyle = this.palette.water[1];
            for (let x = 0; x < this.tileSize; x++) {
                const waveY = 8 + Math.sin((x + waveOffset) * 0.5) * 2;
                ctx.fillRect(x, Math.floor(waveY), 1, 2);
            }
            
            // Highlights
            ctx.fillStyle = this.palette.water[2];
            ctx.fillRect(4 + frame, 4, 2, 1);
            ctx.fillRect(10 - frame, 10, 2, 1);
            
            frames.push(canvas);
        }\n        this.animationFrames.set('water', frames);\n    }\n    \n    createTreeSprite() {\n        // Create multiple tree variants\n        const variants = ['oak', 'pine', 'aws'];\n        \n        variants.forEach((type, index) => {\n            const canvas = document.createElement('canvas');\n            canvas.width = this.tileSize;\n            canvas.height = this.tileSize;\n            const ctx = canvas.getContext('2d');\n            ctx.imageSmoothingEnabled = false;\n            \n            if (type === 'aws') {\n                // AWS themed tree\n                ctx.fillStyle = this.palette.aws_dark[0];\n                ctx.fillRect(7, 12, 2, 4); // trunk\n                \n                ctx.fillStyle = this.palette.aws_orange[0];\n                ctx.fillRect(4, 4, 8, 8); // crown\n                \n                ctx.fillStyle = this.palette.aws_dark[1];\n                ctx.fillRect(5, 5, 6, 6); // inner crown\n            } else if (type === 'pine') {\n                // Pine tree\n                ctx.fillStyle = '#8B4513';\n                ctx.fillRect(7, 12, 2, 4);\n                \n                ctx.fillStyle = '#228B22';\n                ctx.fillRect(6, 8, 4, 4);\n                ctx.fillRect(5, 4, 6, 4);\n            } else {\n                // Oak tree\n                ctx.fillStyle = '#8B4513';\n                ctx.fillRect(7, 12, 2, 4);\n                \n                ctx.fillStyle = '#32CD32';\n                ctx.fillRect(4, 4, 8, 8);\n                \n                ctx.fillStyle = '#228B22';\n                ctx.fillRect(5, 5, 6, 6);\n            }\n            \n            this.spriteCache.set(`tree_${type}`, canvas);\n        });\n    }\n    \n    createPlayerSprite() {\n        const directions = ['down', 'up', 'left', 'right'];\n        \n        directions.forEach(direction => {\n            const frames = [];\n            \n            for (let frame = 0; frame < 4; frame++) {\n                const canvas = document.createElement('canvas');\n                canvas.width = this.tileSize;\n                canvas.height = this.tileSize;\n                const ctx = canvas.getContext('2d');\n                ctx.imageSmoothingEnabled = false;\n                \n                // Body (AWS blue)\n                ctx.fillStyle = this.palette.aws_dark[0];\n                ctx.fillRect(4, 8, 8, 6);\n                \n                // Head\n                ctx.fillStyle = '#FFDBAC';\n                ctx.fillRect(5, 2, 6, 6);\n                \n                // Hat (AWS orange)\n                ctx.fillStyle = this.palette.aws_orange[0];\n                ctx.fillRect(4, 1, 8, 3);\n                \n                // Eyes\n                ctx.fillStyle = '#000000';\n                if (direction === 'left') {\n                    ctx.fillRect(5, 4, 1, 1);\n                } else if (direction === 'right') {\n                    ctx.fillRect(9, 4, 1, 1);\n                } else {\n                    ctx.fillRect(6, 4, 1, 1);\n                    ctx.fillRect(8, 4, 1, 1);\n                }\n                \n                // Walking animation\n                const walkOffset = frame % 2 === 0 ? 0 : 1;\n                \n                // Legs\n                ctx.fillStyle = this.palette.aws_dark[1];\n                if (direction === 'down' || direction === 'up') {\n                    ctx.fillRect(5 + walkOffset, 14, 2, 2);\n                    ctx.fillRect(8 - walkOffset, 14, 2, 2);\n                } else {\n                    ctx.fillRect(5, 14, 2, 2);\n                    ctx.fillRect(8, 14, 2, 2);\n                }\n                \n                frames.push(canvas);\n            }\n            \n            this.animationFrames.set(`player_${direction}`, frames);\n        });\n    }\n    \n    createNPCSprite() {\n        const npcTypes = ['guide', 'architect', 'developer', 'sysops'];\n        const colors = [this.palette.aws_orange[0], this.palette.aws_dark[0], '#FF6B35', '#9C27B0'];\n        \n        npcTypes.forEach((type, index) => {\n            const canvas = document.createElement('canvas');\n            canvas.width = this.tileSize;\n            canvas.height = this.tileSize;\n            const ctx = canvas.getContext('2d');\n            ctx.imageSmoothingEnabled = false;\n            \n            // Body\n            ctx.fillStyle = colors[index];\n            ctx.fillRect(4, 8, 8, 6);\n            \n            // Head\n            ctx.fillStyle = '#FFDBAC';\n            ctx.fillRect(5, 2, 6, 6);\n            \n            // Hat\n            ctx.fillStyle = colors[index] === this.palette.aws_orange[0] ? this.palette.aws_dark[0] : this.palette.aws_orange[0];\n            ctx.fillRect(4, 1, 8, 3);\n            \n            // Eyes\n            ctx.fillStyle = '#000000';\n            ctx.fillRect(6, 4, 1, 1);\n            ctx.fillRect(8, 4, 1, 1);\n            \n            // Legs\n            ctx.fillStyle = colors[index];\n            ctx.fillRect(5, 14, 2, 2);\n            ctx.fillRect(8, 14, 2, 2);\n            \n            this.spriteCache.set(`npc_${type}`, canvas);\n        });\n    }\n    \n    createMonsterSprite() {\n        const monsters = [\n            { name: 'bug', color: '#8B4513' },\n            { name: 'lambda', color: '#FF6347' },\n            { name: 's3', color: '#4169E1' },\n            { name: 'ec2', color: '#DAA520' }\n        ];\n        \n        monsters.forEach(monster => {\n            const frames = [];\n            \n            for (let frame = 0; frame < 2; frame++) {\n                const canvas = document.createElement('canvas');\n                canvas.width = this.tileSize;\n                canvas.height = this.tileSize;\n                const ctx = canvas.getContext('2d');\n                ctx.imageSmoothingEnabled = false;\n                \n                // Body\n                ctx.fillStyle = monster.color;\n                ctx.fillRect(2, 6, 12, 8);\n                \n                // Eyes (AWS orange)\n                ctx.fillStyle = this.palette.aws_orange[0];\n                const eyeOffset = frame === 0 ? 0 : 1;\n                ctx.fillRect(4 + eyeOffset, 8, 2, 2);\n                ctx.fillRect(9 + eyeOffset, 8, 2, 2);\n                \n                // Legs\n                ctx.fillStyle = monster.color;\n                ctx.fillRect(3, 14, 2, 2);\n                ctx.fillRect(6, 14, 2, 2);\n                ctx.fillRect(8, 14, 2, 2);\n                ctx.fillRect(11, 14, 2, 2);\n                \n                frames.push(canvas);\n            }\n            \n            this.animationFrames.set(`monster_${monster.name}`, frames);\n        });\n    }\n    \n    createBuildingSprites() {\n        const buildings = [\n            { name: 'aws_center', color: this.palette.aws_orange[0], accent: this.palette.aws_dark[0] },\n            { name: 'cafe', color: '#4CAF50', accent: '#FFFFFF' },\n            { name: 'datacenter', color: '#607D8B', accent: this.palette.aws_orange[0] }\n        ];\n        \n        buildings.forEach(building => {\n            const canvas = document.createElement('canvas');\n            canvas.width = this.tileSize;\n            canvas.height = this.tileSize;\n            const ctx = canvas.getContext('2d');\n            ctx.imageSmoothingEnabled = false;\n            \n            // Building base\n            ctx.fillStyle = building.color;\n            ctx.fillRect(1, 1, 14, 14);\n            \n            // Accent details\n            ctx.fillStyle = building.accent;\n            ctx.fillRect(2, 2, 12, 12);\n            \n            // Windows/details\n            ctx.fillStyle = building.color;\n            if (building.name === 'aws_center') {\n                ctx.fillRect(4, 4, 3, 3);\n                ctx.fillRect(9, 4, 3, 3);\n                ctx.fillRect(4, 9, 3, 3);\n                ctx.fillRect(9, 9, 3, 3);\n            } else if (building.name === 'datacenter') {\n                for (let i = 0; i < 4; i++) {\n                    ctx.fillRect(4 + (i % 2) * 4, 5 + Math.floor(i / 2) * 4, 2, 2);\n                }\n            }\n            \n            this.spriteCache.set(`building_${building.name}`, canvas);\n        });\n    }\n    \n    renderTile(tileType, x, y, mapX, mapY, time = 0) {\n        const scaledX = x * this.pixelSize;\n        const scaledY = y * this.pixelSize;\n        \n        switch(tileType) {\n            case 1: // Grass\n                this.renderSprite('grass', scaledX, scaledY);\n                break;\n                \n            case 2: // Water\n                const waterFrame = Math.floor(time * 4) % 4;\n                this.renderAnimatedSprite('water', waterFrame, scaledX, scaledY);\n                break;\n                \n            case 3: // Trees (multiple variants)\n                const treeVariant = (mapX + mapY) % 3;\n                const treeTypes = ['oak', 'pine', 'aws'];\n                this.renderSprite(`tree_${treeTypes[treeVariant]}`, scaledX, scaledY);\n                break;\n                \n            case 4: // Server rack\n                this.renderServerRack(scaledX, scaledY, mapX, mapY);\n                break;\n                \n            case 5: // Cables\n                this.renderCables(scaledX, scaledY, mapX, mapY);\n                break;\n                \n            case 7: // Path\n                this.renderPath(scaledX, scaledY);\n                break;\n                \n            case 8: // AWS Center\n                this.renderSprite('building_aws_center', scaledX, scaledY);\n                break;\n                \n            case 9: // Cafe\n                this.renderSprite('building_cafe', scaledX, scaledY);\n                break;\n                \n            case 10: // Data center\n                this.renderSprite('building_datacenter', scaledX, scaledY);\n                break;\n                \n            case 11: // Flower field\n                this.renderFlowerField(scaledX, scaledY, mapX, mapY);\n                break;\n        }\n    }\n    \n    renderSprite(spriteName, x, y) {\n        const sprite = this.spriteCache.get(spriteName);\n        if (sprite) {\n            this.ctx.drawImage(sprite, x, y, this.scaledTileSize, this.scaledTileSize);\n        }\n    }\n    \n    renderAnimatedSprite(spriteName, frame, x, y) {\n        const frames = this.animationFrames.get(spriteName);\n        if (frames && frames[frame]) {\n            this.ctx.drawImage(frames[frame], x, y, this.scaledTileSize, this.scaledTileSize);\n        }\n    }\n    \n    renderPlayer(x, y, direction, animFrame, time) {\n        const scaledX = x * this.pixelSize;\n        const scaledY = y * this.pixelSize;\n        const frame = Math.floor(animFrame) % 4;\n        this.renderAnimatedSprite(`player_${direction}`, frame, scaledX, scaledY);\n    }\n    \n    renderNPC(x, y, npcType) {\n        const scaledX = x * this.pixelSize;\n        const scaledY = y * this.pixelSize;\n        this.renderSprite(`npc_${npcType}`, scaledX, scaledY);\n    }\n    \n    renderMonster(x, y, monsterType, time) {\n        const scaledX = x * this.pixelSize;\n        const scaledY = y * this.pixelSize;\n        const frame = Math.floor(time * 2) % 2;\n        this.renderAnimatedSprite(`monster_${monsterType}`, frame, scaledX, scaledY);\n    }\n    \n    renderServerRack(x, y, mapX, mapY) {\n        // Base\n        this.ctx.fillStyle = this.palette.aws_dark[0];\n        this.ctx.fillRect(x, y, this.scaledTileSize, this.scaledTileSize);\n        \n        // Server units\n        this.ctx.fillStyle = this.palette.aws_orange[0];\n        for (let i = 0; i < 4; i++) {\n            const unitY = y + (i * 6 + 2) * this.pixelSize;\n            this.ctx.fillRect(x + 2 * this.pixelSize, unitY, 12 * this.pixelSize, 4 * this.pixelSize);\n        }\n        \n        // LED indicators\n        this.ctx.fillStyle = '#00FF00';\n        this.ctx.fillRect(x + 14 * this.pixelSize, y + 4 * this.pixelSize, this.pixelSize, this.pixelSize);\n    }\n    \n    renderCables(x, y, mapX, mapY) {\n        this.ctx.fillStyle = this.palette.aws_dark[1];\n        this.ctx.fillRect(x, y, this.scaledTileSize, this.scaledTileSize);\n        \n        // Cable pattern\n        this.ctx.fillStyle = this.palette.aws_orange[0];\n        this.ctx.fillRect(x, y + 6 * this.pixelSize, this.scaledTileSize, 4 * this.pixelSize);\n    }\n    \n    renderPath(x, y) {\n        this.ctx.fillStyle = '#D7CCC8';\n        this.ctx.fillRect(x, y, this.scaledTileSize, this.scaledTileSize);\n        \n        // Path texture\n        this.ctx.fillStyle = '#BCAAA4';\n        for (let i = 0; i < 8; i++) {\n            const px = x + (i % 4) * 4 * this.pixelSize;\n            const py = y + Math.floor(i / 4) * 8 * this.pixelSize;\n            this.ctx.fillRect(px, py, this.pixelSize, this.pixelSize);\n        }\n    }\n    \n    renderFlowerField(x, y, mapX, mapY) {\n        // Grass base\n        this.renderSprite('grass', x, y);\n        \n        // AWS colored flowers\n        const flowerColors = [this.palette.aws_orange[0], this.palette.aws_dark[0], '#FF6B6B', '#4ECDC4'];\n        const seed = (mapX * 7 + mapY * 11) % 100;\n        \n        for (let i = 0; i < 6; i++) {\n            const fx = x + ((seed + i * 13) % 12 + 2) * this.pixelSize;\n            const fy = y + ((seed + i * 17) % 12 + 2) * this.pixelSize;\n            \n            this.ctx.fillStyle = flowerColors[i % flowerColors.length];\n            this.ctx.fillRect(fx, fy, this.pixelSize, this.pixelSize);\n        }\n    }\n}\n\n// Animation Controller\nclass AnimationController {\n    constructor() {\n        this.animations = new Map();\n        this.time = 0;\n    }\n    \n    update(deltaTime) {\n        this.time += deltaTime;\n    }\n    \n    getFrame(animationName, speed = 1) {\n        return Math.floor(this.time * speed) % 4;\n    }\n    \n    getWaterFrame() {\n        return Math.floor(this.time * 2) % 4;\n    }\n    \n    getMonsterFrame() {\n        return Math.floor(this.time * 1.5) % 2;\n    }\n}\n\n// Particle System\nclass ParticleSystem {\n    constructor() {\n        this.particles = [];\n    }\n    \n    addParticle(x, y, type) {\n        this.particles.push({\n            x, y, type,\n            vx: (Math.random() - 0.5) * 2,\n            vy: (Math.random() - 0.5) * 2,\n            life: 1.0,\n            maxLife: 1.0\n        });\n    }\n    \n    update(deltaTime) {\n        this.particles = this.particles.filter(particle => {\n            particle.x += particle.vx * deltaTime * 60;\n            particle.y += particle.vy * deltaTime * 60;\n            particle.life -= deltaTime;\n            return particle.life > 0;\n        });\n    }\n    \n    render(ctx, pixelSize) {\n        this.particles.forEach(particle => {\n            const alpha = particle.life / particle.maxLife;\n            ctx.globalAlpha = alpha;\n            \n            if (particle.type === 'exp') {\n                ctx.fillStyle = '#FFD700';\n            } else if (particle.type === 'heal') {\n                ctx.fillStyle = '#00FF00';\n            }\n            \n            ctx.fillRect(\n                particle.x * pixelSize, \n                particle.y * pixelSize, \n                pixelSize, \n                pixelSize\n            );\n        });\n        \n        ctx.globalAlpha = 1.0;\n    }\n}"