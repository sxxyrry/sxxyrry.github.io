/**
 * 从 GitHub 仓库获取指定文件夹中的文件及文件夹的名称列表。
 *
 * @param {string} access_token GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} dirpath GitHub 上的文件夹路径
 * @returns {Promise<string[]>} 文件及文件夹的名称列表
 */
async function ListDir(access_token, owner, repo, dirpath) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dirpath}`;
    const headers = {
        Authorization: `token ${access_token}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        // 获取文件内容
        const response = await axios.get(apiUrl, { headers });

        // 提取文件及文件夹的名称列表
        return response.data.map(item => item.name);
    } catch (error) {
        throw new Error(`Error listing directory ${dirpath}: ${error.message}`);
    }
}

export default ListDir;
