import {IUser} from '../../../databases/model/user.model';
import {IProduct} from '../../../databases/model/product.model';

export class UserResponseDTO {
    id!: string;
    username!: string;
    email!: string;
    cart!: IProduct[];
    wishlist!: IProduct[];

    static toResponse(user: IUser): UserResponseDTO {
        const userDTO = new UserResponseDTO();
        userDTO.id = user._id;
        userDTO.username = user.username;
        userDTO.email = user.email;
        userDTO.cart = user.cart;
        userDTO.wishlist = user.wishlist;

        return userDTO;
    }
}
