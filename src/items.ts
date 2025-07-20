import OBR, { buildLine, buildPath, buildShape, Command, type Item, type ToolContext, type ToolEvent } from "@owlbear-rodeo/sdk";

import { getPositionOnCircle } from "./geometry";
import { ID } from "./util";

const LINE_COLOUR = "hsl(0 0% 75%)";
const SEGMENT_COLOR = "hsl(100 100% 30%)";
const RADIUS = 50;

export async function addClock(context: ToolContext, event: ToolEvent) {
    // TODO: Implement nicer way of getting the number of segments.
    let nSegments = Number(context.activeMode?.split("-").at(-1));
    let x = event.pointerPosition.x;
    let y = event.pointerPosition.y;

    let items: Item[] = [];
    let base = makeBase(x, y);
    items.push(base);
    items.push(...makeSegments(nSegments, x, y, base));
    items.push(...makeDividers(nSegments, x, y, base));
    items.push(makeBorder(x, y, base));
    OBR.scene.items.addItems(items);
}

function makeBase(x: number, y: number) {
    let base = buildShape()
        .shapeType("CIRCLE")
        .position({x: x, y: y})
        // Add a bit border to the base to grab on to.
        .width((RADIUS + 10) * 2)
        .height((RADIUS + 10 ) * 2)
        .strokeWidth(0)
        .build();
    return base;
}

function* makeSegments(nSegments: number, x: number, y: number, base: Item) {
    let points = [];
    for(let i = 0; i < nSegments; i ++) {
        let angle = i ? (360 / nSegments * i) : 0;
        let start = getPositionOnCircle(x, y, RADIUS, angle);
        points.push(start)
    }

    for (let i = 0; i < nSegments; i++) {
        let j;
        if(i === nSegments - 1) {
            j = 0;
        } else {
            j = i + 1;
        }
        let point = points[i];
        let between = getPositionOnCircle(x, y, RADIUS, 360 / nSegments * (i + 0.5));
        let next = points[j];
        let segment = buildPath()
            .name(`${ID}/segment`)
            .zIndex(base.zIndex + 1)
            // TODO: Figure out how to make this with a round edge. Four
            // segment clocks look wonky.
            .commands([
                [Command.MOVE, x, y],
                [Command.LINE, point.x, point.y],
                [Command.LINE, between.x, between.y],
                [Command.LINE, next.x, next.y],
                [Command.CLOSE],
            ])
            .strokeWidth(0)
            .fillColor(SEGMENT_COLOR)
            .attachedTo(base.id)
            .locked(true)
            .build();
        yield segment;
    }
}

function* makeDividers(nSegments: number, x: number, y: number, base: Item) {
        for(let i = 0; i < nSegments / 2; i ++) {
        let angle = i ? (360 / nSegments * i) : 0;
        let start = getPositionOnCircle(x, y, RADIUS, angle);
        let end = getPositionOnCircle(x, y, RADIUS, angle + 180);
        let divider = buildLine()
            .startPosition(start)
            .endPosition(end)
            .zIndex(base.zIndex + 2)
            .strokeColor(LINE_COLOUR)
            .attachedTo(base.id)
            .disableHit(true)
            .build();
        yield divider;
    }
}

function makeBorder(x: number, y: number, base: Item) {
    let border = buildShape()
        .shapeType("CIRCLE")
        .position({x: x, y: y})
        .width(RADIUS * 2)
        .height(RADIUS * 2)
        .zIndex(base.zIndex + 2)
        .strokeColor(LINE_COLOUR)
        .fillOpacity(0)
        .attachedTo(base.id)
        .disableHit(true)
        .build();
    return border;
}
