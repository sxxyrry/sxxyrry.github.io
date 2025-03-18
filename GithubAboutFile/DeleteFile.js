/**
 * 在 GitHub 仓库中删除文件。
 *
 * @param {string} access_token GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} file_path 文件路径
 * @param {string} commit_message 提交消息
 * @returns {Promise<void>}
 */
async function DeleteFile(access_token, owner, repo, file_path, commit_message) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(file_path)}`;
    const headers = {
        Authorization: `token ${access_token}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        // 获取文件的当前内容和 SHA
        const response = await axios.get(apiUrl, { headers });
        const sha = response.data.sha;

        // 删除文件
        const deleteResponse = await axios.delete(apiUrl, {
            headers,
            data: {
                message: commit_message,
                sha: sha
            }
        });

        console.log('File deleted successfully:', deleteResponse.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log('File does not exist:', error.response.data);
        } else {
            console.error('Error deleting file:', error);
        }
    }
}

export default DeleteFile;
