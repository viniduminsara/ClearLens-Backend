import {IProduct} from '../../../databases/model/product.model';

export class ProductResponseDTO {
    _id!: number;
    name!: string;
    description!: string;
    brand!: string;
    category!: string;
    gender!: string;
    weight!: string;
    quantity!: number;
    image!: string;
    rating!: number;
    price!: number;
    newPrice!: number;

    static toResponse(product: IProduct): ProductResponseDTO {
        const productDTO = new ProductResponseDTO();
        productDTO._id = product._id;
        productDTO.name = product.name;
        productDTO.description = product.description;
        productDTO.brand = product.brand;
        productDTO.category = product.category;
        productDTO.gender = product.gender;
        productDTO.weight = product.weight;
        productDTO.quantity = product.quantity;
        productDTO.image = product.image as string;
        productDTO.rating = product.rating;
        productDTO.price = product.price;
        productDTO.newPrice = product.newPrice;

        return productDTO;
    }
}
