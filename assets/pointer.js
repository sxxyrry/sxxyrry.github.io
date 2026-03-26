/**
 * Magnetic Pointer - 磁吸光标效果
 * 使用GSAP动画实现平滑的光标跟随和磁吸效果
 */

const MagneticPointer = {
    container: null,
    currentTarget: null,
    isInitialized: false,
    config: {
        defaultSize: 40, // 默认光标大小 (px)
        targetPadding: 20, // 目标元素周围的padding
        magneticStrength: 0.1, // 磁吸强度 (0-1)
        transitionDuration: 0.2, // 过渡动画时长
        cornerSize: 10, // 角落元素大小
        borderWidth: 3, // 边框宽度
        borderColor: "#0010f7", // 边框颜色
        // 目标元素选择器：自动识别按钮、链接、卡片等交互元素
        targetSelector: "._target, a, button, .btn, .project-card, .team-card, .showcase-card, .link-btn, .badge, .tips, .info-banner, input[type='submit'], input[type='button'], [role='button']"
    },

    /**
     * 初始化磁吸光标
     * @param {Object} options - 配置选项
     */
    init(options = {}) {
        if (this.isInitialized) return;
        
        // 合并配置
        Object.assign(this.config, options);
        
        // 注入样式
        this.injectStyles();
        
        // 创建光标DOM
        this.createPointer();
        
        // 绑定事件
        this.bindEvents();
        
        this.isInitialized = true;
    },

    /**
     * 注入必要的CSS样式
     */
    injectStyles() {
        if (document.getElementById("magnetic-pointer-styles")) return;
        
        const styles = document.createElement("style");
        styles.id = "magnetic-pointer-styles";
        styles.textContent = `
            .magnetic-pointer {
                position: fixed;
                top: 0;
                left: 0;
                width: ${this.config.defaultSize}px;
                height: ${this.config.defaultSize}px;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
            }
            
            .magnetic-pointer-corner {
                position: absolute;
                width: ${this.config.cornerSize}px;
                height: ${this.config.cornerSize}px;
                border-width: ${this.config.borderWidth}px;
                border-color: ${this.config.borderColor};
            }
            
            .magnetic-pointer-corner.top-left {
                top: 0;
                left: 0;
                border-top-style: solid;
                border-left-style: solid;
            }
            
            .magnetic-pointer-corner.top-right {
                top: 0;
                right: 0;
                border-top-style: solid;
                border-right-style: solid;
            }
            
            .magnetic-pointer-corner.bottom-left {
                bottom: 0;
                left: 0;
                border-bottom-style: solid;
                border-left-style: solid;
            }
            
            .magnetic-pointer-corner.bottom-right {
                bottom: 0;
                right: 0;
                border-bottom-style: solid;
                border-right-style: solid;
            }
        `;
        document.head.appendChild(styles);
    },

    /**
     * 创建光标DOM结构
     */
    createPointer() {
        this.container = document.createElement("div");
        this.container.className = "magnetic-pointer";
        
        const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];
        corners.forEach(corner => {
            const div = document.createElement("div");
            div.className = `magnetic-pointer-corner ${corner}`;
            this.container.appendChild(div);
        });
        
        document.body.appendChild(this.container);
    },

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 鼠标移动事件
        window.addEventListener("mousemove", this.handleMouseMove.bind(this));
        
        // 绑定目标元素事件
        this.bindTargetEvents();
    },

    /**
     * 鼠标移动处理
     * @param {MouseEvent} e - 鼠标事件
     */
    handleMouseMove(e) {
        let x = e.clientX;
        let y = e.clientY;
        
        // 磁吸效果
        if (this.currentTarget) {
            const rect = this.currentTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // 计算磁吸位置
            x = centerX + (x - centerX) * this.config.magneticStrength;
            y = centerY + (y - centerY) * this.config.magneticStrength;
        }
        
        // 使用GSAP移动光标
        gsap.to(this.container, {
            x: x,
            y: y,
            duration: this.config.transitionDuration,
            ease: "power2.out"
        });
    },

    /**
     * 绑定目标元素的事件
     */
    bindTargetElements() {
        const targets = document.querySelectorAll(this.config.targetSelector);
        targets.forEach(target => {
            this.addTarget(target);
        });
    },

    /**
     * 绑定目标元素事件（使用事件委托）
     */
    bindTargetEvents() {
        // 使用事件委托处理动态添加的元素
        document.addEventListener("mouseenter", (e) => {
            const target = e.target.closest(this.config.targetSelector);
            if (target) {
                this.handleTargetEnter(target);
            }
        }, true);
        
        document.addEventListener("mouseleave", (e) => {
            const target = e.target.closest(this.config.targetSelector);
            if (target && this.currentTarget === target) {
                this.handleTargetLeave();
            }
        }, true);
    },

    /**
     * 添加单个目标元素
     * @param {HTMLElement} element - 目标元素
     */
    addTarget(element) {
        element.addEventListener("mouseenter", () => this.handleTargetEnter(element));
        element.addEventListener("mouseleave", () => this.handleTargetLeave());
    },

    /**
     * 处理进入目标元素
     * @param {HTMLElement} target - 目标元素
     */
    handleTargetEnter(target) {
        this.currentTarget = target;
        const rect = target.getBoundingClientRect();
        
        // 计算扩展后的尺寸（与源代码保持一致的算法）
        const padding = window.innerWidth / 50;
        const width = rect.width + padding;
        const height = rect.height + padding;
        
        // 使用GSAP动画扩展光标
        gsap.to(this.container, {
            width: width,
            height: height,
            duration: this.config.transitionDuration,
            ease: "power2.out"
        });
    },

    /**
     * 处理离开目标元素
     */
    handleTargetLeave() {
        this.currentTarget = null;
        
        // 使用GSAP动画恢复光标大小
        gsap.to(this.container, {
            width: this.config.defaultSize,
            height: this.config.defaultSize,
            duration: this.config.transitionDuration,
            ease: "power2.out"
        });
    },

    /**
     * 设置光标颜色
     * @param {string} color - 颜色值
     */
    setColor(color) {
        this.config.borderColor = color;
        const corners = this.container.querySelectorAll(".magnetic-pointer-corner");
        corners.forEach(corner => {
            corner.style.borderColor = color;
        });
    },

    /**
     * 设置磁吸强度
     * @param {number} strength - 强度值 (0-1)
     */
    setMagneticStrength(strength) {
        this.config.magneticStrength = Math.max(0, Math.min(1, strength));
    },

    /**
     * 销毁光标
     */
    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        
        const styles = document.getElementById("magnetic-pointer-styles");
        if (styles) {
            styles.remove();
        }
        
        this.isInitialized = false;
        this.currentTarget = null;
    }
};

// 自动初始化
MagneticPointer.init();

// 导出模块
if (typeof module !== "undefined" && module.exports) {
    module.exports = MagneticPointer;
} else if (typeof window !== "undefined") {
    window.MagneticPointer = MagneticPointer;
}