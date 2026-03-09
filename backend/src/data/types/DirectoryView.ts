import {PlainResource} from "./PlainResource";
import {IDirectory} from "../interfaces/IDirectory";
import {toUserView, UserView} from "./UserView";
import {IUser} from "../interfaces/IUser";
import {FileView, toFileView} from "./FileView";
import {IFile} from "../interfaces/IFile";
import {Types} from "mongoose";


export type DirectoryView = PlainResource<IDirectory, "parents" | "owner" | "children" | "files">
    & {owner: UserView, children: Array<DirectoryView>, files: Array<FileView>};

export function toDirectoryView(directory: IDirectory): DirectoryView {

    let c: Array<DirectoryView> = [];
    let f: Array<FileView> = [];

    if (directory.children.length > 0 && !(directory.children[0] instanceof Types.ObjectId))
        c = directory.children.map(c => toDirectoryView(c as unknown as IDirectory));

    if (directory.files.length > 0 && !(directory.files[0] instanceof Types.ObjectId))
        f = directory.files.map(f  => toFileView(f as unknown as IFile));

    return {
        id: directory.id,
        name: directory.name,
        owner: toUserView(directory.owner as unknown as IUser),
        //parents: directory.parents,
        children: c,
        files: f,
    };
}