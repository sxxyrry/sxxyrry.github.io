const pixelSizeInput = document.getElementById('pixelSizeInput');

document.getElementById('ChooseFile').addEventListener('click', function() {
    document.getElementById('imageInput').click();
});

document.getElementById('imageInput').addEventListener('change', async function(event) {
    if (pixelSizeInput.value.includes('.')){
        await asyncAlert('像素大小不能为小数');
        return;
    }
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // 转换为像素画
                
                pixelate(ctx, img.width, img.height, Number(pixelSizeInput.value)); // pixelSizeInput.value 是像素大小

                // 显示 Canvas 和下载按钮
                canvas.style.display = 'block';
                document.getElementById('downloadBtn').href = canvas.toDataURL('image/png');
                document.getElementById('downloadBtn').style.display = 'block';

            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

async function asyncAlert(message) {
    return new Promise((resolve) => {
        alert(message);
        resolve();
    });
}

function pixelate(ctx, width, height, pixelSize) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            for (let py = 0; py < pixelSize; py++) {
                for (let px = 0; px < pixelSize; px++) {
                    if (y + py < height && x + px < width) {
                        const pi = ((y + py) * width + (x + px)) * 4;
                        data[pi] = r;
                        data[pi + 1] = g;
                        data[pi + 2] = b;
                        data[pi + 3] = a;
                    }
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}