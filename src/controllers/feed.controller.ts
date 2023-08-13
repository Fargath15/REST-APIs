import { Response, Request, Router } from "express";
import { BaseController } from "./base.controller";
import { FeedRepository } from "../repository/feed.repository";
import { SessionRepository } from "../repository/session.repository";
import { getCustomRepository } from "typeorm";
import { ResponseStatus, Utils } from "../Utils/utils.service";
import { FeedSchema, ICreateFeedRequest, IFeedListResponse, IFeedResponse, ISearchFeedRequest, IUpdateFeedRequest } from "../models/feed.model";
import { AuthMiddleWare } from "../middleware/auth.middleware";
import { Access } from "../models/userRoleAccess.model";
import { UserLogRepository } from "../repository/user_log.repository";
import { UserRoleAccessRepository } from "../repository/userRoleAccess.repository";
import { UserType } from "../models/user.model";

export class FeedController extends BaseController {

    feedRepository: FeedRepository;
    sessionRepository: SessionRepository;
    userLogRepository: UserLogRepository;
    userRoleAccessRepository: UserRoleAccessRepository;

    constructor(version: string, route_path: string) {
        super(version, route_path);
        this.feedRepository = getCustomRepository(FeedRepository, process.env.DB_CONFIG);
        this.sessionRepository = getCustomRepository(SessionRepository, process.env.DB_CONFIG);
        this.userLogRepository = getCustomRepository(UserLogRepository, process.env.DB_CONFIG);
        this.userRoleAccessRepository = getCustomRepository(UserRoleAccessRepository, process.env.DB_CONFIG);
    }

    protected defineCustomMiddleWares(router: Router) {

    }

    public defineRoutes(router: Router) {
        router.post("/create", AuthMiddleWare.ValidateUserAccess(this, Access.CREATE), this.ValidateRequest(FeedSchema.GetCreateFeedRequestSchema()), async (req: any, res: any) => await this.createFeed(req, res));
        router.post("/update", AuthMiddleWare.ValidateUserAccess(this, Access.ALTER), this.ValidateRequest(FeedSchema.GetUpdateFeedRequestSchema()), async (req: any, res: any) => await this.updateFeed(req, res));
        router.get("/delete", AuthMiddleWare.ValidateUserAccess(this, Access.DELETE), this.ValidateRequest(FeedSchema.GetRemoveFeedRequestSchema()), async (req: any, res: any) => await this.removeFeed(req, res));
        router.get("/get", AuthMiddleWare.ValidateUserAccess(this, Access.READ), this.ValidateRequest(FeedSchema.GetFeedRequestSchema()), async (req: any, res: any) => await this.getFeed(req, res));
        router.use("/search", AuthMiddleWare.ValidateUserSession(UserType.SuperAdmin), AuthMiddleWare.ValidateUserAccess(this, Access.READ), this.ValidateRequest(FeedSchema.GetSearchFeedRequestSchema()), async (req: any, res: any) => await this.searchFeed(req, res));
    }

    public async createFeed(req: Request, res: Response) {
        try {
            let created_by: string = req.headers.user_id as string;
            let createReq: ICreateFeedRequest = req.body as ICreateFeedRequest;
            if (!Utils.IsNull(createReq) && !Utils.IsNullOrEmpty(createReq.feed_name)) {
                let feedName = await this.feedRepository.getFeedName(createReq.feed_name);
                if (!Utils.IsNull(feedName)) {
                    let response = {
                        error: "Feed Name Already Exists",
                        message: "Feed Name Already Exists",
                        status: ResponseStatus.Failed
                    };
                    return res.status(202).send(response);
                }
            }
            let feed = await this.feedRepository.createFeed(createReq, created_by);
            await this.userLogRepository.saveUserLog(created_by, `Feed ${feed.feed_name} created`);
            if (Utils.IsNull(feed)) {
                let response = {
                    error: "Feed Not Found",
                    message: "Feed Not Found",
                    status: ResponseStatus.Failed
                };
                return res.status(202).send(response);
            }
            else {
                let response: IFeedResponse = {
                    feed: feed,
                    error: "",
                    message: "Success",
                    status: ResponseStatus.Success
                };
                return res.status(200).send(response);
            }
        } catch (error) {
            console.log("createFeed --->", error);
            let response = {
                error: error,
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }

    public async updateFeed(req: Request, res: Response) {
        try {
            let updated_by: string = req.headers.user_id as string;
            let updateReq: IUpdateFeedRequest = req.body as IUpdateFeedRequest;

            let user_access = await this.userRoleAccessRepository.getFeedUserRoleAccesss(updated_by, updateReq.feed_id);
            if (Utils.IsNullOrEmptyArray(user_access)) {
                let response = {
                    error: "Feed Access Denied",
                    message: "Feed Access Denied",
                    status: ResponseStatus.Failed
                };
                return res.status(202).send(response);
            }
            if (!Utils.IsNull(updateReq) && !Utils.IsNullOrEmpty(updateReq.feed_id)) {
                let feed = await this.feedRepository.getFeedById(updateReq.feed_id);
                if (!Utils.IsNull(feed)) {
                    feed = await this.feedRepository.updateFeedInfo(updateReq, updated_by);
                    await this.userLogRepository.saveUserLog(updated_by, `Feed ${feed.feed_name} updated`);
                    let response: IFeedResponse = {
                        feed: feed,
                        error: "",
                        message: "Success",
                        status: ResponseStatus.Success
                    };
                    return res.status(200).send(response);
                }
                else {
                    let response = {
                        error: "Feed Not Found",
                        message: "Feed Not Found",
                        status: ResponseStatus.Failed
                    };
                    return res.status(202).send(response);
                }
            }
        } catch (error) {
            console.log("updateFeedInfo --->", error);
            let response = {
                error: error,
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }

    public async getFeed(req: Request, res: Response) {
        try {
            console.log("[" + new Date().toLocaleString() + "] profile -> getFeed " + JSON.stringify(req.body));
            let feed_id: string = req.headers.feed_id as string;
            let user_id: string = req.headers.user_id as string;

            let user_access = await this.userRoleAccessRepository.getFeedUserRoleAccesss(user_id, feed_id);
            if (Utils.IsNullOrEmptyArray(user_access)) {
                let response = {
                    error: "Feed Access Denied",
                    message: "Feed Access Denied",
                    status: ResponseStatus.Failed
                };
                return res.status(202).send(response);
            }
            let feed = await this.feedRepository.getFeedById(feed_id);
            await this.userLogRepository.saveUserLog(user_id, `Feed ${feed.feed_name} Read`);
            if (Utils.IsNull(feed)) {
                let response = {
                    error: "Feed Not Found",
                    message: "Feed Not Found",
                    status: ResponseStatus.Failed
                };
                return res.status(202).send(response);
            } else {
                let response: IFeedResponse = {
                    error: "",
                    message: "Success",
                    status: ResponseStatus.Success,
                    feed: feed
                };
                return res.status(200).send(response);
            }
        } catch (error) {
            console.log("getFeed --->", error);
            let response = {
                error: error,
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }

    public async removeFeed(req: Request, res: Response) {
        try {
            console.log("[" + new Date().toLocaleString() + "] profile -> removeFeed " + JSON.stringify(req.body));
            let feed_id: string = req.headers.feed_id as string;
            let user_id: string = req.headers.user_id as string;

            let user_access = await this.userRoleAccessRepository.getFeedUserRoleAccesss(user_id, feed_id);
            if (Utils.IsNullOrEmptyArray(user_access)) {
                let response = {
                    error: "Feed Access Denied",
                    message: "Feed Access Denied",
                    status: ResponseStatus.Failed
                };
                return res.status(202).send(response);
            }
            let feed = await this.feedRepository.removeFeed(feed_id);
            if (feed) {
                await this.userLogRepository.saveUserLog(user_id, `Feed ${feed_id} Removed`);
                let response: IFeedResponse = {
                    error: "",
                    message: "Success",
                    status: ResponseStatus.Success,
                    feed: undefined
                };
                return res.status(200).send(response);
            }
            else {
                let response = {
                    error: "Feed Not Found",
                    message: "Feed Not Found",
                    status: ResponseStatus.Failed
                };
                return res.status(202).send(response);
            }
        } catch (error) {
            console.log("removeFeed --->", error);
            let response = {
                error: error,
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }

    public async searchFeed(req: Request, res: Response) {
        try {
            console.log("[" + new Date().toLocaleString() + "] profile -> searchFeed " + JSON.stringify(req.body));
            let filter: ISearchFeedRequest = req.body as ISearchFeedRequest;

            let feeds = await this.feedRepository.searchFeed(filter);
            let response: IFeedListResponse = {
                error: "",
                message: "Success",
                status: ResponseStatus.Success,
                feeds: feeds
            };
            return res.status(200).send(response);
        } catch (error) {
            console.log("searchFeed --->", error);
            let response = {
                error: error,
                status: ResponseStatus.Failed
            };
            return res.status(500).send(response);
        }
    }
}