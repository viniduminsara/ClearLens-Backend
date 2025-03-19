import to from 'await-to-js';
import ProductModel from '../../databases/schema/product.schema';
import {
    ConflictException,
    InternalServerErrorException,
    NotFoundException
} from '../../shared/exceptions/http.exceptions';
import {ErrorMessages} from '../../shared/enums/messages/error-messages.enum';
import {ProductResponseDTO} from '../../shared/models/DTO/productResponseDTO';
import { PaginateResult } from 'mongoose';
import {FileWithBuffer, IProduct} from '../../databases/model/product.model';
import {uploadImageToS3} from '../../shared/helpers/aws.helper';
import {MongooseErrorCodes, MongooseErrors} from '../../shared/enums/db/mongodb-errors.enum';
import {IMongooseError} from '../../shared/models/extensions/errors.extension';


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

// POST /api/v1/products
export const createNewProduct = async (
    productData: IProduct
): Promise<void> => {

    const imageUrl = await uploadImageToS3(productData.image as FileWithBuffer);

    const newProduct = new ProductModel({
        ...productData,
        image: imageUrl
    });

    const [error] = await to(newProduct.save());

    if (error && MongooseErrors.MongoServerError) {
        // this conversion is needed because Error class does not have code property
        const mongooseError = error as IMongooseError;

        if (mongooseError.code === MongooseErrorCodes.UniqueConstraintFail) {
            throw new ConflictException(ErrorMessages.DuplicateEntryFail);
        } else {
            throw new InternalServerErrorException(ErrorMessages.CreateFail);
        }
    }
};

// PUT /api/v1/products/:id
export const updateProduct = async (
    productId: string,
    updatedData: Partial<IProduct>
): Promise<void> => {
    // If there's a new image, upload it to S3
    if (updatedData.image) {
        updatedData.image = await uploadImageToS3(updatedData.image as FileWithBuffer);
    }

    const [error, updatedProduct] = await to(
        ProductModel.findByIdAndUpdate(productId, updatedData, { new: true })
    );

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    if (!updatedProduct) {
        throw new NotFoundException(ErrorMessages.NotFound);
    }
};

// DELETE /api/v1/products/:id
export const deleteProduct = async (productId: string): Promise<void> => {
    const [error, deletedProduct] = await to(ProductModel.findByIdAndDelete(productId));

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.DeleteFail);
    }

    if (!deletedProduct) {
        throw new NotFoundException(ErrorMessages.NotFound);
    }
};





