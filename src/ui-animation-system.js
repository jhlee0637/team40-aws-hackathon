/**
 * UI Animation System with easing functions
 * Professional UI transitions and effects
 */
class UIAnimationSystem {
    constructor() {
        this.animations = [];
        this.easingFunctions = this.createEasingFunctions();
        this.transitionQueue = [];
    }
    
    createEasingFunctions() {
        return {
            linear: t => t,
            
            // Quadratic
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            
            // Cubic
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            
            // Quartic
            easeInQuart: t => t * t * t * t,
            easeOutQuart: t => 1 - (--t) * t * t * t,
            easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
            
            // Quintic
            easeInQuint: t => t * t * t * t * t,
            easeOutQuint: t => 1 + (--t) * t * t * t * t,
            easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
            
            // Sine
            easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
            easeOutSine: t => Math.sin(t * Math.PI / 2),
            easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
            
            // Exponential
            easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
            easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
            easeInOutExpo: t => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
                return (2 - Math.pow(2, -20 * t + 10)) / 2;
            },
            
            // Circular
            easeInCirc: t => 1 - Math.sqrt(1 - t * t),
            easeOutCirc: t => Math.sqrt(1 - (--t) * t),
            easeInOutCirc: t => t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2,
            
            // Back
            easeInBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
            easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
            easeInOutBack: t => {
                const c1 = 1.70158;
                const c2 = c1 * 1.525;
                return t < 0.5
                    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
            },
            
            // Elastic
            easeInElastic: t => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
            },
            easeOutElastic: t => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
            },
            easeInOutElastic: t => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                if (t < 0.5) {
                    return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2;
                }
                return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2 + 1;
            },
            
            // Bounce
            easeInBounce: t => 1 - this.easingFunctions.easeOutBounce(1 - t),
            easeOutBounce: t => {
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            },
            easeInOutBounce: t => t < 0.5
                ? this.easingFunctions.easeInBounce(t * 2) / 2
                : (this.easingFunctions.easeOutBounce(t * 2 - 1) + 1) / 2
        };
    }
    
    // Create animation
    animate(target, properties, duration, easing = 'easeOutQuad', delay = 0) {
        const animation = {
            target,
            startValues: {},
            endValues: properties,
            duration,
            elapsed: 0,
            delay,
            easing: this.easingFunctions[easing] || this.easingFunctions.linear,
            active: false,
            onComplete: null,
            onUpdate: null
        };
        
        // Store start values
        for (const prop in properties) {
            animation.startValues[prop] = target[prop] || 0;
        }
        
        this.animations.push(animation);
        return animation;
    }
    
    // Chain animations
    chain(animations) {
        for (let i = 1; i < animations.length; i++) {
            const prev = animations[i - 1];
            const current = animations[i];
            
            prev.onComplete = () => {
                current.active = true;
            };
        }
        
        animations[0].active = true;
        return animations;
    }
    
    // Parallel animations
    parallel(animations) {
        animations.forEach(anim => anim.active = true);
        return animations;
    }
    
    // Update animations
    update(deltaTime) {
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const animation = this.animations[i];
            
            if (!animation.active) {
                if (animation.delay > 0) {
                    animation.delay -= deltaTime;
                    if (animation.delay <= 0) {
                        animation.active = true;
                    }
                }
                continue;
            }
            
            animation.elapsed += deltaTime;
            const progress = Math.min(animation.elapsed / animation.duration, 1);
            const easedProgress = animation.easing(progress);
            
            // Update target properties
            for (const prop in animation.endValues) {
                const start = animation.startValues[prop];
                const end = animation.endValues[prop];
                animation.target[prop] = start + (end - start) * easedProgress;
            }
            
            // Call update callback
            if (animation.onUpdate) {
                animation.onUpdate(animation.target, easedProgress);
            }
            
            // Check if completed
            if (progress >= 1) {
                if (animation.onComplete) {
                    animation.onComplete(animation.target);
                }
                this.animations.splice(i, 1);
            }
        }
    }
    
    // Stop animation
    stop(animation) {
        const index = this.animations.indexOf(animation);
        if (index !== -1) {
            this.animations.splice(index, 1);
        }
    }
    
    // Stop all animations for target
    stopAll(target) {
        this.animations = this.animations.filter(anim => anim.target !== target);
    }
    
    // Scene transitions
    fadeIn(element, duration = 0.5, easing = 'easeOutQuad') {
        element.alpha = 0;
        return this.animate(element, { alpha: 1 }, duration, easing);
    }
    
    fadeOut(element, duration = 0.5, easing = 'easeOutQuad') {
        return this.animate(element, { alpha: 0 }, duration, easing);
    }
    
    slideIn(element, direction = 'left', duration = 0.5, easing = 'easeOutBack') {
        const startPos = this.getSlideStartPosition(element, direction);
        const endPos = { x: element.x, y: element.y };
        
        element.x = startPos.x;
        element.y = startPos.y;
        
        return this.animate(element, endPos, duration, easing);
    }
    
    slideOut(element, direction = 'right', duration = 0.5, easing = 'easeInBack') {
        const endPos = this.getSlideEndPosition(element, direction);
        return this.animate(element, endPos, duration, easing);
    }
    
    scale(element, fromScale, toScale, duration = 0.3, easing = 'easeOutBack') {
        element.scaleX = fromScale;
        element.scaleY = fromScale;
        return this.animate(element, { scaleX: toScale, scaleY: toScale }, duration, easing);
    }
    
    bounce(element, intensity = 10, duration = 0.6) {
        const originalY = element.y;
        return this.animate(element, { y: originalY - intensity }, duration / 2, 'easeOutQuad')
            .onComplete = () => {
                this.animate(element, { y: originalY }, duration / 2, 'easeOutBounce');
            };
    }
    
    shake(element, intensity = 5, duration = 0.5) {
        const originalX = element.x;
        const originalY = element.y;
        const shakeCount = 10;
        const shakeDuration = duration / shakeCount;
        
        for (let i = 0; i < shakeCount; i++) {
            const offsetX = (Math.random() - 0.5) * intensity;
            const offsetY = (Math.random() - 0.5) * intensity;
            
            this.animate(element, {
                x: originalX + offsetX,
                y: originalY + offsetY
            }, shakeDuration, 'linear', i * shakeDuration);
        }
        
        // Return to original position
        this.animate(element, {
            x: originalX,
            y: originalY
        }, shakeDuration, 'easeOutQuad', duration - shakeDuration);
    }
    
    pulse(element, minScale = 0.9, maxScale = 1.1, duration = 1.0) {
        const pulseAnimation = () => {
            this.animate(element, { scaleX: maxScale, scaleY: maxScale }, duration / 2, 'easeInOutSine')
                .onComplete = () => {
                    this.animate(element, { scaleX: minScale, scaleY: minScale }, duration / 2, 'easeInOutSine')
                        .onComplete = pulseAnimation;
                };
        };
        
        pulseAnimation();
    }
    
    typewriter(textElement, text, duration = 2.0) {
        textElement.text = '';
        const chars = text.split('');
        const charDuration = duration / chars.length;
        
        chars.forEach((char, index) => {
            setTimeout(() => {
                textElement.text += char;
            }, index * charDuration * 1000);
        });
    }
    
    morphPath(pathElement, fromPath, toPath, duration = 1.0, easing = 'easeInOutQuad') {
        // Simplified path morphing
        const animation = this.animate({ progress: 0 }, { progress: 1 }, duration, easing);
        animation.onUpdate = (target, progress) => {
            pathElement.path = this.interpolatePath(fromPath, toPath, progress);
        };
        return animation;
    }
    
    // Helper methods
    getSlideStartPosition(element, direction) {
        const canvasWidth = 960; // Assume canvas width
        const canvasHeight = 720; // Assume canvas height
        
        switch (direction) {
            case 'left': return { x: -element.width, y: element.y };
            case 'right': return { x: canvasWidth, y: element.y };
            case 'top': return { x: element.x, y: -element.height };
            case 'bottom': return { x: element.x, y: canvasHeight };
            default: return { x: element.x, y: element.y };
        }
    }
    
    getSlideEndPosition(element, direction) {
        const canvasWidth = 960;
        const canvasHeight = 720;
        
        switch (direction) {
            case 'left': return { x: -element.width, y: element.y };
            case 'right': return { x: canvasWidth, y: element.y };
            case 'top': return { x: element.x, y: -element.height };
            case 'bottom': return { x: element.x, y: canvasHeight };
            default: return { x: element.x, y: element.y };
        }
    }
    
    interpolatePath(fromPath, toPath, progress) {
        // Simplified path interpolation
        // In a real implementation, this would handle complex SVG path interpolation
        return fromPath; // Placeholder
    }
}

/**
 * UI Component Animation Presets
 */
class UIAnimationPresets {
    constructor(animationSystem) {
        this.animationSystem = animationSystem;
    }
    
    // Button animations
    buttonHover(button) {
        return this.animationSystem.scale(button, 1, 1.05, 0.2, 'easeOutQuad');
    }
    
    buttonPress(button) {
        return this.animationSystem.scale(button, 1, 0.95, 0.1, 'easeOutQuad');
    }
    
    buttonRelease(button) {
        return this.animationSystem.scale(button, 0.95, 1, 0.1, 'easeOutBack');
    }
    
    // Modal animations
    modalShow(modal) {
        modal.alpha = 0;
        modal.scaleX = 0.8;
        modal.scaleY = 0.8;
        
        return this.animationSystem.parallel([
            this.animationSystem.animate(modal, { alpha: 1 }, 0.3, 'easeOutQuad'),
            this.animationSystem.animate(modal, { scaleX: 1, scaleY: 1 }, 0.3, 'easeOutBack')
        ]);
    }
    
    modalHide(modal) {
        return this.animationSystem.parallel([
            this.animationSystem.animate(modal, { alpha: 0 }, 0.2, 'easeInQuad'),
            this.animationSystem.animate(modal, { scaleX: 0.8, scaleY: 0.8 }, 0.2, 'easeInBack')
        ]);
    }
    
    // Notification animations
    notificationSlideIn(notification) {
        return this.animationSystem.slideIn(notification, 'right', 0.4, 'easeOutBack');
    }
    
    notificationSlideOut(notification) {
        return this.animationSystem.slideOut(notification, 'right', 0.3, 'easeInBack');
    }
    
    // Loading animations
    loadingSpinner(spinner) {
        const spinAnimation = () => {
            this.animationSystem.animate(spinner, { rotation: spinner.rotation + Math.PI * 2 }, 1.0, 'linear')
                .onComplete = spinAnimation;
        };
        spinAnimation();
    }
    
    loadingPulse(element) {
        this.animationSystem.pulse(element, 0.8, 1.2, 1.5);
    }
    
    // Progress bar animation
    progressBarFill(progressBar, targetProgress, duration = 1.0) {
        return this.animationSystem.animate(progressBar, { progress: targetProgress }, duration, 'easeOutQuad');
    }
    
    // Menu animations
    menuSlideDown(menu) {
        menu.alpha = 0;
        menu.y -= 20;
        
        return this.animationSystem.parallel([
            this.animationSystem.animate(menu, { alpha: 1 }, 0.3, 'easeOutQuad'),
            this.animationSystem.animate(menu, { y: menu.y + 20 }, 0.3, 'easeOutBack')
        ]);
    }
    
    menuSlideUp(menu) {
        return this.animationSystem.parallel([
            this.animationSystem.animate(menu, { alpha: 0 }, 0.2, 'easeInQuad'),
            this.animationSystem.animate(menu, { y: menu.y - 20 }, 0.2, 'easeInBack')
        ]);
    }
    
    // Stagger animations for lists
    staggerIn(elements, delay = 0.1, duration = 0.5) {
        elements.forEach((element, index) => {
            element.alpha = 0;
            element.y += 20;
            
            this.animationSystem.parallel([
                this.animationSystem.animate(element, { alpha: 1 }, duration, 'easeOutQuad', index * delay),
                this.animationSystem.animate(element, { y: element.y - 20 }, duration, 'easeOutBack', index * delay)
            ]);
        });
    }
    
    // Page transitions
    pageSlideLeft(fromPage, toPage) {
        const canvasWidth = 960;
        
        toPage.x = canvasWidth;
        
        return this.animationSystem.parallel([
            this.animationSystem.animate(fromPage, { x: -canvasWidth }, 0.5, 'easeInOutQuad'),
            this.animationSystem.animate(toPage, { x: 0 }, 0.5, 'easeInOutQuad')
        ]);
    }
    
    pageSlideRight(fromPage, toPage) {
        const canvasWidth = 960;
        
        toPage.x = -canvasWidth;
        
        return this.animationSystem.parallel([
            this.animationSystem.animate(fromPage, { x: canvasWidth }, 0.5, 'easeInOutQuad'),
            this.animationSystem.animate(toPage, { x: 0 }, 0.5, 'easeInOutQuad')
        ]);
    }
    
    pageFade(fromPage, toPage) {
        toPage.alpha = 0;
        
        return this.animationSystem.chain([
            this.animationSystem.animate(fromPage, { alpha: 0 }, 0.25, 'easeOutQuad'),
            this.animationSystem.animate(toPage, { alpha: 1 }, 0.25, 'easeInQuad')
        ]);
    }
}

/**
 * Particle UI Effects
 */
class UIParticleEffects {
    constructor() {
        this.particles = [];
        this.emitters = [];
    }
    
    // Confetti effect for achievements
    confetti(x, y, count = 50) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: -Math.random() * 150 - 50,
                gravity: 300,
                life: 2 + Math.random(),
                maxLife: 2 + Math.random(),
                size: 3 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
    }
    
    // Sparkle effect for UI elements
    sparkle(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                life: 1 + Math.random(),
                maxLife: 1 + Math.random(),
                size: 2 + Math.random() * 2,
                color: '#FFD700',
                twinkle: true
            });
        }
    }
    
    // Smoke effect
    smoke(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y,
                vx: (Math.random() - 0.5) * 30,
                vy: -Math.random() * 80 - 20,
                life: 2 + Math.random(),
                maxLife: 2 + Math.random(),
                size: 5 + Math.random() * 10,
                color: `rgba(100, 100, 100, ${0.3 + Math.random() * 0.3})`,
                growth: 1 + Math.random() * 2
            });
        }
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update physics
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            if (particle.gravity) {
                particle.vy += particle.gravity * deltaTime;
            }
            
            if (particle.rotation !== undefined) {
                particle.rotation += particle.rotationSpeed * deltaTime;
            }
            
            if (particle.growth) {
                particle.size += particle.growth * deltaTime;
            }
            
            particle.life -= deltaTime;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        for (const particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            if (particle.twinkle) {
                ctx.globalAlpha *= Math.sin(particle.life * 10) * 0.5 + 0.5;
            }
            
            ctx.fillStyle = particle.color;
            ctx.translate(particle.x, particle.y);
            
            if (particle.rotation !== undefined) {
                ctx.rotate(particle.rotation);
            }
            
            ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            ctx.restore();
        }
    }
}