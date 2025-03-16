import asyncHandler from 'express-async-handler';
import {NextFunction, Request, Response} from 'express';
import {BadRequestException} from '../exceptions/http.exceptions';
import to from 'await-to-js';
import {completePaymentValidationSchema, createOrderValidationSchema} from '../validators/order.joi.validator';


export const createNewOrderValidator = asyncHandler(async (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    if (!req.body)
        throw new BadRequestException('Missing request body!');

    // the validateAsync method is built into Joi
    const [error] = await to(createOrderValidationSchema.validateAsync(req.body));

    if (error)
        throw new BadRequestException(error.message);

    next();
});

export const completePaymentValidator = asyncHandler(async (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    if (!req.body)
        throw new BadRequestException('Missing request body!');

    // the validateAsync method is built into Joi
    const [error] = await to(completePaymentValidationSchema.validateAsync(req.body));

    if (error)
        throw new BadRequestException(error.message);

    next();
});
