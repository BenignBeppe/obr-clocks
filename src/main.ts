import OBR, { type Line, type ToolContext, type ToolEvent, buildLine, buildShape } from "@owlbear-rodeo/sdk";

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
        onToolClick: onToolClick
    });
}

async function onToolClick(context: ToolContext, event: ToolEvent) {
    // TODO: Implement nicer.
    let segments = Number(context.activeMode?.split("-").at(-1));
    let x = event.pointerPosition.x;
    let y = event.pointerPosition.y;
    let colour = "#FFF";
    let radius = 50;
    let base = buildShape()
        .shapeType("CIRCLE")
        .position({x: x, y: y})
        .width(radius * 2)
        .height(radius * 2)
        .strokeColor(colour)
        .build();
    // We need to wait here to make sure this doesn't go over the dividers.
    await OBR.scene.items.addItems([base]);

    let dividers: Line[] = [];
    for(let i = 0; i < segments / 2; i ++) {
        let angle = i ? (360 / segments * i) : 0;
        let start = getPositionOnCircle(x, y, radius, angle);
        let end = getPositionOnCircle(x, y, radius, angle + 180);
        let divider = buildLine()
            .startPosition(start)
            .endPosition(end)
            .strokeColor(colour)
            .attachedTo(base.id)
            .disableHit(true)
            .build();
        dividers.push(divider);
    }
    // TODO: Figure out if there is a good way to prevent the flickering that
    // sometimes happens when drawing these. Possibly by creating items hidden
    // and show them all at once.
    OBR.scene.items.addItems(dividers);
}

OBR.onReady(() => {
    createTool();
    createSegmentMode(4, "Four segments");
    createSegmentMode(6, "Six segments");
    createSegmentMode(8, "Eight segments");
});
