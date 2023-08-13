import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PGBaseEntity } from "./base.entity";

@Entity("feed")
export class Feed extends PGBaseEntity {
    @PrimaryGeneratedColumn("uuid", {
        name: "feed_id"
    })
    feed_id: string;

    @Column("varchar", {
        nullable: false,
        name: "feed_name"
    })
    feed_name: string;

    @Column("varchar", {
        nullable: true,
        name: "feed_description"
    })
    feed_description: string;

    @Column("varchar", {
        nullable: true,
        name: "feed_url"
    })
    feed_url: string;

    @Column("bool", {
        nullable: false,
        default: true,
        name: "active"
    })
    active: boolean;
}