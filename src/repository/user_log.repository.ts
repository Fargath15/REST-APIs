import { EntityRepository, getConnection } from "typeorm";
import { UserLog } from "../entity/user_log.entity";
import { PGBaseRepository } from "./base.repository";

@EntityRepository(UserLog)
export class UserLogRepository extends PGBaseRepository<UserLog> {

    constructor() {
        super();
        this._repository = getConnection(process.env.DB_CONFIG).manager.getRepository(UserLog);
    }

    async saveUserLog(user_id: string, log_file: string): Promise<UserLog> {
        const user_log = await this._repository.create({
            user_id: user_id,
            log_file: log_file,
        });
        this.OnEntityCreated(user_log, user_id);
        return await this._repository.save(user_log);
    }

    async getUserLogs(user_id: string): Promise<UserLog[]> {
        const user_logs = await this._repository.find({ user_id: user_id });
        return user_logs;
    }

    async clearAllUserUserLog(user_id: string): Promise<boolean> {
        const logs = await this._repository.delete({ user_id: user_id });
        return true;
    }
}