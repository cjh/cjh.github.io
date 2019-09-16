const CANVAS1 = document.getElementById('dandy-1');
const CANVAS2 = document.getElementById('dandy-2');
const CANVAS3 = document.getElementById('dandy-3');
const CTX1 = CANVAS1.getContext('2d');
const CTX2 = CANVAS2.getContext('2d');
const CTX3 = CANVAS3.getContext('2d');
const NUM_COLORS = 5;
const NUM_DANDELIONS = 32;

let WIDTH, HEIGHT, MAX_SIDE;
let colors, maxSize, pilotx, piloty, startTime, maxDelay = 0, frames = [];
CTX1.globalCompositeOperation = 'multiply';
CTX2.globalCompositeOperation = 'multiply';
CTX3.globalCompositeOperation = 'multiply';

function init() {
    function revert() {
        if (frames.length > 0) {
            let frame = frames.pop();
            frame.ctx.putImageData(frame.img, 0, 0);
            setTimeout(function () {
                revert();
            }, 10);
        } else {
            init();
        }
    }
    if (frames.length > 0) {
        revert();
        return;
    }
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    MAX_SIDE = Math.max(WIDTH, HEIGHT);
    CANVAS1.width = MAX_SIDE;
    CANVAS1.height = MAX_SIDE;
    CANVAS2.width = MAX_SIDE;
    CANVAS2.height = MAX_SIDE;
    CANVAS3.width = MAX_SIDE;
    CANVAS3.height = MAX_SIDE;
    maxDelay = 0;
    maxSize = Math.min(WIDTH, HEIGHT) / 6;
    colors = generateRandomColors(NUM_COLORS);
    clearAll();
    dandelions = [];
    freshDandelion('#fa4437', 1300);
    pilotx = random(maxSize / 2, WIDTH - maxSize / 2);
    piloty = random(maxSize / 2, HEIGHT - maxSize / 2);
    dandelions[0].x = pilotx;
    dandelions[0].y = piloty;

    while (dandelions.length < NUM_DANDELIONS) {
        freshDandelion();
    }

    shuffle(dandelions);

    startTime = new Date();
    requestAnimationFrame(draw);
}

function drawDandy(d, context, x, y) {
    //context.filter = 'blur(' + d.blurFactor.toString() + 'px)';
    let rgb = hexToRgb(d.color)
    rgb.push(1);
    rgb = 'rgba(' + rgb.join(',') + ')';
    console.log(rgb);
    context.strokeStyle = rgb;
    context.shadowBlur = 2;
    context.shadowColor = d.color;
    context.beginPath();
    for (i = 0; i < d.path.length; i++) {
        context.lineTo(x + d.path[i][0], y + d.path[i][1]);
    }
    context.moveTo(x, y);
    context.lineTo(x, MAX_SIDE);
    context.stroke();
    context.closePath();
}

let dandelions = [];

function freshDandelion(color = null, delay = null) {
    if (color == null) {
        color = colors[random(0, NUM_COLORS - 1)];
    }
    if (delay == null) {
        delay = random(200, 2400);
    }
    x = random(0, WIDTH);
    y = random(0, HEIGHT);
    if (pilotx != null && piloty != null) {
        while (Math.abs(x - pilotx) < maxSize && Math.abs(y - piloty) < maxSize) {
            x = random(0, WIDTH);
            y = random(0, HEIGHT);
        }
    }

    let width = maxSize * 3, height = HEIGHT * 2;
    dandelion = {
        path: [],
        color: color,
        blurFactor: [1, 1, 1, 2, 2, 3, 3, 3][random(0, 7)],
        x: x,
        y: y,
        width: width,
        height: height,
        cache: document.createElement('canvas'),
        delay: delay,
        ctx: null
    }
    maxDelay = Math.max(maxDelay, dandelion.delay);
    let context = dandelion.cache.getContext('2d');
    let size = Math.min(WIDTH, HEIGHT);
    dandelion.ctx = dandelion.blurFactor == 1 ?
        CTX3 : dandelion.blurFactor == 2 ? CTX2 : CTX1;
    size = random(size / 24, size / 6);
    dandelion.cache.width = width;
    dandelion.cache.height = height;
    for (i = 0; i < 200; i++) {
        let r = size * Math.PI * Math.random(),
            h = Math.random() + Math.random(),
            d = h > 1 ? size - h : h,
            s = d * Math.cos(r),
            m = d * Math.sin(r);
        dandelion.path.push([s, m]);
    }
    drawDandy(dandelion, context, maxSize * 1.5, maxSize * 1.5);
    dandelions.push(dandelion);
}

function draw() {
    clearAll();
    let time = new Date();

    let ms = time.getTime() - startTime.getTime();
    let y = HEIGHT - ms / 10 * (HEIGHT / 100) + 250;
    let maxSize = Math.min(WIDTH, HEIGHT) / 6;
    let offx = -(maxSize * 1.5);
    let offy = -(maxSize * 1.5);
    for (var i = 0; i < dandelions.length; i++) {
        let d = dandelions[i];
        setTimeout(function () {
            d.ctx.drawImage(d.cache, d.x + offx, d.y + offy);
            let frame = {
                ctx: d.ctx,
                img: d.ctx.getImageData(0, 0, MAX_SIDE, MAX_SIDE)
            };
            frames.push(frame);
        }, (i * i) / 4 * 10);
    }
}

function clearAll() {
    CTX1.clearRect(0, 0, MAX_SIDE, MAX_SIDE);
    CTX2.clearRect(0, 0, MAX_SIDE, MAX_SIDE);
    CTX3.clearRect(0, 0, MAX_SIDE, MAX_SIDE);
}

init();
