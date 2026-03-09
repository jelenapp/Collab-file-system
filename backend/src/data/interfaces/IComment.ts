import { Document, Types } from "mongoose";
import {IReaction} from "./IReaction";
import {IUser} from "./IUser";
import {IFile} from "./IFile";

export interface IComment extends Document {
    _id: Types.ObjectId;
    id: string;
    commenter: Types.ObjectId;
    file: Types.ObjectId;
    content: string;
    edited: boolean;
    reactions: Array<Types.ObjectId>;
}

export interface ICommentPopulated extends Document {
    _id: Types.ObjectId;
    id: string;
    commenter: IUser;
    file: IFile;
    content: string;
    edited: boolean;
    reactions: Array<IReaction>;
}

export interface INewComment {
    commenterId: string;
    fileId: string;
    content: string;
}
