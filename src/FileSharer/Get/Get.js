import ListDir from "../../GithubDatabase/ListDir.js";
import Encrypt_Decrypt from "../../Encrypt_Decrypt/Encrypt_Decrypt.js";
import DownloadDir from "../../GithubDatabase/DownloadDir.js";

const token = ""

const ipt = document.getElementById("ipt");
const ipt_form = document.getElementById("ipt_form");

ipt_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const numvalue = Number(ipt.value);

    // 获取目录列表
    try {
        const dirList = await ListDir(token, "sxxyrry", "FileSharer", `FileSharer`);
        let PUClist = [];
        for (const key in dirList) {
            if (dirList[key] === "a") {
                continue;
            } else {
                PUClist.push(Number(key));
            }
        }

        if (PUClist.includes(numvalue)) {
            // 下载文件夹
            DownloadDir(token, "sxxyrry", "FileSharer", `FileSharer/${numvalue}`, `${numvalue}`);
        } else {
            alert("取件码不存在");
        }
    } catch (error) {
        console.error("Error listing directory:", error);
        alert("无法获取目录列表");
    }
});
