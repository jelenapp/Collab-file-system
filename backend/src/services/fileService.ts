import File from "../data/dao/FileSchema"
import Directory from "../data/dao/DirectorySchema";
import {IFile, IFilePopulated, INewFile} from "../data/interfaces/IFile";
import {IDirectory} from "../data/interfaces/IDirectory";
import {IComment} from "../data/interfaces/IComment";
import {CommentView} from "../data/types/CommentView";
import {getAllReactionsForComment} from "./commentService";
import {toUserView} from "../data/types/UserView";
import {toReactionVew} from "../data/types/ReactionView";
import {IReaction} from "../data/interfaces/IReaction";
import {IUser} from "../data/interfaces/IUser";


export async function createFile (file: INewFile): Promise<IFile | null> {

    const dir: IDirectory | null = await Directory.findById(file.parent).exec();

    if (dir != null) {
        let newFile: IFile | null = await File.create(file);
        if (newFile != null) {
            dir.files.push(newFile._id);
            await dir.save();
        }
        return newFile;
    }
    return null;
}

export async function deleteFile(fileId: string): Promise<IFile | null> {

    const file: IFile | null = await File.findById(fileId).exec();
    if (file == null)
        return null;

    const parentDir: IDirectory | null = await Directory.findById(file.parent).exec();
    if (parentDir != null) {
        parentDir.files = parentDir.files.filter(fId => !fId.equals(file.id));
        await parentDir.save();
    }

    return await File.findByIdAndDelete(file.id).exec();
}

export async function getFileById(fileId: string): Promise<IFile | null> {
    return await File.findById(fileId)
        .populate(["owner", "comments"])
        .exec();
}

export async function getCommentsForFile(fileId: string): Promise<Array<CommentView> | null> {

    const file = await File.findById(fileId)
    .populate({
        path: "comments",
        populate: { path: "commenter reactions" },
    })
    .exec() as IFilePopulated | null;

    if (file != null){

        const views: CommentView[] = [];

        for (const comment of file.comments) {
                views.push( {
                    id: comment.id,
                    edited: comment.edited,
                    content: comment.content,
                    commenter: toUserView(comment.commenter as unknown as IUser),
                    reactions: comment.reactions.map(r => toReactionVew(r as unknown as IReaction))
                }  as CommentView
            );
        }
        return views;
    }
    else
        return null;
}

export async function getStateForFileWithId(fileId: string): Promise<Buffer | null> {

    const file = await File.findById(fileId).exec() as IFile | null;

    if(file != null)
        return file.yDocState
    else
        return null;
}

export async function setStateForFileWithId(fileId: string, documentState: Buffer): Promise<boolean> {

    const file = await File.findById(fileId).exec() as IFile | null;
    if(file != null) {
        file.yDocState = documentState;
        await file.save();
        return true;
    }
    else
        return false;
}