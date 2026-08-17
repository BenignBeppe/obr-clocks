import OBR from "@owlbear-rodeo/sdk";

import { ID } from "./util";

let tickSound = new Audio("/obr-clocks/tick.ogg");
let tockSound = new Audio("/obr-clocks/tock.ogg");
let chimeSound = new Audio("/obr-clocks/chime.ogg");

export async function toggleAudio() {
    let isOn = (await OBR.tool.getMetadata(ID + "/tool"))?.playSounds;
    await OBR.tool.setMetadata(ID + "/tool", { playSounds: !isOn });
}

export function playTick() {
    playSound(tickSound);
}

export function playTock() {
    playSound(tockSound);
}

export function playChime() {
    playSound(chimeSound);
}

async function playSound(sound: HTMLAudioElement) {
    if(!(await OBR.tool.getMetadata(ID + "/tool"))?.playSounds) {
        return;
    }

    // Rewind in case the sound is playing.
    sound.currentTime = 0;
    sound.pause();

    sound.play();
}
