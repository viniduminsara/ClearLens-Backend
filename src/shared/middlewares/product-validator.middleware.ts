import asyncHandler from 'express-async-handler';
import {NextFunction, Request, Response} from 'express';
import {BadRequestException} from '../exceptions/http.exceptions';

export const SearchTermValidator = asyncHandler(async (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    if (!req.query?.searchTerm)
        throw new BadRequestException('Required query parameter "searchTerm" is missing!');

    next();
});
