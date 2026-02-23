import {PlainResource} from "./PlainResource";
import {IFile} from "../interfaces/IFile";


export type FileView = PlainResource<IFile, "parent" | "yDocState">;