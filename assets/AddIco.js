//   <!-- 主图标：使用动态SVG（用于网站内显示） -->
//   <link rel="icon" type="image/svg+xml" href="./icon_2.svg">
  
//   <!-- 备用图标：静态ICO（用于浏览器标签页） -->
//   <link rel="icon" type="image/x-icon" href="./icon_2_.ico"></link>
// 等待DOM加载完成后添加页眉
document.addEventListener('DOMContentLoaded', function() {
    // 创建favicon链接元素
    const link1 = document.createElement('link');
    link1.rel = "icon";
    link1.type = "image/svg+xml";
    link1.href = "/JustHTML/icon_2.svg";

    const link2 = document.createElement('link');
    link2.rel = "icon";
    link2.type = "image/x-icon";
    link2.href = "/JustHTML/icon_2.ico";
    
    // 将favicon链接添加到<head>中
    document.head.appendChild(link1);
    document.head.appendChild(link2);
});