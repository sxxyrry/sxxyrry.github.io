function cbyy(adomID){ // 重播音乐
    var adom = document.getElementById(adomID)
    if (!adom){
        return
    }
    adom.currentTime = 0
    adom.play()
}

export function CreateMusic(audioDom, audioDomID, musicName){
    // 创建按钮
    var playbtn = document.createElement("button");
    playbtn.innerHTML = '播放 ' + musicName + ' 音乐';
    playbtn.onclick = function(){
        audioDom.play()
    }
    var pausebtn = document.createElement("button");
    pausebtn.innerHTML = '暂停 ' + musicName + ' 音乐';
    pausebtn.onclick = function(){
        audioDom.pause()
    }
    var cbyybtn = document.createElement("button");
    cbyybtn.innerHTML = '重播 ' + musicName + ' 音乐';
    cbyybtn.onclick = function(){
        cbyy(audioDomID)
    }
    audioDom.parentNode.appendChild(document.createElement("br"))
    audioDom.parentNode.appendChild(playbtn)
    audioDom.parentNode.appendChild(document.createElement("br"))
    audioDom.parentNode.appendChild(pausebtn)
    audioDom.parentNode.appendChild(document.createElement("br"))
    audioDom.parentNode.appendChild(cbyybtn)
    audioDom.parentNode.appendChild(document.createElement("br"))
    
    /**
     * <audio id="fhcqfchd" src="./凤凰传奇翻唱《海底》.mp3"></audio>
     * <button onclick="document.getElementById('fhcqfchd').play()">播放 凤凰传奇翻唱《海底》 音乐</button>
     * <button onclick="document.getElementById('fhcqfchd').pause()">暂停 凤凰传奇翻唱《海底》 音乐</button>
     * <button onclick="cbyy('fhcqfchd')">重播 凤凰传奇翻唱《海底》 音乐</button>
     */
}