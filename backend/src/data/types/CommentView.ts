import {PlainResource} from "./PlainResource";
import {IComment} from "../interfaces/IComment";
import {toUserView, UserView} from "./UserView";
import {ReactionView} from "./ReactionView";
import {IUser} from "../interfaces/IUser";

export type CommentView = PlainResource<IComment, "file" | "commenter" | "reactions">
    & { commenter: UserView, reactions: Array<ReactionView>};

/**
 * Sets reactions to an empty array.
 * Expects populated commenter property.
 **/
export function toCommentView(comment: IComment): CommentView {

    return {
        id: comment.id,
        commenter: toUserView(comment.commenter as unknown as IUser),
        content: comment.content,
        edited: comment.edited,
        reactions: []
    }
}