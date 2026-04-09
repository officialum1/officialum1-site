import { NextResponse } from 'next/server';

/**
 * Unified API Response wrapper for consistent error messages and success data.
 */
export class ApiResponse {
    static success(data: any = { success: true }, status: number = 200) {
        return NextResponse.json(data, { status });
    }

    static error(message: string, status: number = 400, details: any = null) {
        const response: any = {
            success: false,
            error: message
        };
        if (details) response.details = details;
        return NextResponse.json(response, { status });
    }

    static internalError(error: any) {
        console.error('API Internal Error:', error);
        return NextResponse.json({
            success: false,
            error: 'An internal server error occurred.',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }

    static unauthorized(message: string = 'Unauthorized access') {
        return NextResponse.json({
            success: false,
            error: message
        }, { status: 401 });
    }

    static badRequest(message: string = 'Invalid request parameters') {
        return NextResponse.json({
            success: false,
            error: message
        }, { status: 400 });
    }
}
