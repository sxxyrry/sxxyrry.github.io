import ListDir from "../../GithubAboutFile/ListDir.js";
import Encrypt_Decrypt from "../../Encrypt_Decrypt/Encrypt_Decrypt.js";
import DownloadDir from "../../GithubAboutFile/DownloadDir.js";

const token = Encrypt_Decrypt.decrypt("1419404_1420545_1429673_1410276_1397725_1364636_1390879_1393161_1426250_1385174_1379469_\
1377187_1418263_1358931_1431955_1396584_1400007_1404571_1413699_\
1356649_1366918_1389738_1439942_1390879_1423968_1361213_1417122_1377187_1387456_\
1365777_1397725_1376046_1381751_1441083_1358931_1389738_1358931_1403430_1415981_1438801_", "sxxyrry-23XR");

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
