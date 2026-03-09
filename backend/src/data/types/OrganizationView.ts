import {PlainResource} from "./PlainResource";
import {IOrganization} from "../interfaces/IOrganization";
import {toUserView, UserView} from "./UserView";
import {IUser} from "../interfaces/IUser";
import {FileView, toFileView} from "./FileView";
import {Types} from "mongoose";
import {IDirectory} from "../interfaces/IDirectory";
import {IFile} from "../interfaces/IFile";
import {DirectoryView, toDirectoryView} from "./DirectoryView";


export type OrganizationView = PlainResource<IOrganization, "organizer" | "children" | "projections">
    & {
    organizer: UserView,
    children: Array<DirectoryView>,
    projections: Array<DirectoryView>,
    //members: Map<string, string>
    };

export function toOrganizationView(organization: IOrganization): OrganizationView{

    let c: Array<DirectoryView> = [];
    let p: Array<DirectoryView> = [];

    if (organization.children.length > 0 && !(organization.children[0] instanceof Types.ObjectId))
        c = organization.children.map(c => toDirectoryView(c as unknown as IDirectory));

    if (organization.projections.length > 0 && !(organization.projections[0] instanceof Types.ObjectId))
        p = organization.projections.map(p  => toDirectoryView(p as unknown as IDirectory));

    return {
        id: organization.id,
        name: organization.name,
        organizer: toUserView(organization.organizer as unknown as IUser),
        children: c,
        projections: p,
        members: organization.members,//TODO: revisit
    }
}