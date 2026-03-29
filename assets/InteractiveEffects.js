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

    // ============== 元素弹性碰撞 ==============
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

    // ============== Konami Code 彩蛋 ==============
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

    // ============== 重力感应粒子 ==============
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

    // ============== 全息故障效果 ==============
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

    // ============== 重力翻转 ==============
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

    // ============== 量子纠缠网络 ==============
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
            this.konamiCode.init();
            
            // 核心效果初始化
            this.glitchEffect.init();     // 全息故障
            this.gravityFlip.init();      // 重力翻转
            
            // 新增震撼效果（默认启用）
            this.quantumEntanglement.init(); // 量子纠缠网络
            
            // 延迟初始化需要 DOM 尺寸的效果
            setTimeout(() => {
                this.gravityParticles.init();
                if (!isMobileDevice()) {
                    this.holographicHero.init();  // 全息投影Hero
                }
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
                <!-- <span><b style="color:#ff80ff">W</b> - 虫洞传送门</span> -->
                <!-- <span><b style="color:#ff00ff">C</b> - 赛博朋克城市</span> -->
                <!-- <span><b style="color:#00ffff">L</b> - 激光连线</span> -->
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

// setTimeout(() => {

// }, 200)


// 自动初始化
InteractiveEffects.init();

if (typeof window !== 'undefined') {
    window.InteractiveEffects = InteractiveEffects;
}