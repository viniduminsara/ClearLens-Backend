import {Document} from 'mongoose';
import {IProduct} from './product.model';
import {IAddress} from './address.model';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    cart: IProduct[],
    wishlist: IProduct[],
    addresses: IAddress[],
    role: 'USER' | 'ADMIN'
}
