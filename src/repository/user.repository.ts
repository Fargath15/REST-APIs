import { EntityRepository, getConnection } from "typeorm";
import { User } from "../entity/user.entity";
import { ICreateUserRequest, ISearchUserRequest, IUpdateUserRequest } from "../models/user.model";
import { Utils } from "../Utils/utils.service";
import { PGBaseRepository } from "./base.repository";

@EntityRepository(User)
export class UserRepository extends PGBaseRepository<User> {

    constructor() {
        super();
        this._repository = getConnection(process.env.DB_CONFIG).manager.getRepository(User);
    }

    async createUser(createReq: ICreateUserRequest, created_by: string = undefined): Promise<User> {
        const user = await this._repository.create(createReq);
        this.OnEntityCreated(user, created_by);
        return this._repository.save(user);
    }

    async updateUserInfo(updateRequest: IUpdateUserRequest, updated_by: string): Promise<User> {
        const user = await this.getUserById(updateRequest.user_id);
        if (Utils.IsNull(user)) {
            return undefined;
        }
        else {
            if (!Utils.IsNull(updateRequest.user_name)) {
                user.user_name = updateRequest.user_name;
            }
            if (!Utils.IsNull(updateRequest.email)) {
                user.email = updateRequest.email;
            }
            if (!Utils.IsNull(updateRequest.mobile_number)) {
                user.mobile_number = updateRequest.mobile_number;
            }
        }
        this.OnEntityUpdated(user, updated_by);
        return this._repository.save(user);
    }

    async updateUserPassword(user_id: string, password: string, updated_by: string): Promise<User> {
        const user = await this.getUserById(user_id);
        if (Utils.IsNull(user)) {
            return undefined;
        }
        else {
            if (!Utils.IsNull(password)) {
                user.password = password;
            }
        }
        this.OnEntityUpdated(user, updated_by);
        return this._repository.save(user);
    }

    async validateCredential(user_id: string, password: string): Promise<boolean> {
        const user = await this.getUserById(user_id);
        if (!Utils.IsNull(user)) {
            return user.password === password;
        }
        return false;
    }

    async getUserById(user_id: string): Promise<User> {
        const user = await this._repository.findOne({ user_id: user_id });
        return user;
    }

    async getUserName(user_name: string): Promise<User> {
        const user = await this._repository.createQueryBuilder()
            .where("LOWER(user_name) = LOWER(:user_name)", { user_name })
            .getOne();
        return user;
    }

    async getUserByMobileNumber(mobile_number: string): Promise<User> {
        const user = await this._repository.findOne({ mobile_number: mobile_number });
        return user;
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = await this._repository.createQueryBuilder()
            .where("LOWER(email) = LOWER(:email)", { email })
            .getOne();
        return user;
    }

    async searchUser(filter: ISearchUserRequest = undefined): Promise<User[]> {
        let query: string = "SELECT * FROM " + this._repository.metadata.schema + "." + this._repository.metadata.tableName;
        let params = [];

        if (!Utils.IsNull(filter?.user_type)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push(filter?.user_type);
            query += "\"user_type\"=$" + params.length.toString();
        }
        if (!Utils.IsNull(filter?.active)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push(filter?.active);
            query += "\"active\"=$" + params.length.toString();
        }
        if (!Utils.IsNullOrEmpty(filter?.user_name)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push("%" + filter?.user_name.toLowerCase() + "%");
            query += "LOWER(\"user_name\") LIKE $" + params.length.toString();
        }
        if (!Utils.IsNullOrEmpty(filter?.mobile_number)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push("%" + filter?.mobile_number.toLowerCase() + "%");
            query += "\"mobile_number\" LIKE $" + params.length.toString();
        }
        if (!Utils.IsNullOrEmpty(filter?.email)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push(filter?.email);
            query += "\"email\"=$" + params.length.toString();
        }

        console.log("query -> ", query);
        console.log("params -> ", params);
        let result = await this._repository.query(query, params);
        return result;
    }
}