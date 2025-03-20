import mongoose, {Schema, model} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import {IProduct} from '../model/product.model';

const schema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        brand: { type: String, required: true },
        category: { type: String, required: true },
        gender: { type: String, required: true },
        weight: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        rating: { type: Number, required: false },
        price: { type: Number, required: true },
        newPrice: { type: Number, required: true },
        trending: { type: Boolean, required: false },
    },
    {
        timestamps: true,
    }
);

// Apply pagination plugin
schema.plugin(mongoosePaginate);

// Export as a paginated model
const Product = model<IProduct, mongoose.PaginateModel<IProduct>>('Product', schema);
export default Product;
