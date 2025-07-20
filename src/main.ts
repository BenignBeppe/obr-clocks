import OBR, { type Path } from "@owlbear-rodeo/sdk";

import { addClock } from "./items";
import { ID } from "./util";

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
