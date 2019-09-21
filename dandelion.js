const CANVAS1 = document.getElementById('dandy-1');
const CANVAS2 = document.getElementById('dandy-2');
const CTX1 = CANVAS1.getContext('2d');
const CTX2 = CANVAS2.getContext('2d');
const button = document.getElementsByClassName('dandelions')[0];
const panel = document.getElementsByClassName('main-panel')[0];
const items = document.getElementsByClassName('item');

const NUM_COLORS = 3;
let NUM_DANDELIONS = 32;
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
let MAX_SIDE = Math.max(WIDTH, HEIGHT);
let dandelions = [];
let frames = [];
let that = null;
let initial = true;
let busy = false;
let colors, maxSize, thatx, thaty, timeout;

[CANVAS1, CANVAS2].forEach(canvas => {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
});

window.addEventListener('click', e => clickAway(e));
window.addEventListener('touchend', e => clickAway(e));

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
        if (items[i].classList.contains('dandelions'))
            continue;
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
        if (items[i].classList.contains('dandelions'))
            continue;
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
            setTimeout(() => revert(), 10);
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
    [CANVAS1, CANVAS2].forEach(canvas => {
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
    });
    [CTX1, CTX2].forEach(ctx => frames.push({
            ctx: ctx,
            img: ctx.getImageData(0, 0, MAX_SIDE, MAX_SIDE)
        }));
    maxSize = Math.min(WIDTH, HEIGHT) / 6;
    [CTX1, CTX2].forEach(ctx => ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight));
    if (NUM_DANDELIONS <= -11) return;
    if (initial) {
        initial = false;
        growDandelions();
    }

    dandelions.sort((a, b) => a.size - b.size);
    draw(quickly);
}

function draw(quickly = false) {
    const render = d => {
        drawDandy(d, d.ctx, d.x, d.y);
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
            NUM_DANDELIONS > 0 ? 25: 200);
        setTimeout(draw, NUM_DANDELIONS > 0 ? 25 : 200);
    }
    if (dandelions.length == 0) {
        growDandelions();
    }
}

function growDandelions() {
    colors = genColors(NUM_COLORS);
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
    let blurFactor = null;
    let basis = Math.max(WIDTH, HEIGHT) / 2;
    if (color == null) color = colors[random(0, NUM_COLORS - 1)]
    else {
        size = random(basis / 12, basis / 11);
        blurFactor = 1;
    }
    let x = random(0, WIDTH);
    let y = random(0, HEIGHT);
    if (thatx != null && thaty != null) {
        while (Math.abs(x - thatx) < maxSize &&
            Math.abs(y - thaty) < maxSize) {
            x = random(0, WIDTH), y = random(0, HEIGHT);
        }
    }
    let width = maxSize * 3;
    let height = HEIGHT * 2;
    dandelion = {
        path: path,
        color: color,
        blurFactor: blurFactor,
        x: x,
        y: y,
        ctx: null,
        size: size
    }
    if (size == null)
        size = random(basis / 20, basis / 6);
    dandelion.size = size;
    if (blurFactor == null)
        dandelion.blurFactor = size > (basis / 9) ? 1 : 2;

    if (NUM_DANDELIONS <= 1) dandelion.blurFactor = 1;
    dandelion.ctx = dandelion.blurFactor == 1 ?
        CTX2 : CTX1;

    dandelions.push(dandelion);
}

function drawDandy(d, context, x, y) {
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.shadowColor = d.color;
    context.beginPath();
    let rx;
    let ry;
    let stemcount = random(64, 96);
    for (let i = 0; i < stemcount; i++) {
        let angle = Math.random() * Math.PI * 2;
        let rr = Math.random();
        rx = x + Math.cos(angle) * d.size * rr;
        ry = y + Math.sin(angle) * d.size * rr;
        context.lineTo(rx, ry);
        context.moveTo(x, y);
    }
    context.strokeStyle = d.color;
    context.shadowBlur = 2;
    context.lineWidth = d.blurFactor / 6;
    context.stroke();
    context.moveTo(rx, ry);

    for (let i = 0; i < 256 - stemcount; i++) {
        let angle = Math.random() * Math.PI * 2;
        let px = rx;
        let py = ry;
        rx = x + Math.cos(angle) * d.size;
        ry = y + Math.sin(angle) * d.size;
        let a = px - rx;
        let b = py - ry;
        let c = Math.sqrt(a * a + b * b);
        if (random(0, d.size * 2) < c || c < d.size * 0.4) {
            i--;
            continue;
        }
        context.lineTo(rx, ry);
    }
    context.shadowBlur = 4;
    context.strokeStyle = d.color;
    context.lineWidth = d.blurFactor / 8;
    context.stroke();
    context.closePath();

    context.beginPath();
    context.shadowBlur = 2;
    context.lineWidth = d.blurFactor;
    context.moveTo(x, y);
    context.lineTo(x, HEIGHT);
    context.stroke();
    context.closePath();
}

init(true);

