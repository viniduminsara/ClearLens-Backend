import {Request, Response, Router} from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import * as productService from '../services/product/product.service';
import {CommonResponseDTO} from '../shared/models/DTO/CommonResponseDTO';
import {SuccessMessages} from '../shared/enums/messages/success-messages.enum';
import {IdValidator} from '../shared/middlewares/user-validator.middleware';
import {authenticateUser, authorizeAdmin} from '../shared/middlewares/authentication.middleware';

const upload = multer({ storage: multer.memoryStorage() });
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

    .post(
        '/',
        upload.single('image'),
        authenticateUser,
        authorizeAdmin,
        asyncHandler(async (req: Request, res: Response) => {
            const productData = {...req.body, image: req.file,};
            const data = await productService.createNewProduct(productData);
            res.status(201).send(new CommonResponseDTO(true, SuccessMessages.CreateSuccess, data));
        })
    )

    .patch(
        '/:id',
        upload.single('image'),
        authenticateUser,
        authorizeAdmin,
        asyncHandler(async (req: Request, res: Response) => {
            const { id } = req.params;
            const updatedData = { ...req.body, image: req.file };

            const data = await productService.updateProduct(id, updatedData);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.UpdateSuccess, data));
        })
    )

    .delete(
        '/:id',
        authenticateUser,
        authorizeAdmin,
        asyncHandler(async (req: Request, res: Response) => {
            const { id } = req.params;

            await productService.deleteProduct(id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.DeleteSuccess));
        })
    )



export default controller;
