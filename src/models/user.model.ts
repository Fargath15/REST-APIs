import { object, Schema } from "joi";
import * as joi from "joi";
import { User } from "../entity/user.entity";
import { Session } from "../entity/session.entity";
import { IServiceResponse } from "../Utils/utils.service";

export enum UserType {
    SuperAdmin = "SuperAdmin",
    Admin = "Admin",
    Basic = "Basic"
}

export enum LoginMethod {
    OTP = "OTP",
    TRUECALLER = "TRUECALLER",
    GOOGLE = "GOOGLE",
    FACEBOOK = "FACEBOOK",
    EMAIL = "EMAIL"
}

export interface ICreateUserRequest {
    mobile_number: string;
    email: string;
    password: string;
    user_name: string;
    user_type: UserType;
}

export interface IUpdateUserRequest {
    user_id: string;
    user_name: string;
    email: string;
    mobile_number: string;
}

export interface ILoginUserRequest {
    email: string;
    password: string;
}

export interface ISession {
    session_token: string;
}

export interface ILoginResponse extends IServiceResponse {
    user: User;
    session: Session;
}

export interface IUserResponse extends IServiceResponse {
    user: User;
}

export interface IUserListResponse extends IServiceResponse {
    users: User[];
}

export interface ISearchUserRequest {
    mobile_number: string;
    email: string;
    password: string;
    user_name: string;
    user_type: UserType;
    active: boolean;
}

export class UserSchema {
    public static GetLoginUserRequestSchema(): Schema {
        return joi.object().keys({
            email: joi.string().email().required(),
            password: joi.string()
        });
    }

    public static GetUpdateUserRequestSchema(): Schema {
        return joi.object().keys({
            user_id: joi.string().required(),
            user_name: joi.string(),
            email: joi.string().email(),
            mobile_number: joi.string().regex(/^[+]\d{1,4}[-](\d{10}|\d{10})$/).required(),
        });
    }

    public static GetCreateUserRequestSchema(): Schema {
        return joi.object().keys({
            user_name: joi.string().required(),
            email: joi.string().email().required(),
            mobile_number: joi.string().regex(/^[+]\d{1,4}[-](\d{10}|\d{10})$/),
            password: joi.string().min(4).max(8),
            user_type: joi.string().valid(UserType.Admin, UserType.Basic)
                .error(new Error("Super Admin Users cannot be created")).required()
        });
    }

    public static GetUserRequestSchema(): Schema {
        return joi.object().keys({
            user_id: joi.string().uuid()
        });
    }

    public static GetSearchUserRequestSchema(): Schema {
        return joi.object().keys({
            user_name: joi.string(),
            mobile_number: joi.string(),
            email: joi.string(),
            active: joi.boolean()
        });
    }
}
