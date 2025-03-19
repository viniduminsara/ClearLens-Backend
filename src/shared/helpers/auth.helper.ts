import {IUser} from '../../databases/model/user.model';
import jwt from 'jsonwebtoken';
import {InternalServerErrorException} from '../exceptions/http.exceptions';

export const generateJwtToken = (user: IUser) => {
    if (!process.env.JWT_SECRET) {
        throw new InternalServerErrorException('JWT_SECRET is not defined in environment variables');
    }
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d'});
}
