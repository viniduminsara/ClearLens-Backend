import to from 'await-to-js';
import ProductModel from '../../databases/schema/product.schema';
import {InternalServerErrorException, NotFoundException} from '../../shared/exceptions/http.exceptions';
import {ErrorMessages} from '../../shared/enums/messages/error-messages.enum';
import {ProductResponseDTO} from '../../shared/models/DTO/productResponseDTO';
import { PaginateResult } from 'mongoose';


// GET /api/v1/products
export const retrieveProducts = async (
    page: number,
    limit: number
): Promise<PaginateResult<ProductResponseDTO>> => {

    const [error, result] = await to(ProductModel.paginate({}, { page, limit }));

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.GetFail);
    }

    return {
        ...result,
        docs: result.docs.map((product) => ProductResponseDTO.toResponse(product))
    };
};

// GET /api/v1/products/:id
export const retrieveProductById = async (
    id: string
): Promise<ProductResponseDTO> => {
    const [error, existingProduct] = await to(
        ProductModel.findById(id).lean()
    );

    if (!existingProduct) {
        throw new NotFoundException(`Product with id: ${id} was not found!`);
    }

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.GetFail);
    }

    return ProductResponseDTO.toResponse(existingProduct);
};

// GET /api/v1/products/trending
export const retrieveTrendingProducts = async (): Promise<ProductResponseDTO[]> => {

    const [error, products] = await to(ProductModel.find({}).limit(4));

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.GetFail);
    }

    if (!products?.length) {
        return [];
    }

    return products.map((product) => ProductResponseDTO.toResponse(product));
};



