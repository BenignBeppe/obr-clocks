import OBR, { type ToolContext, type ToolEvent } from "@owlbear-rodeo/sdk";

import { addClock } from "./items";
import { ID } from "./util";
import { handleSelect } from "./items";
import { handleMessage } from "./messages";
import { toggleAudio } from "./audio";

function createTool() {
    OBR.tool.create({
        id: `${ID}/tool`,
        defaultMetadata: { playSounds: false },
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

function createAction() {
    OBR.tool.createAction({
        id: ID + "/action",
        icons: [
            {
                icon: "/obr-clocks/sound-on.svg",
                label: "Turn sound off",
                filter: {
                    activeTools: [ ID + "/tool" ],
                    metadata: [
                        {
                            key: "playSounds",
                            value: true
                        }
                    ]
                },
            },
            {
                icon: "/obr-clocks/sound-off.svg",
                label: "Turn sound on",
                filter: {
                    activeTools: [ ID + "/tool" ]
                },
            }
        ],
        onClick: toggleAudio
    });
}

OBR.onReady(() => {
    createTool();
    createSegmentMode(4, "Four segments");
    createSegmentMode(6, "Six segments");
    createSegmentMode(8, "Eight segments");
    createAction();

    OBR.player.onChange(handleSelect);

    OBR.broadcast.onMessage(ID, handleMessage);
});
