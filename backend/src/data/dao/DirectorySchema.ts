import { Schema, SchemaTypes, model } from 'mongoose';
import { IDirectory } from '../interfaces/IDirectory';

const DirectorySchema: Schema<IDirectory> = new Schema({
    name: {
        type: SchemaTypes.String,
        required: true
    },
    owner: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    parents: [{
        type: SchemaTypes.ObjectId,
        ref: 'Directory',
    }],
    children: [{
        type: SchemaTypes.ObjectId,
        ref: 'Directory',
    }],
    files: [{
        type: SchemaTypes.ObjectId,
        ref: 'File',
    }],
}, { timestamps: true });

export default model<IDirectory>('Directory', DirectorySchema);