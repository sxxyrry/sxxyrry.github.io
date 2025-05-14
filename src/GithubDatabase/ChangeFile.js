/**
 * 在 GitHub 仓库中修改文件。
 * 
 * @param {string} accessToken GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} filePath 文件路径
 * @param {string} commitMessage 提交消息
 * @param {string} content 文件内容
 * @returns {Promise<void>}
 */
async function ChangeFile(accessToken, owner, repo, filePath, commitMessage, content) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const headers = {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        // 获取文件的当前内容和 SHA
        const response = await axios.get(apiUrl, { headers });
        const sha = response.data.sha;

        // 将内容转换为 Base64
        const encodedContent = stringToBase64(content);

        // 更新文件
        const updateResponse = await axios.put(apiUrl, {
            message: commitMessage,
            content: encodedContent,
            sha: sha,
            encoding: 'base64'
        }, { headers });

        console.log('File updated successfully:', updateResponse.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // 文件不存在，创建新文件
            const encodedContent = stringToBase64(content);
            const createResponse = await axios.put(apiUrl, {
                message: commitMessage,
                content: encodedContent,
                encoding: 'base64'
            }, { headers });
            console.log('File created successfully:', createResponse.data);
        } else {
            console.error('Error updating file:', error);
        }
    }
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

export default ChangeFile;