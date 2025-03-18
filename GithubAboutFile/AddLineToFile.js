/**
 * 在 GitHub 仓库中修改文件，以加入一行新内容。
 * 
 * @param {string} accessToken GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} filePath 文件路径
 * @param {string} commitMessage 提交消息
 * @param {string} content 新的一行的内容
 * @returns {Promise<void>}
 */
async function AddLineToFile(accessToken, owner, repo, filePath, commitMessage, content) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const headers = {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        // 获取文件的当前内容和 SHA
        const response = await axios.get(apiUrl, { headers });
        const sha = response.data.sha;
        const oldContent = atob(response.data.content);

        // 将新内容添加到旧内容中
        const newContent = `${oldContent}\n${content}`;

        // 将合并后的内容编码为 Base64
        const encodedContent = btoa(newContent);

        // 更新文件
        const updateResponse = await axios.put(apiUrl, {
            message: commitMessage,
            content: encodedContent,
            sha: sha,
            encoding: 'base64'
        }, { headers });

        console.log('Line added successfully:', updateResponse.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // 文件不存在，创建新文件
            const encodedContent = btoa(content);
            const createResponse = await axios.put(apiUrl, {
                message: commitMessage,
                content: encodedContent,
                encoding: 'base64'
            }, { headers });
            console.log('File created successfully:', createResponse.data);
        } else {
            console.error('Error adding line to file:', error);
        }
    }
}

export default AddLineToFile;
