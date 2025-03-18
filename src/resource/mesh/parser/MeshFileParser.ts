import MeshSource from "../MeshSource.ts";



export default interface MeshFileParser {
    parse(content: string): Promise<MeshSource[]>;
}
