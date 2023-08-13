import { EntityManager, Repository } from "typeorm";
import { PGBaseEntity } from "../entity/base.entity";

export class PGBaseRepository<T extends PGBaseEntity> extends Repository<T> {
    _repository: Repository<T>;

    constructor(entityManager?: EntityManager) {
        super();
    }

    public async OnEntityCreated(entity: T, userID?: string) {
        entity.created_at = new Date();
        entity.created_by = userID;
    }

    public async OnEntityUpdated(entity: T, userID?: string) {
        entity.updated_at = new Date();
        entity.updated_by = userID;
    }
}
