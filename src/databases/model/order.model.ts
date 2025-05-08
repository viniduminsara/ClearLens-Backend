import {Document} from 'mongoose';
import {IUser} from './user.model';
import {IAddress} from './address.model';
import {IProduct} from './product.model';
import {OrderPaymentStatus, OrderStatus} from '../../shared/enums/db/order.enum';

export interface IOrderItem {
    product: IProduct;
    qty: number;
}

export interface IOrder extends Document {
    date: Date;
    amount: number;
    status: OrderStatus;
    paymentStatus: OrderPaymentStatus;
    address: IAddress;
    user: IUser;
    orderItems: IOrderItem[]
}
