const random = (t, o) => {
    let a = o + 1 - t,
        n = Math.random() * a + t;
    return Math.floor(n)
}
const genColors = qty => {
    colorstops = [
        HUSL.toHex(random(30, 90), random(80, 95), random(50, 70)),
        HUSL.toHex(random(90, 150), random(80, 95), random(50, 70)),
        HUSL.toHex(random(150, 210), random(80, 95), random(50, 70)),
        HUSL.toHex(random(210, 270), random(80, 95), random(50, 70)),
        HUSL.toHex(random(270, 330), random(80, 95), random(50, 70)),
    ];
    for (let i = 0; i < random(0, 4); i++) {
        colorstops.push(colorstops.shift());
    }
    return chroma
        .scale(colorstops)
        .mode('hsl')
        .padding(0.35)
        .colors(qty);
};
const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
const hexToRgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        ,(m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16));

