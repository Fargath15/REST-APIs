import { sign, SignOptions, VerifyErrors, verify } from "jsonwebtoken";
import { Response, Request } from "express";
import { UserRoleAccessRepository } from "../repository/userRoleAccess.repository";
import { UserRepository } from "../repository/user.repository";
import { getCustomRepository } from "typeorm";
import { Utils } from "../Utils/utils.service";
import { UserType } from "../models/user.model";
import { SessionRepository } from "../repository/session.repository";
import { User } from "../entity/user.entity";
import { Session } from "../entity/session.entity";
import { Access } from "../models/userRoleAccess.model";
import { BaseController } from "../controllers/base.controller";

export class AuthMiddleWare {
    private static userRepository: UserRepository;
    private static GetUserRepository(): UserRepository {
        if (Utils.IsNull(this.userRepository)) {
            this.userRepository = getCustomRepository(UserRepository, process.env.DB_CONFIG);
        }
        return this.userRepository;
    }

    private static sessionRepository: SessionRepository;
    private static GetSessionRepository(): SessionRepository {
        if (Utils.IsNull(this.sessionRepository)) {
            this.sessionRepository = getCustomRepository(SessionRepository, process.env.DB_CONFIG);
        }
        return this.sessionRepository;
    }

    private static userRoleAccessRepository: UserRoleAccessRepository;
    private static GetUserRoleAccessRepository(): UserRoleAccessRepository {
        if (Utils.IsNull(this.userRoleAccessRepository)) {
            this.userRoleAccessRepository = getCustomRepository(UserRoleAccessRepository, process.env.DB_CONFIG);
        }
        return this.userRoleAccessRepository;
    }

    public static async GenerateUserToken(user_id: string, user_type: UserType): Promise<Session> {
        let options: SignOptions = { expiresIn: "24h" };
        let session_token = sign({ user_id: user_id, user_type: user_type }, process.env.JWT_ENCRYPTION_KEY, options);
        return AuthMiddleWare.GetSessionRepository().createSession(user_id, session_token, user_type);
    }

    public static ValidateUserTypes(...allowdTypes: UserType[]) {
        return async (req: Request, res: Response, next: Function) => {
            let userType: UserType = req.headers["user_type"] as UserType;
            if (Utils.IsNull(userType)) {
                let response = {
                    error: "No Permission",
                    status: "Failed"
                };
                return res.status(401).send(response);
            } else if (allowdTypes?.length > 0) {
                if (this.IsUserOfType(allowdTypes, userType)) {
                    next();
                } else {
                    let response = {
                        error: "No Permission",
                        status: "Failed"
                    };
                    return res.status(401).send(response);
                }
            } else {
                next();
            }
        };
    }

    public static ValidateUserSession(...allowedTypes: UserType[]) {
        return async (req: Request, res: Response, next: Function) => {
            if (Utils.IsNull(req.headers["x-access-token"])) {
                let response = {
                    error: "Invalid Token",
                    status: "Failed"
                };
                return res.status(400).send(response);
            }
            let token: string = req.headers["x-access-token"].toString();

            if (Utils.IsNullOrEmpty(token)) {
                let response = {
                    error: "Invalid Token",
                    status: "Failed"
                };
                return res.status(401).send(response);
            } else {
                verify(token, process.env.JWT_ENCRYPTION_KEY, async (err: VerifyErrors, decoded: any) => {
                    if (err) {
                        let response = {
                            error: "UnAuthorized Access",
                            status: "Failed"
                        };
                        return res.status(401).send(response);
                    } else {
                        let session = await AuthMiddleWare.GetSessionRepository().validateSession(token);
                        if (!Utils.IsNull(session)) {
                            let userActive = await AuthMiddleWare.GetUserRepository().getUserById(session.user_id);
                            if (userActive) {
                                req.headers.user_id = session.user_id;
                                req.headers.user_type = session.user_type;
                                if (allowedTypes?.length > 0) {
                                    if (this.IsUserOfType(allowedTypes, session.user_type)) {
                                        next();
                                    } else {
                                        let response = {
                                            error: "No Permission",
                                            message: "No Permission",
                                            status: "Failed"
                                        };
                                        return res.status(401).send(response);
                                    }
                                } else {
                                    next();
                                }
                            } else {
                                let response = {
                                    error: "Your account has been deactivated.",
                                    message: "Your account has been deactivated.",
                                    status: "Failed"
                                };
                                return res.status(401).send(response);
                            }
                        } else {
                            let response = {
                                error: "UnAuthorized Access",
                                message: "UnAuthorized Access",
                                status: "Failed"
                            };
                            return res.status(401).send(response);
                        }
                    }
                });
            }
        };

    }

    public static ValidateUserAccess(controller: BaseController, api_access: Access) {
        return async (req: Request, res: Response, next: Function) => {
            let user_id: string = req.headers["user_id"] as string;
            if (Utils.IsNullOrEmpty(user_id)) {
                let response = {
                    error: "Invalid User",
                    status: "Failed"
                };
                return res.status(401).send(response);
            }
            console.log("user_id", user_id);
            console.log("controller", controller.GetControllerName());
            let user = await AuthMiddleWare.GetUserRepository().getUserById(user_id);
            if (Utils.IsNull(user)) {
                let response = {
                    error: "Invalid User",
                    status: "Failed"
                };
                return res.status(401).send(response);
            }
            else if (user.user_type !== UserType.SuperAdmin) {
                let user_access_level: Access = await AuthMiddleWare.GetUserRoleAccessRepository().getUserRoleAccesss(user_id, controller.GetControllerName());
                console.log("user_access_level", user_access_level);
                if (!Utils.IsNull(user_access_level) && api_access <= user_access_level) {
                    next();
                } else {
                    let response = {
                        error: "Access Denied",
                        status: "Failed"
                    };
                    return res.status(403).send(response);
                }
            }
            next();
        };
    }

    private static IsUserOfType(allowdTypes: UserType[], userType: UserType): boolean {
        if (allowdTypes?.length > 0) {
            console.log(allowdTypes);
            if (allowdTypes.findIndex((x) => x == userType) > -1) {
                return true;
            }
        }
        return false;
    }
}