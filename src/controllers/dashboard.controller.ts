import {Request, Response, Router} from 'express';
import {authenticateUser, authorizeAdmin} from '../shared/middlewares/authentication.middleware';
import asyncHandler from 'express-async-handler';
import * as dashboardService from '../services/dashboard/dashboard.service';
import {CommonResponseDTO} from '../shared/models/DTO/CommonResponseDTO';
import {SuccessMessages} from '../shared/enums/messages/success-messages.enum';

const controller = Router();

controller

    .get(
        '/',
        authenticateUser,
        authorizeAdmin,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await dashboardService.getDashboardData();
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.GetSuccess, data));
        })
    )

export default controller;
