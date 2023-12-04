import { Response } from 'express';
import { CustomError } from '../errors/CustomError';

export const handleError = (res: Response, error: unknown) => {
    console.error(error);

    if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
    } else {
        // Default to 500 Server Error for unknown error types
        res.status(500).json({ message: 'Server error' });
    }
};
