import { Response, Request, Router } from "express";
import { BaseController } from "./base.controller";
import { getCustomRepository } from "typeorm";
import { ResponseStatus, Utils } from "../Utils/utils.service";
import { IUserLogsResponse } from "../models/user_log.model";
import { AuthMiddleWare } from "../middleware/auth.middleware";
import { Access } from "../models/userRoleAccess.model";
import { UserLogRepository } from "../repository/user_log.repository";
import { UserRoleAccessRepository } from "../repository/userRoleAccess.repository";
import { UserType } from "../models/user.model";

export class UserLogController extends BaseController {

    userLogRepository: UserLogRepository;
    userRoleAccessRepository: UserRoleAccessRepository;

    constructor(version: string, route_path: string) {
        super(version, route_path);
        this.userLogRepository = getCustomRepository(UserLogRepository, process.env.DB_CONFIG);
        this.userRoleAccessRepository = getCustomRepository(UserRoleAccessRepository, process.env.DB_CONFIG);
    }

    protected defineCustomMiddleWares(router: Router) {

    }

    public defineRoutes(router: Router) {
        router.get("/get", AuthMiddleWare.ValidateUserSession(UserType.SuperAdmin), AuthMiddleWare.ValidateUserAccess(this, Access.READ), async (req: any, res: any) => await this.getUserLogs(req, res));
    }

    public async getUserLogs(req: Request, res: Response) {
        try {
            console.log("[" + new Date().toLocaleString() + "] profile -> getUserLogs " + JSON.stringify(req.headers));

            let user_id: string = req.headers.user_id as string;

            let user_logs = await this.userLogRepository.getUserLogs(user_id);
            if (Utils.IsNullOrEmptyArray(user_logs)) {
                let response = {
                    error: "Logs Not Found",
                    message: "Logs Not Found",
                    status: ResponseStatus.Success
                };
                return res.status(200).send(response);
            } else {
                let response: IUserLogsResponse = {
                    error: "",
                    message: "Success",
                    status: ResponseStatus.Success,
                    user_logs: user_logs
                };
                return res.status(200).send(response);
            }
        } catch (error) {
            console.log("getUserLogs --->", error);
            let response = {
                error: error,
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }
}