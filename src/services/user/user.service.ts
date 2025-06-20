import to from 'await-to-js';

import {IUser} from '../../databases/model/user.model';
import UserModel from '../../databases/schema/user.schema';
import ProductModel from '../../databases/schema/product.schema';
import AddressModel from '../../databases/schema/address.schema';
import {MongooseErrorCodes, MongooseErrors,} from '../../shared/enums/db/mongodb-errors.enum';
import {ErrorMessages} from '../../shared/enums/messages/error-messages.enum';
import {
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    NotFoundException, UnauthorizedException
} from '../../shared/exceptions/http.exceptions';
import {UserResponseDTO} from '../../shared/models/DTO/userResponseDTO';
import {IMongooseError} from '../../shared/models/extensions/errors.extension';
import bcrypt from 'bcryptjs'
import {generateJwtToken} from '../../shared/helpers/auth.helper';
import {TokenResponseDTO} from '../../shared/models/DTO/tokenResponseDTO';
import {AddressResponseDTO} from '../../shared/models/DTO/AddressResponseDTO';
import {IAddress} from '../../databases/model/address.model';
import {PaginateResult} from 'mongoose';
import {UserAccountTypes, UserRoles} from '../../shared/enums/db/user.enum';
import {OAuth2Client} from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_0AUTH_CLIENT_ID);

// POST /api/v1/users/signup
export const createNewUser = async (
    userData: IUser
): Promise<TokenResponseDTO> => {

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = new UserModel({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: UserRoles.USER,
        accountType: UserAccountTypes.PASSWORD
    });

    const [error] = await to(newUser.save());

    if (error && MongooseErrors.MongoServerError) {
        // this conversion is needed because Error class does not have code property
        const mongooseError = error as IMongooseError;

        if (mongooseError.code === MongooseErrorCodes.UniqueConstraintFail) {
            throw new ConflictException(ErrorMessages.DuplicateEntryFail);
        } else {
            throw new InternalServerErrorException(ErrorMessages.CreateFail);
        }
    }

    const token = generateJwtToken(newUser);
    return TokenResponseDTO.toResponse(newUser, token);
};

// POST /api/v1/users/signup
export const createNewGoogleUser = async (
    idToken: string
): Promise<TokenResponseDTO> => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_0AUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
        throw new UnauthorizedException('Invalid Google token');
    }

    const newUserEmail = payload.email;
    const newUserUsername = payload.name;

    const [findError, existingUser] = await to(
        UserModel.findOne({
            email: newUserEmail,
            accountType: UserAccountTypes.GOOGLE
        }).populate(['cart', 'wishlist'])
    );

    if (existingUser) {
        throw new UnauthorizedException('Already has a account associated with this Google account');
    }

    if (findError) {
        throw new InternalServerErrorException(ErrorMessages.CreateFail);
    }

    const newUser = new UserModel({
        username: newUserUsername,
        email: newUserEmail,
        role: UserRoles.USER,
        accountType: UserAccountTypes.GOOGLE
    });

    const [error] = await to(newUser.save());

    if (error && MongooseErrors.MongoServerError) {
        // this conversion is needed because Error class does not have code property
        const mongooseError = error as IMongooseError;

        if (mongooseError.code === MongooseErrorCodes.UniqueConstraintFail) {
            throw new ConflictException(ErrorMessages.DuplicateEntryFail);
        } else {
            throw new InternalServerErrorException(ErrorMessages.CreateFail);
        }
    }

    const token = generateJwtToken(newUser);
    return TokenResponseDTO.toResponse(newUser, token);
};

// POST /api/v1/users/signin
export const signInUser = async (
    userData: IUser
): Promise<TokenResponseDTO> => {

    const [error, existingUser] = await to(
        UserModel.findOne({username: userData.username})
            .select('+password')
            .populate([
                {path: 'cart'},
                {path: 'wishlist'},
            ])
            .lean()
    );

    if (!existingUser) {
        throw new NotFoundException(`Didn't find account with username: ${userData.username}`);
    }

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.GetFail);
    }

    const isPasswordValid = await bcrypt.compare(userData.password, existingUser.password);
    if (!isPasswordValid) {
        throw new UnauthorizedException('Password is incorrect');
    }

    const token = generateJwtToken(existingUser);
    return TokenResponseDTO.toResponse(existingUser, token);
}

export const signinWithGoogle = async (idToken: string): Promise<TokenResponseDTO> => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_0AUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
        throw new UnauthorizedException('Invalid Google token');
    }

    const userEmail = payload.email;

    const [error, existingUser] = await to(
        UserModel.findOne({
            email: userEmail,
            accountType: UserAccountTypes.GOOGLE
        }).populate(['cart', 'wishlist'])
    );

    if (!existingUser) {
        throw new UnauthorizedException('Could not find any account associated with this Google account');
    }

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.CreateFail);
    }

    const token = generateJwtToken(existingUser);
    return TokenResponseDTO.toResponse(existingUser, token);
};

// GET /api/v1/users
export const retrieveUsers = async (
    page: number,
    limit: number,
): Promise<PaginateResult<UserResponseDTO>> => {

    const [error, result] = await to(UserModel.paginate({}, { page, limit }));

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.GetFail);
    }

    return {
        ...result,
        docs: result.docs.map((user) => UserResponseDTO.toResponse(user))
    };
};

// GET /api/v1/users/:id
export const retrieveUserById = async (
    id: string
): Promise<UserResponseDTO> => {
    const [error, existingUser] = await to(
        UserModel.findById(id)
            .populate([
                {path: 'cart'},
                {path: 'wishlist'},
            ])
            .lean()
    );

    if (!existingUser) {
        throw new NotFoundException(`User with id: ${id} was not found!`);
    }

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.GetFail);
    }

    return UserResponseDTO.toResponse(existingUser);
};

// PATCH /api/v1/users/cart/:id
export const addCartItem = async (
    userId: string,
    productId: string
): Promise<UserResponseDTO> => {

    const [userError, existingUser] = await to(UserModel.findById(userId));

    if (!existingUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    const [productError, existingProduct] = await to(ProductModel.findById(productId))

    if (!existingProduct) {
        throw new NotFoundException(`Product with id: ${productId} was not found!`);
    }

    if (userError ?? productError) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    const isProductInCart = existingUser.cart.some((cartItem) => cartItem.toString() === existingProduct._id.toString());

    if (isProductInCart) {
        throw new ConflictException('Product is already in cart');
    }

    const [error, updatedUser] = await to(
        UserModel.findOneAndUpdate(
            { _id: userId },
            { $push: { cart: productId } },
            { new: true }
        )
            .populate([
                {path: 'cart'},
                {path: 'wishlist'},
            ])
            .lean()
    );

    if (!updatedUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    return UserResponseDTO.toResponse(updatedUser);
}

// PATCH /api/v1/users/wishlist/:id
export const addWishlistItem = async (
    userId: string,
    productId: string
): Promise<UserResponseDTO> => {

    const [userError, existingUser] = await to(UserModel.findById(userId));

    if (!existingUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    const [productError, existingProduct] = await to(ProductModel.findById(productId))

    if (!existingProduct) {
        throw new NotFoundException(`Product with id: ${productId} was not found!`);
    }

    if (userError ?? productError) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    const isProductInCart = existingUser.wishlist.some((wishlistItem) => wishlistItem.toString() === existingProduct._id.toString());

    if (isProductInCart) {
        throw new ConflictException('Product is already in wishlist');
    }

    const [error, updatedUser] = await to(
        UserModel.findOneAndUpdate(
            { _id: userId },
            { $push: { wishlist: productId } },
            { new: true }
        )
            .populate([
                {path: 'cart'},
                {path: 'wishlist'},
            ])
            .lean()
    );

    if (!updatedUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    return UserResponseDTO.toResponse(updatedUser);
}

// DELETE /api/v1/users/cart/:id
export const removeCartItem = async (
    userId: string,
    productId: string
): Promise<UserResponseDTO> => {

    const [userError, existingUser] = await to(UserModel.findById(userId));

    if (!existingUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    const [productError, existingProduct] = await to(ProductModel.findById(productId))

    if (!existingProduct) {
        throw new NotFoundException(`Product with id: ${productId} was not found!`);
    }

    if (userError ?? productError) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    const isProductInCart = existingUser.cart.some((cartItem) => cartItem.toString() === existingProduct._id.toString());

    if (!isProductInCart) {
        throw new ConflictException('Product is not in cart');
    }

    const [error, updatedUser] = await to(
        UserModel.findOneAndUpdate(
            { _id: userId },
            { $pull: { cart: productId } },
            { new: true }
        )
            .populate([
                {path: 'cart'},
                {path: 'wishlist'},
            ])
            .lean()
    );

    if (!updatedUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    return UserResponseDTO.toResponse(updatedUser);
}

// DELETE /api/v1/users/wishlist/:id
export const removeWishlistItem = async (
    userId: string,
    productId: string
): Promise<UserResponseDTO> => {

    const [userError, existingUser] = await to(UserModel.findById(userId));

    if (!existingUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    const [productError, existingProduct] = await to(ProductModel.findById(productId))

    if (!existingProduct) {
        throw new NotFoundException(`Product with id: ${productId} was not found!`);
    }

    if (userError ?? productError) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    const isProductInCart = existingUser.wishlist.some((wishlistItem) => wishlistItem.toString() === existingProduct._id.toString());

    if (!isProductInCart) {
        throw new ConflictException('Product is not in wishlist');
    }

    const [error, updatedUser] = await to(
        UserModel.findOneAndUpdate(
            { _id: userId },
            { $pull: { wishlist: productId } },
            { new: true }
        )
            .populate([
                {path: 'cart'},
                {path: 'wishlist'},
            ])
            .lean()
    );

    if (!updatedUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    return UserResponseDTO.toResponse(updatedUser);
}

// GET /api/v1/users/addresses
export const retrieveUserAddresses = async (
    userId: string,
): Promise<AddressResponseDTO[]> => {

    const [error, existingUser] = await to(UserModel.findById(userId).populate('addresses'));

    if (!existingUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    if (error) {
        throw new InternalServerErrorException(ErrorMessages.GetFail);
    }

    return  existingUser.addresses.map(address => AddressResponseDTO.toResponse(address))
}

// POST /api/v1/users/addresses
export const createNewUserAddress = async (
    addressData: IAddress,
    userId: string,
): Promise<AddressResponseDTO[]> => {

    const user = await UserModel.findById(userId).populate('addresses');

    if (!user) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    if (user.addresses.length >= 3) {
        throw new BadRequestException('You can only save up to 3 addresses.');
    }

    const newAddress = new AddressModel({
        fullName: addressData.fullName,
        mobileNumber: addressData.mobileNumber,
        houseNo: addressData.houseNo,
        street: addressData.street,
        city: addressData.city,
        postalCode: addressData.postalCode,
    });

    const [error] = await to(newAddress.save());

    if (error && MongooseErrors.MongoServerError) {
        // this conversion is needed because Error class does not have code property
        const mongooseError = error as IMongooseError;

        if (mongooseError.code === MongooseErrorCodes.UniqueConstraintFail) {
            throw new ConflictException(ErrorMessages.DuplicateEntryFail);
        } else {
            throw new InternalServerErrorException(ErrorMessages.CreateFail);
        }
    }

    const [updateError, updatedUser] = await to(
        UserModel.findOneAndUpdate(
            { _id: userId },
            { $push: { addresses: newAddress } },
            { new: true }
        )
            .populate('addresses')
    );

    if (!updatedUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    if (updateError) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    return updatedUser.addresses.map(address => AddressResponseDTO.toResponse(address))
};

// PATCH /api/v1/users/addresses/:addressId
export const updateUserAddress = async (
    userId: string,
    addressId: string,
    updatedData: IAddress
): Promise<AddressResponseDTO[]> => {
    const user = await UserModel.findOne({ _id: userId, addresses: addressId });

    if (!user) {
        throw new UnauthorizedException('You do not have permission to update this address.');
    }

    const [updateError, updatedAddress] = await to(
        AddressModel.findByIdAndUpdate(
            addressId, updatedData, { new: true, runValidators: true }
        )
    );

    if (updateError) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    if (!updatedAddress) {
        throw new NotFoundException(`Address with id: ${addressId} not found.`);
    }

    const updatedUser = await UserModel.findById(userId).populate('addresses');

    if (!updatedUser) {
        throw new NotFoundException(`User with id: ${userId} was not found!`);
    }

    return updatedUser.addresses.map(address => AddressResponseDTO.toResponse(address));
};

// DELETE /api/v1/users/addresses/:addressId
export const deleteUserAddress = async (
    userId: string,
    addressId: string,
): Promise<AddressResponseDTO[]> => {
    const user = await UserModel.findOne({ _id: userId, addresses: addressId });

    if (!user) {
        throw new UnauthorizedException('You do not have permission to delete this address.');
    }

    const [userUpdateError, updatedUser] = await to(
        UserModel.findByIdAndUpdate(
            userId,
            { $pull: { addresses: addressId } },
            { new: true }
        ).populate('addresses')
    );

    if (userUpdateError || !updatedUser) {
        throw new InternalServerErrorException(ErrorMessages.UpdateFail);
    }

    const [deleteError] = await to(AddressModel.findByIdAndDelete(addressId));

    if (deleteError) {
        throw new InternalServerErrorException(ErrorMessages.DeleteFail);
    }

    return updatedUser.addresses.map(address => AddressResponseDTO.toResponse(address));
};



// // PATCH /api/mongoose/users/:id
// export const updateUser = async (
//     id: string,
//     userData: Partial<IUser>
// ): Promise<UserResponseDTO> => {
//     const [error, updatedUser] = await to(UserModel.findOneAndUpdate(
//         {_id: id},
//         {$set: {...userData}},
//         {new: true}
//     ));
//
//     if (!updatedUser) {
//         throw new NotFoundException(`User with id: ${id} was not found!`);
//     }
//
//     if (error) {
//         throw new InternalServerErrorException(ErrorMessages.UpdateFail);
//     }
//
//     const userDTO = UserResponseDTO.toResponse(updatedUser);
//     return userDTO;
// };
//
// // PATCH /api/mongoose/users/change-password/:id
// export const updateUserPassword = async (
//     id: string,
//     newPassword: string
// ): Promise<UserResponseDTO> => {
//     const [error, updatedUser] = await to(UserModel.findOneAndUpdate(
//         {_id: id},
//         {$set: {password: newPassword}},
//         {new: true}
//     ));
//
//     if (!updatedUser) {
//         throw new NotFoundException(`User with id: ${id} was not found!`);
//     }
//
//     if (error) {
//         throw new InternalServerErrorException(ErrorMessages.UpdateFail);
//     }
//
//     const userDTO = UserResponseDTO.toResponse(updatedUser);
//     return userDTO;
// };
//
// // DELETE /api/mongoose/users:id
// export const deleteUser = async (id: string): Promise<void> => {
//     const [error, existingUser] = await to(UserModel.findById(id));
//
//     if (!existingUser) {
//         throw new NotFoundException(`User with id: ${id} was not found!`);
//     }
//
//     if (error) {
//         throw new InternalServerErrorException(ErrorMessages.DeleteFail);
//     }
//
//     await UserModel.findOneAndRemove({_id: id});
// };

