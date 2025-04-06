/**
 * 查询 GitHub 仓库中是否存在指定文件。
 *
 * @param {string} access_token GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} file_path 文件路径
 * @returns {boolean} 文件是否存在 (true/false)
 */
async function FileExists(access_token, owner, repo, file_path) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file_path}`;
    const headers = {
        Authorization: `token ${access_token}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        // 尝试获取文件内容
        await axios.get(apiUrl, { headers });
        return true;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false;
        } else {
            throw error;
        }
    }
}

export default FileExists;
