import { Response, Request, Router } from "express";
import { BaseController } from "./base.controller";
import { UserRepository } from "../repository/user.repository";
import { SessionRepository } from "../repository/session.repository";
import { getCustomRepository } from "typeorm";
import { ICreateUserRequest, ILoginUserRequest, ILoginResponse, ISearchUserRequest, IUpdateUserRequest, IUserListResponse, IUserResponse, UserType, UserSchema } from "../models/user.model";
import { AuthMiddleWare } from "../middleware/auth.middleware";
import { IServiceResponse, ResponseStatus, Utils } from "../Utils/utils.service";
import { UserLogRepository } from "../repository/user_log.repository";
import { Access } from "../models/userRoleAccess.model";

export class UserController extends BaseController {

  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  userLogRepository: UserLogRepository;

  constructor(version: string, route_path: string) {
    super(version, route_path);
    this.userRepository = getCustomRepository(UserRepository, process.env.DB_CONFIG);
    this.sessionRepository = getCustomRepository(SessionRepository, process.env.DB_CONFIG);
    this.userLogRepository = getCustomRepository(UserLogRepository, process.env.DB_CONFIG);
  }

  protected defineCustomMiddleWares(router: Router) {
  }

  public defineRoutes(router: Router) {
    router.post("/create", AuthMiddleWare.ValidateUserSession(UserType.SuperAdmin, UserType.Admin), this.ValidateRequest(UserSchema.GetCreateUserRequestSchema()), async (req: any, res: any) => await this.createUser(req, res));
    router.post("/login", this.ValidateRequest(UserSchema.GetLoginUserRequestSchema()), async (req: any, res: any) => await this.login(req, res));
    router.post("/update", AuthMiddleWare.ValidateUserSession(UserType.SuperAdmin, UserType.Admin), this.ValidateRequest(UserSchema.GetUpdateUserRequestSchema()), async (req: any, res: any) => await this.updateUserInfo(req, res));
    router.get("/get", AuthMiddleWare.ValidateUserSession(UserType.SuperAdmin, UserType.Admin), AuthMiddleWare.ValidateUserAccess(this, Access.READ), this.ValidateRequest(UserSchema.GetUserRequestSchema()), async (req: any, res: any) => await this.getUserInfo(req, res));
    router.get("/search", AuthMiddleWare.ValidateUserSession(UserType.SuperAdmin, UserType.Admin), AuthMiddleWare.ValidateUserAccess(this, Access.READ), this.ValidateRequest(UserSchema.GetSearchUserRequestSchema()), async (req: any, res: any) => await this.searchUserInfo(req, res));
  }

  public async createUser(req: Request, res: Response) {
    try {
      let created_by: string = req.headers.user_id as string;
      let createReq: ICreateUserRequest = req.body as ICreateUserRequest;
      let creator = await this.userRepository.getUserById(created_by);
      if (createReq.user_type == UserType.Admin && creator.user_type == UserType.Admin) {
        let response = {
          error: "Admin cannot create other admin users",
          message: "Admin cannot create other admin users",
          status: ResponseStatus.Failed
        };
        return res.status(202).send(response);
      }
      if (!Utils.IsNull(createReq) && !Utils.IsNullOrEmpty(createReq.email)) {
        let userEmail = await this.userRepository.getUserByEmail(createReq.email);
        if (!Utils.IsNull(userEmail)) {
          let response = {
            error: "Email Id Already Exists",
            message: "Email Id Already Exists",
            status: ResponseStatus.Failed
          };
          return res.status(202).send(response);
        }
        let userMobile = await this.userRepository.getUserByMobileNumber(createReq.mobile_number);
        if (!Utils.IsNull(userMobile)) {
          let response = {
            error: "Mobile Number Already Exists",
            message: "Mobile Number Already Exists",
            status: ResponseStatus.Failed
          };
          return res.status(202).send(response);
        }
        let userName = await this.userRepository.getUserName(createReq.user_name);
        if (!Utils.IsNull(userName)) {
          let response = {
            error: "User Name Already Exists",
            message: "User Name Already Exists",
            status: ResponseStatus.Failed
          };
          return res.status(202).send(response);
        }
      }
      if (Utils.IsNullOrEmpty(createReq.password)) {
        createReq.password = "123456789";
      }
      let user = await this.userRepository.createUser(createReq, created_by);

      await this.userLogRepository.saveUserLog(created_by, `${user.user_type} ${user.user_name} Created`);
      if (Utils.IsNull(user)) {
        let response = {
          error: "User Not Found",
          message: "User Not Found",
          status: ResponseStatus.Failed
        };
        return res.status(202).send(response);
      }
      else {
        let response: IUserResponse = {
          user: user,
          error: "",
          message: "Success",
          status: ResponseStatus.Success
        };
        return res.status(200).send(response);
      }
    } catch (error) {
      console.log(error);
      let response = {
        error: error,
        status: ResponseStatus.Failed
      };
      return res.status(500).send(response);
    }
  }

  public async updateUserInfo(req: Request, res: Response) {
    try {
      let user_id: string = req.headers.user_id as string;
      let updateReq: IUpdateUserRequest = req.body as IUpdateUserRequest;
      if (!Utils.IsNull(updateReq) && !Utils.IsNullOrEmpty(updateReq.email)) {
        let userEmail = await this.userRepository.getUserByEmail(updateReq.email);
        if (!Utils.IsNull(userEmail) && userEmail.user_id != user_id) {
          let response = {
            error: "Email Id Already Exists",
            message: "Email Id Already Exists",
            status: ResponseStatus.Failed
          };
          return res.status(202).send(response);
        }
      }
      let user = await this.userRepository.updateUserInfo(updateReq, user_id);
      await this.userLogRepository.saveUserLog(user_id, `${user.user_type} ${user.user_name} Updated`);
      if (Utils.IsNull(user)) {
        let response = {
          error: "User Not Found",
          message: "User Not Found",
          status: ResponseStatus.Failed
        };
        return res.status(202).send(response);
      }
      else {
        let response: IUserResponse = {
          user: user,
          error: "",
          message: "Success",
          status: ResponseStatus.Success
        };
        return res.status(200).send(response);
      }
    } catch (error) {
      console.log(error);
      let response = {
        error: error,
        status: ResponseStatus.Failed
      };
      return res.status(500).send(response);
    }
  }

  public async login(req: Request, res: Response) {
    try {
      console.log("[" + new Date().toLocaleString() + "] profile -> login " + JSON.stringify(req.body));
      let loginReq: ILoginUserRequest = req.body as ILoginUserRequest;

      let user = await this.userRepository.getUserByEmail(loginReq.email);
      if (Utils.IsNull(user)) {
        let response: IServiceResponse = {
          error: "Invalid User",
          status: ResponseStatus.Failed,
          message: "Failed"
        };
        return res.status(202).send(response);
      }
      if (!user.active) {
        let response = {
          error: " Your account has been deactivated.",
          message: " Your account has been deactivated.",
          status: ResponseStatus.Failed
        };
        return res.status(202).send(response);
      }
      let validateCredential = await this.userRepository.validateCredential(user.user_id, loginReq.password);
      if (!validateCredential) {
        let response: IServiceResponse = {
          error: "Login Failed! Please Check your Password",
          message: "Failed",
          status: ResponseStatus.Failed
        };
        return res.status(202).send(response);
      }
      let session = await AuthMiddleWare.GenerateUserToken(user.user_id, user.user_type);
      await this.userLogRepository.saveUserLog(user.user_id, `${user.user_type} ${user.user_name} Logged in to the System`);
      let response: ILoginResponse = {
        user: user,
        session: session,
        error: "",
        message: "Login Success",
        status: ResponseStatus.Success
      };
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      let response = {
        error: error,
        message: error,
        status: ResponseStatus.Failed
      };
      return res.status(500).send(response);
    }
  }

  public async getUserInfo(req: Request, res: Response) {
    try {
      console.log("[" + new Date().toLocaleString() + "] profile -> getUserInfo " + JSON.stringify(req.body));
      let user_id: string = req.headers.user_id as string;

      let user = await this.userRepository.getUserById(user_id);
      if (Utils.IsNull(user)) {
        let response = {
          error: "User Not Found",
          message: "User Not Found",
          status: ResponseStatus.Failed
        };
        return res.status(202).send(response);
      } else {
        await this.userLogRepository.saveUserLog(user.user_id, `${user.user_type} ${user.user_name} Read`);
        let response: IUserResponse = {
          error: "",
          message: "Success",
          status: ResponseStatus.Success,
          user: user
        };
        return res.status(200).send(response);
      }
    } catch (error) {
      console.log(error);
      let response = {
        error: error,
        status: ResponseStatus.Failed
      };
      return res.status(500).send(response);
    }
  }

  public async searchUserInfo(req: Request, res: Response) {
    try {
      console.log("[" + new Date().toLocaleString() + "] profile -> searchUserInfo " + JSON.stringify(req.body));
      let filter: ISearchUserRequest = req.body as ISearchUserRequest;

      let users = await this.userRepository.searchUser(filter);
      let response: IUserListResponse = {
        error: "",
        message: "Success",
        status: ResponseStatus.Success,
        users: users
      };
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      let response = {
        error: error,
        status: ResponseStatus.Failed
      };
      return res.status(500).send(response);
    }
  }
}