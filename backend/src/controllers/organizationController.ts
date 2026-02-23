import { NextFunction, Request, Response } from "express";
import * as os from "../services/organizationService";
import { matchedData } from "express-validator";
import { checkForValidationErrors } from "../middlewares/validation/checkForValidationErrors";
import { INewOrganization } from "../data/interfaces/IOrganization";
import {OrganizationView} from "../data/types/OrganizationView";


export async function getOrganizationByName (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: {name: string} = matchedData(req);
        const result: OrganizationView | null = await os.getOrganizationByName(data.name);
        if (result)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "Organization not found.",
            });
    }
      catch (err) {
        next(err);
    }
}

export async function getOrganizationById(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: { id: string } = matchedData(req);
        const result: OrganizationView | null = await os.getOrganizationById(data.id);
        if (result)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "Organization not found.",
            });
    }
    catch (err) {
        next(err);
    }
}


export async function createOrganization(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const bodyObj = matchedData(req) as INewOrganization;
        const result: OrganizationView | null = await os.createOrganization(bodyObj);
       if (result != null)
           res.status(201).json({
               success: true,
               data: result,
           });
       else
            res.status(400).json({
                success: false,
                message: "Couldn't create organization.",
            });
    }
    catch (err) {
        next(err);
    }
}


export async function addChildrenByIds (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: {id: string, children: Array<string>} = matchedData(req);
        const result: OrganizationView | null = await os.addChildrenByIds(data.id, data.children);
        if (result)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(400).json({
                success: false,
                message: "Cant add children.",
            });
    }
   catch (err) {
        next(err);
    }
}


export async function removeFromChildrenByIds (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: {id: string, children: Array<string>} = matchedData(req);
        const result: OrganizationView | null = await os.removeFromChildrenByIds(data.id, data.children);
       if (result)
           res.status(200).json({
                success: true,
                data: result,
           });
       else
           res.status(404).json({
                success: false,
                message: "Cant remove children.",
           });
    }
   catch (err) {
        next(err);
    }
}

// export async function addFilesByIds (req: Request, res: Response, next: NextFunction) {
//
//     if (checkForValidationErrors(req, res))
//         return;
//
//     try {
//         const data: {organizationId: string, files: Array<string>} = matchedData(req);
//         const result = await os.addFilesByIds(data.organizationId, data.files);
//        if (result)
//             res.status(200).json({
//                 success: true,
//                 data: result,
//             });
//         else
//             res.status(404).json({
//                 success: false,
//                 message: "Cant find organization.",
//             });
//     }
//    catch (err) {
//         next(err);
//     }
// }
//
// export async function removeFromFilesByIds (req: Request, res: Response) {
//
//     if (checkForValidationErrors(req, res))
//         return;
//
//     try {
//         const bodyObj: {organizationId: string, files: Array<string>} = matchedData(req);
//         const org = await os.removeFromFilesByIds(bodyObj.organizationId, bodyObj.files);
//         if (org)
//             res.status(204).end();
//         else
//             res.status(404).send("Organization not found.").end();
//     }
//     catch (err){
//         console.error(err);
//         res.status(500).send("Internal server error occurred.").end();
//     }
// }

export async function addMembersByIds (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: {id: string, members: Map<string,string>} = matchedData(req);
        const result: OrganizationView | null = await os.addMembersByIds(data.id, data.members);
        if (result)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(400).json({
                success: false,
                message: "Can't add members.",
            });
    }
    catch (err) {
        next(err);
    }
}

export async function removeFromMembersByIds (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: {id: string, members: Array<string>} = matchedData(req);
        const result: OrganizationView | null = await os.removeFromMembersByIds(data.id, data.members);
        if (result)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
    }
    catch (err) {
        next(err);
    }
}

export async function addProjectionsByIds (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: {id: string, children: Array<string>} = matchedData(req);
        const result: OrganizationView | null = await os.addProjectionsByIds(data.id, data.children);
       if (result)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "Can't add projections.",
            });
    }
    catch (err) {
        next(err);
    }
}

export async function removeFromProjectionsByIds (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: {id: string, children: Array<string>} = matchedData(req);
        const result: OrganizationView | null = await os.removeFromProjectionsByIds(data.id, data.children);
        if (result)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "Can't remove projections.",
            });
    }
    catch (err) {
        next(err);
    }
}


export async function deleteOrganization (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: { id: string, userId: string} = matchedData(req);
        const result = await os.deleteOrganization(data.id, data.userId);
        if (result)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "Can't delete organization.",
            });
    }
    catch (err) {
        next(err);
    }
}