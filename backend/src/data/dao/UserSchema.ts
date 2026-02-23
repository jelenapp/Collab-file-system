import { Schema, SchemaTypes, model } from 'mongoose';
import { IUser } from '../interfaces/IUser';

const UserSchema: Schema<IUser> = new Schema({
    username: {
        type: SchemaTypes.String,
        required: true,
        unique: true,
        immutable: true
    },
    email: {
        type: SchemaTypes.String,
        required: true,
        unique: true,
        isEmail: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
}, { timestamps: true });

export default model<IUser>('User', UserSchema);