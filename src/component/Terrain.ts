import Editor, { editor } from "../editor/Editor.ts";
import BooleanEditor from "../editor/BooleanEditor.ts";
import NumberEditor from "../editor/NumberEditor.ts";
import Component from "./Component.ts";
import { Opt } from "../../lib/types.ts";
import MeshRenderer from "./renderer/MeshRenderer.ts";
import Vec2Editor from "../editor/Vec2Editor.ts";
import type { float, Vec2, Vec3 } from "../types.ts";
import Perlin from "../utils/Perlin.ts";
import Button, * as Button_ from "../editor/Button.ts";
import { meshVertexLayout } from "../webgl.ts";
import Arrays from "../utils/Arrays.ts";
import jsml, { $, is } from "../../lib/jsml/jsml.ts";
import MeshSource from "../resource/mesh/MeshSource.ts";
import MaterialSource from "../resource/material/MaterialSource.ts";
import BoundingBox from "../primitives/BoundingBox.ts";
import BufferedImage from "../primitives/BufferedImage.ts";
import Color from "../primitives/Color.ts";
import { ModalWindow, window_create, window_open } from "../../lib/window.ts";



export default class Terrain extends Component {
    @editor(BooleanEditor)
    public generateOnAwake: boolean = true;

    @editor(BooleanEditor)
    public generateOnPropertyWrite: boolean = true;

    @editor(NumberEditor)
    public height: number = 2;
    @editor(Vec2Editor)
    public size: Vec2 = glm.vec2(10, 10);

    @editor(NumberEditor)
    public scale: float = 1;
    @editor(NumberEditor)
    public offset: float = 0;



    private _meshRenderer: Opt<MeshRenderer>;



    public awake(): void {
        this._meshRenderer = this.gameObject.getComponent(MeshRenderer)
            ?? this.gameObject.addComponent(MeshRenderer);

        if (this.generateOnAwake) {
            this.generate();
        }
    }



    private triangleNormal(v0: Vec3, v1: Vec3, v2: Vec3): Vec3 {
        return glm.cross(
            v0 ['-'] (v1),
            v0 ['-'] (v2),
        );
    }

    public generate(): void {
        if (!is(this._meshRenderer)) {
            console.warn("MeshRenderer component is not added to the " + this.gameObject.name + " game object");
            return;
        }

        const vertexCount = this.size.x * this.size.y;
        const triangleCount = (this.size.x - 1) * (this.size.y - 1) * 2;
        const vertexes = new Array(vertexCount);
        const boundingBox = BoundingBox.initial();
        const texture = new BufferedImage(this.size.x, this.size.y);

        let i = 0;
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                const vertexY = Perlin.noise(
                    (x + this.offset) / (this.size.x * this.scale),
                    (y + this.offset) / (this.size.y * this.scale)
                ) * this.height;

                const v = vertexes[i++] = glm.vec3(x, vertexY, y);
                boundingBox.add(v);

                const c = ((vertexY / this.height) / 2) + 0.5;
                texture.setPixel(x, y, Color.vec3(c / 2, c, c / 2));
            }
        }

        const data = new Float32Array(meshVertexLayout.getTotalFloats() * triangleCount * 3);
        const VERTEX = meshVertexLayout.getVertexFloats();
        const NORMAL = meshVertexLayout.getNormalFloats();

        let j = 0;
        for (let y0 = 0; y0 < this.size.y - 1; y0++) {
            const y1 = y0 + 1;
            const v0 = y0 / (this.size.y - 1);
            const v1 = y1 / (this.size.y - 1);

            for (let x0 = 0; x0 < this.size.x - 1; x0++) {
                const x1 = x0 + 1;
                const u0 = 1 - (x0 / (this.size.x - 1));
                const u1 = 1 - (x1 / (this.size.x - 1));

                const v00 = vertexes[y0 * this.size.x + x0];
                const v10 = vertexes[y0 * this.size.x + x1];
                const v01 = vertexes[y1 * this.size.x + x0];
                const v11 = vertexes[y1 * this.size.x + x1];

                const t00 = glm.vec2(u0, v0);
                const t10 = glm.vec2(u1, v0);
                const t01 = glm.vec2(u0, v1);
                const t11 = glm.vec2(u1, v1);

                const n0 = this.triangleNormal(v10, v00, v01);
                Arrays.writeVec3(data, j++ * meshVertexLayout.getTotalFloats(), v10);
                Arrays.writeVec3(data, j * meshVertexLayout.getTotalFloats() + VERTEX, n0);
                Arrays.writeVec2(data, j * meshVertexLayout.getTotalFloats() + VERTEX + NORMAL, t10);

                Arrays.writeVec3(data, j++ * meshVertexLayout.getTotalFloats(), v00);
                Arrays.writeVec3(data, j * meshVertexLayout.getTotalFloats() + VERTEX, n0);
                Arrays.writeVec2(data, j * meshVertexLayout.getTotalFloats() + VERTEX + NORMAL, t00);

                Arrays.writeVec3(data, j++ * meshVertexLayout.getTotalFloats(), v01);
                Arrays.writeVec3(data, j * meshVertexLayout.getTotalFloats() + VERTEX, n0);
                Arrays.writeVec2(data, j * meshVertexLayout.getTotalFloats() + VERTEX + NORMAL, t01);

                const n1 = this.triangleNormal(v10, v01, v11);
                Arrays.writeVec3(data, j++ * meshVertexLayout.getTotalFloats(), v10);
                Arrays.writeVec3(data, j * meshVertexLayout.getTotalFloats() + VERTEX, n1);
                Arrays.writeVec2(data, j * meshVertexLayout.getTotalFloats() + VERTEX + NORMAL, t10);

                Arrays.writeVec3(data, j++ * meshVertexLayout.getTotalFloats(), v01);
                Arrays.writeVec3(data, j * meshVertexLayout.getTotalFloats() + VERTEX, n1);
                Arrays.writeVec2(data, j * meshVertexLayout.getTotalFloats() + VERTEX + NORMAL, t01);

                Arrays.writeVec3(data, j++ * meshVertexLayout.getTotalFloats(), v11);
                Arrays.writeVec3(data, j * meshVertexLayout.getTotalFloats() + VERTEX, n1);
                Arrays.writeVec2(data, j * meshVertexLayout.getTotalFloats() + VERTEX + NORMAL, t11);
            }
        }

        const url = texture.toDataUrl();

        MaterialSource
            .loadImage(url)
            .then(source => {
                if (!is(source)) {
                    return;
                }

                if (!is(this._meshRenderer)) {
                    console.warn("MeshRenderer component is not added to the " + this.gameObject.name + " game object");
                    return;
                }

                this._meshRenderer.init([
                    new MeshSource(
                        data,
                        triangleCount,
                        meshVertexLayout,
                        source,
                        boundingBox,
                        this.gameObject.name
                    )
                ]).then();
            });

        // window_open(this.getTextureEditorWindow(url));
    }

    private getTextureEditorWindow(texture: string): ModalWindow {
        const id = "__terrain-texture__" + this.gameObject.name;
        const win = $<HTMLDivElement>("#" + id);
        if (is(win)) {
            return win;
        }

        const content = jsml.div("editor-content pad");
        const w = window_create(
            this.gameObject.name + " > Terrain texture",
            content,
            {
                isDraggable: true,
                isMinimizable: true,
                isResizable: true,
                width: "400px"
            }
        );

        content.append(jsml.img({ src: texture }));
        return Editor.initWindow(w, id);
    }

    @editor(Button)
    public _Generate: Button_.ButtonHandler = this.generate;

    public onPropertyChange(property: string, oldValue: any, newValue: any) {
        if (this.generateOnPropertyWrite) {
            this.generate();
        }
    }
}