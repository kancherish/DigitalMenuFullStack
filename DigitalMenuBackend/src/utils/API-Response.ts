class ApiResponse {
    public statusCode: number;
    public data: any;
    public success: boolean;
    public message: string;

    constructor(statusCode: number, data: any, success: boolean, message: string) {
        this.statusCode = statusCode;
        this.data = data;
        this.success = success;
        this.message = message;
    }
}

export default ApiResponse