import Directory from "../data/dao/DirectorySchema";
import File from "../data/dao/FileSchema";
import User from "../data/dao/UserSchema";
import {IDirectory, INewDirectory} from "../data/interfaces/IDirectory";
import mongoose, {Types} from "mongoose"
import {IFile} from "../data/interfaces/IFile";
import {IUser} from "../data/interfaces/IUser";
import {NumberOfDeletions} from "../data/classes/NumberOfDeletions";
import {DirectoryView, toDirectoryView} from "../data/types/DirectoryView";
import {FileView, toFileView} from "../data/types/FileView";

export async function createDirectory (directory: INewDirectory) {

    let newDirectory = await Directory.create(directory);

    if(directory.parents.length > 0) {

        const parentDirectories: Array<IDirectory> | null = await Directory.find({ _id: {$in: directory.parents} })
            .select('children')
            .exec();

        for (const parentDirectory of parentDirectories) {
            parentDirectory.children.push(newDirectory._id as Types.ObjectId)
            await parentDirectory.save()
        }
    }

    newDirectory.populate(["files", "children", "owner"]);

    return toDirectoryView(newDirectory);
}

export async function deleteDirectory (directoryId: string) {

    const dir: IDirectory | null = await Directory.findById(directoryId).populate(['children', 'parents']).exec();

    const numberOfDeletions = new NumberOfDeletions();

    if (dir == null)
        return numberOfDeletions;

    if(dir.parents.length > 0){

        for(const p of dir.parents){
            const parentDir = p as unknown as IDirectory;

            parentDir.children = parentDir.children.filter(child => child.toHexString() != dir.id);
            await parentDir.save();
        }
    }

    if (dir.populated('children')) {

        let forDeletion: Array<IDirectory> = [dir, ...dir.children as unknown as Array<IDirectory>];

        while (forDeletion.length > 0) {

            let d = forDeletion.pop();

            if (d == undefined)
                continue;

            if (d.files.length > 0){
                for (const file of d.files) {
                    await File.findByIdAndDelete(file._id);
                    numberOfDeletions.filesDeleted++;
                }
            }

            await d.populate('children');
            if (d.children.length > 0 && d.populated('children')) {
                forDeletion.push(...d.children as unknown as Array<IDirectory>);
            }

            await Directory.findByIdAndDelete(d._id);
            numberOfDeletions.directoriesDeleted++;
        }
    }

    return numberOfDeletions;
}

export async function getDirectoriesByOwnerId (ownerId: string) {

    const dirs = await Directory.find({ owner: ownerId })
        .populate(["owner", "children", "files"])
        .exec();

    if (dirs == null)
        return [];

    const views: Array<DirectoryView> = dirs.map(d => toDirectoryView(d));
    return views;
}

export async function getDirectoryWithChildrenAndFiles(dirId: string) {

    const dir = await Directory.findById(dirId)
        .populate(["files", "children", "owner"])
        .exec();

    if (dir == null)
        return null;
    else
        return toDirectoryView(dir);
}

export async function getUserRootDirectories(ownerId: string) {

    const dirs = await Directory.find({ owner: ownerId, parents: [] })
        .populate(["files", "children", "owner"])
        .exec();

    if (dirs == null)
        return [];

    const views: Array<DirectoryView> = dirs.map(d => toDirectoryView(d));
    return views;
}

export async function getDirectoriesStructured (ownerId: string) {

    const owner: IUser | null = await User.findById(ownerId).exec();

    if (owner != null){
        const dirs: Array<IDirectory> = await Directory.find({
            owner: ownerId,
            parents: []
        });

        await populateChildrenIterative(dirs);
        // await populateChildrenRecursive(dirs);

        return dirs.map(d => toDirectoryView(d));
    }
    else
        return null;
}

async function populateChildrenIterative(directories: Array<IDirectory>){

    let dirs: Array<IDirectory> = directories.concat([]);

    while(dirs.length > 0) {
        let directory = dirs.pop();

        if (directory == undefined)
            continue;

        await directory.populate('children');

        if (directory.populated('children')) {
            dirs = dirs.concat(directory.children as unknown as Array<IDirectory>);
        }
    }
}

async function populateChildrenRecursive(directories: Array<IDirectory>) {

    if (directories.length < 0) {
        return
    }

    for (const directory of directories) {
        await directory.populate("children");

        if (directory.populated("children")) {
            await populateChildrenRecursive(directory.children as unknown as Array<IDirectory>);
        }
    }
}

export async function getFilesForDirectory(dirId: string) {

    const dir: IDirectory | null = await Directory.findById(dirId)
        .populate('files')
        .exec();

    let filesView: Array<FileView> | null = null;
    if (dir) {
        filesView = dir.files.map(f => toFileView(f as unknown as IFile));
    }
    return filesView;
}

export async function addChildrenByIds (directoryId: string, childrenIds: Array<string>) {

    const dir: IDirectory | null = await Directory.findById(directoryId).exec();

    if (dir != null) {

        const children = new Set(dir.children.map(x => x.toHexString()));
        const childrenToUpdate = childrenIds.filter(cId => !children.has(cId));

        dir.children = childrenToUpdate
            .concat(...children)
            .map(childId => new Types.ObjectId(childId));

        await dir.save();

        for (const childId of childrenToUpdate) {
            const child = await Directory.findById(childId).select('parents');
            if (child){
                child.parents.push(new Types.ObjectId(directoryId));
                await child.save();
            }
        }

        return toDirectoryView(dir);
    }

    return null;
}

export async function removeFromChildrenByIds (directoryId: string, childrenIdsToRemove: Array<string>) {

    const dir: IDirectory | null = await Directory.findById(directoryId);

    if (dir != null) {
        const toRemove = new Set(childrenIdsToRemove);
        const childrenIds = dir.children
            .map(child => child.toHexString())
            .filter(el => !toRemove.has(el));

        dir.children = childrenIds.map(childId =>
            new Types.ObjectId(childId)
        );
        await dir.save();

        for (const cId of childrenIdsToRemove) {
            const child = await Directory.findById(cId);
            if (child){
                child.parents = child.parents.filter(parentId => !parentId.equals(directoryId));
                await child.save();
            }
        }

        return toDirectoryView(dir);
    }
    return null;
}

export async function addFilesByIds (directoryId: string, filesIds: Array<string>) {

    const dir: IDirectory | null = await Directory.findById(directoryId);

    if (dir != null) {

        const files = new Set(dir.files.map(x => x.toHexString()));
        const filesToUpdate = filesIds.filter(fId => !files.has(fId));

        dir.files = filesToUpdate
            .concat(...files)
            .map(fileId => new Types.ObjectId(fileId));

        await dir.save();

        for (const fileId of filesToUpdate) {
            const file = await File.findById(fileId).select('parent');
            if (file){
                const oldParentId = file.parent;
                const oldParent = await Directory.findById(oldParentId).select('files');

                if (oldParent){
                    oldParent.files.filter(fId => !fId.equals(fileId));
                    await oldParent.save();
                }

                file.parent = new Types.ObjectId(directoryId);
                await file.save();
            }
        }

        return toDirectoryView(dir);
    }
    return null;
}


//!!!NEPOTREBNO!!! ali ga neka
export async function removeFromFilesByIds (directoryId: string, filesIdsToRemove: Array<string>) {

    const dir: IDirectory | null = await Directory.findById(directoryId);

    if (dir != null) {
        const toRemove = new Set(filesIdsToRemove);
        const filesIds = dir.files
            .map(file => file.toHexString())
            .filter(el => !toRemove.has(el));

        dir.files = filesIds.map(fileId =>
            new Types.ObjectId(fileId)
        );
        await dir.save();

        return toDirectoryView(dir);
    }
    return null;
}