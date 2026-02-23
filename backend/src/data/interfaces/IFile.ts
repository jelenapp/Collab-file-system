import { Document, Types } from "mongoose";
import {IUser} from "./IUser";
import {IDirectory} from "./IDirectory";
import {IComment} from "./IComment";

export interface IFile extends Document {
    _id: Types.ObjectId;
    id: string;
    name: string;
    owner: Types.ObjectId;
    parent: Types.ObjectId;
    yDocState: Buffer
    comments: Array<Types.ObjectId>; // TODO: Reconsider -> Maybe not like this?
    version: number
}

export interface IFilePopulated extends Document {
    _id: Types.ObjectId;
    id: string;
    name: string;
    owner: IUser;
    parent: IDirectory;
    yDocState: Buffer
    comments: Array<IComment>;
    version: number
}

export interface INewFile {
    name: string;
    owner: string;
    parent: string;
}