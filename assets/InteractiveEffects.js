/**
 * InteractiveEffects - 交互效果集合
 * 包含：彩虹画笔轨迹、元素弹性碰撞、Konami Code 彩蛋、Hero 文字粒子、重力感应粒子
 */

const InteractiveEffects = {
    // ============== 彩虹画笔轨迹 ==============
    rainbowTrail: {
        canvas: null,
        ctx: null,
        points: [],
        hue: 0,
        lastX: 0,
        lastY: 0,
        
        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'rainbow-trail-canvas';
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9998;
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', (e) => this.draw(e));
            this.animate();
        },
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },
        
        draw(e) {
            const x = e.clientX;
            const y = e.clientY;
            const dx = x - this.lastX;
            const dy = y - this.lastY;
            const speed = Math.sqrt(dx * dx + dy * dy);
            
            this.lastX = x;
            this.lastY = y;
            
            if (speed > 2) {
                this.points.push({
                    x, y,
                    hue: this.hue,
                    size: Math.min(speed / 2 + 2, 8),
                    life: 1
                });
                this.hue = (this.hue + 2) % 360;
            }
            
            if (this.points.length > 100) this.points.shift();
        },
        
        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            for (let i = this.points.length - 1; i >= 0; i--) {
                const p = this.points[i];
                const radius = Math.max(0.5, p.size * p.life);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.life})`;
                this.ctx.fill();
                
                p.life -= 0.02;
                if (p.life <= 0) this.points.splice(i, 1);
            }
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 全息投影 Hero 标题 ==============
    holographicHero: {
        canvas: null,
        ctx: null,
        particles: [],
        text: 'TT23XR Studio\nTT23XR 工作室',
        mouse: { x: -1000, y: -1000 },
        rotation: { x: 0, y: 0 },
        targetRotation: { x: 0, y: 0 },
        glitchTimer: 0,
        isGlitching: false,
        colorShift: 0,
        
        init() {
            const heroContent = document.querySelector('.hero-content');
            if (!heroContent) return;
            
            // // 隐藏原始标题
            // const originalTitle = heroContent.querySelector('h1');
            // if (originalTitle) {
            //     originalTitle.style.opacity = '0';
            //     originalTitle.style.pointerEvents = 'none';
            // }
            
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: absolute; top: -100%; left: -50%;
                width: 200%; height: 200%;
                pointer-events: none; // z-index: 15;
            `;
            heroContent.style.position = 'relative';
            heroContent.insertBefore(this.canvas, heroContent.firstChild);
            this.ctx = this.canvas.getContext('2d');
            
            heroContent.addEventListener('mousemove', (e) => {
                const rect = heroContent.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left - this.canvas.offsetLeft;
                this.mouse.y = e.clientY - rect.top - this.canvas.offsetTop;
                
                // 计算3D旋转角度
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                this.targetRotation.y = ((e.clientX - rect.left) - centerX) / centerX * 15;
                this.targetRotation.x = -((e.clientY - rect.top) - centerY) / centerY * 10;
            });
            
            heroContent.addEventListener('mouseleave', () => {
                this.targetRotation.x = 0;
                this.targetRotation.y = 0;
            });
            
            // 点击触发故障效果
            this.canvas.style.pointerEvents = 'auto';
            this.canvas.addEventListener('click', () => this.triggerGlitch());
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        },
        
        resize() {
            const parent = this.canvas.parentElement;
            if (!parent) return;
            
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.initParticles();
        },
        
        initParticles() {
            this.particles = [];
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            const fontSize = Math.min(w / 6, 100);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = w;
            tempCanvas.height = h;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.font = `bold ${fontSize - 10}px SarasaMonoSC-ExtraLightItalic`;
            tempCtx.fillStyle = 'white';
            tempCtx.textAlign = 'center';
            tempCtx.textBaseline = 'middle';
            tempCtx.fillText(this.text, w / 2, h / 2);
            
            try {
                const imageData = tempCtx.getImageData(0, 0, w, h);
                const gap = 4;
                
                for (let y = 0; y < h; y += gap) {
                    for (let x = 0; x < w; x += gap) {
                        const i = (y * w + x) * 4;
                        if (imageData.data[i + 3] > 128) {
                            this.particles.push({
                                x, y,
                                originX: x,
                                originY: y,
                                vx: 0, vy: 0,
                                size: 2 + Math.random(),
                                hue: 180 + Math.random() * 60,
                                phase: Math.random() * Math.PI * 2,
                                depth: Math.random() * 30 - 15
                            });
                        }
                    }
                }
            } catch (e) {
                console.warn('Holographic hero init failed:', e);
            }
        },
        
        triggerGlitch() {
            this.isGlitching = true;
            this.glitchTimer = 0;
            
            // 粒子爆炸
            this.particles.forEach(p => {
                const angle = Math.random() * Math.PI * 2;
                const force = 5 + Math.random() * 15;
                p.vx = Math.cos(angle) * force;
                p.vy = Math.sin(angle) * force;
            });
        },
        
        animate() {
            if (!this.ctx || !this.canvas) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            this.ctx.clearRect(0, 0, w, h);
            
            // 平滑旋转
            this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.1;
            this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.1;
            
            // 故障计时
            if (this.isGlitching) {
                this.glitchTimer++;
                if (this.glitchTimer > 60) {
                    this.isGlitching = false;
                }
            }
            
            // 随机微小故障
            const randomGlitch = Math.random() < 0.005;
            
            this.colorShift += 0.5;
            
            this.particles.forEach(p => {
                // 3D透视变换
                const depth = p.depth;
                const perspective = 500;
                const rawScale = perspective / (perspective + depth * Math.sin(this.rotation.x * 0.01));
                const scale = Math.max(0.5, Math.min(2, rawScale)); // 限制scale范围
                
                const rotatedX = p.originX + depth * Math.sin(this.rotation.y * Math.PI / 180);
                const rotatedY = p.originY + depth * Math.sin(this.rotation.x * Math.PI / 180);
                
                // 鼠标排斥
                const dx = rotatedX - this.mouse.x;
                const dy = rotatedY - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 80 && dist > 0) {
                    const force = (80 - dist) / 80 * 3;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }
                
                // 弹簧力回到原位
                p.vx += (rotatedX - p.x) * 0.08;
                p.vy += (rotatedY - p.y) * 0.08;
                
                // 阻尼
                p.vx *= 0.9;
                p.vy *= 0.9;
                
                // 故障偏移
                let glitchOffsetX = 0;
                let glitchOffsetY = 0;
                if (this.isGlitching || randomGlitch) {
                    glitchOffsetX = (Math.random() - 0.5) * 20;
                    glitchOffsetY = (Math.random() - 0.5) * 20;
                }
                
                p.x += p.vx + glitchOffsetX;
                p.y += p.vy + glitchOffsetY;
                
                // 呼吸效果
                const breathe = Math.sin(p.phase + performance.now() * 0.002) * 0.5;
                
                // 全息颜色
                const hue = (p.hue + this.colorShift) % 360;
                const alpha = 0.6 + Math.sin(p.phase) * 0.2;
                
                // 绘制粒子 - 确保半径始终为正
                const radius = Math.max(0.5, p.size * scale + breathe);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
                this.ctx.fill();
                
                // 发光效果 - 确保半径始终为正
                const glowRadius = Math.max(1, p.size * scale * 2 + breathe);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha * 0.2})`;
                this.ctx.fill();
            });
            
            // 扫描线效果
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.02)';
            for (let i = 0; i < h; i += 4) {
                this.ctx.fillRect(0, i, w, 2);
            }
            
            // // 故障 RGB 分离效果
            // if (this.isGlitching) {
            //     this.ctx.globalCompositeOperation = 'lighter';
            //     this.ctx.globalAlpha = 0.3;
            //     this.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
            //     this.ctx.fillRect(Math.random() * 10, 0, w, h);
            //     this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            //     this.ctx.fillRect(-Math.random() * 10, 0, w, h);
            //     this.ctx.globalCompositeOperation = 'source-over';
            //     this.ctx.globalAlpha = 1;
            // }
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 矩阵网点背景（鼠标连线） ==============
    matrixGridDots: {
        canvas: null,
        ctx: null,
        dots: [],
        mouse: { x: -1000, y: -1000 },
        gridSpacing: 40,
        
        init() {
            const hero = document.querySelector('.hero');
            if (!hero) return;
            
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'matrix-grid-canvas';
            this.canvas.style.cssText = `
                position: absolute; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none; z-index: 2;
            `;
            hero.insertBefore(this.canvas, hero.firstChild);
            this.ctx = this.canvas.getContext('2d');
            
            hero.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });
            
            hero.addEventListener('mouseleave', () => {
                this.mouse.x = -1000;
                this.mouse.y = -1000;
            });
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        },
        
        resize() {
            const parent = this.canvas.parentElement;
            if (!parent) return;
            
            const w = parent.offsetWidth;
            const h = parent.offsetHeight;
            
            if (w <= 0 || h <= 0) return;
            
            this.canvas.width = w;
            this.canvas.height = h;
            this.initDots();
        },
        
        initDots() {
            this.dots = [];
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            for (let x = this.gridSpacing; x < w; x += this.gridSpacing) {
                for (let y = this.gridSpacing; y < h; y += this.gridSpacing) {
                    this.dots.push({
                        x, y,
                        originX: x,
                        originY: y,
                        vx: 0, vy: 0,
                        size: 2,
                        hue: 200 + Math.random() * 40
                    });
                }
            }
        },
        
        animate() {
            if (!this.ctx || !this.canvas || this.canvas.width <= 0) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            this.ctx.clearRect(0, 0, w, h);
            
            // 更新点位置
            this.dots.forEach(dot => {
                const dx = dot.x - this.mouse.x;
                const dy = dot.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150 && dist > 0) {
                    const force = (150 - dist) / 150 * 5;
                    dot.vx += (dx / dist) * force;
                    dot.vy += (dy / dist) * force;
                }
                
                // 弹回原位
                dot.vx += (dot.originX - dot.x) * 0.05;
                dot.vy += (dot.originY - dot.y) * 0.05;
                dot.vx *= 0.9;
                dot.vy *= 0.9;
                dot.x += dot.vx;
                dot.y += dot.vy;
            });
            
            // 绘制点到鼠标的连线
            this.dots.forEach(dot => {
                const dx = dot.x - this.mouse.x;
                const dy = dot.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 200 && dist > 0) {
                    const alpha = (200 - dist) / 200;
                    
                    // 渐变线条
                    const gradient = this.ctx.createLinearGradient(
                        dot.x, dot.y, this.mouse.x, this.mouse.y
                    );
                    gradient.addColorStop(0, `hsla(${dot.hue}, 100%, 60%, ${alpha * 0.8})`);
                    gradient.addColorStop(1, `hsla(${dot.hue + 60}, 100%, 60%, ${alpha * 0.3})`);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(dot.x, dot.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = alpha * 2;
                    this.ctx.stroke();
                }
            });
            
            // 绘制点与点之间的连线
            for (let i = 0; i < this.dots.length; i++) {
                for (let j = i + 1; j < this.dots.length; j++) {
                    const d1 = this.dots[i];
                    const d2 = this.dots[j];
                    const dist = Math.sqrt((d1.x - d2.x) ** 2 + (d1.y - d2.y) ** 2);
                    
                    if (dist < this.gridSpacing * 1.5) {
                        const alpha = (this.gridSpacing * 1.5 - dist) / (this.gridSpacing * 1.5) * 0.15;
                        this.ctx.beginPath();
                        this.ctx.moveTo(d1.x, d1.y);
                        this.ctx.lineTo(d2.x, d2.y);
                        this.ctx.strokeStyle = `rgba(74, 158, 255, ${alpha})`;
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                    }
                }
            }
            
            // 绘制点
            this.dots.forEach(dot => {
                const dx = dot.x - this.mouse.x;
                const dy = dot.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                let size = dot.size;
                let alpha = 0.5;
                
                if (dist < 150) {
                    size = dot.size + (150 - dist) / 150 * 3;
                    alpha = 0.5 + (150 - dist) / 150 * 0.5;
                }
                
                // 发光效果
                this.ctx.beginPath();
                this.ctx.arc(dot.x, dot.y, size * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${dot.hue}, 100%, 60%, ${alpha * 0.2})`;
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${dot.hue}, 80%, 60%, ${alpha})`;
                this.ctx.fill();
            });
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 初始化 ==============
    init() {
        function isMobileDevice() {
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|windows phone|phone|webos|kindle|tablet/i;
            return mobileRegex.test(ua.toLowerCase());
        }
        const checkAndInit = () => {

            // 立即初始化不依赖 DOM 尺寸的效果
            this.rainbowTrail.init();
            
            // 延迟初始化需要 DOM 尺寸的效果
            setTimeout(() => {
                if (!isMobileDevice()) {
                    this.holographicHero.init();  // 全息投影Hero
                }
                this.matrixGridDots.init();   // 矩阵网点背景
            }, 300);
            
        };
        
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            checkAndInit();
        } else {
            document.addEventListener('DOMContentLoaded', checkAndInit);
        }
    },
};

// 自动初始化
InteractiveEffects.init();

if (typeof window !== 'undefined') {
    window.InteractiveEffects = InteractiveEffects;
}