/**
 * Advanced Visual Effects System
 * Professional pixel art effects and post-processing
 */
class AdvancedVisualEffects {
    constructor(graphicsEngine) {
        this.engine = graphicsEngine;
        this.effects = new Map();
        this.activeEffects = [];
        
        this.setupEffects();
    }
    
    setupEffects() {
        // Rotsprite algorithm for smooth rotation
        this.effects.set('rotsprite', new RotspriteEffect());
        
        // Outline rendering
        this.effects.set('outline', new OutlineEffect());
        
        // Dithering patterns
        this.effects.set('dither', new DitheringEffect());
        
        // Color palette swapping
        this.effects.set('paletteSwap', new PaletteSwapEffect());
        
        // Anti-aliasing for pixel art
        this.effects.set('pixelAA', new PixelAntiAliasing());
        
        // Screen space reflections
        this.effects.set('reflections', new ReflectionEffect());
        
        // Parallax backgrounds
        this.effects.set('parallax', new ParallaxEffect());
    }
    
    applyEffect(effectName, target, options = {}) {
        const effect = this.effects.get(effectName);
        if (effect) {
            return effect.apply(target, options);
        }
        return target;
    }
    
    addActiveEffect(effectName, options = {}) {
        this.activeEffects.push({ name: effectName, options });
    }
    
    removeActiveEffect(effectName) {
        this.activeEffects = this.activeEffects.filter(e => e.name !== effectName);
    }
    
    processFrame(canvas) {
        let result = canvas;
        
        for (const effect of this.activeEffects) {
            result = this.applyEffect(effect.name, result, effect.options);
        }
        
        return result;
    }
}

/**
 * Rotsprite Algorithm for smooth sprite rotation
 */
class RotspriteEffect {
    constructor() {
        this.cache = new Map();
    }
    
    apply(canvas, options = {}) {
        const { angle = 0, scale = 1 } = options;
        const key = `${canvas.width}x${canvas.height}_${angle}_${scale}`;
        
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const result = this.rotsprite(canvas, angle, scale);
        this.cache.set(key, result);
        
        return result;
    }
    
    rotsprite(canvas, angle, scale) {
        // Implement rotsprite algorithm
        const upscaleFactor = 4;
        const upscaled = this.upscale(canvas, upscaleFactor);
        const rotated = this.rotate(upscaled, angle);
        const downscaled = this.downscale(rotated, upscaleFactor * scale);
        
        return downscaled;
    }
    
    upscale(canvas, factor) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width * factor;
        newCanvas.height = canvas.height * factor;
        const ctx = newCanvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
        
        return newCanvas;
    }
    
    rotate(canvas, angle) {
        const newCanvas = document.createElement('canvas');
        const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
        newCanvas.width = diagonal;
        newCanvas.height = diagonal;
        const ctx = newCanvas.getContext('2d');
        
        ctx.translate(diagonal / 2, diagonal / 2);
        ctx.rotate(angle);
        ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        
        return newCanvas;
    }
    
    downscale(canvas, factor) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width / factor;
        newCanvas.height = canvas.height / factor;
        const ctx = newCanvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
        
        return newCanvas;
    }
}

/**
 * Outline Effect with customizable thickness
 */
class OutlineEffect {
    apply(canvas, options = {}) {
        const { thickness = 1, color = '#000000', alpha = 1.0 } = options;
        
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width + thickness * 2;
        newCanvas.height = canvas.height + thickness * 2;
        const ctx = newCanvas.getContext('2d');
        
        // Create outline by drawing the sprite multiple times with offset
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        
        for (let x = -thickness; x <= thickness; x++) {
            for (let y = -thickness; y <= thickness; y++) {
                if (x === 0 && y === 0) continue;
                
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(canvas, thickness + x, thickness + y);
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
                ctx.restore();
            }
        }
        
        // Draw original sprite on top
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.drawImage(canvas, thickness, thickness);
        
        return newCanvas;
    }
}

/**
 * Dithering Effect for gradient effects
 */
class DitheringEffect {
    constructor() {
        this.patterns = {
            bayer2x2: [
                [0, 2],
                [3, 1]
            ],
            bayer4x4: [
                [0, 8, 2, 10],
                [12, 4, 14, 6],
                [3, 11, 1, 9],
                [15, 7, 13, 5]
            ],
            bayer8x8: this.generateBayer8x8()
        };
    }
    
    generateBayer8x8() {
        // Generate 8x8 Bayer matrix
        const matrix = [];
        for (let y = 0; y < 8; y++) {
            matrix[y] = [];
            for (let x = 0; x < 8; x++) {
                matrix[y][x] = this.bayerValue(x, y, 3);
            }
        }
        return matrix;
    }
    
    bayerValue(x, y, n) {
        if (n === 0) return 0;
        
        const half = Math.pow(2, n - 1);
        const quarter = Math.pow(2, 2 * (n - 1));
        
        if (x < half && y < half) {
            return 4 * this.bayerValue(x, y, n - 1);
        } else if (x >= half && y < half) {
            return 4 * this.bayerValue(x - half, y, n - 1) + 2;
        } else if (x < half && y >= half) {
            return 4 * this.bayerValue(x, y - half, n - 1) + 3;
        } else {
            return 4 * this.bayerValue(x - half, y - half, n - 1) + 1;
        }
    }
    
    apply(canvas, options = {}) {
        const { pattern = 'bayer4x4', threshold = 128, colors = 2 } = options;
        
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        const ctx = newCanvas.getContext('2d');
        
        ctx.drawImage(canvas, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const matrix = this.patterns[pattern];
        const matrixSize = matrix.length;
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                const matrixValue = matrix[y % matrixSize][x % matrixSize];
                const normalizedMatrix = matrixValue / (matrixSize * matrixSize - 1);
                
                // Apply dithering to each color channel
                for (let c = 0; c < 3; c++) {
                    const oldValue = data[i + c];
                    const newValue = oldValue + (normalizedMatrix - 0.5) * threshold;
                    data[i + c] = Math.round(newValue / 255 * (colors - 1)) * (255 / (colors - 1));
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        return newCanvas;
    }
}

/**
 * Palette Swap Effect for customization
 */
class PaletteSwapEffect {
    apply(canvas, options = {}) {
        const { colorMap = {} } = options;
        
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        const ctx = newCanvas.getContext('2d');
        
        ctx.drawImage(canvas, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a === 0) continue; // Skip transparent pixels
            
            const colorKey = `${r},${g},${b}`;
            const newColor = colorMap[colorKey];
            
            if (newColor) {
                const [newR, newG, newB] = newColor;
                data[i] = newR;
                data[i + 1] = newG;
                data[i + 2] = newB;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        return newCanvas;
    }
}

/**
 * Pixel Art Anti-Aliasing
 */
class PixelAntiAliasing {
    apply(canvas, options = {}) {
        const { scale = 2 } = options;
        
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width * scale;
        newCanvas.height = canvas.height * scale;
        const ctx = newCanvas.getContext('2d');
        
        // Use HQx algorithm for pixel art upscaling
        return this.hq2x(canvas);
    }
    
    hq2x(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width * 2;
        newCanvas.height = canvas.height * 2;
        const newCtx = newCanvas.getContext('2d');
        const newImageData = newCtx.createImageData(newCanvas.width, newCanvas.height);
        const newData = newImageData.data;
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const result = this.hq2xPixel(data, x, y, canvas.width, canvas.height);
                
                // Write 2x2 result
                for (let dy = 0; dy < 2; dy++) {
                    for (let dx = 0; dx < 2; dx++) {
                        const srcIdx = (dy * 2 + dx) * 4;
                        const dstIdx = ((y * 2 + dy) * newCanvas.width + (x * 2 + dx)) * 4;
                        
                        newData[dstIdx] = result[srcIdx];
                        newData[dstIdx + 1] = result[srcIdx + 1];
                        newData[dstIdx + 2] = result[srcIdx + 2];
                        newData[dstIdx + 3] = result[srcIdx + 3];
                    }
                }
            }
        }
        
        newCtx.putImageData(newImageData, 0, 0);
        return newCanvas;
    }
    
    hq2xPixel(data, x, y, width, height) {
        // Simplified HQ2x implementation
        const getPixel = (px, py) => {
            if (px < 0 || px >= width || py < 0 || py >= height) {
                return [0, 0, 0, 0];
            }
            const idx = (py * width + px) * 4;
            return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
        };
        
        const center = getPixel(x, y);
        const top = getPixel(x, y - 1);
        const bottom = getPixel(x, y + 1);
        const left = getPixel(x - 1, y);
        const right = getPixel(x + 1, y);
        
        // Simple 2x2 upscaling with edge detection
        const result = new Array(16);
        
        // Fill with center pixel
        for (let i = 0; i < 16; i += 4) {
            result[i] = center[0];
            result[i + 1] = center[1];
            result[i + 2] = center[2];
            result[i + 3] = center[3];
        }
        
        return result;
    }
}

/**
 * Screen Space Reflections for water
 */
class ReflectionEffect {
    apply(canvas, options = {}) {
        const { waterLevel = canvas.height * 0.7, intensity = 0.5, distortion = 2 } = options;
        
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        const ctx = newCanvas.getContext('2d');
        
        // Draw original scene
        ctx.drawImage(canvas, 0, 0);
        
        // Create reflection
        ctx.save();
        ctx.globalAlpha = intensity;
        ctx.scale(1, -1);
        ctx.translate(0, -canvas.height);
        
        // Draw reflected portion
        const reflectionHeight = canvas.height - waterLevel;
        ctx.drawImage(
            canvas,
            0, 0, canvas.width, waterLevel,
            0, waterLevel, canvas.width, reflectionHeight
        );
        
        ctx.restore();
        
        // Add water distortion
        this.addWaterDistortion(ctx, waterLevel, distortion);
        
        return newCanvas;
    }
    
    addWaterDistortion(ctx, waterLevel, intensity) {
        const imageData = ctx.getImageData(0, waterLevel, ctx.canvas.width, ctx.canvas.height - waterLevel);
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        const newData = new Uint8ClampedArray(data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const wave = Math.sin((x + y) * 0.1) * intensity;
                const sourceY = Math.max(0, Math.min(height - 1, y + Math.floor(wave)));
                
                const srcIdx = (sourceY * width + x) * 4;
                const dstIdx = (y * width + x) * 4;
                
                newData[dstIdx] = data[srcIdx];
                newData[dstIdx + 1] = data[srcIdx + 1];
                newData[dstIdx + 2] = data[srcIdx + 2];
                newData[dstIdx + 3] = data[srcIdx + 3];
            }
        }
        
        const newImageData = new ImageData(newData, width, height);
        ctx.putImageData(newImageData, 0, waterLevel);
    }
}

/**
 * Parallax Background Effect
 */
class ParallaxEffect {
    constructor() {
        this.layers = [];
    }
    
    addLayer(canvas, speed, offset = { x: 0, y: 0 }) {
        this.layers.push({ canvas, speed, offset });
    }
    
    render(ctx, camera) {
        for (const layer of this.layers) {
            const parallaxX = camera.x * layer.speed + layer.offset.x;
            const parallaxY = camera.y * layer.speed + layer.offset.y;
            
            // Tile the background
            const tileX = Math.floor(parallaxX / layer.canvas.width);
            const tileY = Math.floor(parallaxY / layer.canvas.height);
            
            const offsetX = parallaxX % layer.canvas.width;
            const offsetY = parallaxY % layer.canvas.height;
            
            // Draw tiled background
            for (let x = -1; x <= Math.ceil(ctx.canvas.width / layer.canvas.width) + 1; x++) {
                for (let y = -1; y <= Math.ceil(ctx.canvas.height / layer.canvas.height) + 1; y++) {
                    ctx.drawImage(
                        layer.canvas,
                        (x * layer.canvas.width) - offsetX,
                        (y * layer.canvas.height) - offsetY
                    );
                }
            }
        }
    }
}

/**
 * Day/Night Cycle with color temperature
 */
class DayNightCycle {
    constructor() {
        this.time = 0.5; // 0 = midnight, 0.5 = noon, 1 = midnight
        this.speed = 0.001; // Time progression speed
    }
    
    update(deltaTime) {
        this.time += this.speed * deltaTime;
        if (this.time > 1) this.time = 0;
    }
    
    getColorTemperature() {
        // Calculate color temperature based on time of day
        const dayTime = Math.abs(this.time - 0.5) * 2; // 0 = noon, 1 = midnight
        
        return {
            r: 1.0 - dayTime * 0.3,
            g: 1.0 - dayTime * 0.1,
            b: 1.0 + dayTime * 0.2,
            intensity: 1.0 - dayTime * 0.7
        };
    }
    
    applyToCanvas(canvas) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        const ctx = newCanvas.getContext('2d');
        
        // Draw original
        ctx.drawImage(canvas, 0, 0);
        
        // Apply color temperature
        const temp = this.getColorTemperature();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgba(${Math.floor(temp.r * 255)}, ${Math.floor(temp.g * 255)}, ${Math.floor(temp.b * 255)}, ${temp.intensity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        return newCanvas;
    }
}

/**
 * Weather Particle Systems
 */
class WeatherParticles {
    constructor() {
        this.particles = [];
        this.maxParticles = 200;
        this.weatherType = 'none';
    }
    
    setWeather(type) {
        this.weatherType = type;
        this.particles = [];
    }
    
    update(deltaTime) {
        // Add new particles
        if (this.particles.length < this.maxParticles) {
            this.addParticle();
        }
        
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            this.updateParticle(particle, deltaTime);
            
            if (particle.life <= 0 || particle.y > 800) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    addParticle() {
        switch (this.weatherType) {
            case 'rain':
                this.particles.push({
                    x: Math.random() * 1000,
                    y: -10,
                    vx: -20 + Math.random() * 10,
                    vy: 200 + Math.random() * 100,
                    life: 1,
                    size: 1 + Math.random(),
                    color: 'rgba(100, 150, 255, 0.6)'
                });
                break;
                
            case 'snow':
                this.particles.push({
                    x: Math.random() * 1000,
                    y: -10,
                    vx: -10 + Math.random() * 20,
                    vy: 30 + Math.random() * 20,
                    life: 1,
                    size: 2 + Math.random() * 3,
                    color: 'rgba(255, 255, 255, 0.8)'
                });
                break;
                
            case 'leaves':
                this.particles.push({
                    x: Math.random() * 1000,
                    y: -10,
                    vx: -30 + Math.random() * 60,
                    vy: 50 + Math.random() * 30,
                    life: 1,
                    size: 3 + Math.random() * 2,
                    color: `hsl(${30 + Math.random() * 60}, 70%, 50%)`,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 4
                });
                break;
        }
    }
    
    updateParticle(particle, deltaTime) {
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
        
        if (particle.rotation !== undefined) {
            particle.rotation += particle.rotationSpeed * deltaTime;
        }
        
        // Add some physics
        if (this.weatherType === 'leaves') {
            particle.vx += Math.sin(particle.y * 0.01) * 20 * deltaTime;
        }
    }
    
    render(ctx, camera) {
        for (const particle of this.particles) {
            const screenX = particle.x - camera.x;
            const screenY = particle.y - camera.y;
            
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            
            if (particle.rotation !== undefined) {
                ctx.translate(screenX, screenY);
                ctx.rotate(particle.rotation);
                ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            } else {
                ctx.fillRect(screenX, screenY, particle.size, particle.size);
            }
            
            ctx.restore();
        }
    }
}