/**
 * 从 GitHub 仓库下载文件夹。
 *
 * @param {string} access_token GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} dir_path GitHub 上的文件路径
 * @param {string} zip_name ZIP 文件名
 * @returns {Promise<void>}
 */
async function DownloadDir(access_token, owner, repo, dir_path, zip_name) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dir_path}`;
    const headers = {
        Authorization: `token ${access_token}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        const response = await axios.get(apiUrl, { headers });
        const files = response.data;

        const zip = new JSZip();

        for (const file of files) {
            if (file.type === 'file') {
                const fileContentResponse = await axios.get(file.download_url);
                zip.file(file.path.replace(dir_path + '/', ''), fileContentResponse.data);
            } else if (file.type === 'dir') {
                // 递归下载子文件夹
                await downloadDirectoryRecursively(zip, access_token, owner, repo, file.path, file.path.replace(dir_path + '/', ''));
            }
        }

        // 生成 ZIP 文件
        const content = await zip.generateAsync({ type: 'blob' });

        // 创建一个下载链接并触发下载
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${zip_name}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        console.log('Directory downloaded successfully:', dir_path);
    } catch (error) {
        console.error('Error downloading directory:', error);
    }
}

/**
 * 递归下载子文件夹
 * @param {JSZip} zip JSZip 实例
 * @param {string} access_token GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} dir_path 文件夹路径
 * @param {string} relative_path 相对路径
 * @returns {Promise<void>}
 */
async function downloadDirectoryRecursively(zip, access_token, owner, repo, dir_path, relative_path) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dir_path}`;
    const headers = {
        Authorization: `token ${access_token}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        const response = await axios.get(apiUrl, { headers });
        const files = response.data;

        for (const file of files) {
            if (file.type === 'file') {
                const fileContentResponse = await axios.get(file.download_url);
                zip.file(`${relative_path}/${file.name}`, fileContentResponse.data);
            } else if (file.type === 'dir') {
                // 递归下载子文件夹
                await downloadDirectoryRecursively(zip, access_token, owner, repo, file.path, `${relative_path}/${file.name}`);
            }
        }
    } catch (error) {
        console.error('Error downloading directory recursively:', error);
    }
}

export default DownloadDir;
