const CANVAS1 = document.getElementById('dandy-1');
const CANVAS2 = document.getElementById('dandy-2');
const CANVAS3 = document.getElementById('dandy-3');
const CTX1 = CANVAS1.getContext('2d');
const CTX2 = CANVAS2.getContext('2d');
const CTX3 = CANVAS3.getContext('2d');
const button = document.getElementsByClassName('dandelions')[0];
const panel = document.getElementsByClassName('main-panel')[0];
const items = document.getElementsByClassName('item');
const NUM_COLORS = 3;

const clearAll = () => [CTX1, CTX2, CTX3]
    .forEach(ctx => ctx.clearRect(0, 0, MAX_SIDE, MAX_SIDE));

let WIDTH, HEIGHT, MAX_SIDE;
let colors, bgcolors, maxSize, thatx, thaty, interval, timeout;
let NUM_DANDELIONS = 32;
let dandelions = [];
let frames = [];
let that = null;
let initial = true;
let busy = false;

[CTX1, CTX2, CTX3].forEach(x => x.globalCompositeOperation = 'multiply');
window.addEventListener('click', e => clickAway(e));
window.addEventListener('touchstart', e => clickAway(e));

function clickAway(e) {
    if (!button.contains(e.target))
        showPanel();
}

function showPanelIn(ms) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        if (panel.matches(':hover')) return;
        showPanel();
    }, ms);

}

function showPanel() {
    panel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    panel.style.visibility = 'visible';
    panel.style.boxShadow = '';
    button.style['box-shadow'] = '';
    button.style.background = '';
    for (let i = 0; i < items.length; i++) {
        if (items[i].classList.contains('dandelions')) {
            continue;
        }
        items[i].style.color = '';
        items[i].style.pointerEvents = '';
    }
}

function hidePanel() {
    button.style.background = 'rgba(255, 255, 255, 0.3)';
    button.style.boxShadow = '0 3px 6px rgba(0, 0, 0, .16), 0 3px 6px rgba(0, 0, 0, .23)';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    panel.style.boxShadow = 'none';
    for (let i = 0; i < items.length; i++) {
        if (items[i].classList.contains('dandelions')) {
            continue;
        }
        items[i].style.color = 'transparent';
        items[i].style.pointerEvents = 'none';
    }
    showPanelIn(8000);
}

function init(quickly = false) {
    if (busy) return;
    busy = true;
    const revert = () => {
        if (frames.length > 0) {
            let frame = frames.pop();
            frame.ctx.putImageData(frame.img, 0, 0);
            setTimeout(() => revert(), 5);
        } else {
            busy = false;
            init();
        }
    }
    if (frames.length > 0) {
        hidePanel();
        revert();
        return;
    }
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    MAX_SIDE = Math.max(WIDTH, HEIGHT);
    [CANVAS1, CANVAS2, CANVAS3].forEach(canvas => {
        canvas.width = MAX_SIDE;
        canvas.height = MAX_SIDE;
    });
    maxSize = Math.min(WIDTH, HEIGHT) / 6;
    clearAll();
    if (NUM_DANDELIONS <= 11) return;
    if (initial) {
        initial = false;
        growDandelions();
        shuffle(dandelions);
    }
    clearAll();
    clearInterval(interval);
    let backdrop = bgcolors.slice();
    let i = 0;
    interval = setInterval(() => {
        let body = document.getElementsByTagName('body')[0];
        body.style.background = backdrop[i++ % NUM_COLORS];
    }, 3000);
    draw(quickly);
}

function growDandelions() {
    colors = generateRandomColors(NUM_COLORS);
    bgcolors = lightenHexes(colors, 97);
    if (that == null) {
        freshDandelion('#fa4437');
        that = dandelions[0];
    } else freshDandelion(that.color, that.path);
    thatx = random(maxSize / 2, WIDTH - maxSize / 2);
    thaty = random(maxSize / 2, HEIGHT - maxSize / 2);
    dandelions[0].x = thatx;
    dandelions[0].y = thaty;
    while (dandelions.length < NUM_DANDELIONS) freshDandelion();
    NUM_DANDELIONS--;
    busy = false;
}

function freshDandelion(color = null, path = []) {
    let size = null;
    if (color == null) color = colors[random(0, NUM_COLORS - 1)]
    else {
        size = Math.min(WIDTH, HEIGHT);
        size = random(size / 20, size / 16);
    }
    x = random(0, WIDTH), y = random(0, HEIGHT);
    if (thatx != null && thaty != null) {
        while (Math.abs(x - thatx) < maxSize &&
            Math.abs(y - thaty) < maxSize) {
            x = random(0, WIDTH), y = random(0, HEIGHT);
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
    if (NUM_DANDELIONS <= 1) dandelion.blurFactor = 1;
    if (size == null) {
        size = Math.min(WIDTH, HEIGHT);
        size = random(size / 24, size / 6);
    }
    dandelion.ctx = dandelion.blurFactor == 1 ?
        CTX3 : dandelion.blurFactor == 2 ? CTX2 : CTX1;
    dandelion.cache.width = width;
    dandelion.cache.height = height;

    if (dandelion.path.length == 0) {
        for (let i = 0; i < 224; i++) {
            let r = size * Math.PI * Math.random(),
                h = Math.random() + Math.random(),
                d = h > 1 ? size - h : h,
                s = d * Math.cos(r),
                m = d * Math.sin(r);
            dandelion.path.push([s, m]);
        }
    }
    drawDandy(dandelion, dandelion.cache.getContext('2d'),
        maxSize * 1.5, maxSize * 1.5);
    dandelions.push(dandelion);
}

function drawDandy(d, context, x, y) {
    context.strokeStyle = d.color;
    context.shadowBlur = 2;
    context.shadowColor = d.color;
    context.beginPath();
    for (i = 0; i < d.path.length; i++)
        context.lineTo(x + d.path[i][0], y + d.path[i][1]);
    context.moveTo(x, y);
    context.lineTo(x, HEIGHT * 2);
    context.stroke();
    context.closePath();
}

function draw(quickly = false) {
    let maxSize = Math.min(WIDTH, HEIGHT) / 6;
    let offx = -(maxSize * 1.5);
    let offy = -(maxSize * 1.5);
    const render = d => {
        d.ctx.drawImage(d.cache, d.x + offx, d.y + offy);
        let frame = {
            ctx: d.ctx,
            img: d.ctx.getImageData(0, 0, MAX_SIDE, MAX_SIDE)
        };
        frames.push(frame);
    };
    while (dandelions.length > 0 && quickly)
        render(dandelions.shift());
    if (dandelions.length > 0) {
        setTimeout(() => render(dandelions.shift()),
            NUM_DANDELIONS > 0 ? 20 : 200);
        setTimeout(draw, NUM_DANDELIONS > 0 ? 20 : 200);
    }
    if (dandelions.length == 0) {
        growDandelions();
        shuffle(dandelions);
    }
}

init(true);

