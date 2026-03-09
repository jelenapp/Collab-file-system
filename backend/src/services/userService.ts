import User from "../data/dao/UserSchema";
import {IUser, INewUser} from "../data/interfaces/IUser";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {sendVerificationEmail} from "../mailer/mailer"
import {toUserView, UserView} from "../data/types/UserView";
import {ReactionView} from "../data/types/ReactionView";

export async function createNewUser(user: INewUser) {

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await User.create({
        username: user.username,
        email: user.email,
        password: hashedPassword,
        verificationToken: verificationToken,
        verified: false,
    });

    await sendVerificationEmail(newUser.email, verificationToken);

    return toUserView(newUser);
}

export async function deleteUserWithId(uuid: string) {
    const user = await User.findByIdAndDelete(uuid).exec();

    if (user == null)
        return null;
    else
        return toUserView(user);
}

export async function getAllUsers() {

    const users = await User.find().exec();

    const views: Array<UserView> = [];
    for (const user of users) {
            views.push(toUserView(user));
    }
    return views;
}

export async function getUserById(uuid: string) {
    const user = await User.findById(uuid).exec();

    if (user == null)
        return null;
    else
        return toUserView(user);
}

export async function getUserWithUsername(username: string) {

    const user = await User.findOne({username: username}).exec();

    if (user == null)
        return null;
    else
        return toUserView(user);
}

export async function getUserWithEmail(email: string) {
    const user = await User.findOne({email: email}).exec();

    if (user == null)
        return null;
    else
        return toUserView(user);
}

export async function getUserByVerificationToken(verificationToken: string) {

    const user = await User.findOne({verificationToken: verificationToken}).exec();

    if (user == null)
        return null;
    else
        return toUserView(user);
}

export async function verifyUser(verificationToken: string) {

    const user: IUser | null = await User.findOne({verificationToken: verificationToken});

    if (user == null)
        return null;

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    return toUserView(user);
}

