export enum ResponseStatus {
    Success = "Success",
    Failed = "Failed"
}
export interface IServiceResponse {
    error: string;
    status: ResponseStatus;
    message: string;
}

export class Utils {

    public static IsNullOrEmpty(value: string) {
        if (value === null || value === undefined || value == "") {
            return true;
        }
        return false;
    }

    public static IsNull(value: any) {
        if (value === undefined || value === null) {
            return true;
        }
        return false;
    }

    public static IsNullOrNan(value: number) {
        if (value === undefined || value === null || isNaN(value)) {
            return true;
        }
        return false;
    }

    public static IsNullOrEmptyArray(value: any[]) {
        if (value === null || value === undefined || value.length == 0) {
            return true;
        }
        return false;
    }
}