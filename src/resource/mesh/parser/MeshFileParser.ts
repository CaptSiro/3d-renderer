import MeshSource from "../MeshSource.ts";
import Path from "../../Path.ts";



export default interface MeshFileParser {
    parse(path: Path, content: string): Promise<MeshSource[]>;
}
