export class CommonResponseDTO {

    success: boolean;
    message: string;
    body?: any;

    constructor(success: boolean, message: string, body?: any) {
        this.success = success;
        this.message = message;
        this.body = body;
    }
}
