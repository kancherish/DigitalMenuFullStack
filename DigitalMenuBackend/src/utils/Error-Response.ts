interface ErrorDetail {
    field?: string;
    message: string;
    [key: string]: any;
}

class ErrorResponse extends Error {
    public statusCode: number;
    public message: string;
    public errors: ErrorDetail[];
    public stack?: string;

    constructor(
        statusCode: number,
        message: string = "Something went Wrong",
        errors: ErrorDetail[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ErrorResponse };