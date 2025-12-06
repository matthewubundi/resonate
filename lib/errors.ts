import { ZodError } from 'zod';

export function sanitizeError(error: any): { message: string; status: number } {
    const isDev = process.env.NODE_ENV === 'development';

    // Known error types
    if (error.message === 'Unauthorized') {
        return { message: 'Unauthorized', status: 401 };
    }

    if (error instanceof ZodError) {
        return {
            message: 'Validation failed',
            status: 400
        };
    }

    // Generic error for production
    return {
        message: isDev ? error.message : 'An error occurred. Please try again.',
        status: 500,
    };
}
