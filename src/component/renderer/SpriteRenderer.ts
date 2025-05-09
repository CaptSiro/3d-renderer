import { Opt } from "../../../lib/types.ts";
import Component from "../Component.ts";
import { is } from "../../../lib/jsml/jsml.ts";
import { editor } from "../../editor/Editor.ts";
import NumberEditor from "../../editor/NumberEditor.ts";
import MeshRenderer from "./MeshRenderer.ts";
import Path from "../../resource/Path.ts";
import Material from "../../resource/material/Material.ts";
import MaterialSource from "../../resource/material/MaterialSource.ts";
import { float, int } from "../../types.ts";
import GameObject from "../../object/GameObject.ts";



export default class SpriteRenderer extends Component {
    protected _meshRenderer: Opt<MeshRenderer>;

    @editor(NumberEditor)
    public width: number = 1;
    @editor(NumberEditor)
    public height: number = 1;

    public images: Opt<string[]>;
    protected _materials: Opt<Material[]>;

    @editor(NumberEditor)
    public fps: number = 1;
    protected frame: int = 0;
    protected time: float = 0;

    public onMaterialUpdate: (material: Material, spriteRenderer: SpriteRenderer) => void = () => {};



    private setMaterial(material: Material): void {
        if (!is(this._meshRenderer)) {
            return;
        }

        const meshes = this._meshRenderer.getMeshes();
        if (!is(meshes)) {
            return;
        }

        for (const mesh of meshes) {
            mesh.setMaterial(material);
        }
    }

    public awake() {
        this.scale();
        this._meshRenderer = this.gameObject.addComponent(MeshRenderer);
        this._meshRenderer.initFromModelFile(Path.from('/assets/models/quad.obj'))
            .then(async () => {
                if (!is(this.images)) {
                    return;
                }

                this._materials = [];

                for (const image of this.images) {
                    const source = await MaterialSource.loadImage(image);
                    if (!is(source)) {
                        continue;
                    }

                    this._materials.push(new Material(source))
                }

                if (this._materials.length === 0) {
                    return;
                }

                this.setMaterial(this._materials[0]);
            });
    }

    public getCurrentMaterial(): Opt<Material> {
        this.time += this.scene.getTime().getDeltaTime();
        const frameDuration = 1 / this.fps;

        const frames = Math.floor(this.time / frameDuration);
        this.frame += frames;

        this.time -= frames * frameDuration;

        if (frames <= 0 || !is(this._materials) || this._materials.length === 0) {
            return;
        }

        this.frame -= Math.floor(this.frame / this._materials.length) * this._materials.length;
        return this._materials[this.frame];
    }

    public update() {
        const material = this.getCurrentMaterial();
        if (!is(material)) {
            return;
        }

        this.onMaterialUpdate(material, this);
        this.setMaterial(material);
    }

    public onPropertyChange(property: string, oldValue: any, newValue: any) {
        if (property === "width" || property === "height") {
            this.scale();
        }
    }

    private scale(): void {
        this.transform.setScale(
            glm.vec3(this.width, 1, this.height)
        );
    }

    public setDimensions(width: float, height: float): void {
        this.width = width;
        this.height = height;
        this.scale();
    }
}