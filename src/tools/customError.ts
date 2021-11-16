export class ApiError implements Error {
    public name: "Api_Error";
    message: string;
    code: number;

    constructor(message: string, code: number) {
        this.message = message;
        this.code = code;
    }
}
