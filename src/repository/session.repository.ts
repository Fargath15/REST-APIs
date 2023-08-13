import { EntityRepository, LessThan, getConnection } from "typeorm";
import { Session } from "../entity/session.entity";
import { UserType } from "../models/user.model";
import { PGBaseRepository } from "./base.repository";

@EntityRepository(Session)
export class SessionRepository extends PGBaseRepository<Session> {

    constructor() {
        super();
        this._repository = getConnection(process.env.DB_CONFIG).manager.getRepository(Session);
    }

    async createSession(user_id: string, session_token: string, user_type: UserType): Promise<Session> {
        const session = await this._repository.create({
            user_id: user_id,
            user_type: user_type,
            session_token: session_token,
            expiry: new Date(new Date().getTime() + 24 * 7 * 60 * 60),
            last_accessed: new Date(new Date().getTime() + 24 * 7 * 60 * 60)
        });
        this.OnEntityCreated(session, user_id);
        return this._repository.save(session);
    }

    async validateSession(session_token: string): Promise<Session> {
        const session = await this._repository.findOne({ session_token: session_token });
        return session;
    }

    async clearAllUserSession(user_id: string): Promise<boolean> {
        const session = await this._repository.delete({ user_id: user_id, expiry: LessThan(new Date()) });
        return true;
    }
}