import Comment from "../data/dao/CommentSchema";
import File from "../data/dao/FileSchema";
import User from "../data/dao/UserSchema";
import {IFile} from "../data/interfaces/IFile";
import {IComment, INewComment} from "../data/interfaces/IComment";
import {IUser} from "../data/interfaces/IUser";
import {IReaction} from "../data/interfaces/IReaction";
import {toCommentView} from "../data/types/CommentView";
import {ReactionView} from "../data/types/ReactionView";
import {toUserView} from "../data/types/UserView";

export async function getCommentById(commentId: string) {

    const comment = await Comment.findById(commentId)
        .populate("commenter")
        .exec();
    if (comment == null)
        return null;
    else
        return toCommentView(comment);
}

export async function createComment(comment: INewComment) {

    const commenter: IUser | null = await User.findById(comment.commenterId).exec();
    if(commenter == null)
        return Error("User not found!");

    const file: IFile | null = await File.findById(comment.fileId).exec();
    if(file == null)
        return Error("File not found!");

    const newComment: IComment = await Comment.create(comment);

    file.comments.push(newComment._id);
    await file.save();

    await newComment.populate("commenter");

    return toCommentView(newComment);
}

export async function updateComment(commentId: string, content: string) {

    const comment =  await Comment.findByIdAndUpdate(commentId,
        {
            content: content,
            edited: true
        },
        { new: true }
    ).populate("commenter").exec();

    if (comment == null)
        return null;
    else
        return toCommentView(comment);
}

export async function deleteComment(commentId: string) {

    const comment = await Comment.findByIdAndDelete(commentId)
        .populate("commenter")
        .exec();

    if (comment == null)
        return null;
    else
        return toCommentView(comment);
}

export async function getAllReactionsForComment(commentId: string): Promise<Array<ReactionView> | null> {

    const comment = await Comment.findById(commentId)
        .populate('reactions')
        .select('reactions')
        .lean()
        .exec() as IComment | null;

    if (comment == null)
        return [];

    const reactions = comment.reactions as unknown as Array<IReaction>;

    if (reactions == null || reactions.length == 0)
        return [];

    const views: ReactionView[] = [];

    for (const reaction of reactions) {
        const reactor: IUser | null = await User.findById(reaction.reactor);
        if (reactor != null)
            views.push( {
                    id: reaction.id,
                    reactionType: reaction.reactionType,
                    reactor: toUserView(reactor)
                } as ReactionView
            );
    }
    return views;
}
