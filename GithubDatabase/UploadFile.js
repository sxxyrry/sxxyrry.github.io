/**
 * 上传文件到 GitHub 仓库。
 *
 * @param {string} access_token GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} file_path 文件路径
 * @param {string} commit_message 提交消息
 * @param {string} path 文件保存路径
 * @returns {Promise<void>}
 */
async function UploadFile(access_token, owner, repo, file_path, commit_message, path) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
    const headers = {
        Authorization: `token ${access_token}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        // 读取文件内容
        const fileContent = await readFileAsText(file_path);

        // 将文件内容转换为 Base64 编码
        const encodedContent = stringToBase64(fileContent);

        // 上传文件到 GitHub
        await axios.put(apiUrl, {
            message: commit_message,
            content: encodedContent,
            encoding: 'base64'
        }, { headers });

        console.log(`File ${file_path} has been uploaded.`);
    } catch (error) {
        throw new Error(`Error uploading file ${file_path}: ${error.message}`);
    }
}

/**
 * 读取文件内容为文本
 * @param {string} file_path 文件路径
 * @returns {Promise<string>} 文件内容
 */
async function readFileAsText(file_path) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file_path);
    });
}

/**
 * 将字符串转换为 Base64 编码
 * @param {string} str 输入字符串
 * @returns {string} Base64 编码后的字符串
 */
function stringToBase64(str) {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(str);
    return btoa(String.fromCharCode.apply(null, uint8Array));
}

export default UploadFile;
