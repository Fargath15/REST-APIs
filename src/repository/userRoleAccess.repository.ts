import { EntityRepository, getConnection } from "typeorm";
import { UserRoleAccess } from "../entity/user_role_access.entity";
import { IAddUserRoleAccessRequest, IUpdateUserRoleAccessRequest, Access, ISearchUserRoleAccessFilter } from "../models/userRoleAccess.model";
import { PGBaseRepository } from "./base.repository";
import { Utils } from "../Utils/utils.service";

@EntityRepository(UserRoleAccess)
export class UserRoleAccessRepository extends PGBaseRepository<UserRoleAccess> {

    constructor() {
        super();
        this._repository = getConnection(process.env.DB_CONFIG).manager.getRepository(UserRoleAccess);
    }

    async addUserRoleAccess(addReq: IAddUserRoleAccessRequest, created_by: string): Promise<UserRoleAccess> {
        const userRoleAccess = await this._repository.create(addReq);
        this.OnEntityCreated(userRoleAccess, created_by);
        return await this._repository.save(userRoleAccess);
    }

    async updateUserRoleAccess(updateReq: IUpdateUserRoleAccessRequest, updated_by: string): Promise<UserRoleAccess> {
        const userRoleAccess = await this.getUserRoleAccessById(updateReq.role_access_id);
        if (Utils.IsNull(userRoleAccess)) {
            return undefined;
        }
        else {
            if (!Utils.IsNull(updateReq.access_level)) {
                userRoleAccess.access_level = updateReq.access_level;
            }
        }
        this.OnEntityUpdated(userRoleAccess, updated_by);
        return await this._repository.save(userRoleAccess);
    }

    async getUserRoleAccessById(role_access_id: string): Promise<UserRoleAccess> {
        const role = await this._repository.findOne({ role_access_id: role_access_id });
        return role;
    }

    async getActiveUserRoleAccesss(user_id: string): Promise<UserRoleAccess[]> {
        const role = await this._repository.find({ user_id: user_id });
        return role;
    }

    async getFeedUserRoleAccesss(user_id: string, feed_id: string): Promise<UserRoleAccess[]> {
        const role = await this._repository.find({ user_id: user_id, feed_id: feed_id });
        return role;
    }

    async getUserRoleAccesss(user_id: string, controller: string): Promise<Access> {
        const role = await this._repository.findOne({ user_id: user_id, controller: controller });
        return !Utils.IsNull(role) ? role.access_level : undefined;
    }

    async removeUserRoleAccessById(role_access_id: string): Promise<boolean> {
        const roleItem = await this.getUserRoleAccessById(role_access_id);
        if (!Utils.IsNull(roleItem)) {
            const role = await this._repository.remove(roleItem);
            return !Utils.IsNull(role);
        }
        return false;
    }

    async removeAllUserRoleAccessByUserId(user_id: string): Promise<boolean> {
        const role = await this._repository.delete({ user_id: user_id });
        return true;
    }

    async searchUserRoleAccesss(filter: ISearchUserRoleAccessFilter = undefined): Promise<UserRoleAccess[]> {
        let query: string = "";
        let params = [];

        if (!Utils.IsNull(filter.user_id)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push(filter.user_id);
            query += "\"user_id\"=$" + params.length.toString();
        }
        if (!Utils.IsNull(filter.role_access_id)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push(filter.role_access_id);
            query += "\"role_access_id\"=$" + params.length.toString();
        }
        if (!Utils.IsNull(filter.controller)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push(filter.controller);
            query += "\"controller\"=$" + params.length.toString();
        }
        if (!Utils.IsNull(filter.access_level)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push(filter.access_level);
            query += "\"access_level\"=$" + params.length.toString();
        }

        let result = await this._repository.query(query, params);
        return result;
    }
}