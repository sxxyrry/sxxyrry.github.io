// 等待DOM加载完成后添加页眉
document.addEventListener('DOMContentLoaded', function() {
    // 创建header元素
    const header = document.createElement('header');
    header.innerHTML = '<img style="display: inline; vertical-align: middle; /* 关键属性 */" src="../icon_2.svg" alt="JustHTML图标" width="128" height="128">&nbsp;&nbsp;<h1 style="display: inline; vertical-align: middle;">JustHTML 只需网页！ - 全能工具箱</h1><p>一个集合了多种实用工具的工具箱，基于HTML、CSS和JavaScript</p>';
    
    // 将header添加到body的最前
    document.body.insertBefore(header, document.body.firstChild);
});