import { Document } from 'mongoose';

export interface IProduct extends Document {
    qty: number,
    name: string,
    description: string,
    brand: string,
    category: string,
    gender: string,
    weight: string,
    quantity: number,
    image: string,
    rating: number,
    price: number,
    newPrice: number,
    trending: boolean,
}
