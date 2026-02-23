import { Document, Types } from "mongoose";

export interface IReaction extends Document {
    _id: Types.ObjectId;
    id: string;
    comment: Types.ObjectId;
    reactionType: string,
    reactor: Types.ObjectId,
}

// export interface IReactionPopulated {
//     _id: Types.ObjectId;
//     id: string;
//     comment: IComment;
//     reactionType: string,
//     reactor: IUser,
// }

export interface INewReaction {
    commentId: string;
    reactionType: string;
    reactorId: string;
}