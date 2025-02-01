const cvs = document.getElementById("CodeRain");

const width = window.innerWidth * devicePixelRatio / 2,
  height = window.innerHeight * devicePixelRatio / 2;

cvs.width = width;
cvs.height = height;
cvs.style.backgroundColor = "#000";

const ctx = cvs.getContext("2d");
const fontSize = 20 * devicePixelRatio;
const columnWidth = fontSize;
const columnNum = Math.floor(width / columnWidth);
// 下标
const nextChars = new Array(columnNum).fill(0);

const Running = { value : false };

function draw() {
  if (!Running.value) return;
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < columnNum; i++) {
    const char = GetRandomChar();
    const color = GetRandomColor();
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px "Roboto Mono"`;
    const x = i * columnWidth;
    const index = nextChars[i];
    const y = (index + 1) * fontSize;

    ctx.fillText(char, x, y);
    if (y > height && Math.random() > 0.975) {
      nextChars[i] = 0;
    } else {
      nextChars[i] = index + 1;
    }
  }
  setTimeout(draw, 40);
}

function stop(){
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, width, height);
  nextChars.fill(0);
}

function GetRandomColor(){
  return (
    "#" +
    (((1 << 24) * Math.random()) | 0)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  );
};

function GetRandomChar(){
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz,./;'[]\\=-|}{\":?><=-+_)(*&^%$#@!`~";
  return chars.charAt(Math.floor(Math.random() * chars.length));
};

draw()

// setInterval(draw, 40);

export default {
  Running,
  draw,
  stop
};