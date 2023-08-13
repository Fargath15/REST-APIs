import { IServiceResponse } from "../Utils/utils.service";
import { UserLog } from "../entity/user_log.entity";

export interface IUserLogsResponse extends IServiceResponse {
    user_logs: UserLog[];
}