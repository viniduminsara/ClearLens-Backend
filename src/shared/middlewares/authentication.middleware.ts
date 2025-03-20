import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import {InternalServerErrorException, UnauthorizedException} from '../exceptions/http.exceptions';

interface DecodedToken {
    id: string;
    email: string;
    role: string;
}

export const authenticateUser = asyncHandler(async (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    if (!process.env.JWT_SECRET) {
        throw new InternalServerErrorException('JWT_SECRET is not defined in environment variables');
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedException('Unauthorized: Missing or invalid token.');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

        req.user = { id: decoded.id, email: decoded.email, role: decoded.role }; // Attach user info to request
        next();
    } catch (error) {
        throw new UnauthorizedException('Unauthorized: Invalid token.');
    }
});

export const authorizeAdmin = asyncHandler(async (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    if (req.user?.role !== 'ADMIN') {
        throw new UnauthorizedException('Access denied: Admin Users only.');
    }
    next();
});
