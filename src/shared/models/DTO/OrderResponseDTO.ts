import {IUser} from '../../../databases/model/user.model';
import {IOrder, IOrderItem} from '../../../databases/model/order.model';

export class OrderResponseDTO {
    _id!: string;
    date!: Date;
    amount!: number;
    status!: 'PROCESS' | 'DELIVER' | 'COMPLETED';
    paymentStatus!: 'PENDING' | 'SUCCESS' | 'FAILED';
    user!: IUser
    orderItems!: IOrderItem[]

    static toResponse(order: IOrder) {
        const orderResponseDTO = new OrderResponseDTO();
        orderResponseDTO._id = order._id;
        orderResponseDTO.date = order.date;
        orderResponseDTO.amount = order.amount;
        orderResponseDTO.status = order.status;
        orderResponseDTO.paymentStatus = order.paymentStatus;
        orderResponseDTO.user = order.user;
        orderResponseDTO.orderItems = order.orderItems;

        return orderResponseDTO;
    }
}
