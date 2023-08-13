import { BaseController } from "./base.controller";
import { FeedController } from "./feed.controller";
import { UserController } from "./user.controller";
import { UserRoleAccessController } from "./userRoleAccess.controller";
import { UserLogController } from "./user_log.controller";

export class ControllerFactory {
    getControllers(): Array<BaseController> {
        return [
            new UserController("/v1", "/user"),
            new FeedController("/v1", "/feed"),
            new UserRoleAccessController("/v1", "/user-role-access"),
            new UserLogController("/v1", "/user-log")
        ];
    }
}
