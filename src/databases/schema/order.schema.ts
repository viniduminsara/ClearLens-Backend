import {model, Schema} from 'mongoose';
import {IOrder} from '../model/order.model';
import User from '../../databases/schema/user.schema';
import Product from '../../databases/schema/product.schema';
import Address from '../../databases/schema/address.schema';

const schema = new Schema<IOrder>(
    {
        date: {
            type: Date,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['PROCESS', 'DELIVER', 'COMPLETED'],
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'SUCCESS', 'FAILED'],
            required: true,
        },
        address: {
            type: Schema.Types.ObjectId,
            ref: Address,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: User,
        },
        orderItems: [
            {
                product: { type: Schema.Types.ObjectId, ref: Product },
                qty: Number,
            }
        ]
    },
    {
        timestamps: true,
    }
)

export default model<IOrder>('Order', schema);

