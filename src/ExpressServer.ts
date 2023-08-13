import { Express } from "express";
import { BASE_URL, PORT } from "./App";
import { ControllerFactory } from "./controllers/controller-factory.controller";

export class ExpressServer {
    public static CreateServer(app: Express): Express {
        const controllers = new ControllerFactory().getControllers();
        controllers.forEach(controller => {
            console.log(BASE_URL + controller.getRoutePath());
            app.use(BASE_URL + controller.getRoutePath(), controller.getRouter());
        });
        return app;
    }
}