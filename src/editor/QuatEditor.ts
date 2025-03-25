import { Quaternion } from "../primitives/Quaternion.ts";
import Vec3Editor from "./Vec3Editor.ts";



export default class QuatEditor extends Vec3Editor {
    public saveVector(): void {
        this.saveValue(Quaternion.eulerDegrees(
            Number(this.x.value),
            Number(this.y.value),
            Number(this.z.value),
        ));
    }

    public update() {
        const q = this.readValue();
        const v = Quaternion.toEulerDegrees(q);
        this.x.value = String(v.x);
        this.y.value = String(v.y);
        this.z.value = String(v.z);
    }
}