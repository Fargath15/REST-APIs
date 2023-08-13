import { getCustomRepository } from "typeorm";
import { Utils } from "../../Utils/utils.service";
import { UserLogRepository } from "../../repository/user_log.repository";

export class UserLogCronService {

    static userLogRepository: UserLogRepository;
    protected static GetUserLogRepository(): UserLogRepository {
        if (Utils.IsNull(UserLogCronService.userLogRepository)) {
            UserLogCronService.userLogRepository = getCustomRepository(UserLogRepository, process.env.DB_CONFIG);
        }
        return UserLogCronService.userLogRepository;
    }

    public static async removeExpiredLogs(fireDate: Date) {
        try {
            console.log("removeExpiredLogs_at: " + fireDate.toLocaleString());
            let user_logs = await UserLogCronService.GetUserLogRepository().find();
            for (let i = 0; i < user_logs.length; i++) {
                const user_log = user_logs[i];
                console.log("removeExpiredLogs:", i, user_log.user_id);
                await UserLogCronService.GetUserLogRepository().clearAllUserUserLog(user_log.user_id);
            }
        } catch (error) {
            console.log(error);
            console.log("removeExpiredLogs_error_exception", error);
        }
    }
}