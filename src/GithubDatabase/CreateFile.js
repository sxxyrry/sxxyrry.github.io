/**
 * 在 GitHub 仓库中创建文件。
 *
 * @param {string} accessToken GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} filePath 文件路径
 * @param {string} commitMessage 提交消息
 * @param {string} content 文件内容
 * @returns {Promise<void>}
 */
async function CreateFile(accessToken, owner, repo, filePath, commitMessage, content) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const headers = {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json'
    };

    // 将文件内容转换为 UTF-8 格式的 Uint8Array
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(content);

    // 将 Uint8Array 转换为 Base64 编码
    const encodedContent = btoa(String.fromCharCode.apply(null, uint8Array));

    try {
        // 获取最新提交的 SHA 值
        const commitsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, { headers });
        const latestCommitSha = commitsResponse.data[0].sha;

        // 尝试获取文件的当前 SHA（如果文件存在）
        let sha = null;
        try {
            const fileResponse = await axios.get(apiUrl, { headers, params: { ref: latestCommitSha } });
            sha = fileResponse.data.sha;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                throw error; // 如果不是 404 错误，抛出异常
            }
        }

        // 创建或更新文件
        const response = await axios.put(apiUrl, {
            message: commitMessage,
            content: encodedContent,
            sha: sha,
            encoding: 'base64'
        }, { headers });

        console.log('File created/updated successfully:', response.data);
    } catch (error) {
        console.error('Error creating/updating file:', error);
    }
}

export default CreateFile;