import { QueryResult } from "pg";
import { EntityRepository, Repository, getConnection } from "typeorm";
import { Feed } from "../entity/feed.entity";
import { Utils } from "../Utils/utils.service";
import { ICreateFeedRequest, ISearchFeedRequest, IUpdateFeedRequest } from "../models/feed.model";
import { PGBaseRepository } from "./base.repository";

@EntityRepository(Feed)
export class FeedRepository extends PGBaseRepository<Feed> {

    constructor() {
        super();
        this._repository = getConnection(process.env.DB_CONFIG).manager.getRepository(Feed);
    }

    async createFeed(createReq: ICreateFeedRequest, created_by: string): Promise<Feed> {
        const feed = await this._repository.create(createReq);
        this.OnEntityCreated(feed, created_by);
        return this._repository.save(feed);
    }

    async updateFeedInfo(updateRequest: IUpdateFeedRequest, updated_by: string): Promise<Feed> {
        const feed = await this.getFeedById(updateRequest.feed_id);
        if (Utils.IsNull(feed)) {
            return undefined;
        }
        else {
            if (!Utils.IsNull(updateRequest.feed_name)) {
                feed.feed_name = updateRequest.feed_name;
            }
            if (!Utils.IsNull(updateRequest.feed_url)) {
                feed.feed_url = updateRequest.feed_url;
            }
            if (!Utils.IsNull(updateRequest.feed_description)) {
                feed.feed_description = updateRequest.feed_description;
            }
        }
        this.OnEntityUpdated(feed, updated_by);
        return this._repository.save(feed);
    }

    async getFeedById(feed_id: string): Promise<Feed> {
        const feed = await this._repository.findOne({ feed_id: feed_id });
        return feed;
    }

    async removeFeed(feed_id: string): Promise<boolean> {
        const feedItem = await this.getFeedById(feed_id);
        if (!Utils.IsNull(feedItem)) {
            const feed = await this._repository.remove(feedItem);
            return !Utils.IsNull(feed);
        }
        return false;
    }

    async getFeedName(feed_name: string): Promise<Feed> {
        const feed = await this._repository.createQueryBuilder()
            .where("LOWER(feed_name) = LOWER(:feed_name)", { feed_name })
            .getOne();
        return feed;
    }

    async searchFeed(filter: ISearchFeedRequest): Promise<Feed[]> {
        let query: string = "SELECT * FROM " + this._repository.metadata.schema + "." + this._repository.metadata.tableName;
        let params = [];

        if (!Utils.IsNull(filter.feed_id)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push(filter.feed_id);
            query += "\"feed_id\"=$" + params.length.toString();
        }
        if (!Utils.IsNullOrEmpty(filter.feed_name)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push("%" + filter.feed_name.toLowerCase() + "%");
            query += "LOWER(\"feed_name\") LIKE $" + params.length.toString();
        }
        if (!Utils.IsNull(filter.active)) {
            if (params.length > 0) {
                query += " AND ";
            } else {
                query += " WHERE ";
            }
            params.push(filter.active);
            query += "\"active\"=$" + params.length.toString();
        }

        let result = await this._repository.query(query, params);
        return result;
    }
}