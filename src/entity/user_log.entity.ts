import { Entity, Column, PrimaryColumn } from "typeorm";
import { PGBaseEntity } from "./base.entity";

@Entity("user_log")
export class UserLog extends PGBaseEntity {
    @PrimaryColumn("uuid", {
        name: "user_id"
    })
    user_id: string;

    @Column("varchar", {
        nullable: true,
        name: "log_file"
    })
    log_file: string;
}