import OBR, { Command, type Item, type Path, type ToolContext, type ToolEvent, buildLine, buildPath, buildShape } from "@owlbear-rodeo/sdk";

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
    let segmentColour = "hsl(100 100% 30%)";
    let radius = 50;
    let base = buildShape()
        .shapeType("CIRCLE")
        .position({x: x, y: y})
        // Add a bit border to the base to grab on to.
        .width((radius + 10) * 2)
        .height((radius + 10 ) * 2)
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
            .fillColor(segmentColour)
            .attachedTo(base.id)
            .locked(true)
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

    OBR.player.onChange(async (player) => {
        let selectedId = player.selection;
        if(selectedId === undefined || selectedId.length === 0) {
            // Nothing selected.
            return;
        }

        if(selectedId.length > 1) {
            // Multiple items selected.
            return;
        }

        let selectedItem = (await OBR.scene.items.getItems(selectedId))[0];
        if(selectedItem.name !== `${ID}/segment`) {
            // Selected item is not a segment.
            return;
        }

        // TODO: Is there a way to avoid the selection UI popping up for a
        // split second before it's deselected?
        OBR.player.deselect();
        let segment = selectedItem as Path;
        OBR.scene.items.updateItems([segment], (items) => {
            if(items[0].style.fillOpacity === 1) {
                // Looks like the opacity just need to be more than zero to
                // keep the item selectable.
                items[0].style.fillOpacity = 0.01;
            } else {
                items[0].style.fillOpacity = 1;
            }
        });
    });
});
