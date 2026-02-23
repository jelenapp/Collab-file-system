import { validationResult } from 'express-validator';
import { Request, Response } from 'express';

export function checkForValidationErrors(req: Request, res: Response): boolean {

    const validationErrors = validationResult(req);
    const errorsExist = !validationErrors.isEmpty()
    if (errorsExist) {
        res.status(400).send({errors: validationErrors.array({onlyFirstError: false})}).end();
    }
    return errorsExist;
}