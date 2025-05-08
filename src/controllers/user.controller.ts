import {Router, Request, Response} from 'express';
import asyncHandler from 'express-async-handler';
import * as userService from '../services/user/user.service';
import {SuccessMessages} from '../shared/enums/messages/success-messages.enum';
import {
    createUserValidator,
    IdValidator,
    signInUserValidator
} from '../shared/middlewares/user-validator.middleware';
import {authenticateUser, authorizeAdmin} from '../shared/middlewares/authentication.middleware';
import {CommonResponseDTO} from '../shared/models/DTO/CommonResponseDTO';

const controller = Router();

controller

    // GET /api/v1/users
    .get(
        '/',
        authenticateUser,
        authorizeAdmin,
        asyncHandler(async (req: Request, res: Response) => {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 9;

            const data = await userService.retrieveUsers(page, limit);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.GetSuccess, data));
        })
    )

    // GET /api/v1/users/userDetails
    .get(
        '/userDetails',
        authenticateUser,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await userService.retrieveUserById(req.user.id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.GetSuccess, data));
        })
    )

    // GET /api/v1/users/addresses
    .get(
        '/addresses',
        authenticateUser,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await userService.retrieveUserAddresses(req.user.id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.GetSuccess, data));
        })
    )

    // GET /api/v1/users/:id
    .get(
        '/:id',
        authenticateUser,
        IdValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await userService.retrieveUserById(req.params.id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.GetSuccess, data));
        })
    )

    // POST /api/v1/users/signup
    .post(
        '/signup',
        createUserValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await userService.createNewUser(req.body);
            res.status(201).send(new CommonResponseDTO(true, SuccessMessages.CreateSuccess, data));
        })
    )

    // POST /api/v1/users/signIn
    .post(
        '/signIn',
        signInUserValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await userService.signInUser(req.body);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.CreateSuccess, data));
        })
    )

    // POST /api/v1/users/addresses
    .post(
        '/addresses',
        authenticateUser,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await userService.createNewUserAddress(req.body, req.user.id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.CreateSuccess, data));
        })
    )

    // PATCH /api/v1/users/cart/:id
    .patch(
        '/cart/:id',
        authenticateUser,
        IdValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await userService.addCartItem(req.user.id ,req.params.id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.UpdateSuccess, data));
        })
    )

    // PATCH /api/v1/users/wishlist/:id
    .patch(
        '/wishlist/:id',
        authenticateUser,
        IdValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await userService.addWishlistItem(req.user.id ,req.params.id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.UpdateSuccess, data));
        })
    )

    // DELETE /api/v1/users/cart/:id
    .delete(
        '/cart/:id',
        authenticateUser,
        IdValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await userService.removeCartItem(req.user.id ,req.params.id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.DeleteSuccess, data));
        })
    )

    // DELETE /api/v1/users/wishlist/:id
    .delete(
        '/wishlist/:id',
        authenticateUser,
        IdValidator,
        asyncHandler(async (req: Request, res: Response) => {
            const data = await userService.removeWishlistItem(req.user.id ,req.params.id);
            res.status(200).send(new CommonResponseDTO(true, SuccessMessages.DeleteSuccess, data));
        })
    )

// // PATCH /api/mongoose/users/:id
// .patch(
//     '/:id',
//     getUserByIdValidator,
//     updateUserValidator,
//     asyncHandler(async (req: Request, res: Response) => {
//         const updatedUser = await userService.updateUser(req.params.id, req.body);
//         res.send(updatedUser);
//     })
// )
//
// // PATCH /api/mongoose/users/change-password/:id
// .patch(
//     '/change-password/:id',
//     getUserByIdValidator,
//     changePasswordValidator,
//     asyncHandler(async (req: Request, res: Response) => {
//         const updatedUser = await userService.updateUserPassword(
//             req.params.id,
//             req.body.new_password
//         );
//         res.send(updatedUser);
//     })
// )
//
// // DELETE /api/mongoose/users:id
// .delete(
//     '/:id',
//     getUserByIdValidator,
//     asyncHandler(async (req: Request, res: Response) => {
//         await userService.deleteUser(req.params.id);
//         res.send({message: SuccessMessages.UserRemoveSuccess});
//     })
// );

export default controller;
