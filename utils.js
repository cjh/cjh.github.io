const random = (t, o) => {
    let a = o + 1 - t,
        n = Math.random() * a + t;
    return Math.floor(n)
}
const generateRandomColors = (t, o = "lab", a = .175, n = 4) => {
    let e = [];
    const i = Math.floor(t / n),
        r = t % n,
        h = random(0, 360),
        d = [0, 60, 120, 180, 240, 300].map(t => (h + t) % 360),
        s = random(5, 40),
        m = random(0, 20),
        l = 90 - m;
    e.push(HUSL.toHex(d[0], s, m * random(.25, .75)));
    for (let t = 0; t < i - 1; t++) e.push(HUSL.toHex(d[0], s, m + l * Math.pow(t / (i - 1), 1.5)));
    const w = random(50, 70),
        c = w + 30,
        g = random(45, 80),
        u = Math.min(g + 40, 95);
    for (let t = 0; t < i + r - 1; t++) e.push(HUSL.toHex(d[random(0, d.length - 1)], random(w, c), random(g, u)));
    return e.push(HUSL.toHex(d[0], s, l)), chroma.scale(e).padding(a).mode(o).colors(t)
}
const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
const hexToRgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        ,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16));
const lightenHexes = (hexes, lightness) => {
    let hsls = hexes.map(HUSL.fromHex);
    hsls = hsls.map(function (hsl) {
        hsl = hsl.map(Math.round);
        hsl[2] = lightness;
        hsl[0] = hsl[0].toString();
        hsl[1] = hsl[1].toString() + '%';
        hsl[2] = hsl[2].toString() + '%';
        hsl.push('1.0')
        return 'hsla(' + hsl.join(',') + ')';
    });
    return hsls;
};

