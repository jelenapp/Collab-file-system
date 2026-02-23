import { Document, Types } from "mongoose";
import {IFile} from "./IFile";

export interface IDirectory extends Document {
    _id: Types.ObjectId;
    id: string;
    name: string;
    owner: Types.ObjectId;
    parents: Array<Types.ObjectId>;
    children: Array<Types.ObjectId>;
    files: Array<Types.ObjectId>;
    // collaborators: Array<Types.ObjectId>;
}

export interface IDirectoryPopulated extends Document {
    _id: Types.ObjectId;
    id: string;
    name: string;
    owner: Types.ObjectId;
    parents: Array<IDirectory>;
    children: Array<IDirectory>;
    files: Array<IFile>;
}

export interface INewDirectory {
    name: string;
    owner: string;
    parents: Array<string>;
}