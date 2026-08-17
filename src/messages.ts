import OBR from "@owlbear-rodeo/sdk";

import { playTick, playTock, playChime } from "./audio";
import { ID } from "./util";

export const TICK = "TICK";
export const TOCK = "TOCK";
export const CHIME = "CHIME";

export function handleMessage(event: {data: unknown}) {
    if(event.data === TICK) {
        playTick();
    } else if(event.data === TOCK) {
        playTock();
    } else if(event.data === CHIME) {
        playChime();
    }
}

export function sendMessage(data: unknown) {
    OBR.broadcast.sendMessage(ID, data, {destination: "ALL"});
}
