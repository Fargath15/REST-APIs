import { Router, Request, Response } from "express";
import { Schema } from "joi";
import { Utils } from "../Utils/utils.service";

export abstract class BaseController {
    private controllerName: string;
    private version: string;
    protected router: Router;

    public GetControllerName() {
        return this.controllerName.trim();
    }

    protected abstract defineCustomMiddleWares(router: Router): any;

    protected abstract defineRoutes(router: Router): any;

    constructor(version: string, controllerName: string) {
        this.router = Router();
        this.version = version;
        this.controllerName = controllerName;
    }

    public getRoutePath(): string {
        return this.version.trim() + this.controllerName.trim();
    }

    public getRouter(): Router {
        this.defineCustomMiddleWares(this.router);
        this.defineRoutes(this.router);
        return this.router;
    }

    public ValidateRequest(schema: Schema) {
        return async (req: Request, res: Response, next: Function) => {
            let result = schema.validate(req.body);
            if (!Utils.IsNull(result) && !Utils.IsNull(result.error)) {
                let response = {
                    error: "Invalid Request -> " + result.error.message,
                    status: "Failed"
                };
                console.log("RequestValidator.ValidateRequest: validate_request_error", JSON.stringify({ url: req.url, result: response }));
                return res.status(400).send(response);
            } else {
                next();
            }
        };
    }
}