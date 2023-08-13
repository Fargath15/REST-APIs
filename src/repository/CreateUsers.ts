import * as dotenv from "dotenv";
import { ConnectionOptions, getCustomRepository } from "typeorm";
import { Utils } from "../Utils/utils.service";
import { ConnectionHelper } from "../connection";
import { UserRepository } from "./user.repository";
import { UserType } from "../models/user.model";
import { UserLogRepository } from "./user_log.repository";
import { User } from "../entity/user.entity";
let connections = require("../../ormconfig.json");

if (Utils.IsNullOrEmpty(process.env.ENV)) {
    console.log("Loading from config -> env.dev.local");
    dotenv.config({ path: "./.env.dev.local" });
} else {
    console.log("Loading from config -> env." + process.env.ENV);
    dotenv.config({ path: "./.env." + process.env.ENV });
}

async function createUsers() {
    try {
        let connectionOptions: ConnectionOptions[] = connections;
        let connectionHelper: ConnectionHelper = new ConnectionHelper();
        await connectionHelper.CreateConnection(connectionOptions).then(async connection => {
            console.log("connection name -> ", connection.name);
            let userRepository = getCustomRepository(UserRepository, process.env.DB_CONFIG);
            let userLogRepository = getCustomRepository(UserLogRepository, process.env.DB_CONFIG);

            let superAdmin: User = await userRepository.findOne({ user_type: UserType.SuperAdmin });
            if (Utils.IsNull(superAdmin)) {
                if (!Utils.IsNullOrEmpty(process.env.USER_NAME) && !Utils.IsNullOrEmpty(process.env.EMAIL) && !Utils.IsNullOrEmpty(process.env.PASSWORD)) {
                    superAdmin = await userRepository.createUser({
                        user_name: process.env.USER_NAME,
                        email: process.env.EMAIL,
                        mobile_number: process.env.MOBILE_NUMBER,
                        password: process.env.PASSWORD,
                        user_type: UserType.SuperAdmin
                    });
                    await userLogRepository.saveUserLog(superAdmin.user_id, `${superAdmin.user_type} ${superAdmin.user_name} has been created`);
                } else {
                    throw "Invalid Data";
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
}

createUsers();
