const CANVAS1 = document.getElementById('dandy-1');
const CANVAS2 = document.getElementById('dandy-2');
const CANVAS3 = document.getElementById('dandy-3');
const CTX1 = CANVAS1.getContext('2d');
const CTX2 = CANVAS2.getContext('2d');
const CTX3 = CANVAS3.getContext('2d');
const NUM_COLORS = 3;

let WIDTH, HEIGHT, MAX_SIDE, NUM_DANDELIONS = 32;
let colors, maxSize, thatx, thaty, startTime, frames = [];
CTX1.globalCompositeOperation = 'multiply';
CTX2.globalCompositeOperation = 'multiply';
CTX3.globalCompositeOperation = 'multiply';

let timeout, that = null, initial = true;
let dandelions = [];
let count = 0, refreshTime = (new Date()).getTime();
let storage = window.localStorage.getItem('x');
if (storage) {
    storage = JSON.parse(storage);
    count = storage['count'];
    refreshTime = storage['refreshTime'];
}

function clearView() {
    if (count > 0 || NUM_DANDELIONS <= -7) {
        return;
    }
    clearTimeout(timeout);
    let button = document.getElementsByClassName('dandelions')[0];
    let panel = document.getElementsByClassName('main-panel')[0];
    button.style['background-color'] = 'rgba(255, 255, 255, 0.9)';
    let shadow = window.getComputedStyle(panel).getPropertyValue('box-shadow');
    let transition = window.getComputedStyle(panel).getPropertyValue('transition');
    button.style['box-shadow'] = shadow;
    button.style['transition'] = transition;
    button.style.background = 'rgba(255, 255, 255, 0.3)';
    panel.style.visibility = 'hidden';
    timeout = setTimeout(function () {
        if (NUM_DANDELIONS <= 3) {
            return;
        }
        panel.style.visibility = 'visible';
        button.style['box-shadow'] = '';
    button.style.background = 'rgba(255, 255, 255, 0.9)';
    }, 5000);
}

function init() {
    function revert() {
        if (frames.length > 0) {
            let frame = frames.pop();
            frame.ctx.putImageData(frame.img, 0, 0);
            setTimeout(function () {
                revert();
            }, 5);
        } else {
            init();
        }
    }
    if (count > 0) {
        return;
    }
    if (frames.length > 0) {
        clearView();
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
    maxSize = Math.min(WIDTH, HEIGHT) / 6;
    clearAll();
    if (NUM_DANDELIONS <= -7) {
        window.localStorage.setItem('x', JSON.stringify({
            'count': 10,
            'refreshTime': (new Date()).getTime()
        }));
        return;
    }
    startTime = new Date();
    if (initial) {
        initial = false;
        growDandelions();
        shuffle(dandelions);
    }

    clearAll();
    draw();
}

function growDandelions() {
    colors = generateRandomColors(NUM_COLORS);
    if (that == null) {
        freshDandelion('#fa4437');
        that = dandelions[0];
    } else {
        freshDandelion(that.color, that.path);
    }
    thatx = random(maxSize / 2, WIDTH - maxSize / 2);
    thaty = random(maxSize / 2, HEIGHT - maxSize / 2);
    dandelions[0].x = thatx;
    dandelions[0].y = thaty;
    while (dandelions.length < NUM_DANDELIONS) {
        freshDandelion();
    }
    NUM_DANDELIONS--;
}

function freshDandelion(color = null, path = []) {
    let size = null;
    if (color == null) {
        color = colors[random(0, NUM_COLORS - 1)];
        //color = hexToRgb(color);
        //color = 'rgba(' + color.join(',') + ',0.8)';
    } else {
        size = Math.min(WIDTH, HEIGHT);
        size = random(size / 20, size / 16);
    }
    x = random(0, WIDTH);
    y = random(0, HEIGHT);
    if (thatx != null && thaty != null) {
        while (Math.abs(x - thatx) < maxSize && Math.abs(y - thaty) < maxSize) {
            x = random(0, WIDTH);
            y = random(0, HEIGHT);
        }
    }
    let width = maxSize * 3, height = HEIGHT * 2;
    dandelion = {
        path: path,
        color: color,
        blurFactor: [1, 1, 1, 2, 2, 3, 3, 3][random(0, 7)],
        x: x,
        y: y,
        width: width,
        height: height,
        cache: document.createElement('canvas'),
        ctx: null
    }
    if (NUM_DANDELIONS == 1) {
        dandelion.blurFactor = 2;
    } else if (NUM_DANDELIONS <= 0 && NUM_DANDELIONS >= -3) {
        dandelion.blurFactor = 1;
    } else if (NUM_DANDELIONS == -4) {
        dandelion.blurFactor = 2;
    } else if (NUM_DANDELIONS == -5) {
        dandelion.blurFactor = 3;
    }
    let context = dandelion.cache.getContext('2d');
    if (size == null) {
        size = Math.min(WIDTH, HEIGHT);
        size = random(size / 24, size / 6);
    }
    dandelion.ctx = dandelion.blurFactor == 1 ?
        CTX3 : dandelion.blurFactor == 2 ? CTX2 : CTX1;
    dandelion.cache.width = width;
    dandelion.cache.height = height;

    if (dandelion.path.length == 0) {
        for (i = 0; i < 224; i++) {
            let r = size * Math.PI * Math.random(),
                h = Math.random() + Math.random(),
                d = h > 1 ? size - h : h,
                s = d * Math.cos(r),
                m = d * Math.sin(r);
            dandelion.path.push([s, m]);
        }
    }
    drawDandy(dandelion, context, maxSize * 1.5, maxSize * 1.5);
    dandelions.push(dandelion);
}

function drawDandy(d, context, x, y) {
    context.strokeStyle = d.color;
    context.shadowBlur = 2;
    context.shadowColor = d.color;
    context.beginPath();
    for (i = 0; i < d.path.length; i++) {
        context.lineTo(x + d.path[i][0], y + d.path[i][1]);
    }
    context.moveTo(x, y);
    context.lineTo(x, HEIGHT * 2);
    context.stroke();
    context.closePath();
}

function draw() {
    let time = new Date();

    let ms = time.getTime() - startTime.getTime();
    let y = HEIGHT - ms / 10 * (HEIGHT / 100) + 250;
    let maxSize = Math.min(WIDTH, HEIGHT) / 6;
    let offx = -(maxSize * 1.5);
    let offy = -(maxSize * 1.5);
    let i = 0;
    if (dandelions.length > 0) {
        let d = dandelions.shift();
        setTimeout(function () {
            d.ctx.drawImage(d.cache, d.x + offx, d.y + offy);
            let frame = {
                ctx: d.ctx,
                img: d.ctx.getImageData(0, 0, MAX_SIDE, MAX_SIDE)
            };
            frames.push(frame);
        }, NUM_DANDELIONS > 0 ? 20 : 200);
        setTimeout(draw, NUM_DANDELIONS > 0 ? 20 : 200);
        return;
    }
    growDandelions();
    shuffle(dandelions);
}

function clearAll() {
    CTX1.clearRect(0, 0, MAX_SIDE, MAX_SIDE);
    CTX2.clearRect(0, 0, MAX_SIDE, MAX_SIDE);
    CTX3.clearRect(0, 0, MAX_SIDE, MAX_SIDE);
}

if (count > 0) {
    window.localStorage.setItem('x', JSON.stringify({
        'count': --count,
        'refreshTime': refreshTime
    }));
}
if (count < 1 || Math.abs(refreshTime -
    (new Date()).getTime()) >= 900000) {
    window.localStorage.removeItem('x');
}

init();

