/**
 * AWS 노들노들 이야기 - 전문가급 픽셀 아트 RPG
 * 고급 렌더링, 애니메이션, 파티클 시스템을 포함한 완전한 게임 엔진
 */

// 전문가급 픽셀 렌더러
class ProfessionalPixelRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.tileCache = new Map();
        this.animationFrames = new Map();
        this.shaderEffects = new Map();
        this.setupShaders();
    }

    setupShaders() {
        // 물 셰이더 효과
        this.shaderEffects.set('water', {
            time: 0,
            amplitude: 2,
            frequency: 0.1,
            speed: 2
        });
        
        // 불꽃 셰이더 효과
        this.shaderEffects.set('fire', {
            time: 0,
            flicker: 0.3,
            intensity: 1.0
        });
    }

    renderTile(tileType, x, y, mapX, mapY, time = 0) {
        const size = 32;
        
        switch(tileType) {
            case 1: // 프리미엄 잔디
                this.renderPremiumGrass(x, y, size, mapX, mapY, time);
                break;
            case 2: // 동적 물
                this.renderDynamicWater(x, y, size, mapX, mapY, time);
                break;
            case 3: // AWS 나무 (애니메이션)
                this.renderAnimatedTree(x, y, size, mapX, mapY, time);
                break;
            case 4: // 서버랙 (LED 애니메이션)
                this.renderServerRack(x, y, size, mapX, mapY, time);
                break;
            case 5: // 데이터 케이블 (전기 효과)
                this.renderDataCable(x, y, size, mapX, mapY, time);
                break;
            case 8: // AWS 센터 (홀로그램 효과)
                this.renderAWSCenter(x, y, size, mapX, mapY, time);
                break;
            default:
                this.renderBasicTile(tileType, x, y, size);
        }
    }

    renderPremiumGrass(x, y, size, mapX, mapY, time) {
        // 기본 잔디 색상 (그라데이션)
        const gradient = this.ctx.createLinearGradient(x, y, x, y + size);
        gradient.addColorStop(0, '#8BC34A');
        gradient.addColorStop(0.6, '#7CB342');
        gradient.addColorStop(1, '#689F38');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, size, size);
        
        // 잔디 텍스처 (시드 기반)
        const seed = (mapX * 7 + mapY * 11) % 100;
        const random = this.seededRandom(seed);
        
        // 잔디 블레이드
        for (let i = 0; i < 8; i++) {
            const grassX = x + (random() * size);
            const grassY = y + (random() * size);
            const height = 3 + random() * 4;
            const sway = Math.sin(time * 0.002 + i) * 0.5;
            
            this.ctx.fillStyle = `hsl(${100 + random() * 20}, 60%, ${40 + random() * 20}%)`;
            this.ctx.fillRect(grassX + sway, grassY, 1, height);
        }
        
        // 꽃 (희귀)
        if (seed > 90) {
            const flowerX = x + size * 0.3 + Math.sin(time * 0.001) * 2;
            const flowerY = y + size * 0.3 + Math.cos(time * 0.001) * 2;
            
            // 꽃잎
            const colors = ['#FF9900', '#FF6B6B', '#4ECDC4', '#45B7D1'];
            this.ctx.fillStyle = colors[seed % colors.length];
            
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const petalX = flowerX + Math.cos(angle) * 3;
                const petalY = flowerY + Math.sin(angle) * 3;
                
                this.ctx.beginPath();
                this.ctx.arc(petalX, petalY, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 꽃 중심
            this.ctx.fillStyle = '#FFEB3B';
            this.ctx.beginPath();
            this.ctx.arc(flowerX, flowerY, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderDynamicWater(x, y, size, mapX, mapY, time) {
        const waterShader = this.shaderEffects.get('water');
        waterShader.time = time * 0.001;
        
        // 물 깊이 계산
        const depth = 0.7 + Math.sin(mapX * 0.1) * Math.cos(mapY * 0.1) * 0.3;
        const baseHue = 210;
        const baseSat = 70;
        const baseLit = 20 + depth * 15;
        
        // 물결 효과
        const wave1 = Math.sin(waterShader.time * waterShader.speed + mapX * waterShader.frequency) * waterShader.amplitude;
        const wave2 = Math.cos(waterShader.time * waterShader.speed * 0.7 + mapY * waterShader.frequency) * waterShader.amplitude;
        
        // 기본 물 색상
        this.ctx.fillStyle = `hsl(${baseHue}, ${baseSat}%, ${baseLit}%)`;
        this.ctx.fillRect(x, y, size, size);
        
        // 물결 레이어 1
        this.ctx.fillStyle = `hsl(${baseHue + 10}, ${baseSat - 10}%, ${baseLit + 10}%)`;
        this.ctx.fillRect(x, y + 8 + wave1, size, 6);
        
        // 물결 레이어 2
        this.ctx.fillStyle = `hsl(${baseHue + 20}, ${baseSat - 20}%, ${baseLit + 20}%)`;
        this.ctx.fillRect(x, y + 16 + wave2, size, 4);
        
        // 반짝임 효과
        if (Math.random() < 0.1) {
            const sparkleX = x + Math.random() * size;
            const sparkleY = y + Math.random() * size;
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillRect(sparkleX, sparkleY, 1, 1);
        }
        
        // 물 가장자리 처리 (부드러운 곡선)
        this.renderWaterEdges(x, y, size, mapX, mapY);
    }

    renderAnimatedTree(x, y, size, mapX, mapY, time) {
        // 기본 잔디
        this.ctx.fillStyle = '#7CB342';
        this.ctx.fillRect(x, y, size, size);
        
        // 나무 흔들림 효과
        const sway = Math.sin(time * 0.001 + mapX * 0.1) * 1.5;
        
        // 나무 줄기
        this.ctx.fillStyle = '#5D4037';
        this.ctx.fillRect(x + 14 + sway * 0.3, y + 18, 4, 14);
        
        // 나무 그림자
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.ellipse(x + 16, y + 30, 12, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // AWS 색상 잎사귀 (레이어드)
        const leafColors = ['#FF9900', '#232F3E', '#FF6B35'];
        
        for (let i = 0; i < leafColors.length; i++) {
            const leafSway = sway * (1 - i * 0.2);
            const leafSize = 14 - i * 2;
            
            this.ctx.fillStyle = leafColors[i];
            this.ctx.beginPath();
            this.ctx.arc(x + 16 + leafSway, y + 12 - i, leafSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 잎사귀 디테일
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const leafX = x + 16 + Math.cos(angle) * 8 + sway;
            const leafY = y + 12 + Math.sin(angle) * 8;
            
            this.ctx.fillRect(leafX, leafY, 2, 2);
        }
    }

    renderServerRack(x, y, size, mapX, mapY, time) {
        // 서버랙 베이스
        this.ctx.fillStyle = '#37474F';
        this.ctx.fillRect(x, y, size, size);
        
        // 메탈 테두리
        this.ctx.fillStyle = '#546E7A';
        this.ctx.fillRect(x, y, size, 2);
        this.ctx.fillRect(x, y + size - 2, size, 2);
        this.ctx.fillRect(x, y, 2, size);
        this.ctx.fillRect(x + size - 2, y, 2, size);
        
        // LED 상태 표시등 (애니메이션)
        const ledStates = ['#4CAF50', '#FF9900', '#F44336', '#2196F3'];
        
        for (let i = 0; i < 6; i++) {
            const ledX = x + 4 + (i % 3) * 8;
            const ledY = y + 6 + Math.floor(i / 3) * 10;
            
            // LED 깜빡임
            const blinkSpeed = 0.002 + i * 0.0005;
            const brightness = 0.5 + Math.sin(time * blinkSpeed) * 0.5;
            const colorIndex = Math.floor(time * 0.001 + i) % ledStates.length;
            
            this.ctx.fillStyle = ledStates[colorIndex];
            this.ctx.globalAlpha = brightness;
            this.ctx.fillRect(ledX, ledY, 6, 2);
            this.ctx.globalAlpha = 1;
            
            // LED 글로우 효과
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
            this.ctx.fillRect(ledX - 1, ledY - 1, 8, 4);
        }
        
        // 데이터 흐름 표시
        const dataFlow = Math.sin(time * 0.005) * 0.5 + 0.5;
        this.ctx.fillStyle = `rgba(0, 255, 255, ${dataFlow})`;
        this.ctx.fillRect(x + 2, y + 20, size - 4, 1);
    }

    renderDataCable(x, y, size, mapX, mapY, time) {
        // 케이블 베이스
        this.ctx.fillStyle = '#263238';
        this.ctx.fillRect(x, y, size, size);
        
        // 케이블 방향 결정
        const neighbors = this.getNeighbors(mapX, mapY, 5);
        const isHorizontal = neighbors.left || neighbors.right;
        
        // 메인 케이블
        this.ctx.fillStyle = '#FF9900';
        if (isHorizontal) {
            this.ctx.fillRect(x, y + 12, size, 8);
        } else {
            this.ctx.fillRect(x + 12, y, 8, size);
        }
        
        // 전기 흐름 효과
        const electricFlow = time * 0.01;
        const flowPosition = (electricFlow % 1) * size;
        
        this.ctx.fillStyle = '#00FFFF';
        this.ctx.globalAlpha = 0.8;
        
        if (isHorizontal) {
            this.ctx.fillRect(x + flowPosition - 4, y + 14, 8, 4);
        } else {
            this.ctx.fillRect(x + 14, y + flowPosition - 4, 4, 8);
        }
        
        this.ctx.globalAlpha = 1;
        
        // 접속 포인트
        this.ctx.fillStyle = '#232F3E';
        for (let i = 0; i < 4; i++) {
            const pointX = x + 6 + (i % 2) * 14;
            const pointY = y + 6 + Math.floor(i / 2) * 14;
            
            this.ctx.beginPath();
            this.ctx.arc(pointX, pointY, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderAWSCenter(x, y, size, mapX, mapY, time) {
        // 건물 베이스
        this.ctx.fillStyle = '#FF9900';
        this.ctx.fillRect(x, y, size, size);
        
        // 홀로그램 효과 배경
        const hologramAlpha = 0.3 + Math.sin(time * 0.003) * 0.2;
        this.ctx.fillStyle = `rgba(35, 47, 62, ${hologramAlpha})`;
        this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        
        // AWS 로고 애니메이션
        this.ctx.fillStyle = '#232F3E';
        this.ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
        
        // 글로우 효과
        const glowIntensity = 0.5 + Math.sin(time * 0.002) * 0.3;
        this.ctx.shadowColor = '#FF9900';
        this.ctx.shadowBlur = 10 * glowIntensity;
        
        // AWS 텍스트
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 8px monospace';
        this.ctx.fillText('AWS', x + 8, y + 20);
        
        this.ctx.shadowBlur = 0;
        
        // 데이터 스트림 효과
        for (let i = 0; i < 3; i++) {
            const streamY = y + 8 + i * 6;
            const streamFlow = (time * 0.005 + i * 0.3) % 1;
            const streamX = x + 4 + streamFlow * (size - 8);
            
            this.ctx.fillStyle = `rgba(0, 255, 255, ${1 - streamFlow})`;
            this.ctx.fillRect(streamX, streamY, 2, 1);
        }
    }

    renderWaterEdges(x, y, size, mapX, mapY) {
        // 물 타일 주변 확인하여 부드러운 가장자리 렌더링
        const neighbors = this.getNeighbors(mapX, mapY, 2);
        const radius = 8;
        
        // 모서리 처리
        if (!neighbors.top && !neighbors.left) {
            this.ctx.fillStyle = '#7CB342';
            this.ctx.fillRect(x, y, radius, radius);
            
            this.ctx.fillStyle = `hsl(210, 70%, 25%)`;
            this.ctx.beginPath();
            this.ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
            this.ctx.fill();
        }
        
        // 추가 모서리들도 동일하게 처리...
    }

    getNeighbors(mapX, mapY, tileType) {
        // 이웃 타일 확인 (게임 인스턴스에서 맵 데이터 접근 필요)
        return {
            top: false,
            bottom: false,
            left: false,
            right: false
        };
    }

    seededRandom(seed) {
        let currentSeed = seed;
        return function() {
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            return currentSeed / 233280;
        };
    }
}

// 고급 애니메이션 시스템
class AdvancedAnimationSystem {
    constructor() {
        this.animations = new Map();
        this.tweens = [];
        this.easingFunctions = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            bounce: t => {
                if (t < 1/2.75) return 7.5625 * t * t;
                if (t < 2/2.75) return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
                if (t < 2.5/2.75) return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
                return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
            }
        };
    }

    createAnimation(name, keyframes, duration, easing = 'linear') {
        this.animations.set(name, {
            keyframes,
            duration,
            easing,
            currentTime: 0,
            playing: false
        });
    }

    playAnimation(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.playing = true;
            animation.currentTime = 0;
        }
    }

    updateAnimations(deltaTime) {
        for (let [name, animation] of this.animations) {
            if (animation.playing) {
                animation.currentTime += deltaTime;
                
                if (animation.currentTime >= animation.duration) {
                    animation.playing = false;
                    animation.currentTime = animation.duration;
                }
            }
        }
        
        // 트윈 업데이트
        this.tweens = this.tweens.filter(tween => {
            tween.currentTime += deltaTime;
            const progress = Math.min(tween.currentTime / tween.duration, 1);
            const easedProgress = this.easingFunctions[tween.easing](progress);
            
            tween.update(easedProgress);
            
            if (progress >= 1) {
                if (tween.onComplete) tween.onComplete();
                return false;
            }
            return true;
        });
    }

    createTween(target, properties, duration, easing = 'linear', onComplete = null) {
        const startValues = {};
        const endValues = {};
        
        for (let prop in properties) {
            startValues[prop] = target[prop];
            endValues[prop] = properties[prop];
        }
        
        this.tweens.push({
            target,
            startValues,
            endValues,
            duration,
            easing,
            currentTime: 0,
            onComplete,
            update: (progress) => {
                for (let prop in endValues) {
                    const start = startValues[prop];
                    const end = endValues[prop];
                    target[prop] = start + (end - start) * progress;
                }
            }
        });
    }
}

// 향상된 파티클 시스템
class EnhancedParticleSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
        this.emitters = [];
        this.maxParticles = 1000;
    }

    createEmitter(x, y, config) {
        const emitter = {
            x, y,
            particleCount: config.particleCount || 10,
            particleLife: config.particleLife || 2000,
            particleSpeed: config.particleSpeed || { min: 1, max: 3 },
            particleSize: config.particleSize || { min: 1, max: 3 },
            particleColor: config.particleColor || '#FFFFFF',
            gravity: config.gravity || 0,
            spread: config.spread || Math.PI * 2,
            emissionRate: config.emissionRate || 10,
            lastEmission: 0,
            active: true
        };
        
        this.emitters.push(emitter);
        return emitter;
    }

    update(deltaTime) {
        // 파티클 업데이트
        this.particles = this.particles.filter(particle => {
            particle.life -= deltaTime;
            particle.x += particle.vx * deltaTime * 0.001;
            particle.y += particle.vy * deltaTime * 0.001;
            particle.vy += particle.gravity * deltaTime * 0.001;
            particle.alpha = particle.life / particle.maxLife;
            
            return particle.life > 0;
        });
        
        // 이미터에서 파티클 생성
        for (let emitter of this.emitters) {
            if (!emitter.active) continue;
            
            emitter.lastEmission += deltaTime;
            
            if (emitter.lastEmission >= 1000 / emitter.emissionRate) {
                this.emitParticles(emitter);
                emitter.lastEmission = 0;
            }
        }
    }

    emitParticles(emitter) {
        for (let i = 0; i < emitter.particleCount; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const angle = Math.random() * emitter.spread;
            const speed = emitter.particleSpeed.min + 
                         Math.random() * (emitter.particleSpeed.max - emitter.particleSpeed.min);
            
            this.particles.push({
                x: emitter.x,
                y: emitter.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: emitter.particleSize.min + 
                      Math.random() * (emitter.particleSize.max - emitter.particleSize.min),
                color: emitter.particleColor,
                life: emitter.particleLife,
                maxLife: emitter.particleLife,
                alpha: 1,
                gravity: emitter.gravity
            });
        }
    }

    render() {
        for (let particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    createFireEffect(x, y) {
        return this.createEmitter(x, y, {
            particleCount: 5,
            particleLife: 1000,
            particleSpeed: { min: 0.5, max: 2 },
            particleSize: { min: 2, max: 4 },
            particleColor: '#FF6B35',
            gravity: -0.5,
            spread: Math.PI * 0.5,
            emissionRate: 20
        });
    }

    createWaterSplash(x, y) {
        return this.createEmitter(x, y, {
            particleCount: 8,
            particleLife: 800,
            particleSpeed: { min: 2, max: 5 },
            particleSize: { min: 1, max: 2 },
            particleColor: '#4FC3F7',
            gravity: 2,
            spread: Math.PI,
            emissionRate: 30
        });
    }
}

// 동적 조명 시스템
class DynamicLightingSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.lights = [];
        this.ambientLight = 0.3;
        this.lightCanvas = document.createElement('canvas');
        this.lightCtx = this.lightCanvas.getContext('2d');
    }

    addLight(x, y, radius, intensity, color = '#FFFFFF') {
        this.lights.push({
            x, y, radius, intensity, color,
            flickering: false,
            flickerSpeed: 0,
            originalIntensity: intensity
        });
    }

    update(time) {
        for (let light of this.lights) {
            if (light.flickering) {
                light.intensity = light.originalIntensity * 
                    (0.8 + Math.sin(time * light.flickerSpeed) * 0.2);
            }
        }
    }

    render(canvasWidth, canvasHeight) {
        this.lightCanvas.width = canvasWidth;
        this.lightCanvas.height = canvasHeight;
        
        // 어두운 베이스
        this.lightCtx.fillStyle = `rgba(0, 0, 0, ${1 - this.ambientLight})`;
        this.lightCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // 조명 효과
        this.lightCtx.globalCompositeOperation = 'lighter';
        
        for (let light of this.lights) {
            const gradient = this.lightCtx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, light.radius
            );
            
            gradient.addColorStop(0, `rgba(255, 255, 255, ${light.intensity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.lightCtx.fillStyle = gradient;
            this.lightCtx.beginPath();
            this.lightCtx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
            this.lightCtx.fill();
        }
        
        // 메인 캔버스에 조명 적용
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.drawImage(this.lightCanvas, 0, 0);
        this.ctx.restore();
    }
}

// 날씨 시스템
class WeatherSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.currentWeather = 'sunny';
        this.weatherEffects = {
            rain: [],
            snow: [],
            fog: { opacity: 0, target: 0 }
        };
        this.windDirection = 0;
        this.windStrength = 0;
    }

    setWeather(weather) {
        this.currentWeather = weather;
        
        switch(weather) {
            case 'rainy':
                this.createRain();
                break;
            case 'snowy':
                this.createSnow();
                break;
            case 'foggy':
                this.weatherEffects.fog.target = 0.3;
                break;
            default:
                this.clearWeather();
        }
    }

    createRain() {
        this.weatherEffects.rain = [];
        for (let i = 0; i < 100; i++) {
            this.weatherEffects.rain.push({
                x: Math.random() * 1000,
                y: Math.random() * 800,
                speed: 5 + Math.random() * 3,
                length: 10 + Math.random() * 5
            });
        }
    }

    createSnow() {
        this.weatherEffects.snow = [];
        for (let i = 0; i < 50; i++) {
            this.weatherEffects.snow.push({
                x: Math.random() * 1000,
                y: Math.random() * 800,
                speed: 1 + Math.random() * 2,
                size: 2 + Math.random() * 3,
                drift: Math.random() * 2 - 1
            });
        }
    }

    update(deltaTime) {
        // 비 업데이트
        for (let drop of this.weatherEffects.rain) {
            drop.y += drop.speed * deltaTime * 0.1;
            drop.x += this.windStrength * deltaTime * 0.05;
            
            if (drop.y > 800) {
                drop.y = -drop.length;
                drop.x = Math.random() * 1000;
            }
        }
        
        // 눈 업데이트
        for (let flake of this.weatherEffects.snow) {
            flake.y += flake.speed * deltaTime * 0.05;
            flake.x += (flake.drift + this.windStrength) * deltaTime * 0.02;
            
            if (flake.y > 800) {
                flake.y = -10;
                flake.x = Math.random() * 1000;
            }
        }
        
        // 안개 업데이트
        const fog = this.weatherEffects.fog;
        fog.opacity += (fog.target - fog.opacity) * 0.02;
    }

    render() {
        switch(this.currentWeather) {
            case 'rainy':
                this.renderRain();
                break;
            case 'snowy':
                this.renderSnow();
                break;
            case 'foggy':
                this.renderFog();
                break;
        }
    }

    renderRain() {
        this.ctx.strokeStyle = 'rgba(173, 216, 230, 0.6)';
        this.ctx.lineWidth = 1;
        
        for (let drop of this.weatherEffects.rain) {
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x - 2, drop.y - drop.length);
            this.ctx.stroke();
        }
    }

    renderSnow() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let flake of this.weatherEffects.snow) {
            this.ctx.beginPath();
            this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderFog() {
        if (this.weatherEffects.fog.opacity > 0) {
            this.ctx.fillStyle = `rgba(200, 200, 200, ${this.weatherEffects.fog.opacity})`;
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
    }

    clearWeather() {
        this.weatherEffects.rain = [];
        this.weatherEffects.snow = [];
        this.weatherEffects.fog.target = 0;
    }
}

// 메인 게임 클래스
class ProfessionalAWSGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // 전문가급 시스템 초기화
        this.pixelRenderer = new ProfessionalPixelRenderer(this.ctx);
        this.animationSystem = new AdvancedAnimationSystem();
        this.particleSystem = new EnhancedParticleSystem(this.ctx);
        this.lightingSystem = new DynamicLightingSystem(this.ctx);
        this.weatherSystem = new WeatherSystem(this.ctx);
        
        // 게임 상태
        this.gameState = 'overworld';
        this.time = 0;
        this.deltaTime = 0;
        this.lastTime = performance.now();
        
        // 플레이어
        this.player = {
            x: 400, y: 300, width: 32, height: 32, speed: 3,
            direction: 'down', moving: false, animFrame: 0,
            health: 100, maxHealth: 100, energy: 100, maxEnergy: 100
        };
        
        // 카메라 (부드러운 추적)
        this.camera = { 
            x: 0, y: 0, targetX: 0, targetY: 0,
            smoothing: 0.1, shake: { x: 0, y: 0, intensity: 0 }
        };
        
        // 맵 시스템
        this.tileSize = 32;
        this.mapWidth = 60;
        this.mapHeight = 45;
        this.map = [];
        
        // 게임 진행
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.exp = 0;
        this.expToNext = 100;
        this.collectedCerts = new Set();
        
        // 입력
        this.keys = {};
        
        // NPCs와 몬스터
        this.npcs = [];
        this.monsters = [];
        
        this.initializeGame();
    }

    initializeGame() {
        this.generateProfessionalMap();
        this.setupAdvancedNPCs();
        this.setupDynamicMonsters();
        this.setupEventHandlers();
        this.initializeEffects();
        
        console.log('🎮 전문가급 AWS 노들노들 이야기가 시작되었습니다!');
        this.gameLoop();
    }

    generateProfessionalMap() {
        this.map = [];
        for (let y = 0; y < this.mapHeight; y++) {
            const row = [];
            for (let x = 0; x < this.mapWidth; x++) {
                row.push(1); // 기본 잔디
            }
            this.map.push(row);
        }
        
        // 한강 (자연스러운 곡선)
        for (let x = 0; x < this.mapWidth; x++) {
            const progress = x / this.mapWidth;
            const riverCenter = 8 + Math.sin(progress * Math.PI * 3) * 4;
            for (let offset = -3; offset <= 3; offset++) {
                const riverY = Math.floor(riverCenter + offset);
                if (riverY >= 0 && riverY < this.mapHeight) {
                    this.map[riverY][x] = 2; // 물
                }
            }
        }
        
        // AWS 센터
        for (let y = 35; y < 40; y++) {
            for (let x = 25; x < 32; x++) {
                this.map[y][x] = 8;
            }
        }
        
        // 서버 농장
        for (let x = 15; x < 45; x++) {
            for (let y = 25; y < 35; y++) {
                if (y % 3 === 0 && x % 5 === 0) {
                    this.map[y][x] = 4; // 서버랙
                } else if (y % 3 === 1 && x % 5 === 2) {
                    this.map[y][x] = 5; // 케이블
                }
            }
        }
        
        // 나무들 (자연스럽게 배치)
        const treePositions = [
            {x: 10, y: 3}, {x: 15, y: 2}, {x: 20, y: 4}, {x: 35, y: 3},
            {x: 12, y: 40}, {x: 18, y: 41}, {x: 25, y: 42}, {x: 40, y: 40}
        ];
        
        treePositions.forEach(pos => {
            if (pos.x < this.mapWidth && pos.y < this.mapHeight) {
                this.map[pos.y][pos.x] = 3;
            }
        });
    }

    setupAdvancedNPCs() {
        this.npcs = [
            { 
                x: 28, y: 38, cert: 'cp', name: 'AWS 클라우드 가이드', 
                color: '#FF9900', defeated: false, direction: 'down',
                dialogue: ['안녕하세요! AWS 클라우드의 세계에 오신 것을 환영합니다!']
            },
            { 
                x: 45, y: 20, cert: 'saa', name: '솔루션 아키텍트 마스터', 
                color: '#232F3E', defeated: false, direction: 'left',
                dialogue: ['확장 가능한 아키텍처 설계에 대해 알아볼까요?']
            }
        ];
    }

    setupDynamicMonsters() {
        this.monsters = [
            { 
                x: 20, y: 30, name: 'Lambda Bug', color: '#FF6B35', 
                cert: 'cp', defeated: false, moveTimer: 0,
                ai: 'patrol', patrolPath: [{x: 20, y: 30}, {x: 25, y: 30}]
            },
            { 
                x: 35, y: 28, name: 'S3 Slime', color: '#4FC3F7', 
                cert: 'saa', defeated: false, moveTimer: 0,
                ai: 'random'
            }
        ];
    }

    setupEventHandlers() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    initializeEffects() {
        // 조명 설정
        this.lightingSystem.addLight(28 * 32, 38 * 32, 100, 0.8, '#FF9900');
        this.lightingSystem.addLight(200, 200, 150, 0.6, '#4FC3F7');
        
        // 날씨 설정
        this.weatherSystem.setWeather('sunny');
        
        // 파티클 효과
        this.particleSystem.createFireEffect(28 * 32, 38 * 32);
    }

    update() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.time = currentTime;
        
        // 시스템 업데이트
        this.animationSystem.updateAnimations(this.deltaTime);
        this.particleSystem.update(this.deltaTime);
        this.lightingSystem.update(this.time);
        this.weatherSystem.update(this.deltaTime);
        
        // 게임 로직 업데이트
        this.updatePlayer();
        this.updateMonsters();
        this.updateCamera();
        this.checkInteractions();
    }

    updatePlayer() {
        const oldX = this.player.x;
        const oldY = this.player.y;
        let moved = false;
        
        if (this.keys['ArrowUp']) {
            this.player.y -= this.player.speed;
            this.player.direction = 'up';
            moved = true;
        }
        if (this.keys['ArrowDown']) {
            this.player.y += this.player.speed;
            this.player.direction = 'down';
            moved = true;
        }
        if (this.keys['ArrowLeft']) {
            this.player.x -= this.player.speed;
            this.player.direction = 'left';
            moved = true;
        }
        if (this.keys['ArrowRight']) {
            this.player.x += this.player.speed;
            this.player.direction = 'right';
            moved = true;
        }
        
        // 충돌 검사
        if (this.checkCollision()) {
            this.player.x = oldX;
            this.player.y = oldY;
            moved = false;
        }
        
        this.player.moving = moved;
        if (moved) {
            this.player.animFrame += this.deltaTime * 0.01;
            
            // 걸을 때 파티클 효과
            if (Math.random() < 0.1) {
                this.particleSystem.createEmitter(this.player.x, this.player.y + 20, {
                    particleCount: 1,
                    particleLife: 500,
                    particleSpeed: { min: 0.5, max: 1 },
                    particleSize: { min: 1, max: 2 },
                    particleColor: '#8BC34A',
                    gravity: 0,
                    spread: Math.PI * 0.5,
                    emissionRate: 10
                });
            }
        }
    }

    updateMonsters() {
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            monster.moveTimer += this.deltaTime;
            
            if (monster.moveTimer > 2000) {
                if (monster.ai === 'random') {
                    const directions = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
                    const dir = directions[Math.floor(Math.random() * 4)];
                    
                    const newX = monster.x + dir.x;
                    const newY = monster.y + dir.y;
                    
                    if (this.isValidPosition(newX, newY)) {
                        monster.x = newX;
                        monster.y = newY;
                    }
                }
                
                monster.moveTimer = 0;
            }
        });
    }

    updateCamera() {
        // 부드러운 카메라 추적
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;
        
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
        
        // 맵 경계 제한
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapWidth * this.tileSize - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapHeight * this.tileSize - this.canvas.height));
        
        // 카메라 흔들림 효과
        if (this.camera.shake.intensity > 0) {
            this.camera.shake.x = (Math.random() - 0.5) * this.camera.shake.intensity;
            this.camera.shake.y = (Math.random() - 0.5) * this.camera.shake.intensity;
            this.camera.shake.intensity *= 0.9;
        }
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
            
            const tile = this.map[tileY][tileX];
            if (tile === 2 || tile === 3 || tile >= 8) {
                return true;
            }
        }
        
        return false;
    }

    checkInteractions() {
        // NPC 상호작용 체크
        // 몬스터 전투 체크
        // 아이템 수집 체크
    }

    isValidPosition(x, y) {
        if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
            return false;
        }
        
        const tile = this.map[y][x];
        return tile === 1 || tile === 7; // 잔디나 길만 이동 가능
    }

    render() {
        // 배경 클리어
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 맵 렌더링
        this.renderMap();
        
        // 엔티티 렌더링
        this.renderNPCs();
        this.renderMonsters();
        this.renderPlayer();
        
        // 효과 렌더링
        this.particleSystem.render();
        this.weatherSystem.render();
        this.lightingSystem.render(this.canvas.width, this.canvas.height);
        
        // UI 렌더링
        this.renderUI();
    }

    renderMap() {
        const startX = Math.floor(this.camera.x / this.tileSize);
        const startY = Math.floor(this.camera.y / this.tileSize);
        const endX = Math.min(startX + Math.ceil(this.canvas.width / this.tileSize) + 1, this.mapWidth);
        const endY = Math.min(startY + Math.ceil(this.canvas.height / this.tileSize) + 1, this.mapHeight);
        
        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                const screenX = x * this.tileSize - this.camera.x + this.camera.shake.x;
                const screenY = y * this.tileSize - this.camera.y + this.camera.shake.y;
                
                this.pixelRenderer.renderTile(this.map[y][x], screenX, screenY, x, y, this.time);
            }
        }
    }

    renderPlayer() {
        const screenX = this.player.x - this.camera.x + this.camera.shake.x;
        const screenY = this.player.y - this.camera.y + this.camera.shake.y;
        
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.ellipse(screenX + 16, screenY + 28, 12, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 플레이어 애니메이션
        const animOffset = Math.sin(this.player.animFrame) * 2;
        
        // 몸
        this.ctx.fillStyle = '#232F3E';
        this.ctx.fillRect(screenX + 8, screenY + 16 + animOffset, 16, 12);
        
        // 얼굴
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(screenX + 10, screenY + 6 + animOffset, 12, 12);
        
        // AWS 모자
        this.ctx.fillStyle = '#FF9900';
        this.ctx.fillRect(screenX + 8, screenY + 4 + animOffset, 16, 6);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(screenX + 12, screenY + 10 + animOffset, 2, 2);
        this.ctx.fillRect(screenX + 18, screenY + 10 + animOffset, 2, 2);
        
        // 입
        this.ctx.fillRect(screenX + 14, screenY + 14 + animOffset, 4, 1);
    }

    renderNPCs() {
        this.npcs.forEach(npc => {
            if (npc.defeated) return;
            
            const screenX = npc.x * this.tileSize - this.camera.x + this.camera.shake.x;
            const screenY = npc.y * this.tileSize - this.camera.y + this.camera.shake.y;
            
            // NPC 렌더링 (향상된 버전)
            this.renderAdvancedNPC(npc, screenX, screenY);
        });
    }

    renderAdvancedNPC(npc, x, y) {
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.ellipse(x + 16, y + 28, 12, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 글로우 효과
        this.ctx.shadowColor = npc.color;
        this.ctx.shadowBlur = 10;
        
        // 몸
        this.ctx.fillStyle = npc.color;
        this.ctx.fillRect(x + 8, y + 12, 16, 16);
        
        this.ctx.shadowBlur = 0;
        
        // 얼굴
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x + 10, y + 4, 12, 12);
        
        // 모자
        this.ctx.fillStyle = npc.color === '#FF9900' ? '#232F3E' : '#FF9900';
        this.ctx.fillRect(x + 8, y + 2, 16, 6);
        
        // 눈
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 12, y + 8, 2, 2);
        this.ctx.fillRect(x + 18, y + 8, 2, 2);
        
        // 자격증 배지
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 10px monospace';
        this.ctx.fillText(npc.cert.toUpperCase(), x + 6, y - 2);
        
        // 호버 효과
        const bobbing = Math.sin(this.time * 0.003) * 2;
        this.ctx.translate(0, bobbing);
        this.ctx.translate(0, -bobbing);
    }

    renderMonsters() {
        this.monsters.forEach(monster => {
            if (monster.defeated) return;
            
            const screenX = monster.x * this.tileSize - this.camera.x + this.camera.shake.x;
            const screenY = monster.y * this.tileSize - this.camera.y + this.camera.shake.y;
            
            this.renderAdvancedMonster(monster, screenX, screenY);
        });
    }

    renderAdvancedMonster(monster, x, y) {
        // 그림자
        this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this.ctx.ellipse(x + 16, y + 26, 10, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 몬스터 애니메이션
        const bounce = Math.sin(this.time * 0.005) * 3;
        
        // 몸체
        this.ctx.fillStyle = monster.color;
        this.ctx.fillRect(x + 4, y + 8 + bounce, 24, 20);
        
        // 눈 (AWS 테마)
        this.ctx.fillStyle = '#FF9900';
        this.ctx.fillRect(x + 10, y + 12 + bounce, 4, 4);
        this.ctx.fillRect(x + 18, y + 12 + bounce, 4, 4);
        
        // 이름 표시
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '8px monospace';
        this.ctx.fillText(monster.name, x - 5, y - 2);
        
        // 위험 표시 (깜빡임)
        if (Math.sin(this.time * 0.01) > 0) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(x + 14, y + 4 + bounce, 4, 2);
        }
    }

    renderUI() {
        // 상단 UI 패널
        this.ctx.fillStyle = 'rgba(35, 47, 62, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, 80);
        
        // 제목
        this.ctx.fillStyle = '#FF9900';
        this.ctx.font = 'bold 24px serif';
        this.ctx.fillText('🏝️ AWS 노들노들 이야기 - 전문가 에디션', 20, 35);
        
        // 상태 정보
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`레벨 ${this.level} 클라우드 엔지니어`, 20, 60);
        this.ctx.fillText(`❤️ ${this.lives}/5`, 200, 60);
        this.ctx.fillText(`⭐ ${this.exp}/${this.expToNext}`, 280, 60);
        this.ctx.fillText(`🏆 ${this.collectedCerts.size}/6`, 380, 60);
        
        // EXP 바 (그라데이션)
        const expGradient = this.ctx.createLinearGradient(480, 50, 680, 50);
        expGradient.addColorStop(0, '#FF9900');
        expGradient.addColorStop(1, '#FFB74D');
        
        this.ctx.fillStyle = '#232F3E';
        this.ctx.fillRect(480, 50, 200, 12);
        this.ctx.fillStyle = expGradient;
        this.ctx.fillRect(480, 50, (this.exp / this.expToNext) * 200, 12);
        
        // 조작법
        this.ctx.fillStyle = '#E8F5E8';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('화살표: 이동 | 스페이스: 상호작용', this.canvas.width - 250, 25);
        
        // 미니맵 (우하단)
        this.renderMinimap();
        
        // 성능 정보 (개발용)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, this.canvas.height - 60, 200, 50);
        
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(`FPS: ${Math.round(1000 / this.deltaTime)}`, 15, this.canvas.height - 45);
        this.ctx.fillText(`Particles: ${this.particleSystem.particles.length}`, 15, this.canvas.height - 30);
        this.ctx.fillText(`Time: ${Math.round(this.time / 1000)}s`, 15, this.canvas.height - 15);
    }

    renderMinimap() {
        const minimapSize = 150;
        const minimapX = this.canvas.width - minimapSize - 20;
        const minimapY = this.canvas.height - minimapSize - 20;
        
        // 미니맵 배경
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // 맵 축소 렌더링
        const scaleX = minimapSize / (this.mapWidth * this.tileSize);
        const scaleY = minimapSize / (this.mapHeight * this.tileSize);
        
        this.ctx.save();
        this.ctx.translate(minimapX, minimapY);
        this.ctx.scale(scaleX, scaleY);
        
        // 간단한 맵 표시
        for (let y = 0; y < this.mapHeight; y += 2) {
            for (let x = 0; x < this.mapWidth; x += 2) {
                const tile = this.map[y][x];
                let color = '#7CB342'; // 기본 잔디
                
                if (tile === 2) color = '#2196F3'; // 물
                else if (tile === 3) color = '#4CAF50'; // 나무
                else if (tile === 8) color = '#FF9900'; // AWS 센터
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize * 2, this.tileSize * 2);
            }
        }
        
        // 플레이어 위치
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.player.x - 2, this.player.y - 2, 4, 4);
        
        this.ctx.restore();
        
        // 미니맵 테두리
        this.ctx.strokeStyle = '#FF9900';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 게임 시작
window.addEventListener('load', () => {
    new ProfessionalAWSGame();
});