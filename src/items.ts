import OBR, { buildPath, buildShape, buildText, Command, type Item, type Shape } from "@owlbear-rodeo/sdk";

import { getPositionOnCircle } from "./geometry";
import { ID } from "./util";
import { hexToHsl } from "./colour";

const RADIUS = 80;
const BORDER_WIDTH = 30;

export async function addClock(x: number, y:number, nSegments: number, labelText: string) {
    let colour = await OBR.player.getColor();
    let items: Item[] = [];
    let base = await makeBase(x, y, colour);
    items.push(base);
    items.push(...makeSegments(base, nSegments, colour));
    items.push(makeLabel(base, labelText, colour));
    OBR.scene.items.addItems(items);
}

async function makeBase(x: number, y: number, colour: string) {
    let hslColour = hexToHsl(colour);
    let baseColour;
    // Set background colour to be lighter when the foreground colour is dark
    // and vice versa.
    console.log(hslColour.l);
    if(hslColour.l > 50) {
        baseColour = "hsl(0 0% 25%)";
    } else {
        baseColour = "hsl(0 0% 75%)";
    }

    let base = buildShape()
        .shapeType("CIRCLE")
        .position({x: x, y: y})
        .width(RADIUS * 2)
        .height(RADIUS * 2)
        .strokeWidth(BORDER_WIDTH)
        .strokeColor(baseColour)
        .fillColor(baseColour)
        .build();
    return base;
}

function* makeSegments(base: Item, nSegments: number, colour: string) {
    let baseX = base.position.x;
    let baseY = base.position.y;
    for (let i = 0; i < nSegments; i++) {
        // This is the point close to the center of the circle.
        let centerPoint = getPositionOnCircle(baseX, baseY, 10, 360 / nSegments * (i + 0.5));
        let startAngle = (i ? (360 / nSegments * i) : 0) + 5;
        let startPoint = getPositionOnCircle(baseX, baseY, RADIUS, startAngle);
        // The radius offset is just something that looks fine for all number
        // of segments. The edge isn't circular.
        let middlePoint = getPositionOnCircle(baseX, baseY, RADIUS + 5, 360 / nSegments * (i + 0.5));
        let endAngle = (i + 1 ? (360 / nSegments * (i + 1)) : 0) - 5;
        let endPoint = getPositionOnCircle(baseX, baseY, RADIUS, endAngle);
        let segment = buildPath()
            .name(`${ID}/segment`)
            .zIndex(base.zIndex + 1)
            // TODO: Figure out how to make this with a round edge. Four
            // segment clocks look wonky.
            .commands([
                [Command.MOVE, centerPoint.x, centerPoint.y],
                [Command.LINE, startPoint.x, startPoint.y],
                [Command.QUAD, middlePoint.x, middlePoint.y, endPoint.x, endPoint.y],
                [Command.CLOSE],
            ])
            .strokeWidth(2)
            .strokeColor("hsl(0 0% 50%)")
            .fillColor(colour)
            .fillOpacity(0.01)
            .attachedTo(base.id)
            .locked(true)
            .build();
        yield segment;
    }
}

function makeLabel(base: Shape, text: string, colour: string) {
    let position = {
        x: base.position.x - RADIUS,
        y: base.position.y + RADIUS + BORDER_WIDTH / 2
    }
    let label = buildText()
        .position(position)
        .width(base.width)
        .textType("PLAIN")
        .textAlign("CENTER")
        .plainText(text)
        .fontSize(24)
        .fillColor(colour)
        .attachedTo(base.id)
        .build();

    // Attach the other way too. This makes it possible to select and move the
    // clock by clicking the label.
    base.attachedTo = label.id;
    // Still allow deleting the text without losing the whole clock.
    base.disableAttachmentBehavior = ["DELETE"];
    return label;
}
