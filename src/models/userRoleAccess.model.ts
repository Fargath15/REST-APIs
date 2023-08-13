import * as joi from "joi";
import { Schema } from "joi";
import { UserRoleAccess } from "../entity/user_role_access.entity";
import { IServiceResponse } from "../Utils/utils.service";
import { UserType } from "./user.model";

export enum Access {
    FULL_ACCESS = 100,
    DELETE = 40,
    CREATE = 30,
    ALTER = 20,
    READ = 10
}

export interface IAddUserRoleAccessRequest {
    user_id: string;
    feed_id: string;
    controller: string;
    access_level: Access;
    user_type: UserType;
}

export interface IUpdateUserRoleAccessRequest {
    role_access_id: string;
    access_level: Access;
}

export interface ISearchUserRoleAccessFilter {
    role_access_id: string;
    access_level: Access;
    user_id: string;
    controller: string;
}

export interface IUserRoleAccessResponse extends IServiceResponse {
    user_role_access: UserRoleAccess;
}

export interface IUserRoleAccessListResponse extends IServiceResponse {
    user_role_access_list: UserRoleAccess[];
}

export class UserRoleAccessSchema {
    public static GetAddUserRoleAccessRequestSchema(): Schema {
        return joi.object().keys({
            user_id: joi.string().uuid().required(),
            feed_id: joi.string().uuid().required(),
            controller: joi.string().required(),
            access_level: joi.string().valid(Access.FULL_ACCESS, Access.DELETE, Access.CREATE, Access.ALTER, Access.READ).required()
        });
    }

    public static GetUpdateUserRoleAccessRequestSchema(): Schema {
        return joi.object().keys({
            role_access_id: joi.string().uuid().required(),
            access_level: joi.string().valid(Access.FULL_ACCESS, Access.DELETE, Access.CREATE, Access.ALTER, Access.READ),
        });
    }

    public static GetUserRoleAccessRequestSchema(): Schema {
        return joi.object().keys({
            role_access_id: joi.string().uuid().required(),
        });
    }

    public static GetAllUserRoleAccessRequestSchema(): Schema {
        return joi.object().keys({
            user_id: joi.string().uuid().required(),
        });
    }

    public static GetSearchUserRoleAccessRequestSchema(): Schema {
        return joi.object().keys({
            user_id: joi.string().uuid(),
            controller: joi.string(),
            access_level: joi.string().valid(Access.FULL_ACCESS, Access.DELETE, Access.CREATE, Access.ALTER, Access.READ),
        });
    }

    public static GetRemoveUserRoleAccessRequestSchema(): Schema {
        return joi.object().keys({
            role_access_id: joi.string().uuid().required(),
        });
    }

}