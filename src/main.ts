import OBR, { Command, type Item, type ToolContext, type ToolEvent, buildLine, buildPath, buildShape } from "@owlbear-rodeo/sdk";

import { getPositionOnCircle } from "./geometry";

const ID = "eu.sebber.obr-clock";

function createTool() {
    OBR.tool.create({
        id: `${ID}/tool`,
        icons: [
            {
                icon: "/tool.svg",
                label: "Clocks",
            }
        ]
    });
}

function createSegmentMode(segments: number, label: string) {
    OBR.tool.createMode({
        id: `${ID}/mode-${segments}`,
        icons: [
            {
                icon: `/mode-${segments}.svg`,
                label: label,
                filter: {
                    activeTools: [`${ID}/tool`],
                }
            }
        ],
        onToolClick: addClock
    });
}

async function addClock(context: ToolContext, event: ToolEvent) {
    // TODO: Implement nicer way of getting the number of segments.
    let segments = Number(context.activeMode?.split("-").at(-1));
    let x = event.pointerPosition.x;
    let y = event.pointerPosition.y;
    let lineColour = "hsl(0 0% 75%)";
    let radius = 50;
    let base = buildShape()
        .shapeType("CIRCLE")
        .position({x: x, y: y})
        .width(radius * 2)
        .height(radius * 2)
        .strokeWidth(0)
        .build();
    let items: Item[] = [base];

    let points = [];
    for(let i = 0; i < segments; i ++) {
        let angle = i ? (360 / segments * i) : 0;
        let start = getPositionOnCircle(x, y, radius, angle);
        points.push(start)
    }

    for (let i = 0; i < segments; i++) {
        let j;
        if(i === segments - 1) {
            j = 0;
        } else {
            j = i + 1;
        }
        let point = points[i];
        let between = getPositionOnCircle(x, y, radius, 360 / segments * (i + 0.5));
        let next = points[j];
        let segment = buildPath()
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
            .fillColor("hsl(100 100% 30%)")
            .attachedTo(base.id)
            .disableHit(true)
            .build();
        items.push(segment);
    }

    for(let i = 0; i < segments / 2; i ++) {
        let angle = i ? (360 / segments * i) : 0;
        let start = getPositionOnCircle(x, y, radius, angle);
        let end = getPositionOnCircle(x, y, radius, angle + 180);
        let divider = buildLine()
            .startPosition(start)
            .endPosition(end)
            .zIndex(base.zIndex + 2)
            .strokeColor(lineColour)
            .attachedTo(base.id)
            .disableHit(true)
            .build();
        items.push(divider);
    }

    let edge = buildShape()
        .shapeType("CIRCLE")
        .position({x: x, y: y})
        .width(radius * 2)
        .height(radius * 2)
        .zIndex(base.zIndex + 2)
        .strokeColor(lineColour)
        .fillOpacity(0)
        .attachedTo(base.id)
        .disableHit(true)
        .build();
    items.push(edge);

    OBR.scene.items.addItems(items);
}

OBR.onReady(() => {
    createTool();
    createSegmentMode(4, "Four segments");
    createSegmentMode(6, "Six segments");
    createSegmentMode(8, "Eight segments");
});
