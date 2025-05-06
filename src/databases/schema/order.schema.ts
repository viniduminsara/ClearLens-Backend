import mongoose, {model, Schema} from 'mongoose';
import {IOrder} from '../model/order.model';
import User from '../../databases/schema/user.schema';
import Address from '../../databases/schema/address.schema';
import {OrderPaymentStatus, OrderStatus} from '../../shared/enums/db/order.enum';
import mongoosePaginate from 'mongoose-paginate-v2';

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
            enum: OrderStatus,
        },
        paymentStatus: {
            type: String,
            enum: OrderPaymentStatus,
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
                _id: String,
                name: String,
                image: String,
                price: Number,
                newPrice: Number,
                qty: Number,
            }
        ]
    },
    {
        timestamps: true,
    }
)

// Apply pagination plugin
schema.plugin(mongoosePaginate);

// Export as a paginated model
const Order = model<IOrder, mongoose.PaginateModel<IOrder>>('Order', schema);
export default Order;

