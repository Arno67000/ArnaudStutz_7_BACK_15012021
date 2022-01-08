export class ApiError implements Error {
    name: string;
    message: string;
    code: number;

    constructor(name: string, message: string, code: number) {
        this.name = name;
        this.message = message;
        this.code = code;
    }
}
