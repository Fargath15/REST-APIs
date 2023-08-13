import { Column, BaseEntity } from "typeorm";

export class PGBaseEntity extends BaseEntity {
    @Column("timestamp", {
        nullable: true,
        name: "created_at"
    })
    created_at: Date;

    @Column("uuid", {
        nullable: true,
        name: "created_by"
    })
    created_by: string;

    @Column("timestamp", {
        nullable: true,
        name: "updated_at"
    })
    updated_at: Date;

    @Column("uuid", {
        nullable: true,
        name: "updated_by"
    })
    updated_by: string;
}