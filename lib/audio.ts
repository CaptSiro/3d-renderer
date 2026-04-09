let audioVolume = 1;

export function playAudio(source: string): Promise<void> {
    const myAudio = document.createElement("audio");
    myAudio.src = source;
    myAudio.volume = audioVolume;
    return myAudio.play();
}

export function setAudioVolume(volume: number): void {
    audioVolume = volume;
}