import File from "../data/dao/FileSchema"
import Directory from "../data/dao/DirectorySchema";
import {IFile, IFilePopulated, INewFile} from "../data/interfaces/IFile";
import {IDirectory} from "../data/interfaces/IDirectory";
import {IComment} from "../data/interfaces/IComment";
import {toFileView} from "../data/types/FileView";
import {toCommentView} from "../data/types/CommentView";


export async function createFile (file: INewFile) {

    const dir: IDirectory | null = await Directory.findById(file.parent).exec();

    if (dir != null) {
        let newFile: IFile | null = await File.create(file);
        if (newFile != null) {
            dir.files.push(newFile._id);
            await dir.save();
        }
        return toFileView(newFile);
    }
    return null;
}

export async function deleteFile(fileId: string) {

    const file: IFile | null = await File.findById(fileId).exec();
    if (file == null)
        return null;

    const parentDir: IDirectory | null = await Directory.findById(file.parent).exec();
    if (parentDir != null) {
        parentDir.files = parentDir.files.filter(fId => !fId.equals(file.id));
        await parentDir.save();
    }

    const result = await File.findByIdAndDelete(file.id)
        .populate(["owner", "comments"])
        .exec();

    if (result == null)
        return null;

    return toFileView(result);
}

export async function getFileById(fileId: string) {

    const file = await File.findById(fileId)
        .populate(["owner", "comments"])
        .exec();

    if (file == null)
        return null;

    return toFileView(file);
}

export async function getCommentsForFile(fileId: string) {

    const file = await File.findById(fileId)
        .select('comments')
        .populate("comments")
        .exec();

    if (file == null)
        return null;
    else
        return file.comments.map(c => toCommentView(c as unknown as IComment));
}

export async function getStateForFileWithId(fileId: string) {

    const file = await File.findById(fileId).select("yDocState").exec() as IFile | null;

    if(file == null)
        return null;
    else
        return file.yDocState
}

export async function setStateForFileWithId(fileId: string, documentState: Buffer) {

    const file = await File.findById(fileId).exec() as IFile | null;
    if(file != null) {
        file.yDocState = documentState;
        await file.save();
        return true;
    }
    else
        return false;
}