import { Document, Types } from "mongoose";

export interface IOrganization extends Document {
    _id: Types.ObjectId;
    id: string;
    name: string;
    organizer: Types.ObjectId;
    children: Array<Types.ObjectId>;
    projections: Array<Types.ObjectId>;
    members: Map<string, string>;
}

export type INewOrganization = {
    name: string;
    organizer: string;
}
