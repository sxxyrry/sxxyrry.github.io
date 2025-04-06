import CreateFile from './CreateFile.js'

/**
 * 在 GitHub 仓库中创建目录。
 * 
 * @prompt 副作用：创建一个名为 “a” 的空文件作为目录的支持文件。
 * @param {string} access_token GitHub 个人访问令牌
 * @param {string} owner 仓库所有者
 * @param {string} repo 仓库名称
 * @param {string} dir_path 目录路径
 * @param {string} commit_message 提交消息
 * @returns {Promise<void>}
 */
async function CreateDir(access_token, owner, repo, dir_path, commit_message) {
    return await CreateFile(access_token, owner, repo, `${dir_path}/a`, commit_message, "")
}

export default CreateDir;
