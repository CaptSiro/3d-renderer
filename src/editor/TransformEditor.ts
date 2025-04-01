import Editor from "./Editor.ts";
import Transform from "../component/Transform.ts";
import Vec3Editor from "./Vec3Editor.ts";
import { Opt } from "../../lib/types.ts";
import { Vec3 } from "../types.ts";
import jsml from "../../lib/jsml/jsml.ts";
import Quaternion from "../utils/Quaternion.ts";



type Getter<T> = () => T;
type Setter<T> = (x: T) => void;

class TransformVec3Editor extends Vec3Editor {
    protected getter: Getter<Vec3> = () => glm.vec3(0, 0, 0);
    protected setter: Setter<Vec3> = () => glm.vec3(0, 0, 0);

    public setGetter(getter: Getter<Vec3>): void {
        this.getter = getter;
    }

    public setSetter(setter: Setter<Vec3>): void {
        this.setter = setter;
    }

    protected readValue(): Vec3 {
        return this.getter();
    }

    protected saveValue(value: Vec3) {
        this.setter(value);
    }
}

export default class TransformEditor extends Editor<Transform> {
    private position: Opt<Vec3Editor>;
    private rotation: Opt<Vec3Editor>;
    private scale: Opt<Vec3Editor>;

    public update() {
        this.position?.update();
        this.scale?.update();
    }

    public html(): HTMLElement {
        const position = new TransformVec3Editor(this.editorWindow, this.value, "position", this.value.getPosition());
        position.setGetter(() => this.value.getPosition());
        position.setSetter((x) => this.value.setPosition(x));
        this.position = position;

        const rotation = new TransformVec3Editor(this.editorWindow, this.value, "rotation", Quaternion.toEulerDegrees(this.value.getRotation()));
        rotation.setGetter(() => Quaternion.toEulerDegrees(this.value.getRotation()));
        rotation.setSetter((v) => this.value.setRotation(Quaternion.fromEulerDegrees(v.x, v.y, v.z)));
        this.rotation = rotation;

        const scale = new TransformVec3Editor(this.editorWindow, this.value, "scale", this.value.getScale());
        scale.setGetter(() => this.value.getScale());
        scale.setSetter((x) => this.value.setScale(x));
        this.scale = scale;

        return jsml.div("editor-column", [
            position.html(),
            rotation.html(),
            scale.html()
        ]);
    }
}