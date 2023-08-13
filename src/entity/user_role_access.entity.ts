import { Index, Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Access } from "../models/userRoleAccess.model";
import { UserType } from "../models/user.model";
import { PGBaseEntity } from "./base.entity";

@Entity("user_role_access")
@Index("user_role_access_role_access_id", ["role_access_id"], { unique: true })
export class UserRoleAccess extends PGBaseEntity {
    @PrimaryGeneratedColumn("uuid", {
        name: "role_access_id"
    })
    role_access_id: string;

    @Column("uuid", {
        nullable: false,
        name: "user_id"
    })
    user_id: string;

    @Column("varchar", {
        nullable: false,
        name: "user_type"
    })
    user_type: UserType;

    @Column("uuid", {
        nullable: true,
        name: "feed_id"
    })
    feed_id: string;

    @Column("varchar", {
        nullable: false,
        name: "controller"
    })
    controller: string;

    @Column("varchar", {
        nullable: false,
        name: "access_level"
    })
    access_level: Access;
}