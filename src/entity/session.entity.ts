import { UserType } from "../models/user.model";
import { Index, Entity, Column } from "typeorm";
import { PGBaseEntity } from "./base.entity";

@Entity("session")
@Index("session_session_token", ["session_token"], { unique: true })
export class Session extends PGBaseEntity {
    @Column("varchar", {
        nullable: false,
        primary: true,
        name: "session_token"
    })
    session_token: string;

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

    @Column("timestamp", {
        nullable: false,
        name: "last_accessed"
    })
    last_accessed: Date;

    @Column("timestamp", {
        nullable: true,
        name: "expiry"
    })
    expiry: Date;
}