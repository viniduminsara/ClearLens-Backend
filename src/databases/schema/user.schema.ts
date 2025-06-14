import mongoose, {Schema, model} from 'mongoose';
import {IUser} from '../model/user.model';
import Product from '../../databases/schema/product.schema';
import Address from '../../databases/schema/address.schema';
import mongoosePaginate from 'mongoose-paginate-v2';
import {UserRoles} from '../../shared/enums/db/user.enum';

const schema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            select: false
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
            enum: UserRoles,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

// Apply pagination plugin
schema.plugin(mongoosePaginate);

// Export as a paginated model
const User = model<IUser, mongoose.PaginateModel<IUser>>('User', schema);
export default User;
