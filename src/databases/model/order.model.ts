import {Document} from 'mongoose';
import {IUser} from './user.model';
import {IAddress} from './address.model';

export interface IOrderItem {
    product: string;
    qty: number;
}

export interface IOrder extends Document {
    date: Date;
    amount: number;
    status: 'PROCESS' | 'DELIVER' | 'COMPLETED';
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
    address: IAddress;
    user: IUser;
    orderItems: IOrderItem[]
}
