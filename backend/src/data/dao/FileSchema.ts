import { Schema, SchemaTypes, model } from 'mongoose';
import { IFile } from "../interfaces/IFile";

const FileSchema: Schema<IFile> = new Schema({
    name: {
        type: SchemaTypes.String,
        required: true
    },
    owner: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    parent: {
        type: SchemaTypes.ObjectId,
        ref: 'Directory',
        required: true
    },
    // FULL Y.js snapshot (binary)
    yDocState: SchemaTypes.Buffer,
    comments: [{
        type: SchemaTypes.ObjectId,
        ref: 'Comment',
    }],
    version: {
        type: SchemaTypes.Number,
        default: 1
    },

}, { timestamps: true });

export default model<IFile>('File', FileSchema);
