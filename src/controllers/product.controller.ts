import {Request, Response, Router} from 'express';
import asyncHandler from 'express-async-handler';
import * as productService from '../services/product/product.service';
import {CommonResponseDTO} from '../shared/models/DTO/CommonResponseDTO';
import {SuccessMessages} from '../shared/enums/messages/success-messages.enum';
import {IdValidator} from '../shared/middlewares/user-validator.middleware';

const controller = Router();

controller

    .get(
        '/',
        asyncHandler(async (req: Request, res: Response) => {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 9;
            const data = await productService.retrieveProducts(page, limit);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.GetSuccess, data));
        })
    )

    .get(
        '/trending',
        asyncHandler(async (req: Request, res: Response) => {
            const data = await productService.retrieveTrendingProducts();
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.GetSuccess, data));
        })
    )

    .get(
        '/:id',
        IdValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await productService.retrieveProductById(req.params.id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.GetSuccess, data));
        })
    )

export default controller;
