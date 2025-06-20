import {Request, Response, Router} from 'express';
import asyncHandler from 'express-async-handler';
import * as orderService from '../services/order/order.service';
import {CommonResponseDTO} from '../shared/models/DTO/CommonResponseDTO';
import {SuccessMessages} from '../shared/enums/messages/success-messages.enum';
import {authenticateUser, authorizeAdmin} from '../shared/middlewares/authentication.middleware';
import {
    completePaymentValidator,
    createNewOrderValidator,
    updateOrderStatusValidator
} from '../shared/middlewares/order-validator.middleware';
import {IdValidator} from '../shared/middlewares/user-validator.middleware';
import {OrderStatus} from '../shared/enums/db/order.enum';
import {UserRoles} from '../shared/enums/db/user.enum';

const controller = Router();

controller
    // GET /api/v1/orders
    .get(
        '/',
        authenticateUser,
        asyncHandler(async (req: Request, res: Response) => {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 9;

            let data;
            if (req.user.role === UserRoles.ADMIN) {
                data = await orderService.retrieveAllOrders(page, limit);
            } else {
                data = await orderService.retrieveUserOrders(req.user.id, page, limit);
            }

            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.GetSuccess, data));
        })
    )

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

    // PATCH /api/v1/orders/complete
    .patch(
        '/complete',
        authenticateUser,
        completePaymentValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await orderService.completeOrderPayment(req.body);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.UpdateSuccess, data));
        })
    )

    // PATCH /api/v1/orders/:id/status
    .patch(
        '/:id/status',
        authenticateUser,
        authorizeAdmin,
        updateOrderStatusValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const { orderStatus } = req.query;
            const data = await orderService.updateOrderStatus(req.params.id, orderStatus as OrderStatus)
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.UpdateSuccess, data));
        })
    )

    // GET /api/v1/orders/:id
    .get(
        '/:id',
        authenticateUser,
        IdValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await orderService.retrieveOrderById(req.params.id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.GetSuccess, data));
        })
    )


export default controller;
