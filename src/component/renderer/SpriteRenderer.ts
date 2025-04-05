import { Opt } from "../../../lib/types.ts";
import BoundingBox from "../../primitives/BoundingBox.ts";
import RenderingContext from "../../primitives/RenderingContext.ts";
import Component from "../Component.ts";
import Renderer from "./Renderer.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import { editor } from "../../editor/Editor.ts";
import NumberEditor from "../../editor/NumberEditor.ts";



window.addEventListener("load", () => {
    SpriteRenderer.__loadQuad();
});



export default class SpriteRenderer extends Component implements Renderer {
    private static quad: WebGLBuffer | any;
    public static __loadQuad(): void {

    }



    private _texture: Opt<WebGLTexture>;
    private _boundingBox: BoundingBox = new BoundingBox(
        glm.vec3(-0.5, -0.5, 0),
        glm.vec3( 0.5,  0.5, 0),
    );

    @editor(NumberEditor)
    public width: number = 1;
    @editor(NumberEditor)
    public height: number = 1;



    public awake() {
        this.scale();
    }

    public draw(context: RenderingContext): void {
        if (!is(this._texture)) {
            return;
        }

        const model = context.parentMatrix ["*"] (this.transform.getMatrix());
    }

    public getBoundingBox(): Opt<BoundingBox> {
        return this._boundingBox;
    }

    public onPropertyChange(property: string, oldValue: any, newValue: any) {
        if (property === "width" || property === "height") {
            this.scale();
        }
    }

    private scale(): void {
        this.transform.setScale(
            glm.vec3(this.width, this.height, 1)
        );
    }



    public init(url: string): void {

    }
}