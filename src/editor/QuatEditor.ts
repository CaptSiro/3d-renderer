import Vec3Editor from "./Vec3Editor.ts";
import Quaternion from "../utils/Quaternion.ts";



export default class QuatEditor extends Vec3Editor {
    public saveVector(): void {
        this.saveValue(Quaternion.fromEulerDegrees(
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