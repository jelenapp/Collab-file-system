import {PlainResource} from "./PlainResource";
import {IUser} from "../interfaces/IUser";


export type UserView = PlainResource<IUser, "password" | "verified" | "verificationToken">