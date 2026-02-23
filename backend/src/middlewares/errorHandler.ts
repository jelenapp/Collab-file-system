import {Request, Response, NextFunction} from "express";
import {ENV} from "../config/config";

interface HttpError extends Error {
    status?: number;
}

export const errorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[Error] ${status}: ${message}`);

    res.status(status).json({
        success: false,
        message: message,
        stack: ENV === 'development' ? err.stack : undefined,
    });
};
