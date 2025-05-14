async function getRepoFiles(owner, repo, token, path = '') {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await fetch(
    url,
    {
      headers: {
        'Authorization': `token ${token}`,
      }
    },
  );
  const data = await response.json();
  
  const files = data.map(item => item.name);
  return files;
}

function UploadTextToFile(owner, repo, path, content, token, message = 'Upload Text') {
  // const owner = '你的GitHub用户名';
  // const repo = '你的仓库名';
  // const path = `WMB/${name}-${i}.txt`; // 留言板文件
  // const content = '你要上传的文字内容';
  // const token = '你的GitHub Personal Access Token';

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const data = {
    message: message, // 提交信息
    content: btoa(content), // 将内容转换为Base64编码
    branch: 'main' // 目标分支
  };

  fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    return data;
  })
  .catch(error => {
    return error;
  });
}
