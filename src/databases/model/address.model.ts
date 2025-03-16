import { Document } from 'mongoose';

export interface IAddress extends Document {
    fullName: string;
    mobileNumber: string;
    houseNo: string;
    street: string;
    city: string;
    postalCode: string;
}
