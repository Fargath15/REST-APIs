import { scheduleJob } from "node-schedule";
import { UserLogCronService } from "./events/user_log.cron.service";

export class CronService {
    public static StartContentPublisherCron() {
        let removeExpiredLogs = scheduleJob("Remove_Expired_Logs_Cron_Handler ", "* * * * *", UserLogCronService.removeExpiredLogs);
        console.log(removeExpiredLogs.name);
    }
}