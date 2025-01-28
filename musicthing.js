function replay(adomID) { // 重播音乐
    var adom = document.getElementById(adomID);
    if (!adom) {
        return;
    }
    adom.currentTime = 0;
    adom.play();
}

/**
 * 创建音乐控制按钮
 * @param {document} audioDom 
 * @param {string} audioDomID 
 * @param {string} musicName 
 */
export function CreateMusicControlBtn(audioDom, audioDomID, musicName) {
    // 创建一个容器来放置按钮
    var buttonContainer = document.createElement("div");
    buttonContainer.className = `music-controls ${audioDomID}`; // 添加类名
    // 使用模板字符串创建按钮
    const createButton = (label, className, action) => {
        var btn = document.createElement("button");
        btn.innerHTML = label;
        btn.className = `music-control-btn ${className} ${audioDomID}`; // 添加类名
        btn.addEventListener('click', action);
        // btn.style.background = '#00aaff';
        return btn;
    };
    const createpPDom = () => {
        var pPDom = document.createElement("p");
        pPDom.innerHTML = '&nbsp';
        pPDom.style.display = 'inline-block';
        pPDom.style.margin = '0';
        buttonContainer.appendChild(pPDom);
    };
    // 创建播放按钮
    var playbtn = createButton(`播放 ${musicName} 音乐`, 'play-btn', () => audioDom.play());
    // 创建暂停按钮
    var pausebtn = createButton(`暂停 ${musicName} 音乐`, 'pause-btn', () => audioDom.pause());
    // 创建重播按钮
    var replaybtn = createButton(`重播 ${musicName} 音乐`, 'replay-btn', () => replay(audioDomID));
    // 将按钮添加到容器
    buttonContainer.appendChild(playbtn);
    createpPDom()
    buttonContainer.appendChild(pausebtn);
    createpPDom()
    buttonContainer.appendChild(replaybtn);
    var pDom = document.createElement("p")
    buttonContainer.appendChild(pDom);
    // 将容器添加到父节点，并在audioDom之后一个元素
    audioDom.parentNode.insertBefore(buttonContainer, audioDom.nextSibling);
}