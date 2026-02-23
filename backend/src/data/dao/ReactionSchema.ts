import {model, Schema, SchemaTypes} from "mongoose";
import {IReaction} from "../interfaces/IReaction";

export const reactionSchema: Schema<IReaction> = new Schema({
    comment:{
        type: SchemaTypes.ObjectId,
        ref: 'Comment',
        required: true
    },
    reactionType: {
        type: SchemaTypes.String,
        required: true,
    },
    reactor: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

export default model<IReaction>('Reaction', reactionSchema);
