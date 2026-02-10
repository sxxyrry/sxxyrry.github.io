/**
 * 深层拷贝一个 Object 的函数
 * @param {object} obj - 要拷贝的 Object 对象
 * @returns {object} 返回一个新的 Object 对象，与原对象深拷贝
 */
function deepcopy(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepcopy(item));
  }
  
  if (typeof obj === "object") {
    const copiedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        copiedObj[key] = deepcopy(obj[key]);
      }
    }
    return copiedObj;
  }
}

/**
 * 动态加载（强制去除缓存） JS 的函数
 * @param {string} src - 要加载的 JS 的 src 链接
 * @returns {Promise} 返回一个 Promise 对象，用于处理异步加载
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src + '?v=' + new Date().getTime(); // 使用时间戳避免缓存
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * URL安全的Base64编码器
 * 将输入字符串转换为URL安全的Base64编码格式
 * @param {string} input - 要编码的字符串
 * @returns {string} URL安全的Base64编码字符串
 */
function urlSafeBase64Encode(input) {
    // 首先使用标准btoa进行Base64编码
    const base64 = btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
    
    // 替换不安全的字符为URL安全的字符
    return base64
        .replace(/\+/g, '-')  // 将 '+' 替换为 '-'
        .replace(/\//g, '_')  // 将 '/' 替换为 '_'
        .replace(/=/g, '');   // 移除填充字符 '='
}

/**
 * URL安全的Base64解码器
 * 将URL安全的Base64编码字符串解码回原始字符串
 * @param {string} input - URL安全的Base64编码字符串
 * @returns {string} 解码后的原始字符串
 */
function urlSafeBase64Decode(input) {
    // 先将URL安全的字符转换回标准Base64字符
    let base64 = input
        .replace(/-/g, '+')  // 将 '-' 替换为 '+'
        .replace(/_/g, '/'); // 将 '_' 替换为 '/'
    
    // 根据需要添加填充字符
    const padding = base64.length % 4;
    if (padding !== 0) {
        base64 += '='.repeat(4 - padding);
    }
    
    // 使用atob解码
    return decodeURIComponent(Array.prototype.map.call(atob(base64), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

window.addEventListener('click', (e) => {
  e.preventDefault()

  if (e.target.nodeName === 'A') {
    if (e.target.href.startsWith(window.location.origin)) {
      const relativePath = './' + e.target.href.substring(window.location.origin.length + '/'.length);

      // console.log(relativePath)

      if (window.Tools) {
        if (window.Tools.includes(relativePath)) {
          window.open(e.target.href, '_self');
          return
        }
      }
      if (relativePath.includes('/index.html') || relativePath.includes('/Special/') || relativePath.includes('#')) {
        window.open(e.target.href, '_self');
        return
      }
      const url = e.target.href
      if (url.endsWith('.md') || url.endsWith('.Md') || url.endsWith('.mD') || url.endsWith('.MD')) {
        fetch(url)
          .then(response => response.text())
          .then(text => {
            const encodedURL = urlSafeBase64Encode(text)
            const url_ = `${window.location.origin}/showMD.html?content=${encodedURL}`
            window.open(url_)
          })
      } else if (url.endsWith('/package/Marked/LICENSE') || url.endsWith('/package/GSAP/LICENSE')) {
        fetch(url)
          .then(response => response.text())
          .then(text => {
            const encodedURL = urlSafeBase64Encode(text)
            const url_ = `${window.location.origin}/showMD.html?content=${encodedURL}`
            window.open(url_)
          })
      } else {
        fetch(url)
          .then(response => response.text())
          .then(text => {
            const encodedURL = urlSafeBase64Encode(text)
            const url_ = `${window.location.origin}/showFile.html?content=${encodedURL}`
            window.open(url_)
          })
      }
    } else if (e.target.href.endsWith('.md') || e.target.href.endsWith('.Md') || e.target.href.endsWith('.mD') || e.target.href.endsWith('.MD')) {
        fetch(url)
          .then(response => response.text())
          .then(text => {
            const encodedURL = urlSafeBase64Encode(text)
            const url_ = `${window.location.origin}/showMD.html?content=${encodedURL}`
            window.open(url_)
          })
    } else {
      window.open(e.target.href);
    }
  }
})