/**
 * 查询 GitHub 仓库中是否存在指定文件夹。
 *
 * @param {string} access_token GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} file_path 文件路径
 * @returns {Promise<boolean>} 文件是否存在 (true/false)
 */
async function DirExists(access_token, owner, repo, file_path) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file_path}`;
    const headers = {
        Authorization: `token ${access_token}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        // 获取文件内容
        const response = await axios.get(apiUrl, { headers });

        // 如果返回结果是目录，则返回 true
        return Array.isArray(response.data) || response.data.type === 'dir';
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false;
        } else {
            throw error;
        }
    }
}

export default DirExists;
