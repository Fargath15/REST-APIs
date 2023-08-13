import { Connection, ConnectionOptions } from "typeorm";
import { ConnectionHelper } from "./connection";
import { BASE_URL, PORT, app } from "./App";
import { ExpressServer } from "./ExpressServer";
import { CronService } from "./services/cron.service";

let connections = require("./ormconfig.json");

export let connectionOptions: ConnectionOptions[] = connections;
let connectionHelper: ConnectionHelper = new ConnectionHelper();
connectionHelper.CreateConnection(connectionOptions).then((connection: Connection) => {
    console.info("APP: DB Connection Success -> " + connection.name);
    let createdApp = app;
    createdApp = ExpressServer.CreateServer(createdApp);
    CronService.StartContentPublisherCron();
    createdApp.set("port", PORT);
    createdApp.listen(createdApp.get("port"), () => {
        console.info((`Api is running at http://localhost:${PORT}${BASE_URL}`));
        console.info((`Health Check is running at http://localhost:${PORT}${BASE_URL}/ping`));
        console.info("Press CTRL-C to stop\n");
    });
    console.info("Server Started Successfully");
});
