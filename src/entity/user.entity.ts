
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserType } from "../models/user.model";
import { PGBaseEntity } from "./base.entity";

@Entity("users")
export class User extends PGBaseEntity {
    @PrimaryGeneratedColumn("uuid", {
        name: "user_id"
    })
    user_id: string;

    @Column("varchar", {
        nullable: false,
        name: "user_type"
    })
    user_type: UserType;

    @Column("varchar", {
        nullable: false,
        unique: true,
        name: "user_name"
    })
    user_name: string;

    @Column("varchar", {
        nullable: true,
        unique: true,
        name: "mobile_number"
    })
    mobile_number: string;

    @Column("varchar", {
        nullable: false,
        unique: true,
        name: "email"
    })
    email: string;

    @Column("varchar", {
        nullable: true,
        name: "password"
    })
    password: string;

    @Column("bool", {
        nullable: false,
        default: true,
        name: "active"
    })
    active: boolean;
}