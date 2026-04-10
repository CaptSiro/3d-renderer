import jsml, { is } from "./jsml/jsml.ts";



export const AUDIO_DEFAULT_CHANNEL = 'main';
const channels = new Map<string, number>();
const sources = new Map<string, Set<HTMLAudioElement>>();
const signals = new Map<HTMLAudioElement, AbortController>();

export function AudioPlayer(source: string, channel: string = AUDIO_DEFAULT_CHANNEL): HTMLAudioElement {
    const player = jsml.audio({ src: source });

    player.volume = channels.get(channel) ?? 1;
    player.dataset.channel = channel;

    return player;
}

function setSource(player: HTMLAudioElement, channel: string): void {
    player.dataset.channel = channel;
    if (!player.paused) {
        return;
    }

    let set = sources.get(channel);
    if (!is(set)) {
        sources.set(channel, set = new Set());
    }

    set.add(player);

    const controller = new AbortController();
    signals.set(player, controller);

    player.addEventListener("ended", () => set.delete(player), {
        signal: controller.signal,
        once: true
    });
}

export async function playAudio(player: HTMLAudioElement): Promise<boolean> {
    const channel = player.dataset.channel;
    if (!is(channel)) {
        console.error("Unknown channel for audio player");
        return false;
    }

    setSource(player, channel);

    await player.play();
    return true;
}

export function changeAudioChannel(player: HTMLAudioElement, channel: string): void {
    const old = player.dataset.channel;
    if (is(old)) {
        sources.get(old)
            ?.delete(player);

        signals.get(player)
            ?.abort();

        signals.delete(player);
    }

    setSource(player, channel);
}

export async function audioEnd(player: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
        if (player.paused) {
            reject("Audio is not playing");
            return;
        }

        player.addEventListener("ended", () => resolve());
    });
}

export function setAudioVolume(volume: number, channel: string = AUDIO_DEFAULT_CHANNEL): void {
    channels.set(channel, volume);
    console.log(channel, volume);

    const set = sources.get(channel);
    if (!is(set)) {
        return;
    }

    for (const x of set) {
        x.volume = volume;
    }
}