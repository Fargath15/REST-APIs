import { Connection, ConnectionOptions, createConnection } from "typeorm";
import { Utils } from "./Utils/utils.service";

export class ConnectionHelper {
    protected static activeConnection: Connection;
    protected static mActiveConnectionConfig: ConnectionOptions;

    public async CreateConnection(connectionOptions: ConnectionOptions[], synchronize: boolean = false, logging: boolean = false): Promise<Connection> {

        let activeConnection: Connection;

        if (Utils.IsNull(process.env.ENV) || Utils.IsNull(process.env.DB_CONFIG) || Utils.IsNull(process.env.DB_HOST)
            || Utils.IsNull(process.env.DB_USER_NAME) || Utils.IsNull(process.env.DB_PASSWORD) || Utils.IsNull(process.env.DB_MAIN_DATABASE)) {
            throw "Invalid ENV Configration";
        }
        if (!Utils.IsNullOrEmpty(process.env.ENV) && !Utils.IsNullOrEmpty(process.env.DB_CONFIG)) {
            let selectedConnectionOption: any;

            selectedConnectionOption = connectionOptions.find((x) => x.name == "default");
            console.log("ConnectionHelper: selectedConnecitonOption -> ", selectedConnectionOption?.name);

            if (!Utils.IsNull(selectedConnectionOption)) {
                if (!Utils.IsNullOrEmpty(process.env.DB_CONFIG)) {
                    selectedConnectionOption.name = process.env.DB_CONFIG;
                }
                if (!Utils.IsNullOrEmpty(process.env.DB_HOST)) {
                    selectedConnectionOption.host = process.env.DB_HOST;
                }
                if (!Utils.IsNullOrEmpty(process.env.DB_USER_NAME)) {
                    selectedConnectionOption.username = process.env.DB_USER_NAME;
                }
                if (!Utils.IsNullOrEmpty(process.env.DB_PASSWORD)) {
                    selectedConnectionOption.password = process.env.DB_PASSWORD;
                }
                if (!Utils.IsNullOrEmpty(process.env.DB_MAIN_DATABASE)) {
                    selectedConnectionOption.database = process.env.DB_MAIN_DATABASE;
                }
                if (!Utils.IsNullOrEmpty(process.env.DB_PORT)) {
                    selectedConnectionOption.port = process.env.DB_PORT;
                }
                if (!Utils.IsNull(synchronize)) {
                    selectedConnectionOption.synchronize = synchronize;
                }
                if (!Utils.IsNull(logging)) {
                    selectedConnectionOption.logging = logging;
                }
                if (!Utils.IsNull(selectedConnectionOption)) {
                    activeConnection = await createConnection(selectedConnectionOption);
                } else {
                    activeConnection = await createConnection();
                }
            } else {
                throw "No DATABASE Config to Load";
            }
        }
        console.log("ConnectionHelper: DB Connection Success -> " + activeConnection.name);
        return activeConnection;
    }
}