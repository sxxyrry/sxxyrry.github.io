/**
 * 从 GitHub 仓库下载文件内容。
 *
 * @param {string} access_token GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} file_path GitHub 上的文件路径
 * @returns {Promise<ArrayBuffer>}
 */
async function DownloadFile(access_token, owner, repo, file_path) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file_path}`;
    const headers = {
        Authorization: `token ${access_token}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        const response = await axios.get(apiUrl, { headers });
        // 解码文件内容
        const decodedContent = Buffer.from(response.data.content, 'base64');
        return decodedContent;
    } catch (error) {
        throw new Error(`Error downloading file ${file_path}: ${error.message}`);
    }
}

export default DownloadFile;
