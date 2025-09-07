import OBR, { type ToolContext, type ToolEvent } from "@owlbear-rodeo/sdk";

import { addClock } from "./items";
import { ID } from "./util";
import { handleSelect } from "./items";

function createTool() {
    OBR.tool.create({
        id: `${ID}/tool`,
        icons: [
            {
                icon: "/obr-clocks/tool.svg",
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
                icon: `/obr-clocks/mode-${segments}.svg`,
                label: label,
                filter: {
                    activeTools: [`${ID}/tool`],
                }
            }
        ],
        onToolClick: (_context: ToolContext, event: ToolEvent) => {
            let x = event.pointerPosition.x;
            let y = event.pointerPosition.y;
            addClock(x, y, segments, label)
        }
    });
}

OBR.onReady(() => {
    createTool();
    createSegmentMode(4, "Four segments");
    createSegmentMode(6, "Six segments");
    createSegmentMode(8, "Eight segments");

    OBR.player.onChange(handleSelect);
});
