import {IUser} from '../../../databases/model/user.model';
import {UserResponseDTO} from './userResponseDTO';

export class TokenResponseDTO {
    user!: UserResponseDTO;
    token!: string;

    static toResponse(user: IUser, token: string) {
        const userDTO = UserResponseDTO.toResponse(user);

        const tokenResponseDTO =  new TokenResponseDTO();
        tokenResponseDTO.user = userDTO;
        tokenResponseDTO.token = token;

        return tokenResponseDTO;
    }
}
