import { NextFunction, Request, Response } from 'express';
import * as ds from "../services/directoryService";
import {IFile} from "../data/interfaces/IFile";
import { matchedData } from "express-validator";
import { checkForValidationErrors } from "../middlewares/validation/checkForValidationErrors";
import {IDirectory, INewDirectory} from "../data/interfaces/IDirectory";
import {DirectoryView} from "../data/types/DirectoryView";
import {FileView} from "../data/types/FileView";


export async function createDirectory (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const dir: INewDirectory = {...matchedData(req) };
        const result: DirectoryView | null = await ds.createDirectory(dir);
        if (result)
            res.status(201).json({
                success: true,
                data: result,  
            });
        else
            res.status(400).json({
                success: false,
                message: "Couldn't create directory.",
            });
    }
    catch (err) {
        next(err);
    }
}

export async function deleteDirectory (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const { id } = matchedData(req);
        const result = await ds.deleteDirectory(id);
        //TODO: Mozda treba da se izmeni
        res.status(200).json({
                success: true,
                data: result,  
            });
    }
    catch (err) {
        next(err);
    }
}

export async function getUsersDirectories (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const { userId } = matchedData(req);
        const result: Array<DirectoryView> | null = await ds.getDirectoriesByOwnerId(userId);
        if (result != null)
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

export async function getUsersDirectoriesStructured (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const { userId } = matchedData(req);
        const result: Array<DirectoryView> | null = await ds.getDirectoriesStructured(userId);
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

export async function getDirectoryWithChildrenAndFiles(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const { id } = matchedData(req);
        const result: DirectoryView | null = await ds.getDirectoryWithChildrenAndFiles(id);
        if (result)
            res.status(200).json({
                success: true,
                data: result,  
            });
        else
            res.status(404).json({
                success: false,
                message: "Specified directory could not be found.",
                });
    }
    catch (err) {
        next(err);
    }  
}

export async function getUserRootDirectories(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const { userId } = matchedData(req);
        const result: Array<DirectoryView> | null = await ds.getUserRootDirectories(userId);

        if (result)
            res.status(200).json({
                success: true,
                data: result,  
            });
        else
            res.status(404).json({
                success: false,
                message: "Root directory not found.",
                });
    }
    catch (err) {
        next(err);
    }
}

export async function getFilesInDirectory(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const { id } = matchedData(req);
        const result: Array<FileView> | null = await ds.getFilesForDirectory(id);
        if (result)
            res.status(200).json({
                success: true,
                data: result,  
            });
        else
            res.status(404).json({
                success: false,
                message: "Specified directory could not be found.",
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
        const { id, children } = matchedData(req);
        const result: DirectoryView | null = await ds.addChildrenByIds(id, children);
        if (result)
            res.status(204).end();
        else
            res.status(404).json({
                success: false,
                message: "Directory not found.",
                });
    }
    catch (err){
        next(err);
    }
}

export async function removeFromChildrenByIds (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const { id, children } = matchedData(req);
        const result: DirectoryView | null = await ds.removeFromChildrenByIds(id, children);
        if (result)
            res.status(204).end();
        else
            res.status(404).json({
                success: false,
                message: "Directory not found.",
                });
    }
    catch (err){
        next(err);
    }
}

export async function addFilesByIds (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const { id, files } = matchedData(req);
        const result: DirectoryView | null = await ds.addFilesByIds(id, files);
        if (result)
            res.status(204).end();
        else
            res.status(404).json({
                success: false,
                message: "Directory not found.",
                });
    }
    catch (err) {
        next(err);
    }
}

export async function removeFromFilesByIds (req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const { id, files } = matchedData(req);
        const result: DirectoryView | null = await ds.removeFromFilesByIds(id, files);
        if (result)
            res.status(204).end();
        else
            res.status(404).json({
                success: false,
                message: "Directory not found.",
                });
    }
    catch (err){
        next(err);
    }
}