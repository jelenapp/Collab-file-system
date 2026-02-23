import {Document, Types} from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId;
    id: string;
    username: string;
    email: string;
    password: string;
    verified: boolean;
    verificationToken?: string;
}

export interface INewUser {
    username: string;
    email: string;
    password: string;
}