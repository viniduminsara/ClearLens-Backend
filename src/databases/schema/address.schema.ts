import mongoose, {model} from 'mongoose';
import {IAddress} from '../model/address.model';

const schema = new mongoose.Schema<IAddress>({
    fullName: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    houseNo: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    }
});

export default model<IAddress>('Address', schema);
