import {Request, Response, Router} from 'express';
import asyncHandler from 'express-async-handler';
import * as orderService from '../services/order/order.service';
import {CommonResponseDTO} from '../shared/models/DTO/CommonResponseDTO';
import {SuccessMessages} from '../shared/enums/messages/success-messages.enum';
import {authenticateUser} from '../shared/middlewares/authentication.middleware';
import {completePaymentValidator, createNewOrderValidator} from '../shared/middlewares/order-validator.middleware';

const controller = Router();

controller

    // POST /api/v1/orders/init
    .post(
        '/init',
        authenticateUser,
        createNewOrderValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await orderService.initializeNewOrder(req.body, req.user.id);
            res.status(201).send(new CommonResponseDTO(true, SuccessMessages.CreateSuccess, data));
        })
    )

    // PATCH /api/v1/orders/init
    .patch(
        '/complete',
        authenticateUser,
        completePaymentValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await orderService.completeOrderPayment(req.body);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.UpdateSuccess, data));
        })
    )


export default controller;
