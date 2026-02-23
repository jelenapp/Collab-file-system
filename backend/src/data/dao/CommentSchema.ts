import { Schema, SchemaTypes, model } from 'mongoose';
import { IComment } from '../interfaces/IComment';

const commentSchema: Schema<IComment> = new Schema({
    commenter: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    file: {
        type: SchemaTypes.ObjectId,
        ref: 'File',
        required: true
    },
    content: {
        type: SchemaTypes.String,
        required: true,
        trim: true
    },
    edited: {
        type: SchemaTypes.Boolean,
        default: false
    },
    reactions: [{
        type: SchemaTypes.ObjectId,
        ref: 'Reaction',
    }],
}, { timestamps: true });

export default model<IComment>('Comment', commentSchema);
