import * as dotenv from "dotenv";
import { ConnectionOptions, getCustomRepository } from "typeorm";
import { Utils } from "../Utils/utils.service";
import { ConnectionHelper } from "../connection";
let connections = require("../../ormconfig.json");

if (Utils.IsNull(connections)) {
    connections = require("../../ormconfig.json");
}

if (Utils.IsNullOrEmpty(process.env.ENV)) {
    console.log("Loading from config -> env.dev.local");
    dotenv.config({ path: "./.env.dev.local" });
} else {
    console.log("Loading from config -> env." + process.env.ENV);
    dotenv.config({ path: "./.env." + process.env.ENV });
}

console.log("Creating Repositories In -> " + process.env.DB_CONFIG);

async function CreateTables() {
    try {
        let connectionOptions: ConnectionOptions[] = connections;
        let connectionHelper: ConnectionHelper = new ConnectionHelper();
        connectionHelper.CreateConnection(connectionOptions, true, false).then(async connection => {
            console.log("Connected to", connection.name);
        });
    } catch (error) {
        console.log("EXCEPTION");
        console.log(error);
    }

}

export default CreateTables();
