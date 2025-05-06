import Component from "./Component.ts";
import { editor } from "../editor/Editor.ts";
import NumberEditor from "../editor/NumberEditor.ts";
import Vector3 from "../utils/Vector3.ts";



export default class SphereCollider extends Component {
    @editor(NumberEditor)
    public radius: number = 1;



    public awake() {
        this.scene.addCollider(this);
    }

    public delete() {
        this.scene.deleteCollider(this);
    }



    public isColliding(other: SphereCollider): boolean {
        const a = this.transform.getWorldPosition();
        const b = other.transform.getWorldPosition();

        return glm.length(b ['-'] (a)) <= (this.radius + other.radius);
    }

    public onCollision(other: SphereCollider): void {
        const a = this;
        const b = other;

        const s_a = this.transform.getWorldPosition();
        const s_b = other.transform.getWorldPosition();

        const v = glm.normalize(s_b ['-'] (s_a));
        const i_a = s_a ['+'] (v ['*'] (a.radius))
        const i_b = s_a ['+'] (v ['*'] (1 - b.radius))
        const i_h = (i_a ['+'] (i_b)) ['*'] (0.5);

        this.transform.setPosition(
            i_h ['+'] (v ['*'] (-a.radius))
        );

        other.transform.setPosition(
            i_h ['+'] (v ['*'] (b.radius))
        );
    }
}