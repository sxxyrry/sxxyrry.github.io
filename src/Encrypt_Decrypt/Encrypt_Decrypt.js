class NotSpecifiedFormatString extends Error {
    constructor(message) {
        super(message);
        this.name = "NotSpecifiedFormatString";
    }
}

function sumForText(string) {
    let sum = 0;
    for (let s of string) {
        sum += s.charCodeAt(0);
    }
    return sum;
}

/**
 * 自己的加密算法加密
 * 
 * @param {string} text 原文本
 * @param {string} key 加密密钥
 * @returns {string} 加密后的文本
 */
function encrypt(text, key) {
    let text_ = '';
    const keySum = sumForText(key);

    for (let s of text) {
        text_ += ((s.charCodeAt(0) + keySum) * keySum) + '_';
    }

    return text_;
}

/**
 * 自己的加密算法解密
 * 
 * @param {string} text 加密后的文本
 * @param {string} key 加密密钥
 * @returns {string} 解密后的文本
 */
function decrypt(text, key) {
    let text_ = '';
    const keySum = sumForText(key);
    const parts = text.split('_');

    for (let i of parts) {
        if (i.length > 0) {
            if (!/^\d+$/.test(i)) {
                throw new NotSpecifiedFormatString(`Not Specified Format String (${text})`);
            }
            text_ += String.fromCharCode(parseInt(i) / keySum - keySum);
        }
    }

    return text_;
}

// 示例用法
// const text = 'SXXYRRY-是星星与然然呀-23XR-星然';
// console.log(`原文本：${text}`);
// const key = 'sxxyrry-23XR';
// console.log(`秘钥：${key}`);
// const en_text = encrypt(text, key);
// console.log(`加密后的文本：${en_text}`);
// const de_text = decrypt(en_text, key);
// console.log(`解密后的文本：${de_text}`);
// const eq_1 = text === de_text;
// const eq_2 = eq_1 ? '是' : '否';
// console.log(`原文本与解密后的文本是否相等：${eq_1} （${eq_2}）`);

export default { encrypt, decrypt };
