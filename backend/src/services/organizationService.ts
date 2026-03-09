import {IOrganization, INewOrganization} from "../data/interfaces/IOrganization";
import Organization from "../data/dao/OrganizationSchema";
import {Types} from "mongoose";
import {deleteFile} from "./fileService"
import {createDirectory, deleteDirectory} from "./directoryService";
import {IDirectory} from "../data/interfaces/IDirectory";
import Directory from "../data/dao/DirectorySchema";
import {IUser} from "../data/interfaces/IUser";
import {NumberOfDeletions} from "../data/classes/NumberOfDeletions";
import {toOrganizationView} from "../data/types/OrganizationView";


export async function getOrganizationByName(orgName: string) {

    const org = await Organization.findOne({name: orgName})
        .populate(["children", "projections", "organizer"])
        .exec();

    if (org == null)
        return null;
    else
        return toOrganizationView(org);
}

export async function getOrganizationById(orgId: string) {

    const org = await Organization.findById(orgId)
        .populate(["children", "projections", "organizer"])
        .exec();

    if (org == null)
        return null;
    else
        return toOrganizationView(org);
}

export async function createOrganization(organization: INewOrganization) {

    const org = await Organization.create(organization);

    if (org == null)
        return null;

    await org.populate(["children", "projections", "organizer"]);
    return toOrganizationView(org);

}

export async function addChildrenByIds(organizationId: string, childrenIds: Array<string>) {

    const org: IOrganization | null = await Organization.findById(organizationId)
        .exec();

    if (org != null) {
        childrenIds = [...new Set(
            childrenIds.concat(
                org.children.map(child => child.toHexString())
            )
        )];

        org.children = childrenIds.map(childId =>
            new Types.ObjectId(childId)
        );
        await org.save();

        await org.populate(["children", "projections", "organizer"]);
        return toOrganizationView(org);
    }
    return null;
}

export async function removeFromChildrenByIds(organizationId: string, childrenIdsToRemove: Array<string>) {

    const org: IOrganization | null = await Organization.findById(organizationId);

    if (org != null) {
        const toRemove = new Set(childrenIdsToRemove);
        const childrenIds = org.children
            .map(child => child.toHexString())
            .filter(el => !toRemove.has(el));

        org.children = childrenIds.map(childId =>
            new Types.ObjectId(childId)
        );
        await org.save();

        await org.populate(["children", "projections", "organizer"]);
        return toOrganizationView(org);
    }
    return null;
}

export async function addMembersByIds(organizationId: string, membersIdsAndPrivileges: Map<string, string>) {

    const org: IOrganization | null = await Organization.findById(organizationId)
        .populate(["children", "projections", "organizer"])
        .exec();

    if (org != null) {
        membersIdsAndPrivileges.forEach((value, key) => org.members.set(key, value));
        await org.save()

        return toOrganizationView(org);
    }

    return null;
}

export async function removeFromMembersByIds(organizationId: string, membersIdsToRemove: Array<string>) {

    const org: IOrganization | null = await Organization.findById(organizationId)
        .exec();

    if (org != null) {

        membersIdsToRemove.forEach(memberId => {
            org.members.delete(memberId);
        });

        await org.save();

        await org.populate(["children", "projections", "organizer"]);

        return toOrganizationView(org);
    }

    return null;
}


//TODO: revisit this function <too sleepy to think>
export async function addProjectionsByIds(organizationId: string, projectionsIds: Array<string>) {

    const org: IOrganization | null = await Organization.findById(organizationId)
        .select('projections')
        .populate('projections')
        .exec()

    if (org == null)
        return null;

    const projectionsDict = new Map<string, IDirectory>();

    org.projections.forEach(projection => {
        const proj = projection as unknown as IDirectory;
        projectionsDict.set(proj.name, proj);
    });

    const projections: Array<IDirectory> = await Directory.find({_id: {$in: projectionsIds}})
        .select('owner')
        .populate('owner')
        .exec();

    for (const projection of projections) {

        const owner = projection.owner as unknown as IUser;

        if (projectionsDict.has(owner.username)) {

            const dir = projectionsDict.get(owner.username)
            if (dir) {
                dir.children = [...new Set(dir.children.concat(projection._id as Types.ObjectId))];
                await dir.save();

                projection.parents = [...new Set(projection.parents.concat(dir._id as Types.ObjectId))];
            }
        } else {

            let newDirectory = await Directory.create({
                name: owner.username,
                owner: owner.id,

                parents: [org.id],
            });

            const parentDirectories: Array<IDirectory> | null = await Directory.find({_id: {$in: newDirectory.parents}})
                .select('children')
                .exec();

            for (const parentDirectory of parentDirectories) {
                parentDirectory.children.push(newDirectory._id as Types.ObjectId)
                await parentDirectory.save()
            }

            await addChildrenByIds(newDirectory.id, [projection.id]);
            projection.parents.push(newDirectory._id);
            org.projections.push(newDirectory._id);

        }

        await projection.save();
    }

    await org.save();

    return toOrganizationView(org);
}

//TODO: revisit this function <too sleepy to think>
export async function removeFromProjectionsByIds(organizationId: string, projectionsIdsToRemove: Array<string>) {

    const org: IOrganization | null = await Organization.findById(organizationId)
        .populate('projections')
        .select('projections');

    if (org == null)
        return null;

    if (org.projections.length == 0)
        return toOrganizationView(org);

    const mapOfProjections = new Map<string, IDirectory>();
    for (const projection of org.projections) {
        const proj = projection as unknown as IDirectory;
        mapOfProjections.set(proj.name, proj)
    }

    const toRemove = new Set(projectionsIdsToRemove);
    const projectionsToRemove: Array<IDirectory> | null = await Directory.find({_id: {$in: toRemove}})
        .populate(['owner', 'parents'])
        .select(['owner', 'parents']);

    if (projectionsToRemove.length == 0)
        return toOrganizationView(org);

    const mapOfProjectionsToRemove = new Map<string, Array<IDirectory>>();
    for (const projection of projectionsToRemove) {
        const proj = projection as unknown as IDirectory;
        const name = (proj.owner as unknown as IUser).username;
        if (mapOfProjectionsToRemove.has(name))
            mapOfProjectionsToRemove.get(name)?.push(proj);
        else
            mapOfProjectionsToRemove.set(name, [proj]);
    }

    for (const name_projection of mapOfProjections.entries()) {
        const childrenToRemove = mapOfProjectionsToRemove.get(name_projection[0]);
        if (childrenToRemove != null) {
            const forRemoval = new Set(...childrenToRemove.map(dir => dir.id));
            name_projection[1].children.map(childObjId => childObjId.toHexString())
                .filter(childId => !forRemoval.has(childId));
            if (name_projection[1].children.length == 0)
                await deleteDirectory(name_projection[1].id);
            else
                await name_projection[1].save();
        }
    }

    await org.save();

    return toOrganizationView(org);
}

export async function deleteOrganization(organizationId: string, applicantId: string) {

    const org = await Organization.findById(organizationId)
        .populate(['projections', 'members'])
        .exec() as Omit<IOrganization, "projections" | "members"> & {
        projections: Array<IDirectory>,
        members: Array<IUser>
    } | null;

    const numberOfDeletions = new NumberOfDeletions();

    if (org == null)
        return numberOfDeletions;

    if (org.organizer.toHexString() !== applicantId)
        return new Error('Only organizer can delete the organization.');

    for (const c of org.children) {
        numberOfDeletions.accumulate(await deleteDirectory(c.toHexString()));
    }

    for (const p of org.projections) {
        p.parents = p.parents.filter(el => el.toHexString() !== organizationId);
        // if(p.parents.length == 0) {
        //     numberOfDeletions.accumulate( await deleteDirectory(p.id) );
        // }
    }

    return numberOfDeletions;
}