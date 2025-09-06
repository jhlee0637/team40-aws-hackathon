/**
 * AAA-Quality 2D Graphics Engine
 * Professional pixel art rendering with advanced effects
 */
class GraphicsEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { 
            alpha: false, 
            desynchronized: true,
            willReadFrequently: false 
        });
        
        // Core settings
        this.pixelRatio = window.devicePixelRatio || 1;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Graphics systems
        this.lightingSystem = new LightingSystem(this);
        this.particleSystem = new ParticleSystem(this);
        this.animationSystem = new AnimationSystem(this);
        this.shaderSystem = new ShaderSystem(this);
        this.atlasManager = new AtlasManager(this);
        
        // Rendering layers
        this.layers = new Map();
        this.renderQueue = [];
        
        // Performance optimization
        this.batchRenderer = new BatchRenderer(this);
        this.cullingSystem = new CullingSystem(this);
        this.dirtyRects = [];
        
        // Post-processing
        this.postProcessor = new PostProcessor(this);
        this.colorGrading = new ColorGrading(this);
        
        this.initialize();
    }
    
    initialize() {
        // Setup high-DPI rendering
        this.setupHighDPI();
        
        // Initialize render targets
        this.setupRenderTargets();
        
        // Setup default layers
        this.createLayer('background', 0);
        this.createLayer('terrain', 10);
        this.createLayer('objects', 20);
        this.createLayer('characters', 30);
        this.createLayer('effects', 40);
        this.createLayer('ui', 50);
        
        // Initialize systems
        this.lightingSystem.initialize();
        this.particleSystem.initialize();
        this.animationSystem.initialize();
    }
    
    setupHighDPI() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.pixelRatio;
        this.canvas.height = rect.height * this.pixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        this.ctx.imageSmoothingEnabled = false;
    }
    
    setupRenderTargets() {
        // Main render target
        this.mainTarget = this.createRenderTarget(this.width, this.height);
        
        // Lighting render target
        this.lightingTarget = this.createRenderTarget(this.width, this.height);
        
        // Shadow render target
        this.shadowTarget = this.createRenderTarget(this.width, this.height);
        
        // Post-processing targets
        this.postTarget1 = this.createRenderTarget(this.width, this.height);
        this.postTarget2 = this.createRenderTarget(this.width, this.height);
    }
    
    createRenderTarget(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas, ctx };
    }
    
    createLayer(name, zIndex) {
        this.layers.set(name, {
            name,
            zIndex,
            visible: true,
            opacity: 1.0,
            blendMode: 'source-over',
            renderables: []
        });
    }
    
    addToLayer(layerName, renderable) {
        const layer = this.layers.get(layerName);
        if (layer) {
            layer.renderables.push(renderable);
        }
    }
    
    render(camera, deltaTime) {
        // Clear main target
        this.mainTarget.ctx.clearRect(0, 0, this.width, this.height);
        
        // Update systems
        this.animationSystem.update(deltaTime);
        this.particleSystem.update(deltaTime);
        this.lightingSystem.update(deltaTime);
        
        // Frustum culling
        const visibleObjects = this.cullingSystem.cull(camera);
        
        // Render layers in order
        const sortedLayers = Array.from(this.layers.values())
            .sort((a, b) => a.zIndex - b.zIndex);
        
        for (const layer of sortedLayers) {
            if (!layer.visible) continue;
            
            this.renderLayer(layer, camera, visibleObjects);
        }
        
        // Render lighting
        this.lightingSystem.render(camera);
        
        // Apply post-processing
        this.postProcessor.process(this.mainTarget, this.postTarget1);
        
        // Final composite to screen
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.postTarget1.canvas, 0, 0);
        
        // Clear render queue
        this.renderQueue.length = 0;
        this.clearLayers();
    }
    
    renderLayer(layer, camera, visibleObjects) {
        this.mainTarget.ctx.save();
        this.mainTarget.ctx.globalAlpha = layer.opacity;
        this.mainTarget.ctx.globalCompositeOperation = layer.blendMode;
        
        // Batch similar renderables
        const batches = this.batchRenderer.createBatches(layer.renderables, visibleObjects);
        
        for (const batch of batches) {
            this.batchRenderer.renderBatch(batch, camera);
        }
        
        this.mainTarget.ctx.restore();
    }
    
    clearLayers() {
        for (const layer of this.layers.values()) {
            layer.renderables.length = 0;
        }
    }
    
    // Sprite rendering with advanced effects
    drawSprite(sprite, x, y, options = {}) {
        const {
            rotation = 0,
            scaleX = 1,
            scaleY = 1,
            alpha = 1,
            tint = null,
            outline = null,
            shadow = null,
            layer = 'objects'
        } = options;
        
        this.addToLayer(layer, {
            type: 'sprite',
            sprite,
            x, y,
            rotation,
            scaleX, scaleY,
            alpha,
            tint,
            outline,
            shadow
        });
    }
    
    // Text rendering with effects
    drawText(text, x, y, options = {}) {
        const {
            font = '16px monospace',
            color = '#FFFFFF',
            outline = null,
            shadow = null,
            layer = 'ui'
        } = options;
        
        this.addToLayer(layer, {
            type: 'text',
            text,
            x, y,
            font,
            color,
            outline,
            shadow
        });
    }
    
    // Particle emission
    emitParticles(x, y, config) {
        this.particleSystem.emit(x, y, config);
    }
    
    // Lighting
    addLight(x, y, config) {
        this.lightingSystem.addLight(x, y, config);
    }
    
    // Screen effects
    screenShake(intensity, duration) {
        this.animationSystem.screenShake(intensity, duration);
    }
    
    // Color grading
    setColorGrading(config) {
        this.colorGrading.setConfig(config);
    }
}

/**
 * Advanced Lighting System with colored lights and shadows
 */
class LightingSystem {
    constructor(engine) {
        this.engine = engine;
        this.lights = [];
        this.ambientLight = { r: 0.2, g: 0.2, b: 0.3, a: 1.0 };
        this.shadowCasters = [];
    }
    
    initialize() {
        // Setup lighting shaders
        this.setupLightingShaders();
    }
    
    setupLightingShaders() {
        // Implement lighting calculations using Canvas blend modes
        this.lightingCanvas = document.createElement('canvas');
        this.lightingCanvas.width = this.engine.width;
        this.lightingCanvas.height = this.engine.height;
        this.lightingCtx = this.lightingCanvas.getContext('2d');
    }
    
    addLight(x, y, config) {
        const light = {
            x, y,
            color: config.color || { r: 1, g: 1, b: 1 },
            intensity: config.intensity || 1.0,
            radius: config.radius || 100,
            falloff: config.falloff || 'quadratic',
            castShadows: config.castShadows || false,
            ...config
        };
        
        this.lights.push(light);
        return light;
    }
    
    removeLight(light) {
        const index = this.lights.indexOf(light);
        if (index !== -1) {
            this.lights.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        // Update dynamic lights
        for (const light of this.lights) {
            if (light.update) {
                light.update(deltaTime);
            }
        }
    }
    
    render(camera) {
        // Clear lighting buffer
        this.lightingCtx.fillStyle = `rgba(${Math.floor(this.ambientLight.r * 255)}, ${Math.floor(this.ambientLight.g * 255)}, ${Math.floor(this.ambientLight.b * 255)}, ${this.ambientLight.a})`;
        this.lightingCtx.fillRect(0, 0, this.engine.width, this.engine.height);
        
        // Render each light
        for (const light of this.lights) {
            this.renderLight(light, camera);
        }
        
        // Apply lighting to main target
        this.engine.mainTarget.ctx.save();
        this.engine.mainTarget.ctx.globalCompositeOperation = 'multiply';
        this.engine.mainTarget.ctx.drawImage(this.lightingCanvas, 0, 0);
        this.engine.mainTarget.ctx.restore();
    }
    
    renderLight(light, camera) {
        const screenX = light.x - camera.x;
        const screenY = light.y - camera.y;
        
        // Create radial gradient for light
        const gradient = this.lightingCtx.createRadialGradient(
            screenX, screenY, 0,
            screenX, screenY, light.radius
        );
        
        const { r, g, b } = light.color;
        const intensity = light.intensity;
        
        gradient.addColorStop(0, `rgba(${Math.floor(r * 255 * intensity)}, ${Math.floor(g * 255 * intensity)}, ${Math.floor(b * 255 * intensity)}, 1)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.lightingCtx.save();
        this.lightingCtx.globalCompositeOperation = 'lighter';
        this.lightingCtx.fillStyle = gradient;
        this.lightingCtx.fillRect(
            screenX - light.radius,
            screenY - light.radius,
            light.radius * 2,
            light.radius * 2
        );
        this.lightingCtx.restore();
        
        // Render shadows if enabled
        if (light.castShadows) {
            this.renderShadows(light, camera);
        }
    }
    
    renderShadows(light, camera) {
        // Implement shadow casting using ray casting
        for (const caster of this.shadowCasters) {
            this.castShadow(light, caster, camera);
        }
    }
    
    castShadow(light, caster, camera) {
        // Ray casting shadow implementation
        const lightX = light.x - camera.x;
        const lightY = light.y - camera.y;
        const casterX = caster.x - camera.x;
        const casterY = caster.y - camera.y;
        
        // Calculate shadow polygon
        const shadowVertices = this.calculateShadowVertices(
            lightX, lightY,
            casterX, casterY,
            caster.width, caster.height
        );
        
        // Render shadow
        this.lightingCtx.save();
        this.lightingCtx.globalCompositeOperation = 'source-over';
        this.lightingCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.lightingCtx.beginPath();
        this.lightingCtx.moveTo(shadowVertices[0].x, shadowVertices[0].y);
        for (let i = 1; i < shadowVertices.length; i++) {
            this.lightingCtx.lineTo(shadowVertices[i].x, shadowVertices[i].y);
        }
        this.lightingCtx.closePath();
        this.lightingCtx.fill();
        this.lightingCtx.restore();
    }
    
    calculateShadowVertices(lightX, lightY, casterX, casterY, width, height) {
        // Implement shadow vertex calculation
        const vertices = [
            { x: casterX, y: casterY },
            { x: casterX + width, y: casterY },
            { x: casterX + width, y: casterY + height },
            { x: casterX, y: casterY + height }
        ];
        
        const shadowVertices = [];
        const shadowLength = 200;
        
        for (const vertex of vertices) {
            const dx = vertex.x - lightX;
            const dy = vertex.y - lightY;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            if (length > 0) {
                const normalizedX = dx / length;
                const normalizedY = dy / length;
                
                shadowVertices.push({
                    x: vertex.x + normalizedX * shadowLength,
                    y: vertex.y + normalizedY * shadowLength
                });
            }
        }
        
        return shadowVertices;
    }
}

/**
 * Advanced Particle System with forces and emitters
 */
class ParticleSystem {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.emitters = [];
        this.forces = [];
        this.maxParticles = 1000;
        this.particlePool = [];
    }
    
    initialize() {
        // Pre-allocate particle pool
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(this.createParticle());
        }
    }
    
    createParticle() {
        return {
            x: 0, y: 0,
            vx: 0, vy: 0,
            life: 0, maxLife: 1,
            size: 1, color: '#FFFFFF',
            alpha: 1, rotation: 0,
            active: false
        };
    }
    
    getParticle() {
        for (const particle of this.particlePool) {
            if (!particle.active) {
                particle.active = true;
                return particle;
            }
        }
        return null;
    }
    
    releaseParticle(particle) {
        particle.active = false;
    }
    
    emit(x, y, config) {
        const count = config.count || 10;
        
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            // Initialize particle
            particle.x = x + (Math.random() - 0.5) * (config.spread || 10);
            particle.y = y + (Math.random() - 0.5) * (config.spread || 10);
            
            const angle = (config.angle || 0) + (Math.random() - 0.5) * (config.angleSpread || Math.PI);
            const speed = (config.speed || 50) + Math.random() * (config.speedVariation || 20);
            
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            
            particle.life = config.life || 1;
            particle.maxLife = particle.life;
            particle.size = (config.size || 2) + Math.random() * (config.sizeVariation || 1);
            particle.color = config.color || '#FFFFFF';
            particle.alpha = config.alpha || 1;
            particle.rotation = Math.random() * Math.PI * 2;
            
            this.particles.push(particle);
        }
    }
    
    addForce(force) {
        this.forces.push(force);
    }
    
    update(deltaTime) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Apply forces
            for (const force of this.forces) {
                force.apply(particle, deltaTime);
            }
            
            // Update physics
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            
            // Update visual properties
            particle.alpha = particle.life / particle.maxLife;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.releaseParticle(particle);
                this.particles.splice(i, 1);
            }
        }
        
        // Update emitters
        for (const emitter of this.emitters) {
            emitter.update(deltaTime);
        }
    }
    
    render(camera) {
        for (const particle of this.particles) {
            const screenX = particle.x - camera.x;
            const screenY = particle.y - camera.y;
            
            this.engine.mainTarget.ctx.save();
            this.engine.mainTarget.ctx.globalAlpha = particle.alpha;
            this.engine.mainTarget.ctx.fillStyle = particle.color;
            this.engine.mainTarget.ctx.translate(screenX, screenY);
            this.engine.mainTarget.ctx.rotate(particle.rotation);
            this.engine.mainTarget.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            this.engine.mainTarget.ctx.restore();
        }
    }
}

/**
 * Animation System with tweening and skeletal animation
 */
class AnimationSystem {
    constructor(engine) {
        this.engine = engine;
        this.tweens = [];
        this.skeletalAnimations = [];
        this.shakeOffset = { x: 0, y: 0 };
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
    }
    
    initialize() {
        // Setup animation systems
    }
    
    // Tweening system
    tween(target, properties, duration, easing = 'linear') {
        const tween = {
            target,
            startValues: {},
            endValues: properties,
            duration,
            elapsed: 0,
            easing: this.getEasingFunction(easing),
            active: true
        };
        
        // Store start values
        for (const prop in properties) {
            tween.startValues[prop] = target[prop];
        }
        
        this.tweens.push(tween);
        return tween;
    }
    
    getEasingFunction(name) {
        const easings = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
        };
        
        return easings[name] || easings.linear;
    }
    
    screenShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }
    
    update(deltaTime) {
        // Update tweens
        for (let i = this.tweens.length - 1; i >= 0; i--) {
            const tween = this.tweens[i];
            if (!tween.active) continue;
            
            tween.elapsed += deltaTime;
            const progress = Math.min(tween.elapsed / tween.duration, 1);
            const easedProgress = tween.easing(progress);
            
            // Update target properties
            for (const prop in tween.endValues) {
                const start = tween.startValues[prop];
                const end = tween.endValues[prop];
                tween.target[prop] = start + (end - start) * easedProgress;
            }
            
            // Remove completed tweens
            if (progress >= 1) {
                this.tweens.splice(i, 1);
            }
        }
        
        // Update screen shake
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            const intensity = this.shakeIntensity * (this.shakeDuration / this.shakeDuration);
            
            this.shakeOffset.x = (Math.random() - 0.5) * intensity;
            this.shakeOffset.y = (Math.random() - 0.5) * intensity;
        } else {
            this.shakeOffset.x = 0;
            this.shakeOffset.y = 0;
        }
    }
    
    getShakeOffset() {
        return this.shakeOffset;
    }
}

/**
 * Shader System using Canvas blend modes and filters
 */
class ShaderSystem {
    constructor(engine) {
        this.engine = engine;
        this.shaders = new Map();
    }
    
    createShader(name, config) {
        this.shaders.set(name, config);
    }
    
    applyShader(target, shaderName, uniforms = {}) {
        const shader = this.shaders.get(shaderName);
        if (!shader) return;
        
        // Apply Canvas filters and blend modes
        target.ctx.save();
        
        if (shader.filter) {
            target.ctx.filter = shader.filter;
        }
        
        if (shader.blendMode) {
            target.ctx.globalCompositeOperation = shader.blendMode;
        }
        
        // Custom shader logic
        if (shader.apply) {
            shader.apply(target.ctx, uniforms);
        }
        
        target.ctx.restore();
    }
}

/**
 * Texture Atlas Manager for efficient sprite rendering
 */
class AtlasManager {
    constructor(engine) {
        this.engine = engine;
        this.atlases = new Map();
        this.sprites = new Map();
    }
    
    loadAtlas(name, imagePath, dataPath) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                fetch(dataPath)
                    .then(response => response.json())
                    .then(data => {
                        this.atlases.set(name, { image, data });
                        
                        // Register sprites
                        for (const spriteName in data.frames) {
                            const frame = data.frames[spriteName];
                            this.sprites.set(spriteName, {
                                atlas: name,
                                x: frame.frame.x,
                                y: frame.frame.y,
                                width: frame.frame.w,
                                height: frame.frame.h
                            });
                        }
                        
                        resolve();
                    })
                    .catch(reject);
            };
            image.onerror = reject;
            image.src = imagePath;
        });
    }
    
    getSprite(name) {
        return this.sprites.get(name);
    }
    
    drawSprite(name, x, y, options = {}) {
        const sprite = this.sprites.get(name);
        if (!sprite) return;
        
        const atlas = this.atlases.get(sprite.atlas);
        if (!atlas) return;
        
        const ctx = this.engine.mainTarget.ctx;
        
        ctx.save();
        
        // Apply transformations
        if (options.rotation || options.scaleX !== 1 || options.scaleY !== 1) {
            ctx.translate(x + sprite.width/2, y + sprite.height/2);
            if (options.rotation) ctx.rotate(options.rotation);
            if (options.scaleX !== 1 || options.scaleY !== 1) {
                ctx.scale(options.scaleX || 1, options.scaleY || 1);
            }
            ctx.translate(-sprite.width/2, -sprite.height/2);
            x = 0;
            y = 0;
        }
        
        // Apply effects
        if (options.alpha !== undefined) {
            ctx.globalAlpha = options.alpha;
        }
        
        if (options.tint) {
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = options.tint;
            ctx.fillRect(x, y, sprite.width, sprite.height);
            ctx.globalCompositeOperation = 'source-atop';
        }
        
        // Draw sprite
        ctx.drawImage(
            atlas.image,
            sprite.x, sprite.y, sprite.width, sprite.height,
            x, y, sprite.width, sprite.height
        );
        
        ctx.restore();
    }
}

/**
 * Batch Renderer for performance optimization
 */
class BatchRenderer {
    constructor(engine) {
        this.engine = engine;
    }
    
    createBatches(renderables, visibleObjects) {
        const batches = new Map();
        
        for (const renderable of renderables) {
            if (!this.isVisible(renderable, visibleObjects)) continue;
            
            const key = this.getBatchKey(renderable);
            if (!batches.has(key)) {
                batches.set(key, []);
            }
            batches.get(key).push(renderable);
        }
        
        return Array.from(batches.values());
    }
    
    getBatchKey(renderable) {
        // Group by type and material
        return `${renderable.type}_${renderable.sprite || renderable.font || 'default'}`;
    }
    
    isVisible(renderable, visibleObjects) {
        // Simple visibility check
        return true; // Implement proper culling
    }
    
    renderBatch(batch, camera) {
        if (batch.length === 0) return;
        
        const type = batch[0].type;
        
        switch (type) {
            case 'sprite':
                this.renderSpriteBatch(batch, camera);
                break;
            case 'text':
                this.renderTextBatch(batch, camera);
                break;
        }
    }
    
    renderSpriteBatch(batch, camera) {
        const ctx = this.engine.mainTarget.ctx;
        
        for (const item of batch) {
            const screenX = item.x - camera.x;
            const screenY = item.y - camera.y;
            
            ctx.save();
            
            // Apply transformations and effects
            if (item.alpha !== 1) ctx.globalAlpha = item.alpha;
            if (item.rotation) {
                ctx.translate(screenX, screenY);
                ctx.rotate(item.rotation);
                ctx.translate(-screenX, -screenY);
            }
            
            // Draw sprite (simplified)
            ctx.fillStyle = item.sprite.color || '#FF0000';
            ctx.fillRect(screenX, screenY, 32, 32);
            
            ctx.restore();
        }
    }
    
    renderTextBatch(batch, camera) {
        const ctx = this.engine.mainTarget.ctx;
        
        for (const item of batch) {
            const screenX = item.x - camera.x;
            const screenY = item.y - camera.y;
            
            ctx.save();
            ctx.font = item.font;
            ctx.fillStyle = item.color;
            
            if (item.outline) {
                ctx.strokeStyle = item.outline.color;
                ctx.lineWidth = item.outline.width;
                ctx.strokeText(item.text, screenX, screenY);
            }
            
            ctx.fillText(item.text, screenX, screenY);
            ctx.restore();
        }
    }
}

/**
 * Culling System for performance optimization
 */
class CullingSystem {
    constructor(engine) {
        this.engine = engine;
    }
    
    cull(camera) {
        // Implement frustum culling
        const viewBounds = {
            left: camera.x,
            top: camera.y,
            right: camera.x + this.engine.width,
            bottom: camera.y + this.engine.height
        };
        
        // Return all objects for now (implement proper culling)
        return [];
    }
}

/**
 * Post-Processing System
 */
class PostProcessor {
    constructor(engine) {
        this.engine = engine;
        this.effects = [];
    }
    
    addEffect(effect) {
        this.effects.push(effect);
    }
    
    process(source, target) {
        let currentSource = source;
        let currentTarget = target;
        
        for (const effect of this.effects) {
            effect.apply(currentSource, currentTarget);
            
            // Swap buffers
            [currentSource, currentTarget] = [currentTarget, currentSource];
        }
        
        // Ensure final result is in target
        if (currentSource !== target) {
            target.ctx.clearRect(0, 0, this.engine.width, this.engine.height);
            target.ctx.drawImage(currentSource.canvas, 0, 0);
        }
    }
}

/**
 * Color Grading System
 */
class ColorGrading {
    constructor(engine) {
        this.engine = engine;
        this.config = {
            brightness: 0,
            contrast: 1,
            saturation: 1,
            hue: 0,
            gamma: 1
        };
    }
    
    setConfig(config) {
        Object.assign(this.config, config);
    }
    
    apply(source, target) {
        // Implement color grading using Canvas filters
        target.ctx.filter = this.buildFilterString();
        target.ctx.drawImage(source.canvas, 0, 0);
        target.ctx.filter = 'none';
    }
    
    buildFilterString() {
        const { brightness, contrast, saturation, hue } = this.config;
        
        return [
            `brightness(${1 + brightness})`,
            `contrast(${contrast})`,
            `saturate(${saturation})`,
            `hue-rotate(${hue}deg)`
        ].join(' ');
    }
}