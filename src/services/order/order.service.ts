import {IOrder} from '../../databases/model/order.model';
import UserModel from '../../databases/schema/user.schema';
import OrderModel from '../../databases/schema/order.schema';
import AddressModel from '../../databases/schema/address.schema';
import to from 'await-to-js';
import {
    ConflictException,
    InternalServerErrorException,
    NotFoundException
} from '../../shared/exceptions/http.exceptions';
import {ErrorMessages} from '../../shared/enums/messages/error-messages.enum';
import {MongooseErrorCodes, MongooseErrors} from '../../shared/enums/db/mongodb-errors.enum';
import {IMongooseError} from '../../shared/models/extensions/errors.extension';
import {hashPaymentDetails} from '../../shared/helpers/payment-hash.helper';
import {PaymentHashResponseDTO} from '../../shared/models/DTO/PaymentHashResponseDTO';
import {UserResponseDTO} from '../../shared/models/DTO/userResponseDTO';
import {OrderPaymentStatus, OrderStatus} from '../../shared/enums/db/order.enum';
import {OrderResponseDTO} from '../../shared/models/DTO/OrderResponseDTO';
import {PaginateResult} from 'mongoose';

export const initializeNewOrder = async (
    orderData: IOrder,
    userId: string,
): Promise<PaymentHashResponseDTO> => {

    const [userError, existingUser] = await to(UserModel.findById(userId));

    if (!existingUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    if (userError) {
        throw new InternalServerErrorException(ErrorMessages.CreateFail);
    }

    const [addressError, existingAddress] = await to(AddressModel.findById(orderData.address._id));

    if (!existingAddress) {
        throw new NotFoundException(`Address with id: ${orderData.address._id} was not found!`);
    }

    if (addressError) {
        throw new InternalServerErrorException(ErrorMessages.CreateFail);
    }

    const newOrder = new OrderModel({
        date: new Date(),
        amount: orderData.amount,
        paymentStatus: OrderPaymentStatus.PENDING,
        user: existingUser._id,
        address: existingAddress._id,
        status: OrderStatus.PROCESS,
        orderItems: orderData.orderItems.map(item => ({
            id: item.product._id,
            name: item.product.name,
            image: item.product.image,
            price: item.product.price,
            newPrice: item.product.newPrice,
            qty: item.qty,
        }))
    });

    const [error] = await to(newOrder.save());

    if (error && MongooseErrors.MongoServerError) {
        // this conversion is needed because Error class does not have code property
        const mongooseError = error as IMongooseError;

        if (mongooseError.code === MongooseErrorCodes.UniqueConstraintFail) {
            throw new ConflictException(ErrorMessages.DuplicateEntryFail);
        } else {
            throw new InternalServerErrorException(ErrorMessages.CreateFail);
        }
    }

    const hash = hashPaymentDetails(String(newOrder._id), newOrder.amount);

    return PaymentHashResponseDTO.toResponse(newOrder, hash);
}


export const completeOrderPayment = async (
    orderData: IOrder,
): Promise<UserResponseDTO | void> => {
    const [updateError, updatedOrder] = await to(
        OrderModel.findByIdAndUpdate(
            orderData._id,
            { paymentStatus: orderData.paymentStatus },
            { new: true }
        )
    );

    if (!updatedOrder) {
        throw new NotFoundException(`Order with id: ${orderData._id} was not found!`);
    }

    if (updateError) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    if (orderData.paymentStatus === OrderPaymentStatus.SUCCESS) {
        const [error, updatedUser] = await to(
            UserModel.findOneAndUpdate(
                { _id: updatedOrder.user._id },
                { $set: { cart: [] } },
                { new: true }
            )
                .populate([
                    { path: 'cart' },
                    { path: 'wishlist' },
                ])
                .lean()
        );

        if (!updatedUser) {
            throw new NotFoundException(`User with id: ${updatedOrder.user._id} was not found!`);
        }

        if (error) {
            throw new InternalServerErrorException(ErrorMessages.CreateFail);
        }

        return UserResponseDTO.toResponse(updatedUser);
    }
};

export const retrieveAllOrders = async (
    page: number,
    limit: number,
): Promise<PaginateResult<OrderResponseDTO>> => {

    const [error, result] = await to(OrderModel.paginate({}, { page, limit }));

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.GetFail);
    }

    return {
        ...result,
        docs: result.docs.map((order) => OrderResponseDTO.toResponse(order))
    };
}

export const retrieveUserOrders = async (
    userId: string,
    page: number,
    limit: number,
): Promise<PaginateResult<OrderResponseDTO>> => {

    const [error, result] = await to(OrderModel.paginate(
        {
            user: userId,
            paymentStatus: OrderPaymentStatus.SUCCESS
        },
        {
            page,
            limit,
            sort: { date: -1 }
        }
    ));

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.GetFail);
    }

    return {
        ...result,
        docs: result.docs.map((order) => OrderResponseDTO.toResponse(order))
    };
}

export const retrieveOrderById = async (
    id: string
): Promise<OrderResponseDTO> => {
    const [error, existingOrder] = await to(
        OrderModel.findById(id)
            .populate({path: 'user'})
            .lean()
    );

    if (!existingOrder) {
        throw new NotFoundException(`User with id: ${id} was not found!`);
    }

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.GetFail);
    }

    return OrderResponseDTO.toResponse(existingOrder);
};

export const updateOrderStatus = async (
    orderId: string,
    orderStatus: OrderStatus,
): Promise<OrderResponseDTO> => {
    const [updateError, updatedOrder] = await to(
        OrderModel.findByIdAndUpdate(
            orderId,
            { status: orderStatus },
            { new: true }
        )
    );

    if (!updatedOrder) {
        throw new NotFoundException(`Order with id: ${orderId} was not found!`);
    }

    if (updateError) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    return OrderResponseDTO.toResponse(updatedOrder);
};

