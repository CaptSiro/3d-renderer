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

        const centerA = this.transform.getWorldPosition();
        const centerB = other.transform.getWorldPosition();

        const v = glm.normalize(centerB ['-'] (centerA));
        const intersectionA = centerA ['+'] (v ['*'] (a.radius))
        const intersectionB = centerA ['+'] (v ['*'] (1 - b.radius))
        const intersectionHalfPoint = (intersectionA ['+'] (intersectionB)) ['*'] (0.5);

        this.transform.setPosition(
            intersectionHalfPoint ['+'] (v ['*'] (-a.radius))
        );

        other.transform.setPosition(
            intersectionHalfPoint ['+'] (v ['*'] (b.radius))
        );
    }
}