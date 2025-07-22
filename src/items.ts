import OBR, { buildPath, buildShape, buildText, Command, type Item, type Shape } from "@owlbear-rodeo/sdk";

import { getPositionOnCircle } from "./geometry";
import { ID } from "./util";
import { getContrastGrey } from "./colour";

const RADIUS = 80;

export async function addClock(x: number, y:number, nSegments: number, labelText: string) {
    let colour = await OBR.player.getColor();
    let contrastColour = getContrastGrey(colour);

    let items: Item[] = [];
    let pin = await makePin(x, y, colour, contrastColour);
    items.push(pin);
    items.push(...makeSegments(pin, nSegments, colour, contrastColour));
    items.push(makeLabel(pin, labelText, colour));
    // Attach each item to the previous one. This means you can move any item and the rest will follow.
    for(let i = 0; i < items.length; i++) {
        let j;
        if(i === 0) {
            j = items.length - 1;
        } else {
            j = i - 1;
        }
        items[i].attachedTo = items[j].id;
    }
    OBR.scene.items.addItems(items);
}

async function makePin(x: number, y: number, colour: string, contrastColour: string) {
    let pin = buildShape()
        .shapeType("CIRCLE")
        .position({x: x, y: y})
        .width(RADIUS / 3)
        .height(RADIUS / 3)
        .strokeWidth(5)
        .strokeColor(contrastColour)
        .fillColor(colour)
        .build();
    return pin;
}

function* makeSegments(pin: Item, nSegments: number, colour: string, contrastColour: string) {
    let pinX = pin.position.x;
    let pinY = pin.position.y;
    for (let i = 0; i < nSegments; i++) {
        let startAngle = (i ? (360 / nSegments * i) : 0);
        let startPoint = getPositionOnCircle(pinX, pinY, RADIUS, startAngle);
        let endAngle = (i + 1 ? (360 / nSegments * (i + 1)) : 0);
        let endPoint = getPositionOnCircle(pinX, pinY, RADIUS, endAngle);
        // This is based on
        // https://ctan.math.illinois.edu/macros/latex/contrib/lapdf/rcircle.pdf.
        let middleAngle = (endAngle - startAngle) / 2 * (Math.PI / 180);
        let middleRadius = RADIUS / Math.cos(middleAngle);
        let middlePoint = getPositionOnCircle(pinX, pinY, middleRadius, startAngle + (endAngle - startAngle) / 2);
        let segment = buildPath()
            .name(`${ID}/segment`)
            .zIndex(pin.zIndex - 1)
            .commands([
                [Command.MOVE, pinX, pinY],
                [Command.LINE, startPoint.x, startPoint.y],
                [Command.QUAD, middlePoint.x, middlePoint.y, endPoint.x, endPoint.y],
                [Command.CLOSE],
            ])
            .strokeWidth(5)
            .strokeColor(contrastColour)
            .fillColor(colour)
            .fillOpacity(0.01)
            .build();
        yield segment;
    }
}

function makeLabel(pin: Shape, text: string, colour: string) {
    let position = {
        x: pin.position.x - RADIUS,
        y: pin.position.y + RADIUS
    }
    let label = buildText()
        .position(position)
        .width(RADIUS * 2)
        .textType("PLAIN")
        .textAlign("CENTER")
        .plainText(text)
        .fontSize(24)
        .fillColor(colour)
        .build();

        return label;
}
