import CreateFile from "../../GithubAboutFile/CreateFile.js";
import CreateDir from "../../GithubAboutFile/CreateDir.js";
import DirExists from "../../GithubAboutFile/DirExists.js";
import ListDir from "../../GithubAboutFile/ListDir.js";
import Encrypt_Decrypt from "../../Encrypt_Decrypt/Encrypt_Decrypt.js";


const token = Encrypt_Decrypt.decrypt("1419404_1420545_1429673_1410276_1397725_1364636_1390879_1393161_1426250_1385174_1379469_\
1377187_1418263_1358931_1431955_1396584_1400007_1404571_1413699_\
1356649_1366918_1389738_1439942_1390879_1423968_1361213_1417122_1377187_1387456_\
1365777_1397725_1376046_1381751_1441083_1358931_1389738_1358931_1403430_1415981_1438801_", "sxxyrry-23XR");

const ipt1 = document.getElementById("ipt1");
const btn1 = document.getElementById("btn1");
const ipt2 = document.getElementById("ipt2");
const btn2 = document.getElementById("btn2");
const ipt3 = document.getElementById("ipt3");
const btn3 = document.getElementById("btn3");

const etr = document.getElementById("etr");

const FileRes = document.getElementById("FileRes");

const PUC = document.getElementById("PUC");
const copyPUC = document.getElementById("copyPUC");

const filelist = {};

const keyslist = [];

function isNumeric(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const num = parseFloat(value);
    return !Number.isNaN(num) && num.toString() === value;
}

function len(value) {
    if (Array.isArray(value)) {
        return value.length;
    } else if (value !== null && typeof value === 'object' && typeof value.size === 'number') {
        // 处理 Set、Map 等可遍历对象
        return value.size;
    } else if (value !== null && typeof value === 'object') {
        // 处理普通对象
        return Object.keys(value).length;
    } else {
        throw new TypeError('Unsupported type');
    }
}

function MaxNumbericStringArrString(arr) {
    // 将字符串数组转换为数字数组
    const numbers = arr.map(Number);

    // 使用 Math.max() 和扩展运算符 ... 找到最大值
    const maxNumber = Math.max(...numbers);

    return String(maxNumber);
}

// // 示例
// console.log(isNumeric("123")); // true
// console.log(isNumeric("123.45")); // true
// console.log(isNumeric("abc")); // false
// console.log(isNumeric("123abc")); // false
// console.log(isNumeric("")); // false

btn1.addEventListener("click", () => {
    // 让 ipt1 选择 文件
    ipt1.click();
    ipt1.onchange = () => {
        const file = ipt1.files[0];
        if (file) {
            readFiles([file]);
        }
    };
});

btn2.addEventListener("click", () => {
    // 让 ipt2 选择 多个 文件
    ipt2.click();
    ipt2.onchange = () => {
        const files = ipt2.files;
        if (files.length > 0) {
            readFiles(files);
        }
    };
});

btn3.addEventListener("click", () => {
    // 让 ipt3 选择 文件夹
    ipt3.click();
    ipt3.onchange = () => {
        const files = ipt3.files;
        if (files.length > 0) {
            readFiles(files);
        }
    };
});

function readFiles(files) {
    // 将 FileList 对象转换为数组
    const filesArray = Array.from(files);
    let filesRead = 0;
    const totalFiles = filesArray.length;


    
    filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
            if (file.webkitRelativePath) {
                filelist[file.webkitRelativePath] = reader.result;
            } else {
                filelist[file.name] = reader.result;
            }
            filesRead++;
            if (filesRead === totalFiles) {
                _Change();
            }
        };
        // 传递文件对象作为参数
        reader.readAsText(file);
    });
};

function _Change() {
    FileRes.innerHTML = "";
    for (const key in filelist) {
        const pDom = document.createElement("p");
        pDom.innerHTML = `${key}`;
        FileRes.appendChild(pDom);
    }
}

/**
 * 生成取件码
 * @returns {Promise<number>}
 */
async function GeneratePickUpCode(){
    const list = ListDir(token, "sxxyrry", "FileSharer", "/FileSharer");
    let MN;
    await list.then(res => {
        for (const key in res) {
            if (res[key] === "a") {
                continue;
            }
            else if (isNumeric(res[key])){
                keyslist.push(res[key]);
            };
        };
        if (keyslist.length === 0) {
            MN = -1;
        }
        else {
            MN = Number(MaxNumbericStringArrString(keyslist));
        }
        
        MN++

        PUC.innerText = `${MN}`;

    });
    return MN;
};

copyPUC.addEventListener("click", (e) => {
    navigator.clipboard.writeText(PUC.innerText);
});

etr.addEventListener("click", (e) => {
    // console.log(filelist);
    if (len(filelist) === 0) {
        alert("请选择文件");
        return;
    }
    let PUCode;
    GeneratePickUpCode().then(res => {
        PUCode = res
        // console.log(PUCode);
        // CreateDir(token, "sxxyrry", "FileSharer", `FileSharer/${PUCode}`, `Create ${PUCode}`);
        for (const key in filelist) {
            CreateFile(token, "sxxyrry", "FileSharer", `FileSharer/${PUCode}/${key}`, `Upload ${PUCode}`, filelist[key]);
        }
    });
});
