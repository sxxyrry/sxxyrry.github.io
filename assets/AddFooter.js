// 23XRStudio 网站页脚组件

class StudioFooter {
    constructor() {
        this.init();
    }
    
    init() {
        // 等待DOM加载完成后添加页脚
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createFooter());
        } else {
            this.createFooter();
        }
    }
    
    createFooter() {
        // 创建footer元素
        const footer = document.createElement('footer');
        
        // Footer内容
        footer.innerHTML = `
            <div class="footer-content">
                <div class="footer-section">
                    <h3>23XRStudio</h3>
                    <p>23XR 工作室，致力于更好的应用。</p>
                    <p class="copyright">23XRStudio &copy; 2026 - ${new Date().getFullYear()} 保留所有权利</p>
                </div>
                
                <div class="footer-section">
                    <h3>快速导航</h3>
                    <ul class="quick-links">
                        <li><a href="#home" class="footer-nav-link">首页</a></li>
                        <li><a href="#about" class="footer-nav-link">关于我们</a></li>
                        <li><a href="#projects" class="footer-nav-link">项目展示</a></li>
                        <li><a href="#team" class="footer-nav-link">团队成员</a></li>
                        <li><a href="#contact" class="footer-nav-link">联系我们</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3>友情链接</h3>
                    <ul class="friend-links">
                    <li>
                        <a href="https://xnors.github.io" target="_blank" rel="noopener noreferrer">
                        XnorsStudio 异或工作室
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/denjehdhuendx/ITLToolkitnext" target="_blank" rel="noopener noreferrer">
                        ITLToolkit IT 课工具箱
                        </a>
                    </li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3>关注我们</h3>
                    <div class="social-links">
                        <a href="https://github.com/sxxyrry" target="_blank" rel="noopener noreferrer" class="social-link">
                            <span class="social-icon">
                            🐱
                            </span>
                            <span>
                            GitHub
                            </span>
                        </a>
                        <a href="https://space.bilibili.com/1532090388" target="_blank" rel="noopener noreferrer" class="social-link">
                            <span class="social-icon">
                            📺
                            </span>
                            <span>
                            BiliBili
                            </span>
                        </a>
                        <a href="https://x.com/sxxyrry" target="_blank" rel="noopener noreferrer" class="social-link">
                            <span class="social-icon">
                            💬
                            </span>
                            <span>
                            X ( Twitter )
                            </span>
                        </a>
                        <a href="https://www.youtube.com/@sxxyrry" target="_blank" rel="noopener noreferrer" class="social-link">
                            <span class="social-icon">
                            🎞️
                            </span>
                            <span>
                            YouTube
                            </span>
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>构建于现代Web技术 | 支持所有主流浏览器</p>
                <p>Designed with <i class="fas fa-heart" style="color: #ff6b4a;"></i> by 23XRStudio Team</p>
            </div>
        `;
        
        // 将footer添加到body的最后
        document.body.appendChild(footer);
        
        // 添加页脚链接事件监听器
        this.addFooterEventListeners();
    }
    
    addFooterEventListeners() {
        // 页脚导航链接点击事件
        const footerLinks = document.querySelectorAll('.footer-nav-link');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
        
        // 回到顶部按钮（如果有）
        const backToTopBtn = document.querySelector('.back-to-top');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: { y: 0 },
                        ease: "power2.inOut"
                    });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    }
    
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            // 使用GSAP实现平滑滚动
            if (typeof gsap !== 'undefined') {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: `#${sectionId}`, offsetY: 70 },
                    ease: "power2.inOut"
                });
            } else {
                // 备用方案：使用原生滚动
                const yOffset = -70;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    }
}

// 自动初始化
let studioFooter;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        studioFooter = new StudioFooter();
    });
} else {
    studioFooter = new StudioFooter();
}

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudioFooter;
}