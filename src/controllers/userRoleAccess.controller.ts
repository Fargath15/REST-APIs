
import { Response, Request, Router } from "express";
import { UserRoleAccessRepository } from "../repository/userRoleAccess.repository";
import { AuthMiddleWare } from "../middleware/auth.middleware";
import { BaseController } from "./base.controller";
import { UserLogRepository } from "../repository/user_log.repository";
import { getCustomRepository } from "typeorm";
import { Access, IAddUserRoleAccessRequest, IUpdateUserRoleAccessRequest, IUserRoleAccessListResponse, IUserRoleAccessResponse, UserRoleAccessSchema } from "../models/userRoleAccess.model";
import { IServiceResponse, ResponseStatus, Utils } from "../Utils/utils.service";
import { UserRoleAccess } from "../entity/user_role_access.entity";
import { UserRepository } from "../repository/user.repository";
import { UserType } from "../models/user.model";

export class UserRoleAccessController extends BaseController {

    userLogRepository: UserLogRepository;
    userRoleAccessRepository: UserRoleAccessRepository;
    userRepository: UserRepository;

    constructor(version: string, route_path: string) {
        super(version, route_path);
        this.userLogRepository = getCustomRepository(UserLogRepository, process.env.DB_CONFIG);
        this.userRoleAccessRepository = getCustomRepository(UserRoleAccessRepository, process.env.DB_CONFIG);
        this.userRepository = getCustomRepository(UserRepository, process.env.DB_CONFIG);
    }

    protected defineCustomMiddleWares(router: Router) {

    }

    public defineRoutes(router: Router) {
        router.post("/add", AuthMiddleWare.ValidateUserAccess(this, Access.CREATE), this.ValidateRequest(UserRoleAccessSchema.GetAddUserRoleAccessRequestSchema()), async (req: any, res: any) => await this.addUserRoleAccess(req, res));
        router.post("/update", AuthMiddleWare.ValidateUserAccess(this, Access.ALTER), this.ValidateRequest(UserRoleAccessSchema.GetUpdateUserRoleAccessRequestSchema()), async (req: any, res: any) => await this.updateUserRoleAccess(req, res));
        router.post("/remove", AuthMiddleWare.ValidateUserAccess(this, Access.DELETE), this.ValidateRequest(UserRoleAccessSchema.GetRemoveUserRoleAccessRequestSchema()), async (req: any, res: any) => await this.removeUserRoleAccess(req, res));
        router.get("/get", AuthMiddleWare.ValidateUserAccess(this, Access.READ), this.ValidateRequest(UserRoleAccessSchema.GetUserRoleAccessRequestSchema()), async (req: any, res: any) => await this.getUserRoleAccess(req, res));
        router.get("/search", AuthMiddleWare.ValidateUserAccess(this, Access.READ), this.ValidateRequest(UserRoleAccessSchema.GetSearchUserRoleAccessRequestSchema()), async (req: any, res: any) => await this.searchUserRoleAccess(req, res));
        router.get("/get-user-access", AuthMiddleWare.ValidateUserAccess(this, Access.READ), this.ValidateRequest(UserRoleAccessSchema.GetAllUserRoleAccessRequestSchema()), async (req: any, res: any) => await this.getAllUserRoleAccess(req, res));
    }

    public async addUserRoleAccess(req: Request, res: Response) {
        try {
            let addUserRoleAccessRequest: IAddUserRoleAccessRequest = req.body as IAddUserRoleAccessRequest;
            let user_id: string = req.headers.user_id as string;

            let user = await this.userRepository.getUserById(user_id);
            if (Utils.IsNull(user) || user.user_type === UserType.Basic) {
                let response: IServiceResponse = {
                    error: "Invalid User",
                    message: "Invalid User",
                    status: ResponseStatus.Failed
                };
                return res.status(202).send(response);
            }
            else if (user.user_type === UserType.Admin) {
                let user_access = await this.userRoleAccessRepository.getFeedUserRoleAccesss(user_id, addUserRoleAccessRequest.feed_id);
                if (Utils.IsNullOrEmptyArray(user_access)) {
                    let response: IServiceResponse = {
                        error: "Feed Access Denied",
                        message: "Feed Access Denied",
                        status: ResponseStatus.Failed
                    };
                    return res.status(202).send(response);
                }
            }
            addUserRoleAccessRequest.user_type = user.user_type;
            let userRoleAccessResponse = await this.userRoleAccessRepository.addUserRoleAccess(addUserRoleAccessRequest, user_id);
            let response: IUserRoleAccessResponse = {
                error: "",
                message: "Success",
                status: ResponseStatus.Success,
                user_role_access: userRoleAccessResponse
            };
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            let response: IServiceResponse = {
                error: error,
                message: "Failed",
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }

    public async getUserRoleAccess(req: Request, res: Response) {
        try {
            let userRoleAccess: UserRoleAccess;
            let role_access_id: string = req.query.role_access_id as string;
            userRoleAccess = await this.userRoleAccessRepository.getUserRoleAccessById(role_access_id);
            let response: IUserRoleAccessResponse = {
                error: "",
                message: "Success",
                status: ResponseStatus.Success,
                user_role_access: userRoleAccess,
            };
            return res.status(200).send(response);
        } catch (error) {
            let response: IServiceResponse = {
                error: error,
                message: "Failed",
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }

    public async searchUserRoleAccess(req: Request, res: Response) {
        try {
            let user_id: string = req.query.user_id as string;
            let userRoleAccess = await this.userRoleAccessRepository.getActiveUserRoleAccesss(user_id);

            let response: IUserRoleAccessListResponse = {
                error: "",
                message: "Success",
                status: ResponseStatus.Success,
                user_role_access_list: userRoleAccess,
            };
            return res.status(200).send(response);
        } catch (error) {
            let response: IServiceResponse = {
                error: error,
                message: "Failed",
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }

    public async getAllUserRoleAccess(req: Request, res: Response) {
        try {
            let user_id: string = req.query.user_id as string;
            if (!Utils.IsNull(user_id)) {
                let userRoleAccess = await this.userRoleAccessRepository.getActiveUserRoleAccesss(user_id);
                let response: IUserRoleAccessListResponse = {
                    error: "",
                    message: "Success",
                    status: ResponseStatus.Success,
                    user_role_access_list: userRoleAccess,
                };
                return res.status(200).send(response);
            }
            else {
                let response: IUserRoleAccessListResponse = {
                    error: "",
                    message: "Success",
                    status: ResponseStatus.Success,
                    user_role_access_list: [],
                };
                return res.status(200).send(response);
            }
        } catch (error) {
            let response: IServiceResponse = {
                error: error,
                message: "Failed",
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }

    public async updateUserRoleAccess(req: Request, res: Response) {
        try {
            let roleRequest: IUpdateUserRoleAccessRequest = req.body as IUpdateUserRoleAccessRequest;
            let user_id: string = req.headers.user_id as string;

            let roleResponse: UserRoleAccess = await this.userRoleAccessRepository.updateUserRoleAccess(roleRequest, user_id);
            let response: IUserRoleAccessResponse = {
                error: "",
                message: "Success",
                status: ResponseStatus.Success,
                user_role_access: roleResponse,
            };
            return res.status(200).send(response);

        } catch (error) {
            console.log(error);
            let response: IServiceResponse = {
                error: error,
                message: "Failed",
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }

    public async removeUserRoleAccess(req: Request, res: Response) {
        try {

            let role_access_id: string = req.query.role_access_id as string;
            let status: boolean = false;
            if (!Utils.IsNullOrEmpty(role_access_id)) {
                status = await this.userRoleAccessRepository.removeUserRoleAccessById(role_access_id);
            }
            if (status) {
                let response: IServiceResponse = {
                    error: "",
                    message: "Success",
                    status: ResponseStatus.Success
                };
                return res.status(200).send(response);
            } else {
                let response: IServiceResponse = {
                    error: "Unable To remove",
                    message: "Failed",
                    status: ResponseStatus.Failed
                };
                return res.status(400).send(response);
            }
        } catch (error) {
            console.log(error);
            let response: IServiceResponse = {
                error: error,
                message: "Failed",
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }
}