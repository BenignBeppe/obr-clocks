export function hexToHsl(hex: string) {
    // Based on https://css-tricks.com/converting-color-spaces-in-javascript/#aa-hex-to-hsl

    // Convert hex to RGB first
    let r: number = 0;
    let g: number = 0;
    let b: number = 0;
    if(hex.length == 4) {
        r = Number("0x" + hex[1] + hex[1]);
        g = Number("0x" + hex[2] + hex[2]);
        b = Number("0x" + hex[3] + hex[3]);
    } else if(hex.length == 7) {
        r = Number("0x" + hex[1] + hex[2]);
        g = Number("0x" + hex[3] + hex[4]);
        b = Number("0x" + hex[5] + hex[6]);
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b);
    let cmax = Math.max(r, g, b);
    let delta = cmax - cmin;
    let h = 0;
    let s = 0;
    let l = 0;

    if(delta == 0) {
        h = 0;
    } else if(cmax == r) {
        h = ((g - b) / delta) % 6;
    } else if(cmax == g) {
        h = (b - r) / delta + 2;
    } else {
        h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    if(h < 0) {
        h += 360;
    }

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return {h: h, s: s, l: l};
    // return "hsl(" + h + "," + s + "%," + l + "%)";
}
