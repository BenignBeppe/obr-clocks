import OBR, { buildPath, buildShape, Command, type Item, type ToolContext, type ToolEvent } from "@owlbear-rodeo/sdk";

import { getPositionOnCircle } from "./geometry";
import { ID } from "./util";

const RADIUS = 80;

export async function addClock(context: ToolContext, event: ToolEvent) {
    // TODO: Implement nicer way of getting the number of segments.
    let nSegments = Number(context.activeMode?.split("-").at(-1));
    let x = event.pointerPosition.x;
    let y = event.pointerPosition.y;

    let items: Item[] = [];
    let base = makeBase(x, y);
    items.push(base);
    items.push(...makeSegments(nSegments, x, y, base));
    OBR.scene.items.addItems(items);
}

function makeBase(x: number, y: number) {
    let baseColour = "hsl(0 0% 75%)";
    let base = buildShape()
        .shapeType("CIRCLE")
        .position({x: x, y: y})
        .width(RADIUS * 2)
        .height(RADIUS * 2)
        .strokeWidth(30)
        .strokeColor(baseColour)
        .fillColor(baseColour)
        .build();
    return base;
}

function* makeSegments(nSegments: number, baseX: number, baseY: number, base: Item) {
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
            .strokeColor("hsl(0 0% 20%)")
            .fillColor("hsl(100 100% 30%)")
            .fillOpacity(0.01)
            .attachedTo(base.id)
            .locked(true)
            .build();
        yield segment;
    }
}
