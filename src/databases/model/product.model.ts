import { Document } from 'mongoose';

export interface FileWithBuffer {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
}

export interface IProduct extends Document {
    name: string,
    description: string,
    brand: string,
    category: string,
    gender: string,
    weight: string,
    quantity: number,
    image: string | FileWithBuffer,
    rating: number,
    price: number,
    newPrice: number,
    trending: boolean,
}
