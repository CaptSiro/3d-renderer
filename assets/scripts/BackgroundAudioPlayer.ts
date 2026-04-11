import Component from "../../src/component/Component.ts";
import { audio } from "../audio/audio-sources.ts";
import { audioEnd, AudioPlayer, playAudio } from "../../lib/audio.ts";
import { editor } from "../../src/editor/Editor.ts";
import BooleanEditor from "../../src/editor/BooleanEditor.ts";
import { viewport } from "../../src/main.ts";



export default class BackgroundAudioPlayer extends Component {
    @editor(BooleanEditor)
    public playLoopIndefinitely: boolean = false;

    private isPlaying: boolean = false;

    start() {
        // User has to interact with the page for playing media
        viewport.addEventListener("click", () => this.playLoop());
    }

    async playLoop() {
        if (this.isPlaying) {
            return;
        }

        this.isPlaying = true;

        do {
            for await (const background of audio.background) {
                const player = AudioPlayer(background, audio.channels.background);

                // Wait out the whole duration of the background audio source
                if (await playAudio(player)) {
                    await audioEnd(player);
                }
            }
        } while (this.playLoopIndefinitely);

        this.isPlaying = false;
    }
}