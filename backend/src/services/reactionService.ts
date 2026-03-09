import {INewReaction, IReaction} from "../data/interfaces/IReaction";
import Reaction from "../data/dao/ReactionSchema";
import Comment from "../data/dao/CommentSchema";
import {IComment} from "../data/interfaces/IComment";
import {toReactionVew} from "../data/types/ReactionView";


export async function getReactionById(reactionId: string) {

    const reaction = await Reaction.findById(reactionId).exec();

    if (reaction == null)
        return null;
    else
        return toReactionVew(reaction);
}

export async function getReactionByCommentAndUser(userId: string, commentId: string) {

    const reaction =  await Reaction.findOne({reactor: userId, comment: commentId}).exec();

    if (reaction == null)
        return null;
    else
        return toReactionVew(reaction);
}

export async function createOrUpdateReaction(reaction: INewReaction) {

    const r =  await Reaction.findOne({
        reactor: reaction.reactorId,
        comment: reaction.commentId
    }).exec();

    if (r != null)
        return { updated: true, reaction: await updateReaction(r, reaction.reactionType)};
    else
        return { updated: false, reaction: await createNewReaction(reaction)};
}

export async function createNewReaction(reaction: INewReaction) {

    const newReaction: IReaction = await Reaction.create(reaction);
    await newReaction.populate('comment');
    if(newReaction.populated('comment')) {
        const comment = newReaction.comment as unknown as IComment;
        comment.reactions.push(newReaction._id);
        await comment.save();
    }
    newReaction.depopulate('comment');
    return toReactionVew(newReaction);
}

export async function updateReaction(reaction: IReaction, newReactionType: string) {
    reaction.reactionType = newReactionType;

    const r = await Reaction.findByIdAndUpdate(reaction._id, reaction, {new: true}).exec();

    if (r == null)
        return null;
    else
        return toReactionVew(r);
}

export async function deleteReaction(reactionId: string) {

    const reaction = await Reaction.findByIdAndDelete(reactionId).exec();

    if (reaction == null)
        return null;
    else
        return toReactionVew(reaction);
}