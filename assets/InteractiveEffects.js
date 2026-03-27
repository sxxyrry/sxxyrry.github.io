/**
 * InteractiveEffects - 交互效果集合
 * 包含：彩虹画笔轨迹、元素弹性碰撞、Konami Code 彩蛋、Hero 文字粒子、重力感应粒子
 */

const InteractiveEffects = {
    // ============== 1. 彩虹画笔轨迹 ==============
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

    // ============== 2. 元素弹性碰撞 ==============
    physicsElements: {
        elements: [],
        mouseX: 0,
        mouseY: 0,
        
        init(selector = '.project-card, .team-card, .showcase-card') {
            const targets = document.querySelectorAll(selector);
            targets.forEach((el) => {
                const rect = el.getBoundingClientRect();
                this.elements.push({
                    el,
                    x: 0, y: 0,
                    vx: 0, vy: 0,
                    radius: Math.max(rect.width, rect.height) / 2
                });
            });
            
            window.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });
            
            this.animate();
        },
        
        animate() {
            this.elements.forEach((item) => {
                const rect = item.el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const dx = centerX - this.mouseX;
                const dy = centerY - this.mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150 && dist > 0) {
                    const force = (150 - dist) / 150 * 2;
                    item.vx += (dx / dist) * force;
                    item.vy += (dy / dist) * force;
                }
                
                item.vx += -item.x * 0.05;
                item.vy += -item.y * 0.05;
                item.vx *= 0.9;
                item.vy *= 0.9;
                
                item.x += item.vx;
                item.y += item.vy;
                
                item.x = Math.max(-30, Math.min(30, item.x));
                item.y = Math.max(-30, Math.min(30, item.y));
                
                if (typeof gsap !== 'undefined') {
                    gsap.set(item.el, { x: item.x, y: item.y });
                }
            });
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 3. Konami Code 彩蛋 ==============
    konamiCode: {
        sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'],
        currentIndex: 0,
        isActive: false,
        
        init() {
            window.addEventListener('keydown', (e) => this.handleKeyPress(e));
        },
        
        handleKeyPress(e) {
            if (this.isActive) return;
            
            if (e.code === this.sequence[this.currentIndex]) {
                this.currentIndex++;
                if (this.currentIndex === this.sequence.length) {
                    this.trigger();
                    this.currentIndex = 0;
                }
            } else {
                this.currentIndex = 0;
            }
        },
        
        trigger() {
            this.isActive = true;
            
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 99999; pointer-events: none;
            `;
            document.body.appendChild(overlay);
            
            // 彩虹雨
            for (let i = 0; i < 100; i++) {
                setTimeout(() => {
                    const drop = document.createElement('div');
                    const hue = Math.random() * 360;
                    drop.style.cssText = `
                        position: absolute; left: ${Math.random() * 100}%; top: -20px;
                        width: 10px; height: 20px;
                        background: linear-gradient(to bottom, hsl(${hue}, 100%, 60%), hsl(${(hue + 60) % 360}, 100%, 50%));
                        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                    `;
                    overlay.appendChild(drop);
                    if (typeof gsap !== 'undefined') {
                        gsap.to(drop, {
                            y: window.innerHeight + 50, rotation: 360,
                            duration: 1 + Math.random() * 2, ease: 'none',
                            onComplete: () => drop.remove()
                        });
                    }
                }, i * 30);
            }
            
            // 元素动画
            if (typeof gsap !== 'undefined') {
                document.querySelectorAll('.project-card, .team-card, .showcase-card, .nav-link, .btn').forEach((el, i) => {
                    gsap.to(el, {
                        rotation: (Math.random() - 0.5) * 720,
                        scale: 0.8 + Math.random() * 0.6,
                        duration: 0.5, delay: i * 0.03,
                        ease: 'elastic.out(1, 0.3)',
                        onComplete: () => {
                            gsap.to(el, { rotation: 0, scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)' });
                        }
                    });
                });
            }
            
            // 文字
            const text = document.createElement('div');
            text.innerHTML = ' Konami Code Activated! ';
            text.style.cssText = `
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                font-size: 3rem; font-weight: bold; color: white;
                text-shadow: 0 0 20px #ff00ff;
            `;
            overlay.appendChild(text);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(text, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' });
            }
            
            setTimeout(() => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(overlay, { opacity: 0, duration: 0.5, onComplete: () => overlay.remove() });
                } else {
                    overlay.remove();
                }
                this.isActive = false;
            }, 4000);
        }
    },

    // ============== 4. 互动式 Hero 文字粒子 ==============
    heroParticles: {
        canvas: null,
        ctx: null,
        particles: [],
        text: 'TT23XR Studio TT23XR 工作室',
        isExploded: false,
        mouse: { x: -1000, y: -1000 },
        lastMouse: { x: -1000, y: -1000 },
        mouseVel: { x: 0, y: 0 },
        
        init() {
            // const heroTitle = document.querySelector('.hero h1');
            // if (!heroTitle) return;
            // this.text = heroTitle.textContent.split(' ')[0].substring(0, 10) || 'TT23XR Studio TT23XR 工作室';
            
            // this.text = ''

            const heroContent = document.querySelector('.hero-content');
            if (!heroContent) return;
            
            heroContent.style.position = 'relative';
            
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: absolute; top: -20rem; left: -40%;
                width: 180%; height: 180%;
                pointer-events: none; z-index: 10;
            `;
            heroContent.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            
            this.canvas.style.pointerEvents = 'auto';
            this.canvas.addEventListener('click', () => this.explode());
            
            heroContent.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                
                // 计算鼠标速度
                const newX = e.clientX - rect.left;
                const newY = e.clientY - rect.top;
                
                this.mouseVel.x = newX - this.mouse.x;
                this.mouseVel.y = newY - this.mouse.y;
                
                this.lastMouse.x = this.mouse.x;
                this.lastMouse.y = this.mouse.y;
                this.mouse.x = newX;
                this.mouse.y = newY;
            });
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        },
        
        resize() {
            const parent = this.canvas.parentElement;
            if (!parent) return;
            
            // 使用 CSS 宽高来设置 canvas 的实际像素尺寸
            const rect = this.canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            
            if (w <= 0 || h <= 0) return;
            
            this.canvas.width = w;
            this.canvas.height = h;
            this.initParticles();
        },
        
        initParticles() {
            this.particles = [];
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            if (w <= 0 || h <= 0) return;
            
            // 增大字体：最小60px，最大150px
            const fontSize = Math.max(60, Math.min(w / this.text.length * 1.5 - 20, 150));
            
            // 直接绘制文字到临时 canvas
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = w;
            tempCanvas.height = h;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.font = `bold ${fontSize}px Arial`;
            tempCtx.fillStyle = 'white';
            tempCtx.textAlign = 'center';
            tempCtx.textBaseline = 'middle';
            tempCtx.fillText(this.text, w / 2, h / 2);
            
            try {
                const imageData = tempCtx.getImageData(0, 0, w, h);
                const gap = 5;
                
                for (let y = 0; y < h; y += gap) {
                    for (let x = 0; x < w; x += gap) {
                        const i = (y * w + x) * 4;
                        if (imageData.data[i + 3] > 128) {
                            this.particles.push({
                                x, y,
                                originX: x, originY: y,
                                vx: 0, vy: 0,
                                size: 2,
                                hue: (x / w) * 360
                            });
                        }
                    }
                }
            } catch (e) {
                console.warn('Hero particles init failed:', e);
            }
        },
        
        explode() {
            this.isExploded = !this.isExploded;
            
            if (this.isExploded) {
                this.particles.forEach(p => {
                    const angle = Math.random() * Math.PI * 2;
                    const force = 3 + Math.random() * 8;
                    p.vx = Math.cos(angle) * force;
                    p.vy = Math.sin(angle) * force;
                });
            }
        },
        
        animate() {
            if (!this.ctx || !this.canvas) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.particles.forEach(p => {
                if (this.isExploded) {
                    p.vx *= 0.98;
                    p.vy *= 0.98;
                    p.vy += 0.1;
                    
                    p.vx += (p.originX - p.x) * 0.01;
                    p.vy += (p.originY - p.y) * 0.01;
                    
                    p.x += p.vx;
                    p.y += p.vy;
                } else {
                    const dx = p.x - this.mouse.x;
                    const dy = p.y - this.mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 60 && dist > 0) {
                        const force = (60 - dist) / 60 * 2;
                        p.x += (dx / dist) * force;
                        p.y += (dy / dist) * force;
                    }
                    
                    p.x += (p.originX - p.x) * 0.08;
                    p.y += (p.originY - p.y) * 0.08;
                }
                
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsl(${p.hue}, 80%, 60%)`;
                this.ctx.fill();
            });
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 5. 重力感应粒子 ==============
    gravityParticles: {
        canvas: null,
        ctx: null,
        particles: [],
        mouse: { x: -1000, y: -1000 },
        
        init() {
            const hero = document.querySelector('.hero');
            if (!hero) return;
            
            // 清空原有粒子
            const existing = document.querySelector('.particles');
            if (existing) existing.innerHTML = '';
            
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: absolute; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none; z-index: 1;
            `;
            hero.appendChild(this.canvas);
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
            this.initParticles();
        },
        
        initParticles() {
            this.particles = [];
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            for (let i = 0; i < 60; i++) {
                this.particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: 0, vy: 0,
                    size: 2 + Math.random() * 3,
                    hue: 200 + Math.random() * 60,
                    alpha: 0.3 + Math.random() * 0.3
                });
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
            
            this.particles.forEach(p => {
                p.vy += 0.08;
                
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120 && dist > 0) {
                    const force = (120 - dist) / 120 * 4;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }
                
                p.vx *= 0.99;
                p.vy *= 0.99;
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.y > h - p.size) { p.y = h - p.size; p.vy *= -0.5; p.vx *= 0.8; }
                if (p.x < p.size) { p.x = p.size; p.vx *= -0.5; }
                if (p.x > w - p.size) { p.x = w - p.size; p.vx *= -0.5; }
                if (p.y < p.size) { p.y = p.size; p.vy *= -0.5; }
                
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.alpha})`;
                this.ctx.fill();
            });
            
            // 连线
            this.ctx.strokeStyle = 'rgba(74, 158, 255, 0.1)';
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p1 = this.particles[i];
                    const p2 = this.particles[j];
                    const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                    if (dist < 80) {
                        this.ctx.globalAlpha = (80 - dist) / 80 * 0.2;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.stroke();
                    }
                }
            }
            this.ctx.globalAlpha = 1;
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // // ============== 6. 引力透镜效果 ==============
    // gravityLens: {
    //     canvas: null,
    //     ctx: null,
    //     mouse: { x: -1000, y: -1000 },
    //     isActive: false,
    //     backgroundCanvas: null,
    //     bgCtx: null,
    //     stars: [],
        
    //     init() {
    //         // 创建背景星空画布
    //         this.backgroundCanvas = document.createElement('canvas');
    //         this.backgroundCanvas.style.cssText = `
    //             position: fixed; top: 0; left: 0;
    //             width: 100%; height: 100%;
    //             pointer-events: none; z-index: 0;
    //             opacity: 0.25;
    //         `;
    //         document.body.insertBefore(this.backgroundCanvas, document.body.firstChild);
    //         this.bgCtx = this.backgroundCanvas.getContext('2d');
            
    //         // 创建透镜效果画布
    //         this.canvas = document.createElement('canvas');
    //         this.canvas.style.cssText = `
    //             position: fixed; top: 0; left: 0;
    //             width: 100%; height: 100%;
    //             pointer-events: none; z-index: 9997;
    //             opacity: 0.25;
    //         `;
    //         document.body.appendChild(this.canvas);
    //         this.ctx = this.canvas.getContext('2d');
            
    //         this.resize();
    //         window.addEventListener('resize', () => this.resize());
            
    //         // 按住 L 键激活引力透镜
    //         window.addEventListener('keydown', (e) => {
    //             if (e.code === 'KeyL' && !this.isActive) {
    //                 this.isActive = true;
    //                 this.canvas.style.opacity = '1';
    //             }
    //         });
            
    //         window.addEventListener('keyup', (e) => {
    //             // if (e.code === 'KeyL') {
    //             //     this.isActive = false;
    //             //     this.canvas.style.opacity = '0';
    //             // }
    //         });
            
    //         window.addEventListener('mousemove', (e) => {
    //             this.mouse.x = e.clientX;
    //             this.mouse.y = e.clientY;
    //         });
            
    //         this.animate();
    //     },
        
    //     resize() {
    //         const w = window.innerWidth;
    //         const h = window.innerHeight;
    //         this.canvas.width = w;
    //         this.canvas.height = h;
    //         this.backgroundCanvas.width = w;
    //         this.backgroundCanvas.height = h;
    //         this.initStars();
    //     },
        
    //     initStars() {
    //         this.stars = [];
    //         const w = this.backgroundCanvas.width;
    //         const h = this.backgroundCanvas.height;
    //         for (let i = 0; i < 200; i++) {
    //             this.stars.push({
    //                 x: Math.random() * w,
    //                 y: Math.random() * h,
    //                 size: Math.random() * 2 + 0.5,
    //                 brightness: Math.random()
    //             });
    //         }
    //     },
        
    //     animate() {
    //         const w = this.canvas.width;
    //         const h = this.canvas.height;
            
    //         // 绘制背景星空
    //         this.bgCtx.fillStyle = 'rgba(18, 18, 18, 0.1)';
    //         this.bgCtx.fillRect(0, 0, w, h);
            
    //         this.stars.forEach(star => {
    //             this.bgCtx.beginPath();
    //             this.bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    //             this.bgCtx.fillStyle = `rgba(255, 255, 255, ${0.3 + star.brightness * 0.7})`;
    //             this.bgCtx.fill();
    //         });
            
    //         // 引力透镜效果
    //         if (this.isActive) {
    //             this.ctx.clearRect(0, 0, w, h);
                
    //             // 绘制黑洞效果
    //             const gradient = this.ctx.createRadialGradient(
    //                 this.mouse.x, this.mouse.y, 0,
    //                 this.mouse.x, this.mouse.y, 150
    //             );
    //             gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    //             gradient.addColorStop(0.3, 'rgba(20, 0, 40, 0.7)');
    //             gradient.addColorStop(0.6, 'rgba(60, 0, 80, 0.3)');
    //             gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
    //             this.ctx.fillStyle = gradient;
    //             this.ctx.fillRect(0, 0, w, h);
                
    //             // 吸积盘效果
    //             for (let i = 0; i < 3; i++) {
    //                 this.ctx.beginPath();
    //                 this.ctx.arc(this.mouse.x, this.mouse.y, 80 + i * 30, 0, Math.PI * 2);
    //                 this.ctx.strokeStyle = `hsla(${280 + i * 40}, 100%, 60%, ${0.5 - i * 0.15})`;
    //                 this.ctx.lineWidth = 3 - i;
    //                 this.ctx.stroke();
    //             }
                
    //             // 扭曲周围的星星
    //             this.stars.forEach(star => {
    //                 const dx = star.x - this.mouse.x;
    //                 const dy = star.y - this.mouse.y;
    //                 const dist = Math.sqrt(dx * dx + dy * dy);
                    
    //                 if (dist < 200 && dist > 10) {
    //                     const force = (200 - dist) / 200;
    //                     const angle = Math.atan2(dy, dx);
                        
    //                     // 绘制被扭曲的光线
    //                     this.ctx.beginPath();
    //                     this.ctx.moveTo(star.x, star.y);
    //                     this.ctx.lineTo(
    //                         star.x + Math.cos(angle + Math.PI / 2) * force * 20,
    //                         star.y + Math.sin(angle + Math.PI / 2) * force * 20
    //                     );
    //                     this.ctx.strokeStyle = `rgba(150, 100, 255, ${force * 0.5})`;
    //                     this.ctx.lineWidth = 1;
    //                     this.ctx.stroke();
    //                 }
    //             });
    //         }
            
    //         requestAnimationFrame(() => this.animate());
    //     }
    // },

    // ============== 7. 全息故障效果 ==============
    glitchEffect: {
        isActive: false,
        overlay: null,
        styleElement: null,
        
        init() {
            // 注入CSS动画
            this.styleElement = document.createElement('style');
            this.styleElement.textContent = `
                @keyframes glitch-skew {
                    0% { transform: skew(0deg); }
                    20% { transform: skew(-2deg); }
                    40% { transform: skew(2deg); }
                    60% { transform: skew(-1deg); }
                    80% { transform: skew(1deg); }
                    100% { transform: skew(0deg); }
                }
                @keyframes glitch-shift {
                    0%, 100% { clip-path: inset(0 0 0 0); }
                    20% { clip-path: inset(20% 0 60% 0); transform: translate(-5px, 0); }
                    40% { clip-path: inset(40% 0 40% 0); transform: translate(5px, 0); }
                    60% { clip-path: inset(60% 0 20% 0); transform: translate(-3px, 0); }
                    80% { clip-path: inset(80% 0 0% 0); transform: translate(3px, 0); }
                }
                @keyframes scanline {
                    0% { top: -100%; }
                    100% { top: 100%; }
                }
                @keyframes rgb-shift {
                    0%, 100% { text-shadow: -2px 0 red, 2px 0 cyan; }
                    25% { text-shadow: 2px 0 red, -2px 0 cyan; }
                    50% { text-shadow: -2px 0 red, 2px 0 cyan; }
                    75% { text-shadow: 2px 0 red, -2px 0 cyan; }
                }
                .glitch-active * {
                    animation: glitch-skew 0.3s infinite linear alternate;
                }
                .glitch-active .hero h1, .glitch-active .section-title {
                    animation: rgb-shift 0.1s infinite;
                }
                .glitch-overlay {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    pointer-events: none;
                    z-index: 99999;
                    background: repeating-linear-gradient(
                        0deg,
                        rgba(0, 0, 0, 0.15),
                        rgba(0, 0, 0, 0.15) 1px,
                        transparent 1px,
                        transparent 2px
                    );
                }
                .glitch-scanline {
                    position: absolute;
                    width: 100%;
                    height: 5px;
                    background: rgba(255, 255, 255, 0.8);
                    animation: scanline 0.5s linear infinite;
                }
                .glitch-noise {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    opacity: 0.1;
                    background-image: url('data:image/svg+xml,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noise)"/></svg>');
                }
            `;
            document.head.appendChild(this.styleElement);
            
            // 双击触发
            let lastClickTime = 0;
            document.addEventListener('dblclick', (e) => {
                this.trigger();
            });
        },
        
        trigger() {
            if (this.isActive) return;
            this.isActive = true;
            
            // 创建覆盖层
            this.overlay = document.createElement('div');
            this.overlay.className = 'glitch-overlay';
            this.overlay.innerHTML = `
                <div class="glitch-noise"></div>
                <div class="glitch-scanline"></div>
            `;
            document.body.appendChild(this.overlay);
            
            // 添加glitch类
            document.body.classList.add('glitch-active');
            
            // RGB分离效果
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.filter = 'url(#glitch-filter)';
            }
            
            // 创建SVG滤镜
            const svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgFilter.innerHTML = `
                <filter id="glitch-filter">
                    <feOffset in="SourceGraphic" dx="3" dy="0" result="red">
                        <animate attributeName="dx" values="3;-3;3" dur="0.2s" repeatCount="indefinite"/>
                    </feOffset>
                    <feOffset in="SourceGraphic" dx="-3" dy="0" result="cyan">
                        <animate attributeName="dx" values="-3;3;-3" dur="0.2s" repeatCount="indefinite"/>
                    </feOffset>
                </filter>
            `;
            svgFilter.style.cssText = 'position: absolute; width: 0; height: 0;';
            document.body.appendChild(svgFilter);
            
            // 故障文字
            const glitchTexts = ['SYSTEM ERROR', 'GLITCH DETECTED', 'REBOOTING...', '01101000 01101001'];
            let textIndex = 0;
            const textInterval = setInterval(() => {
                const textEl = document.createElement('div');
                textEl.textContent = glitchTexts[textIndex % glitchTexts.length];
                textEl.style.cssText = `
                    position: fixed;
                    top: ${Math.random() * 80 + 10}%;
                    left: ${Math.random() * 80 + 10}%;
                    font-size: 2rem;
                    font-weight: bold;
                    color: #ff00ff;
                    text-shadow: 2px 2px 0 #00ffff, -2px -2px 0 #ff0000;
                    z-index: 100000;
                    font-family: monospace;
                    pointer-events: none;
                `;
                document.body.appendChild(textEl);
                setTimeout(() => textEl.remove(), 300);
                textIndex++;
            }, 200);
            
            // 随机闪烁
            const flashInterval = setInterval(() => {
                document.body.style.filter = `invert(${Math.random() > 0.8 ? 1 : 0})`;
            }, 100);
            
            // 结束效果
            setTimeout(() => {
                clearInterval(textInterval);
                clearInterval(flashInterval);
                document.body.classList.remove('glitch-active');
                document.body.style.filter = '';
                if (this.overlay) this.overlay.remove();
                svgFilter.remove();
                this.isActive = false;
                
                // 显示恢复消息
                const recoveryMsg = document.createElement('div');
                recoveryMsg.textContent = '✓ System Restored';
                recoveryMsg.style.cssText = `
                    position: fixed; top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 2rem; color: #00ff00;
                    font-family: monospace;
                    z-index: 100000;
                    text-shadow: 0 0 20px #00ff00;
                `;
                document.body.appendChild(recoveryMsg);
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(recoveryMsg, { opacity: 0, scale: 0.5 }, { 
                        opacity: 1, scale: 1, duration: 0.3,
                        onComplete: () => {
                            gsap.to(recoveryMsg, { opacity: 0, y: -50, delay: 1, duration: 0.5, onComplete: () => recoveryMsg.remove() });
                        }
                    });
                } else {
                    setTimeout(() => recoveryMsg.remove(), 2000);
                }
            }, 250);
        }
    },

    // ============== 8. 元素逃逸（愚人节彩蛋） ==============
    aprilFoolsEscape: {
        isActive: false,
        elements: [],
        activationDate: null,
        manualActivate: false,
        
        init() {
            // 检查是否是4月1日
            const today = new Date();
            this.activationDate = (today.getMonth() === 3 && today.getDate() === 1);
            
            // 或者按 F1 手动激活
            window.addEventListener('keydown', (e) => {
                if (e.code === 'F1') {
                    e.preventDefault();
                    this.manualActivate = true;
                    this.toggle();
                }
            });
            
            // 自动检查愚人节
            if (this.activationDate) {
                setTimeout(() => {
                    this.showHint();
                }, 5000);
            }
            
            // 鼠标移动时处理逃逸
            window.addEventListener('mousemove', (e) => {
                if (this.isActive) {
                    this.handleEscape(e);
                }
            });
            
            this.collectElements();
            this.animate();
        },
        
        showHint() {
            const hint = document.createElement('div');
            hint.innerHTML = '愚人节快乐！试试移动鼠标，看看会发生什么...<br><small style="opacity:0.7">按 F1 开启/关闭元素逃逸模式</small>';
            hint.style.cssText = `
                position: fixed; bottom: 20px; left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ff6b6b, #feca57);
                color: white;
                padding: 15px 25px;
                border-radius: 30px;
                font-size: 1rem;
                z-index: 100000;
                box-shadow: 0 5px 30px rgba(255, 107, 107, 0.5);
                text-align: center;
            `;
            document.body.appendChild(hint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(hint, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
                gsap.to(hint, { y: 100, opacity: 0, delay: 5, duration: 0.5, onComplete: () => hint.remove() });
            } else {
                setTimeout(() => hint.remove(), 6000);
            }
        },
        
        toggle() {
            this.isActive = !this.isActive;
            
            if (this.isActive) {
                this.collectElements();
                this.showActivationMessage();
            } else {
                this.resetAllElements();
            }
        },
        
        showActivationMessage() {
            const msg = document.createElement('div');
            msg.innerHTML = '元素逃逸模式已激活！<br><small>所有元素都害怕你的鼠标...</small>';
            msg.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: #00ff00;
                padding: 30px 50px;
                border-radius: 20px;
                font-size: 1.5rem;
                z-index: 100000;
                border: 2px solid #00ff00;
                text-align: center;
                font-family: monospace;
            `;
            document.body.appendChild(msg);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(msg, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' });
                gsap.to(msg, { scale: 0, opacity: 0, delay: 2, duration: 0.3, onComplete: () => msg.remove() });
            } else {
                setTimeout(() => msg.remove(), 2500);
            }
        },
        
        collectElements() {
            this.elements = [];
            const selectors = '.project-card, .team-card, .showcase-card, .btn, .nav-link, .tag, .skill-tag, .link-btn, .member-avatar, h2, h3';
            document.querySelectorAll(selectors).forEach((el, i) => {
                const rect = el.getBoundingClientRect();
                this.elements.push({
                    el,
                    originalX: 0,
                    originalY: 0,
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    fearDistance: 100 + Math.random() * 50,
                    escapeSpeed: 0.3 + Math.random() * 0.3,
                    wobble: Math.random() * Math.PI * 2
                });
            });
        },
        
        handleEscape(e) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            this.elements.forEach(item => {
                const rect = item.el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const dx = centerX - mouseX;
                const dy = centerY - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < item.fearDistance && dist > 0) {
                    // 计算逃逸方向
                    const escapeForce = (item.fearDistance - dist) / item.fearDistance * item.escapeSpeed;
                    const angle = Math.atan2(dy, dx);
                    
                    // 添加一些随机性，让逃逸更有趣
                    const randomAngle = angle + (Math.random() - 0.5) * 0.5;
                    
                    item.vx += Math.cos(randomAngle) * escapeForce * 15;
                    item.vy += Math.sin(randomAngle) * escapeForce * 15;
                    
                    // 添加抖动效果
                    item.wobble += 0.5;
                }
            });
        },
        
        resetAllElements() {
            this.elements.forEach(item => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(item.el, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
                }
                item.x = 0;
                item.y = 0;
                item.vx = 0;
                item.vy = 0;
            });
        },
        
        animate() {
            if (!this.isActive) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            this.elements.forEach(item => {
                // 应用弹簧力回到原位
                item.vx += -item.x * 0.02;
                item.vy += -item.y * 0.02;
                
                // 阻尼
                item.vx *= 0.92;
                item.vy *= 0.92;
                
                // 更新位置
                item.x += item.vx;
                item.y += item.vy;
                
                // 限制最大位移
                const maxDist = 150;
                const dist = Math.sqrt(item.x * item.x + item.y * item.y);
                if (dist > maxDist) {
                    item.x = (item.x / dist) * maxDist;
                    item.y = (item.y / dist) * maxDist;
                }
                
                // 添加轻微抖动
                const wobbleX = Math.sin(item.wobble) * 2;
                const wobbleY = Math.cos(item.wobble) * 2;
                item.wobble += 0.1;
                
                // 应用变换
                const rotation = item.x * 0.1;
                if (typeof gsap !== 'undefined') {
                    gsap.set(item.el, { 
                        x: item.x + wobbleX, 
                        y: item.y + wobbleY,
                        rotation: rotation
                    });
                } else {
                    item.el.style.transform = `translate(${item.x + wobbleX}px, ${item.y + wobbleY}px) rotate(${rotation}deg)`;
                }
            });
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 9. 画布签名墙 ==============
    signatureWall: {
        canvas: null,
        ctx: null,
        isDrawing: false,
        strokes: [],
        currentStroke: [],
        hue: 0,
        particles: [],
        
        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none; z-index: 9996;
                opacity: 0;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            
            // Shift + 鼠标拖动绘制
            window.addEventListener('mousedown', (e) => {
                if (e.shiftKey) {
                    this.startDrawing(e);
                }
            });
            
            window.addEventListener('mousemove', (e) => {
                if (this.isDrawing && e.shiftKey) {
                    this.draw(e);
                }
            });
            
            window.addEventListener('mouseup', () => {
                if (this.isDrawing) {
                    this.stopDrawing();
                }
            });
            
            // 显示提示
            this.showHint();
            this.animate();
        },
        
        showHint() {
            const hint = document.createElement('div');
            hint.innerHTML = '按住 Shift + 拖动鼠标，在页面上签名！';
            hint.style.cssText = `
                position: fixed; bottom: 80px; right: 20px;
                background: rgba(74, 158, 255, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 0.9rem;
                z-index: 100000;
                box-shadow: 0 4px 15px rgba(74, 158, 255, 0.4);
            `;
            document.body.appendChild(hint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(hint, { x: 100, opacity: 0 }, { x: 0, opacity: 1, delay: 3, duration: 0.5 });
                gsap.to(hint, { x: 100, opacity: 0, delay: 10, duration: 0.5, onComplete: () => hint.remove() });
            } else {
                setTimeout(() => hint.remove(), 15000);
            }
        },
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },
        
        startDrawing(e) {
            this.isDrawing = true;
            this.canvas.style.opacity = '1';
            this.currentStroke = [{ x: e.clientX, y: e.clientY, hue: this.hue }];
            this.hue = (this.hue + 30) % 360;
        },
        
        draw(e) {
            const point = { x: e.clientX, y: e.clientY, hue: this.hue };
            this.currentStroke.push(point);
            
            // 绘制线条
            if (this.currentStroke.length > 1) {
                const prev = this.currentStroke[this.currentStroke.length - 2];
                this.ctx.beginPath();
                this.ctx.moveTo(prev.x, prev.y);
                this.ctx.lineTo(point.x, point.y);
                this.ctx.strokeStyle = `hsl(${point.hue}, 80%, 60%)`;
                this.ctx.lineWidth = 3;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
            }
        },
        
        stopDrawing() {
            this.isDrawing = false;
            if (this.currentStroke.length > 0) {
                this.strokes.push([...this.currentStroke]);
                // 延迟后让签名变成粒子飞走
                setTimeout(() => {
                    this.convertToParticles(this.strokes.length - 1);
                }, 2000);
            }
            this.currentStroke = [];
        },
        
        convertToParticles(strokeIndex) {
            if (strokeIndex >= this.strokes.length) return;
            
            const stroke = this.strokes[strokeIndex];
            stroke.forEach((point, i) => {
                for (let j = 0; j < 3; j++) {
                    this.particles.push({
                        x: point.x,
                        y: point.y,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5 - 2,
                        size: 2 + Math.random() * 2,
                        hue: point.hue,
                        life: 1
                    });
                }
            });
            
            // 从数组中移除这个笔画
            this.strokes.splice(strokeIndex, 1);
            
            // 重绘画布
            this.redraw();
        },
        
        redraw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.strokes.forEach(stroke => {
                for (let i = 1; i < stroke.length; i++) {
                    const prev = stroke[i - 1];
                    const point = stroke[i];
                    this.ctx.beginPath();
                    this.ctx.moveTo(prev.x, prev.y);
                    this.ctx.lineTo(point.x, point.y);
                    this.ctx.strokeStyle = `hsl(${point.hue}, 80%, 60%)`;
                    this.ctx.lineWidth = 3;
                    this.ctx.lineCap = 'round';
                    this.ctx.stroke();
                }
            });
        },
        
        animate() {
            // 更新粒子
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                
                p.vy += 0.1; // 重力
                p.vx *= 0.99;
                p.vy *= 0.99;
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.01;
                
                // 绘制粒子
                const radius = Math.max(0.5, p.size * p.life);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
                this.ctx.fill();
                
                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                }
            }
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 10. 重力翻转 ==============
    gravityFlip: {
        gravity: { x: 0, y: 1 }, // 重力方向
        particles: [],
        canvas: null,
        ctx: null,
        directions: ['down', 'up', 'left', 'right'],
        currentDir: 0,
        isActive: false,
        
        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none; z-index: 9995;
                opacity: 0;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            
            // 按 G 键切换重力
            window.addEventListener('keydown', (e) => {
                if (e.code === 'KeyG') {
                    this.flipGravity();
                }
            });
            
            this.showHint();
            this.initParticles();
            this.animate();
        },
        
        showHint() {
            const hint = document.createElement('div');
            hint.innerHTML = '按 G 键翻转重力方向！';
            hint.style.cssText = `
                position: fixed; bottom: 120px; right: 20px;
                background: rgba(255, 107, 74, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 0.9rem;
                z-index: 100000;
                box-shadow: 0 4px 15px rgba(255, 107, 74, 0.4);
            `;
            document.body.appendChild(hint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(hint, { x: 100, opacity: 0 }, { x: 0, opacity: 1, delay: 5, duration: 0.5 });
                gsap.to(hint, { x: 100, opacity: 0, delay: 12, duration: 0.5, onComplete: () => hint.remove() });
            } else {
                setTimeout(() => hint.remove(), 18000);
            }
        },
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },
        
        initParticles() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            // 创建各种形状的粒子
            for (let i = 0; i < 50; i++) {
                this.particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: 0,
                    vy: 0,
                    size: 5 + Math.random() * 15,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 5,
                    shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)],
                    color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
                });
            }
        },
        
        flipGravity() {
            this.currentDir = (this.currentDir + 1) % 4;
            const dir = this.directions[this.currentDir];
            
            // 设置重力方向
            switch (dir) {
                case 'down': this.gravity = { x: 0, y: 1 }; break;
                case 'up': this.gravity = { x: 0, y: -1 }; break;
                case 'left': this.gravity = { x: -1, y: 0 }; break;
                case 'right': this.gravity = { x: 1, y: 0 }; break;
            }
            
            // 显示画布
            this.canvas.style.opacity = '1';
            this.isActive = true;
            
            // 给粒子一个初始速度
            this.particles.forEach(p => {
                p.vx += (Math.random() - 0.5) * 10;
                p.vy += (Math.random() - 0.5) * 10;
            });
            
            // 显示方向提示
            const arrow = { down: '↓', up: '↑', left: '←', right: '→' };
            const hint = document.createElement('div');
            hint.innerHTML = `重力 ${arrow[dir]}`;
            hint.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                font-size: 4rem; color: white;
                text-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
                z-index: 100000;
                pointer-events: none;
            `;
            document.body.appendChild(hint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(hint, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
                gsap.to(hint, { scale: 2, opacity: 0, delay: 0.5, duration: 0.3, onComplete: () => hint.remove() });
            } else {
                setTimeout(() => hint.remove(), 1000);
            }
            
            // 3秒后隐藏画布
            setTimeout(() => {
                this.canvas.style.opacity = '0';
                this.isActive = false;
            }, 3000);
        },
        
        animate() {
            if (!this.isActive) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            this.ctx.clearRect(0, 0, w, h);
            
            this.particles.forEach(p => {
                // 应用重力
                p.vx += this.gravity.x * 0.3;
                p.vy += this.gravity.y * 0.3;
                
                // 阻尼
                p.vx *= 0.99;
                p.vy *= 0.99;
                
                // 更新位置
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                
                // 边界碰撞
                if (p.x < p.size) { p.x = p.size; p.vx *= -0.7; }
                if (p.x > w - p.size) { p.x = w - p.size; p.vx *= -0.7; }
                if (p.y < p.size) { p.y = p.size; p.vy *= -0.7; }
                if (p.y > h - p.size) { p.y = h - p.size; p.vy *= -0.7; }
                
                // 绘制
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation * Math.PI / 180);
                this.ctx.fillStyle = p.color;
                
                switch (p.shape) {
                    case 'circle':
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    case 'square':
                        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                        break;
                    case 'triangle':
                        this.ctx.beginPath();
                        this.ctx.moveTo(0, -p.size);
                        this.ctx.lineTo(p.size * 0.866, p.size / 2);
                        this.ctx.lineTo(-p.size * 0.866, p.size / 2);
                        this.ctx.closePath();
                        this.ctx.fill();
                        break;
                }
                
                this.ctx.restore();
            });
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 11. 时间冻结 ==============
    timeFreeze: {
        isFrozen: false,
        frozenTime: 0,
        overlay: null,
        magnifier: null,
        pausedAnimations: [],
        
        init() {
            // 创建冻结覆盖层
            this.overlay = document.createElement('div');
            this.overlay.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0, 50, 100, 0.3);
                pointer-events: none; z-index: 9994;
                opacity: 0;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(this.overlay);
            
            // 创建放大镜
            this.magnifier = document.createElement('div');
            this.magnifier.style.cssText = `
                position: fixed;
                width: 200px; height: 200px;
                border-radius: 50%;
                border: 3px solid rgba(255, 255, 255, 0.8);
                box-shadow: 0 0 30px rgba(100, 200, 255, 0.5), inset 0 0 50px rgba(100, 200, 255, 0.2);
                pointer-events: none; z-index: 9995;
                display: none;
                overflow: hidden;
            `;
            document.body.appendChild(this.magnifier);
            
            // 空格键冻结/解冻
            window.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && !e.repeat) {
                    e.preventDefault();
                    this.toggle();
                }
            });
            
            // 冻结时鼠标移动更新放大镜位置
            window.addEventListener('mousemove', (e) => {
                if (this.isFrozen) {
                    this.updateMagnifier(e);
                }
            });
            
            this.showHint();
        },
        
        showHint() {
            const hint = document.createElement('div');
            hint.innerHTML = '按空格键冻结时间！';
            hint.style.cssText = `
                position: fixed; bottom: 160px; right: 20px;
                background: rgba(100, 200, 255, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 0.9rem;
                z-index: 100000;
                box-shadow: 0 4px 15px rgba(100, 200, 255, 0.4);
            `;
            document.body.appendChild(hint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(hint, { x: 100, opacity: 0 }, { x: 0, opacity: 1, delay: 7, duration: 0.5 });
                gsap.to(hint, { x: 100, opacity: 0, delay: 14, duration: 0.5, onComplete: () => hint.remove() });
            } else {
                setTimeout(() => hint.remove(), 22000);
            }
        },
        
        toggle() {
            this.isFrozen = !this.isFrozen;
            
            if (this.isFrozen) {
                this.freeze();
            } else {
                this.unfreeze();
            }
        },
        
        freeze() {
            // 显示覆盖层
            this.overlay.style.opacity = '1';
            this.magnifier.style.display = 'block';
            
            // 暂停所有GSAP动画
            if (typeof gsap !== 'undefined') {
                gsap.globalTimeline.pause();
            }
            
            // 添加冻结效果到页面元素
            document.body.style.filter = 'saturate(0.5) brightness(0.9)';
            
            // 显示时间戳
            const timestamp = document.createElement('div');
            timestamp.className = 'freeze-timestamp';
            timestamp.innerHTML = `TIME FROZEN<br><small>${new Date().toLocaleTimeString()}</small>`;
            timestamp.style.cssText = `
                position: fixed; top: 20px; left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 100, 200, 0.9);
                color: white;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 1.2rem;
                z-index: 100000;
                text-align: center;
                font-family: monospace;
                border: 2px solid rgba(255, 255, 255, 0.5);
            `;
            document.body.appendChild(timestamp);
            
            // 冻结粒子动画
            if (window.InteractiveEffects) {
                // 标记冻结状态
                this.frozenTime = performance.now();
            }
            
            // 音效提示（可选）
            this.playFreezeSound();
        },
        
        unfreeze() {
            // 隐藏覆盖层
            this.overlay.style.opacity = '0';
            this.magnifier.style.display = 'none';
            
            // 恢复GSAP动画
            if (typeof gsap !== 'undefined') {
                gsap.globalTimeline.resume();
            }
            
            // 恢复页面样式
            document.body.style.filter = '';
            
            // 移除时间戳
            const timestamp = document.querySelector('.freeze-timestamp');
            if (timestamp) timestamp.remove();
            
            // 显示恢复消息
            const msg = document.createElement('div');
            msg.innerHTML = '时间恢复流动';
            msg.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 200, 100, 0.9);
                color: white;
                padding: 20px 40px;
                border-radius: 10px;
                font-size: 1.5rem;
                z-index: 100000;
            `;
            document.body.appendChild(msg);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(msg, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
                gsap.to(msg, { scale: 1.2, opacity: 0, delay: 0.8, duration: 0.3, onComplete: () => msg.remove() });
            } else {
                setTimeout(() => msg.remove(), 1200);
            }
        },
        
        updateMagnifier(e) {
            const x = e.clientX;
            const y = e.clientY;
            
            this.magnifier.style.left = (x - 100) + 'px';
            this.magnifier.style.top = (y - 100) + 'px';
            
            // 放大镜内显示内容继续播放
            this.magnifier.innerHTML = `
                <div style="
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(100, 200, 255, 0.3) 0%, transparent 70%);
                    transform: translate(-50%, -50%) scale(2);
                    animation: pulse 1s infinite;
                "></div>
            `;
        },
        
        playFreezeSound() {
            // 使用 Web Audio API 创建简单的音效
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.3);
            } catch (e) {
                // 音频播放失败，忽略
            }
        }
    },

    // ============== 12. 全息投影 Hero 标题 ==============
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
                pointer-events: none; z-index: 15;
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

    // ============== 13. 矩阵网点背景（鼠标连线） ==============
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

    // ============== 14. 矩阵数字雨（鼠标交互） ==============
    matrixRain: {
        canvas: null,
        ctx: null,
        columns: [],
        mouse: { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 },
        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()',
        isActive: false,
        
        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none; z-index: 0;
                opacity: 0;
                transition: opacity 0.5s;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);
            this.ctx = this.canvas.getContext('2d');
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            
            // 鼠标移动追踪
            window.addEventListener('mousemove', (e) => {
                this.mouse.vx = e.clientX - this.mouse.x;
                this.mouse.vy = e.clientY - this.mouse.y;
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            
            // 按 M 键切换数字雨
            window.addEventListener('keydown', (e) => {
                if (e.code === 'KeyM') {
                    this.toggle();
                }
            });
            
            // 默认5秒后自动开启
            setTimeout(() => {
                if (!this.isActive) this.toggle();
            }, 3000);
            
            this.animate();
        },
        
        toggle() {
            this.isActive = !this.isActive;
            this.canvas.style.opacity = this.isActive ? '0.4' : '0';
            
            if (this.isActive) {
                this.showHint();
            }
        },
        
        showHint() {
            const hint = document.createElement('div');
            hint.innerHTML = '矩阵数字雨已启动<br><small>移动鼠标拨开数字雨 | 按 M 键切换</small>';
            hint.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 50, 30, 0.9);
                color: #00ff88;
                padding: 20px 40px;
                border-radius: 15px;
                font-size: 1.2rem;
                z-index: 100000;
                border: 2px solid #00ff88;
                text-align: center;
                font-family: monospace;
                box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
            `;
            document.body.appendChild(hint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(hint, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
                gsap.to(hint, { scale: 1.2, opacity: 0, delay: 2, duration: 0.3, onComplete: () => hint.remove() });
            } else {
                setTimeout(() => hint.remove(), 2500);
            }
        },
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.initColumns();
        },
        
        initColumns() {
            this.columns = [];
            const fontSize = 16;
            const columnCount = Math.ceil(this.canvas.width / fontSize);
            
            for (let i = 0; i < columnCount; i++) {
                this.columns.push({
                    x: i * fontSize,
                    y: Math.random() * this.canvas.height,
                    speed: 2 + Math.random() * 5,
                    chars: [],
                    length: 10 + Math.floor(Math.random() * 20)
                });
            }
        },
        
        animate() {
            if (!this.isActive) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            const fontSize = 16;
            
            // 半透明黑色覆盖产生拖尾效果
            this.ctx.fillStyle = 'rgba(18, 18, 18, 0.1)';
            this.ctx.fillRect(0, 0, w, h);
            
            this.ctx.font = `${fontSize}px monospace`;
            
            this.columns.forEach(col => {
                // 鼠标排斥效果
                const dx = col.x - this.mouse.x;
                const dy = col.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                let pushForce = 0;
                if (dist < 100 && dist > 0) {
                    pushForce = (100 - dist) / 100 * 30;
                }
                
                // 绘制字符列
                for (let i = 0; i < col.length; i++) {
                    const charY = col.y - i * fontSize;
                    
                    if (charY < 0 || charY > h) continue;
                    
                    // 计算鼠标影响
                    const charDist = Math.sqrt((col.x - this.mouse.x) ** 2 + (charY - this.mouse.y) ** 2);
                    const isPushed = charDist < 100;
                    
                    // 颜色渐变（头部亮，尾部暗）
                    const brightness = Math.max(0, 1 - i / col.length);
                    const hue = 120 + brightness * 30;
                    
                    // 被鼠标推开的字符变红
                    let charColor;
                    if (isPushed) {
                        const intensity = (100 - charDist) / 100;
                        charColor = `hsla(${hue - 60 * intensity}, 100%, ${50 + brightness * 30}%, ${brightness})`;
                    } else {
                        charColor = `hsla(${hue}, 100%, ${50 + brightness * 30}%, ${brightness})`;
                    }
                    
                    // 随机更换字符
                    if (Math.random() < 0.02) {
                        col.chars[i] = this.chars[Math.floor(Math.random() * this.chars.length)];
                    }
                    
                    const char = col.chars[i] || this.chars[Math.floor(Math.random() * this.chars.length)];
                    
                    // 被推开时字符偏移
                    let offsetX = 0;
                    if (isPushed) {
                        offsetX = (dx / dist) * pushForce * (1 - i / col.length);
                    }
                    
                    // 绘制发光效果
                    if (brightness > 0.8) {
                        this.ctx.shadowBlur = 10;
                        this.ctx.shadowColor = '#00ff88';
                    } else {
                        this.ctx.shadowBlur = 0;
                    }
                    
                    this.ctx.fillStyle = charColor;
                    this.ctx.fillText(char, col.x + offsetX, charY);
                }
                
                // 更新列位置
                col.y += col.speed;
                
                // 重置到顶部
                if (col.y - col.length * fontSize > h) {
                    col.y = -Math.random() * 100;
                    col.speed = 2 + Math.random() * 5;
                    col.length = 10 + Math.floor(Math.random() * 20);
                }
            });
            
            this.ctx.shadowBlur = 0;
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 15. 激光连线交互 ==============
    laserConnect: {
        canvas: null,
        ctx: null,
        mouse: { x: -1000, y: -1000 },
        targets: [],
        laserBeams: [],
        isActivated: false,
        hue: 180,
        
        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none; z-index: 9996;
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            
            // 按 L 键激活激光模式
            window.addEventListener('keydown', (e) => {
                if (e.code === 'KeyL') {
                    this.isActivated = !this.isActivated;
                    if (this.isActivated) {
                        this.collectTargets();
                        this.showHint();
                    }
                }
            });
            
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            
            // 点击创建激光爆炸
            window.addEventListener('click', (e) => {
                if (this.isActivated) {
                    this.createLaserBurst(e.clientX, e.clientY);
                }
            });
            
            this.animate();
        },
        
        showHint() {
            const hint = document.createElement('div');
            hint.innerHTML = '激光连线模式已启动<br><small>移动鼠标连接元素 | 点击发射激光脉冲</small>';
            hint.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 30, 60, 0.9);
                color: #00ffff;
                padding: 20px 40px;
                border-radius: 15px;
                font-size: 1.2rem;
                z-index: 100000;
                border: 2px solid #00ffff;
                text-align: center;
                font-family: monospace;
                box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
            `;
            document.body.appendChild(hint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(hint, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
                gsap.to(hint, { scale: 1.2, opacity: 0, delay: 2, duration: 0.3, onComplete: () => hint.remove() });
            } else {
                setTimeout(() => hint.remove(), 2500);
            }
        },
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },
        
        collectTargets() {
            this.targets = [];
            const selectors = '.project-card, .team-card, .showcase-card, .btn, .member-avatar, h2, h3';
            document.querySelectorAll(selectors).forEach(el => {
                const rect = el.getBoundingClientRect();
                this.targets.push({
                    el,
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    radius: Math.max(rect.width, rect.height) / 2
                });
            });
        },
        
        createLaserBurst(x, y) {
            // 创建多条激光向外发射
            const beamCount = 12;
            for (let i = 0; i < beamCount; i++) {
                const angle = (i / beamCount) * Math.PI * 2;
                this.laserBeams.push({
                    x, y,
                    angle,
                    speed: 15,
                    length: 0,
                    maxLength: 300 + Math.random() * 200,
                    hue: this.hue + Math.random() * 60,
                    width: 2 + Math.random() * 2,
                    life: 1
                });
            }
        },
        
        animate() {
            if (!this.ctx || !this.canvas) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            this.ctx.clearRect(0, 0, w, h);
            
            this.hue = (this.hue + 0.5) % 360;
            
            if (this.isActivated) {
                // 绘制鼠标周围的能量场
                const gradient = this.ctx.createRadialGradient(
                    this.mouse.x, this.mouse.y, 0,
                    this.mouse.x, this.mouse.y, 100
                );
                gradient.addColorStop(0, `hsla(${this.hue}, 100%, 60%, 0.3)`);
                gradient.addColorStop(0.5, `hsla(${this.hue + 30}, 100%, 50%, 0.1)`);
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, w, h);
                
                // 更新目标位置
                this.targets.forEach(t => {
                    const rect = t.el.getBoundingClientRect();
                    t.x = rect.left + rect.width / 2;
                    t.y = rect.top + rect.height / 2;
                });
                
                // 绘制到最近目标的激光
                const sortedTargets = [...this.targets].sort((a, b) => {
                    const distA = Math.sqrt((a.x - this.mouse.x) ** 2 + (a.y - this.mouse.y) ** 2);
                    const distB = Math.sqrt((b.x - this.mouse.x) ** 2 + (b.y - this.mouse.y) ** 2);
                    return distA - distB;
                });
                
                // 连接到最近的3个目标
                for (let i = 0; i < Math.min(3, sortedTargets.length); i++) {
                    const target = sortedTargets[i];
                    const dist = Math.sqrt((target.x - this.mouse.x) ** 2 + (target.y - this.mouse.y) ** 2);
                    
                    if (dist < 400) {
                        const alpha = (400 - dist) / 400;
                        
                        // 绘制激光线（多条叠加产生发光效果）
                        for (let j = 0; j < 3; j++) {
                            const lineWidth = 4 - j;
                            const lineAlpha = alpha * (1 - j * 0.3);
                            
                            this.ctx.beginPath();
                            this.ctx.moveTo(this.mouse.x, this.mouse.y);
                            
                            // 添加折射效果
                            const midX = (this.mouse.x + target.x) / 2 + Math.sin(performance.now() * 0.01 + i) * 20;
                            const midY = (this.mouse.y + target.y) / 2 + Math.cos(performance.now() * 0.01 + i) * 20;
                            
                            this.ctx.quadraticCurveTo(midX, midY, target.x, target.y);
                            
                            const gradient = this.ctx.createLinearGradient(
                                this.mouse.x, this.mouse.y, target.x, target.y
                            );
                            gradient.addColorStop(0, `hsla(${this.hue + i * 30}, 100%, 60%, ${lineAlpha})`);
                            gradient.addColorStop(0.5, `hsla(${this.hue + i * 30 + 30}, 100%, 50%, ${lineAlpha * 0.8})`);
                            gradient.addColorStop(1, `hsla(${this.hue + i * 30 + 60}, 100%, 60%, ${lineAlpha * 0.5})`);
                            
                            this.ctx.strokeStyle = gradient;
                            this.ctx.lineWidth = lineWidth;
                            this.ctx.lineCap = 'round';
                            this.ctx.stroke();
                        }
                        
                        // 目标点发光
                        this.ctx.beginPath();
                        this.ctx.arc(target.x, target.y, 10, 0, Math.PI * 2);
                        this.ctx.fillStyle = `hsla(${this.hue + i * 30}, 100%, 70%, ${alpha * 0.5})`;
                        this.ctx.fill();
                    }
                }
                
                // 绘制鼠标光标能量核心
                this.ctx.beginPath();
                this.ctx.arc(this.mouse.x, this.mouse.y, 8, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, 0.8)`;
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(this.mouse.x, this.mouse.y, 15, 0, Math.PI * 2);
                this.ctx.strokeStyle = `hsla(${this.hue}, 100%, 60%, 0.5)`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            
            // 更新和绘制激光爆发
            for (let i = this.laserBeams.length - 1; i >= 0; i--) {
                const beam = this.laserBeams[i];
                
                beam.length += beam.speed;
                beam.life -= 0.02;
                
                if (beam.length >= beam.maxLength || beam.life <= 0) {
                    this.laserBeams.splice(i, 1);
                    continue;
                }
                
                const endX = beam.x + Math.cos(beam.angle) * beam.length;
                const endY = beam.y + Math.sin(beam.angle) * beam.length;
                
                // 发光效果
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = `hsl(${beam.hue}, 100%, 60%)`;
                
                const gradient = this.ctx.createLinearGradient(beam.x, beam.y, endX, endY);
                gradient.addColorStop(0, `hsla(${beam.hue}, 100%, 70%, ${beam.life})`);
                gradient.addColorStop(1, `hsla(${beam.hue}, 100%, 50%, 0)`);
                
                this.ctx.beginPath();
                this.ctx.moveTo(beam.x, beam.y);
                this.ctx.lineTo(endX, endY);
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = beam.width;
                this.ctx.stroke();
                
                // 拖尾粒子
                if (Math.random() < 0.3) {
                    this.ctx.beginPath();
                    this.ctx.arc(endX, endY, Math.random() * 3 + 1, 0, Math.PI * 2);
                    this.ctx.fillStyle = `hsla(${beam.hue}, 100%, 70%, ${beam.life * 0.5})`;
                    this.ctx.fill();
                }
            }
            
            this.ctx.shadowBlur = 0;
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 16. 量子纠缠网络 ==============
    quantumEntanglement: {
        canvas: null,
        ctx: null,
        particles: [],
        connections: [],
        mouse: { x: -1000, y: -1000 },
        energyPulses: [],
        isActive: true,
        
        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'quantum-entanglement-canvas';
            this.canvas.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none; z-index: 0;
                opacity: 0.25;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);
            this.ctx = this.canvas.getContext('2d');
            
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
                this.activateNearby(e.clientX, e.clientY);
            });
            
            window.addEventListener('click', (e) => {
                this.createEnergyBurst(e.clientX, e.clientY);
            });
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        },
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.initParticles();
        },
        
        initParticles() {
            this.particles = [];
            const w = this.canvas.width;
            const h = this.canvas.height;
            const count = Math.min(150, Math.floor((w * h) / 15000));
            
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: 2 + Math.random() * 2,
                    energy: 0,
                    maxEnergy: 1,
                    hue: 180 + Math.random() * 80,
                    pulsePhase: Math.random() * Math.PI * 2,
                    connections: []
                });
            }
        },
        
        activateNearby(x, y) {
            this.particles.forEach(p => {
                const dx = p.x - x;
                const dy = p.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    p.energy = Math.min(p.maxEnergy, p.energy + 0.1);
                }
            });
        },
        
        createEnergyBurst(x, y) {
            // 创建能量脉冲
            this.energyPulses.push({
                x, y,
                radius: 0,
                maxRadius: 300,
                speed: 8,
                life: 1
            });
            
            // 激活所有粒子
            this.particles.forEach(p => {
                const dx = p.x - x;
                const dy = p.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 300) {
                    p.energy = p.maxEnergy;
                    // 添加冲击力
                    const angle = Math.atan2(dy, dx);
                    p.vx += Math.cos(angle) * 2;
                    p.vy += Math.sin(angle) * 2;
                }
            });
        },
        
        animate() {
            if (!this.ctx || !this.canvas) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            // 半透明清除产生拖尾
            this.ctx.fillStyle = 'rgba(18, 18, 18, 0.15)';
            this.ctx.fillRect(0, 0, w, h);
            
            // 更新和绘制能量脉冲
            for (let i = this.energyPulses.length - 1; i >= 0; i--) {
                const pulse = this.energyPulses[i];
                pulse.radius += pulse.speed;
                pulse.life -= 0.02;
                
                if (pulse.radius >= pulse.maxRadius || pulse.life <= 0) {
                    this.energyPulses.splice(i, 1);
                    continue;
                }
                
                const gradient = this.ctx.createRadialGradient(
                    pulse.x, pulse.y, pulse.radius * 0.8,
                    pulse.x, pulse.y, pulse.radius
                );
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.5, `hsla(200, 100%, 60%, ${pulse.life * 0.3})`);
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.beginPath();
                this.ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `hsla(200, 100%, 60%, ${pulse.life})`;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
            
            // 更新粒子
            this.particles.forEach(p => {
                // 移动
                p.x += p.vx;
                p.y += p.vy;
                
                // 边界反弹
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                p.x = Math.max(0, Math.min(w, p.x));
                p.y = Math.max(0, Math.min(h, p.y));
                
                // 能量衰减
                p.energy *= 0.995;
                
                // 速度衰减
                p.vx *= 0.99;
                p.vy *= 0.99;
                
                // 脉动
                p.pulsePhase += 0.05;
            });
            
            // 绘制连接线（量子纠缠）
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p1 = this.particles[i];
                    const p2 = this.particles[j];
                    const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                    
                    if (dist < 120) {
                        const alpha = (120 - dist) / 120;
                        const energy = (p1.energy + p2.energy) / 2;
                        
                        // 能量传输效果
                        const midX = (p1.x + p2.x) / 2;
                        const midY = (p1.y + p2.y) / 2;
                        const pulseOffset = Math.sin(performance.now() * 0.005 + i + j) * 5;
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        
                        // 波浪线
                        const segments = 5;
                        for (let s = 1; s <= segments; s++) {
                            const t = s / segments;
                            const x = p1.x + (p2.x - p1.x) * t;
                            const y = p1.y + (p2.y - p1.y) * t;
                            const offset = Math.sin(performance.now() * 0.01 + t * Math.PI * 4) * 3 * alpha;
                            const perpX = -(p2.y - p1.y) / dist * offset;
                            const perpY = (p2.x - p1.x) / dist * offset;
                            this.ctx.lineTo(x + perpX, y + perpY);
                        }
                        
                        const hue = (p1.hue + p2.hue) / 2 + energy * 60;
                        this.ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha * (0.2 + energy * 0.5)})`;
                        this.ctx.lineWidth = 1 + energy * 2;
                        this.ctx.stroke();
                        
                        // 能量节点
                        if (energy > 0.5) {
                            this.ctx.beginPath();
                            this.ctx.arc(midX, midY, 3 * energy, 0, Math.PI * 2);
                            this.ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${energy * 0.5})`;
                            this.ctx.fill();
                        }
                    }
                }
            }
            
            // 绘制粒子
            this.particles.forEach(p => {
                const pulse = Math.sin(p.pulsePhase) * 0.3 + 1;
                const size = Math.max(0.5, p.radius * pulse + p.energy * 3);
                
                // 外发光
                if (p.energy > 0.1) {
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
                    this.ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.energy * 0.2})`;
                    this.ctx.fill();
                }
                
                // 核心
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${0.5 + p.energy * 0.5})`;
                this.ctx.fill();
                
                // 高亮核心
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${0.8 + p.energy * 0.2})`;
                this.ctx.fill();
            });
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 17. 磁流体模拟 ==============
    ferrofluid: {
        canvas: null,
        ctx: null,
        points: [],
        mouse: { x: -1000, y: -1000, pressed: false },
        mode: 'attract', // 'attract' or 'repel'
        
        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none; z-index: 9993;
                opacity: 0;
                transition: opacity 0.5s;
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            
            // F 键切换
            window.addEventListener('keydown', (e) => {
                if (e.code === 'KeyF') {
                    this.toggle();
                }
            });
            
            // 鼠标交互
            window.addEventListener('mousedown', () => this.mouse.pressed = true);
            window.addEventListener('mouseup', () => this.mouse.pressed = false);
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            
            // 右键切换模式
            window.addEventListener('contextmenu', (e) => {
                if (this.canvas.style.opacity !== '0') {
                    e.preventDefault();
                    this.mode = this.mode === 'attract' ? 'repel' : 'attract';
                    this.showModeHint();
                }
            });
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        },
        
        toggle() {
            const isActive = this.canvas.style.opacity === '1';
            this.canvas.style.opacity = isActive ? '0' : '1';
            
            if (!isActive) {
                this.initPoints();
                this.showHint();
            }
        },
        
        showHint() {
            const hint = document.createElement('div');
            hint.innerHTML = '磁流体模拟已启动<br><small>移动鼠标操控流体 | 右键切换吸引/排斥 | 按 F 键关闭</small>';
            hint.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(50, 30, 60, 0.95));
                color: #c0c0ff;
                padding: 25px 40px;
                border-radius: 20px;
                font-size: 1.2rem;
                z-index: 100000;
                border: 2px solid rgba(150, 100, 255, 0.5);
                text-align: center;
                font-family: monospace;
                box-shadow: 0 0 40px rgba(100, 50, 200, 0.4);
            `;
            document.body.appendChild(hint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(hint, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
                gsap.to(hint, { scale: 1.1, opacity: 0, delay: 3, duration: 0.3, onComplete: () => hint.remove() });
            } else {
                setTimeout(() => hint.remove(), 3500);
            }
        },
        
        showModeHint() {
            const modeText = this.mode === 'attract' ? '吸引模式' : '排斥模式';
            const color = this.mode === 'attract' ? '#8080ff' : '#ff8080';
            
            const hint = document.createElement('div');
            hint.textContent = modeText;
            hint.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                color: ${color};
                font-size: 2rem;
                font-weight: bold;
                z-index: 100000;
                text-shadow: 0 0 20px ${color};
            `;
            document.body.appendChild(hint);
            setTimeout(() => hint.remove(), 800);
        },
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },
        
        initPoints() {
            this.points = [];
            const w = this.canvas.width;
            const h = this.canvas.height;
            const centerX = w / 2;
            const centerY = h / 2;
            
            // 创建一圈流体点
            const rings = 8;
            const pointsPerRing = 60;
            
            for (let r = 1; r <= rings; r++) {
                const radius = r * 25;
                for (let i = 0; i < pointsPerRing; i++) {
                    const angle = (i / pointsPerRing) * Math.PI * 2;
                    this.points.push({
                        baseX: centerX + Math.cos(angle) * radius,
                        baseY: centerY + Math.sin(angle) * radius,
                        x: centerX + Math.cos(angle) * radius,
                        y: centerY + Math.sin(angle) * radius,
                        vx: 0,
                        vy: 0,
                        radius: radius,
                        angle: angle,
                        ring: r
                    });
                }
            }
            
            // 添加中心点
            this.points.push({
                baseX: centerX,
                baseY: centerY,
                x: centerX,
                y: centerY,
                vx: 0,
                vy: 0,
                radius: 0,
                angle: 0,
                ring: 0
            });
        },
        
        animate() {
            if (!this.ctx || !this.canvas || this.canvas.style.opacity === '0') {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            // 清除
            this.ctx.fillStyle = 'rgba(18, 18, 18, 0.3)';
            this.ctx.fillRect(0, 0, w, h);
            
            // 更新点位置
            this.points.forEach(p => {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // 磁场影响
                if (dist < 200 && dist > 1) {
                    const force = (200 - dist) / 200;
                    const angle = Math.atan2(dy, dx);
                    const strength = force * 15;
                    
                    if (this.mode === 'attract') {
                        p.vx -= Math.cos(angle) * strength;
                        p.vy -= Math.sin(angle) * strength;
                    } else {
                        p.vx += Math.cos(angle) * strength;
                        p.vy += Math.sin(angle) * strength;
                    }
                }
                
                // 弹回原位
                p.vx += (p.baseX - p.x) * 0.03;
                p.vy += (p.baseY - p.y) * 0.03;
                
                // 阻尼
                p.vx *= 0.92;
                p.vy *= 0.92;
                
                // 更新位置
                p.x += p.vx;
                p.y += p.vy;
            });
            
            // 绘制磁场线
            this.ctx.strokeStyle = 'rgba(100, 80, 200, 0.1)';
            this.ctx.lineWidth = 1;
            
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2 + performance.now() * 0.0005;
                const radius = 250;
                
                this.ctx.beginPath();
                for (let r = 0; r < radius; r += 5) {
                    const x = this.mouse.x + Math.cos(angle) * r;
                    const y = this.mouse.y + Math.sin(angle) * r;
                    if (r === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.stroke();
            }
            
            // 绘制流体轮廓
            this.ctx.beginPath();
            
            // 按环分组绘制
            const rings = {};
            this.points.forEach(p => {
                if (!rings[p.ring]) rings[p.ring] = [];
                rings[p.ring].push(p);
            });
            
            Object.keys(rings).forEach(ringNum => {
                const ring = rings[ringNum];
                if (ring.length < 3) return;
                
                // 排序
                ring.sort((a, b) => a.angle - b.angle);
                
                this.ctx.beginPath();
                
                for (let i = 0; i < ring.length; i++) {
                    const p = ring[i];
                    const next = ring[(i + 1) % ring.length];
                    
                    if (i === 0) {
                        this.ctx.moveTo(p.x, p.y);
                    }
                    
                    // 贝塞尔曲线平滑
                    const cpX = (p.x + next.x) / 2;
                    const cpY = (p.y + next.y) / 2;
                    this.ctx.quadraticCurveTo(p.x, p.y, cpX, cpY);
                }
                
                this.ctx.closePath();
                
                // 金属渐变填充
                const gradient = this.ctx.createRadialGradient(
                    w / 2, h / 2, 0,
                    w / 2, h / 2, 300
                );
                gradient.addColorStop(0, 'rgba(80, 60, 150, 0.6)');
                gradient.addColorStop(0.5, 'rgba(60, 40, 120, 0.4)');
                gradient.addColorStop(1, 'rgba(40, 20, 80, 0.2)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
                
                // 边缘高光
                this.ctx.strokeStyle = `hsla(${260 + parseInt(ringNum) * 10}, 70%, 60%, 0.4)`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            });
            
            // 绘制点
            this.points.forEach(p => {
                const dist = Math.sqrt((p.x - this.mouse.x) ** 2 + (p.y - this.mouse.y) ** 2);
                const brightness = Math.max(0, 1 - dist / 200);
                
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 2 + brightness * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(260, 80%, ${50 + brightness * 30}%, ${0.3 + brightness * 0.5})`;
                this.ctx.fill();
            });
            
            // 鼠标处的高光
            const mouseGradient = this.ctx.createRadialGradient(
                this.mouse.x, this.mouse.y, 0,
                this.mouse.x, this.mouse.y, 100
            );
            
            if (this.mode === 'attract') {
                mouseGradient.addColorStop(0, 'rgba(100, 80, 255, 0.3)');
                mouseGradient.addColorStop(0.5, 'rgba(80, 60, 200, 0.1)');
            } else {
                mouseGradient.addColorStop(0, 'rgba(255, 80, 100, 0.3)');
                mouseGradient.addColorStop(0.5, 'rgba(200, 60, 80, 0.1)');
            }
            mouseGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = mouseGradient;
            this.ctx.fillRect(0, 0, w, h);
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 18. 虫洞传送门 ==============
    wormhole: {
        canvas: null,
        ctx: null,
        particles: [],
        rings: [],
        mouse: { x: -1000, y: -1000 },
        isActive: false,
        time: 0,
        
        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none; z-index: 9992;
                opacity: 0;
                transition: opacity 0.5s;
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            
            // W 键切换
            window.addEventListener('keydown', (e) => {
                if (e.code === 'KeyW') {
                    this.toggle();
                }
            });
            
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            
            // 点击吸入效果
            window.addEventListener('click', (e) => {
                if (this.isActive) {
                    this.suckIn(e.clientX, e.clientY);
                }
            });
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.initParticles();
            this.animate();
        },
        
        toggle() {
            this.isActive = !this.isActive;
            this.canvas.style.opacity = this.isActive ? '0.8' : '0';
            
            if (this.isActive) {
                this.showHint();
            }
        },
        
        showHint() {
            const hint = document.createElement('div');
            hint.innerHTML = '虫洞传送门已启动<br><small>移动鼠标控制虫洞位置 | 点击吸入周围粒子 | 按 W 键关闭</small>';
            hint.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(20, 0, 40, 0.95), rgba(40, 0, 60, 0.95));
                color: #ff80ff;
                padding: 25px 40px;
                border-radius: 20px;
                font-size: 1.2rem;
                z-index: 100000;
                border: 2px solid rgba(200, 100, 255, 0.5);
                text-align: center;
                font-family: monospace;
                box-shadow: 0 0 40px rgba(150, 50, 200, 0.4);
            `;
            document.body.appendChild(hint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(hint, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
                gsap.to(hint, { scale: 1.1, opacity: 0, delay: 3, duration: 0.3, onComplete: () => hint.remove() });
            } else {
                setTimeout(() => hint.remove(), 3500);
            }
        },
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },
        
        initParticles() {
            this.particles = [];
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            // 创建星尘粒子
            for (let i = 0; i < 300; i++) {
                this.particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 0.5,
                    hue: Math.random() * 60 + 200,
                    alpha: Math.random() * 0.5 + 0.3,
                    isSucked: false,
                    exitPoint: null
                });
            }
        },
        
        suckIn(x, y) {
            // 创建吸力波
            this.particles.forEach(p => {
                const dx = p.x - x;
                const dy = p.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 300) {
                    const force = (300 - dist) / 300 * 20;
                    const angle = Math.atan2(dy, dx);
                    p.vx -= Math.cos(angle) * force;
                    p.vy -= Math.sin(angle) * force;
                }
            });
        },
        
        animate() {
            if (!this.ctx || !this.canvas) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            this.time += 0.016;
            
            // 清除
            this.ctx.fillStyle = 'rgba(18, 18, 18, 0.2)';
            this.ctx.fillRect(0, 0, w, h);
            
            if (this.isActive) {
                // 绘制虫洞
                const hx = this.mouse.x;
                const hy = this.mouse.y;
                
                // 事件视界（黑洞核心）
                const blackHoleGradient = this.ctx.createRadialGradient(hx, hy, 0, hx, hy, 80);
                blackHoleGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
                blackHoleGradient.addColorStop(0.5, 'rgba(10, 0, 20, 0.9)');
                blackHoleGradient.addColorStop(0.8, 'rgba(30, 0, 50, 0.5)');
                blackHoleGradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = blackHoleGradient;
                this.ctx.fillRect(0, 0, w, h);
                
                // 吸积盘
                for (let i = 0; i < 5; i++) {
                    const ringRadius = 60 + i * 25;
                    const rotation = this.time * (2 - i * 0.3);
                    
                    this.ctx.save();
                    this.ctx.translate(hx, hy);
                    this.ctx.rotate(rotation);
                    
                    // 椭圆形吸积盘
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
                    
                    const hue = 280 + i * 20;
                    this.ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.6 - i * 0.1})`;
                    this.ctx.lineWidth = 4 - i * 0.5;
                    this.ctx.stroke();
                    
                    // 发光
                    this.ctx.shadowBlur = 20;
                    this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
                    this.ctx.stroke();
                    this.ctx.shadowBlur = 0;
                    
                    this.ctx.restore();
                }
                
                // 引力透镜效果 - 扭曲周围
                this.ctx.save();
                this.ctx.globalCompositeOperation = 'lighter';
                
                for (let a = 0; a < 8; a++) {
                    const angle = (a / 8) * Math.PI * 2 + this.time * 2;
                    const dist = 100 + Math.sin(this.time * 3 + a) * 20;
                    
                    const px = hx + Math.cos(angle) * dist;
                    const py = hy + Math.sin(angle) * dist;
                    
                    const lensGradient = this.ctx.createRadialGradient(px, py, 0, px, py, 15);
                    lensGradient.addColorStop(0, 'rgba(255, 200, 255, 0.5)');
                    lensGradient.addColorStop(0.5, 'rgba(200, 100, 255, 0.2)');
                    lensGradient.addColorStop(1, 'transparent');
                    
                    this.ctx.fillStyle = lensGradient;
                    this.ctx.fillRect(px - 20, py - 20, 40, 40);
                }
                
                this.ctx.restore();
                
                // 更新粒子 - 被虫洞吸引
                this.particles.forEach(p => {
                    if (p.isSucked) return;
                    
                    const dx = p.x - hx;
                    const dy = p.y - hy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 200 && dist > 1) {
                        // 引力
                        const force = (200 - dist) / 200 * 3;
                        const angle = Math.atan2(dy, dx);
                        p.vx -= Math.cos(angle) * force;
                        p.vy -= Math.sin(angle) * force;
                        
                        // 旋转
                        p.vx += Math.cos(angle + Math.PI / 2) * force * 0.5;
                        p.vy += Math.sin(angle + Math.PI / 2) * force * 0.5;
                    }
                    
                    // 被吸入虫洞
                    if (dist < 20) {
                        p.isSucked = true;
                        // 设置出口点（屏幕另一边）
                        p.exitPoint = {
                            x: Math.random() * w,
                            y: Math.random() * h
                        };
                        setTimeout(() => {
                            p.x = p.exitPoint.x;
                            p.y = p.exitPoint.y;
                            p.vx = (Math.random() - 0.5) * 5;
                            p.vy = (Math.random() - 0.5) * 5;
                            p.isSucked = false;
                            p.exitPoint = null;
                        }, 500);
                    }
                });
            }
            
            // 更新和绘制粒子
            this.particles.forEach(p => {
                if (p.isSucked) return;
                
                p.x += p.vx;
                p.y += p.vy;
                
                // 边界
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                
                // 阻尼
                p.vx *= 0.99;
                p.vy *= 0.99;
                
                const radius = Math.max(0.5, p.size);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.alpha})`;
                this.ctx.fill();
            });
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 19. 赛博朋克霓虹城市 ==============
    cyberpunkCity: {
        canvas: null,
        ctx: null,
        buildings: [],
        flyingVehicles: [],
        neonSigns: [],
        mouse: { x: -1000, y: -1000 },
        isActive: false,
        time: 0,
        
        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none; z-index: 0;
                opacity: 0;
                transition: opacity 0.5s;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);
            this.ctx = this.canvas.getContext('2d');
            
            // C 键切换
            window.addEventListener('keydown', (e) => {
                if (e.code === 'KeyC') {
                    this.toggle();
                }
            });
            
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        },
        
        toggle() {
            this.isActive = !this.isActive;
            this.canvas.style.opacity = this.isActive ? '0.6' : '0';
            
            if (this.isActive) {
                this.initCity();
                this.showHint();
            }
        },
        
        showHint() {
            const hint = document.createElement('div');
            hint.innerHTML = '赛博朋克城市已启动<br><small>移动鼠标照亮城市 | 按 C 键关闭</small>';
            hint.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(20, 0, 30, 0.95), rgba(50, 0, 50, 0.95));
                color: #ff00ff;
                padding: 25px 40px;
                border-radius: 20px;
                font-size: 1.2rem;
                z-index: 100000;
                border: 2px solid rgba(255, 0, 255, 0.5);
                text-align: center;
                font-family: monospace;
                box-shadow: 0 0 40px rgba(255, 0, 255, 0.4),
                            inset 0 0 20px rgba(255, 0, 255, 0.1);
                text-shadow: 0 0 10px #ff00ff;
            `;
            document.body.appendChild(hint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(hint, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
                gsap.to(hint, { scale: 1.1, opacity: 0, delay: 3, duration: 0.3, onComplete: () => hint.remove() });
            } else {
                setTimeout(() => hint.remove(), 3500);
            }
        },
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },
        
        initCity() {
            this.buildings = [];
            this.flyingVehicles = [];
            this.neonSigns = [];
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            // 创建建筑
            for (let i = 0; i < 30; i++) {
                const buildingWidth = 30 + Math.random() * 80;
                const buildingHeight = 100 + Math.random() * 400;
                
                this.buildings.push({
                    x: (i / 30) * w + Math.random() * 50 - 25,
                    width: buildingWidth,
                    height: buildingHeight,
                    windows: [],
                    hue: Math.random() > 0.5 ? 300 + Math.random() * 60 : 180 + Math.random() * 40
                });
                
                // 窗户
                const windowsPerFloor = Math.floor(buildingWidth / 15);
                const floors = Math.floor(buildingHeight / 20);
                
                for (let f = 0; f < floors; f++) {
                    for (let wn = 0; wn < windowsPerFloor; wn++) {
                        this.buildings[i].windows.push({
                            offsetX: wn * 15 + 5,
                            offsetY: f * 20 + 10,
                            lit: Math.random() > 0.3,
                            flickerPhase: Math.random() * Math.PI * 2,
                            flickerSpeed: 0.05 + Math.random() * 0.1
                        });
                    }
                }
            }
            
            // 飞行器
            for (let i = 0; i < 8; i++) {
                this.flyingVehicles.push({
                    x: Math.random() * w,
                    y: 50 + Math.random() * 200,
                    speed: 1 + Math.random() * 3,
                    size: 5 + Math.random() * 10,
                    hue: Math.random() > 0.5 ? 0 : 180,
                    trailLength: 20 + Math.random() * 30
                });
            }
            
            // 霓虹招牌
            const signs = ['CYBER', 'NEON', 'TECH', 'DATA', 'CODE', 'FUTURE'];
            for (let i = 0; i < 6; i++) {
                this.neonSigns.push({
                    text: signs[i],
                    x: Math.random() * w,
                    y: 100 + Math.random() * 300,
                    fontSize: 20 + Math.random() * 30,
                    hue: Math.random() * 360,
                    flickerPhase: Math.random() * Math.PI * 2
                });
            }
        },
        
        animate() {
            if (!this.ctx || !this.canvas) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            this.time += 0.016;
            
            // 清除 - 渐变夜空
            const skyGradient = this.ctx.createLinearGradient(0, 0, 0, h);
            skyGradient.addColorStop(0, 'rgba(10, 0, 20, 0.3)');
            skyGradient.addColorStop(0.5, 'rgba(20, 0, 30, 0.3)');
            skyGradient.addColorStop(1, 'rgba(30, 10, 40, 0.3)');
            
            this.ctx.fillStyle = skyGradient;
            this.ctx.fillRect(0, 0, w, h);
            
            if (!this.isActive) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            // 星星
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for (let i = 0; i < 50; i++) {
                const sx = (i * 137.5) % w;
                const sy = (i * 73.3) % (h * 0.4);
                const twinkle = Math.sin(this.time * 3 + i) * 0.5 + 0.5;
                this.ctx.globalAlpha = twinkle * 0.8;
                this.ctx.fillRect(sx, sy, 1, 1);
            }
            this.ctx.globalAlpha = 1;
            
            // 绘制建筑
            this.buildings.forEach((building, bi) => {
                const baseY = h - building.height;
                
                // 建筑主体
                this.ctx.fillStyle = 'rgba(20, 20, 30, 0.9)';
                this.ctx.fillRect(building.x, baseY, building.width, building.height);
                
                // 建筑边缘发光
                const edgeGlow = this.ctx.createLinearGradient(
                    building.x, 0, building.x + building.width, 0
                );
                edgeGlow.addColorStop(0, `hsla(${building.hue}, 100%, 50%, 0.3)`);
                edgeGlow.addColorStop(1, 'transparent');
                this.ctx.fillStyle = edgeGlow;
                this.ctx.fillRect(building.x, baseY, 3, building.height);
                
                // 窗户
                building.windows.forEach(win => {
                    win.flickerPhase += win.flickerSpeed;
                    
                    if (win.lit) {
                        const flicker = Math.sin(win.flickerPhase) * 0.3 + 0.7;
                        
                        // 窗户发光
                        this.ctx.fillStyle = `hsla(${building.hue}, 80%, 60%, ${flicker * 0.3})`;
                        this.ctx.fillRect(
                            building.x + win.offsetX - 2,
                            baseY + win.offsetY - 2,
                            10, 14
                        );
                        
                        // 窗户本体
                        this.ctx.fillStyle = `hsla(${building.hue}, 70%, 50%, ${flicker})`;
                        this.ctx.fillRect(
                            building.x + win.offsetX,
                            baseY + win.offsetY,
                            6, 10
                        );
                    } else {
                        this.ctx.fillStyle = 'rgba(30, 30, 40, 0.8)';
                        this.ctx.fillRect(
                            building.x + win.offsetX,
                            baseY + win.offsetY,
                            6, 10
                        );
                    }
                });
            });
            
            // 绘制飞行器
            this.flyingVehicles.forEach(v => {
                v.x += v.speed;
                if (v.x > w + 50) v.x = -50;
                
                // 拖尾
                const trailGradient = this.ctx.createLinearGradient(
                    v.x - v.trailLength, v.y,
                    v.x, v.y
                );
                trailGradient.addColorStop(0, 'transparent');
                trailGradient.addColorStop(1, `hsla(${v.hue}, 100%, 70%, 0.8)`);
                
                this.ctx.beginPath();
                this.ctx.moveTo(v.x - v.trailLength, v.y);
                this.ctx.lineTo(v.x, v.y);
                this.ctx.strokeStyle = trailGradient;
                this.ctx.lineWidth = v.size / 2;
                this.ctx.stroke();
                
                // 飞行器本体
                this.ctx.beginPath();
                this.ctx.arc(v.x, v.y, v.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${v.hue}, 100%, 70%, 0.9)`;
                this.ctx.fill();
                
                // 发光
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = `hsl(${v.hue}, 100%, 50%)`;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            });
            
            // 绘制霓虹招牌
            this.neonSigns.forEach(sign => {
                sign.flickerPhase += 0.05;
                const flicker = Math.sin(sign.flickerPhase) * 0.2 + 0.8;
                
                this.ctx.font = `bold ${sign.fontSize}px monospace`;
                this.ctx.textAlign = 'center';
                
                // 霓虹发光效果
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = `hsl(${sign.hue}, 100%, 50%)`;
                this.ctx.fillStyle = `hsla(${sign.hue}, 100%, 50%, ${flicker})`;
                this.ctx.fillText(sign.text, sign.x, sign.y);
                
                // 额外发光层
                this.ctx.shadowBlur = 40;
                this.ctx.fillStyle = `hsla(${sign.hue}, 100%, 70%, ${flicker * 0.5})`;
                this.ctx.fillText(sign.text, sign.x, sign.y);
                
                this.ctx.shadowBlur = 0;
            });
            
            // 鼠标聚光灯效果
            const spotlight = this.ctx.createRadialGradient(
                this.mouse.x, this.mouse.y, 0,
                this.mouse.x, this.mouse.y, 150
            );
            spotlight.addColorStop(0, 'rgba(255, 100, 255, 0.1)');
            spotlight.addColorStop(0.5, 'rgba(100, 50, 200, 0.05)');
            spotlight.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = spotlight;
            this.ctx.fillRect(0, 0, w, h);
            
            // 底部雾气
            const fogGradient = this.ctx.createLinearGradient(0, h - 100, 0, h);
            fogGradient.addColorStop(0, 'transparent');
            fogGradient.addColorStop(1, 'rgba(100, 50, 150, 0.3)');
            
            this.ctx.fillStyle = fogGradient;
            this.ctx.fillRect(0, h - 100, w, 100);
            
            requestAnimationFrame(() => this.animate());
        }
    },

    // ============== 初始化 ==============
    init() {
        const checkAndInit = () => {
            // 立即初始化不依赖 DOM 尺寸的效果
            this.rainbowTrail.init();
            this.konamiCode.init();
            
            // 核心效果初始化
            this.glitchEffect.init();     // 全息故障
            this.aprilFoolsEscape.init(); // 元素逃逸
            this.gravityFlip.init();      // 重力翻转
            this.laserConnect.init();     // 激光连线
            
            // 新增震撼效果（默认启用）
            this.quantumEntanglement.init(); // 量子纠缠网络
            this.ferrofluid.init();          // 磁流体模拟
            this.wormhole.init();            // 虫洞传送门
            // this.cyberpunkCity.init();       // 赛博朋克城市
            
            // 延迟初始化需要 DOM 尺寸的效果
            setTimeout(() => {
                this.gravityParticles.init();
                this.holographicHero.init();  // 全息投影Hero
                this.matrixGridDots.init();   // 矩阵网点背景
            }, 300);
            
            setTimeout(() => {
                this.physicsElements.init();
            }, 500);
            
            // 显示快捷键提示
            setTimeout(() => {
                this.showShortcutsHint();
            }, 2000);
        };
        
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            checkAndInit();
        } else {
            document.addEventListener('DOMContentLoaded', checkAndInit);
        }
    },
    
    showShortcutsHint() {
        const hint = document.createElement('div');
        hint.innerHTML = `
            <div style="font-size: 1.3rem; margin-bottom: 15px; color: #80ffff;">交互效果快捷键</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; text-align: left; font-size: 0.9rem;">
                <span><b style="color:#8080ff">F</b> - 磁流体模拟</span>
                <span><b style="color:#ff80ff">W</b> - 虫洞传送门</span>
                <!-- <span><b style="color:#ff00ff">C</b> - 赛博朋克城市</span> -->
                <span><b style="color:#00ffff">L</b> - 激光连线</span>
                <!-- <span><b style="color:#00ff88">↑↑↓↓BA</b> - 彩蛋</span> -->
                <span><b style="color:#ffff00">G</b> - 重力翻转</span>
            </div>
            <div style="margin-top: 12px; font-size: 0.8rem; opacity: 0.7;">点击页面触发脉冲 | 移动鼠标探索效果</div>
        `;
        hint.style.cssText = `
            position: fixed; bottom: 20px; left: 20px;
            background: linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(30, 20, 50, 0.95));
            color: #ccc;
            padding: 20px 25px;
            border-radius: 15px;
            z-index: 100000;
            border: 1px solid rgba(100, 100, 255, 0.3);
            font-family: monospace;
            box-shadow: 0 0 30px rgba(100, 50, 200, 0.3);
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(hint);
        
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(hint, { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 });
            gsap.to(hint, { opacity: 0, delay: 8, duration: 0.5, onComplete: () => hint.remove() });
        } else {
            setTimeout(() => {
                hint.style.transition = 'opacity 0.5s';
                hint.style.opacity = '0';
                setTimeout(() => hint.remove(), 500);
            }, 8000);
        }
    }
};

// 自动初始化
InteractiveEffects.init();

if (typeof window !== 'undefined') {
    window.InteractiveEffects = InteractiveEffects;
}