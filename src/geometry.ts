import { type Vector2 } from "@owlbear-rodeo/sdk";

export function getPositionOnCircle(x: number, y: number, radius: number, degrees: number): Vector2 {
    // Based on https://stackoverflow.com/a/839931/1021969
    // x = cx + r * cos(a)
    // y = cy + r * sin(a)
    // Where r is the radius, cx,cy the origin, and a the angle.
    // let angle = degrees ? (360 / segments * degrees) : 0;
    let radians = degrees * (Math.PI / 180);
    let position = {
        x: x + radius * Math.cos(radians),
        y: y + radius * Math.sin(radians)
    }

    return position;
}
