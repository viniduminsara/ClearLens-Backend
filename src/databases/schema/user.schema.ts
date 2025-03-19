import mongoose, {Schema, model} from 'mongoose';
import {IUser} from '../model/user.model';
import Product from '../../databases/schema/product.schema';
import Address from '../../databases/schema/address.schema';

const schema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        cart: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: Product
            }
        ],
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: Product
            }
        ],
        addresses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: Address
            }
        ],
        role: {
            type: String,
            enum: ['USER', 'ADMIN'],
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

export default model<IUser>('User', schema);
