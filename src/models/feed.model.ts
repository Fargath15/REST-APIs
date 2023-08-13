import * as joi from "joi";
import { Schema } from "joi";
import { IServiceResponse } from "../Utils/utils.service";
import { Feed } from "../entity/feed.entity";

export interface ICreateFeedRequest {
    feed_name: string;
    feed_description: string;
    feed_url: string;
}

export interface IUpdateFeedRequest {
    feed_id: string;
    feed_name: string;
    feed_description: string;
    feed_url: string;
}

export interface ISearchFeedRequest {
    feed_id: string;
    feed_name: string;
    active: boolean;
}

export interface IFeedResponse extends IServiceResponse {
    feed: Feed;
}

export interface IFeedListResponse extends IServiceResponse {
    feeds: Feed[];
}

export class FeedSchema {

    public static GetCreateFeedRequestSchema(): Schema {
        return joi.object().keys({
            feed_name: joi.string().required(),
            feed_description: joi.string(),
            feed_url: joi.string()
        });
    }

    public static GetUpdateFeedRequestSchema(): Schema {
        return joi.object().keys({
            feed_id: joi.string().uuid().required(),
            feed_name: joi.string(),
            feed_description: joi.string(),
            feed_url: joi.string()
        });
    }

    public static GetFeedRequestSchema(): Schema {
        return joi.object().keys({
            feed_id: joi.string().required()
        });
    }

    public static GetRemoveFeedRequestSchema(): Schema {
        return joi.object().keys({
            feed_id: joi.string().required()
        });
    }

    public static GetSearchFeedRequestSchema(): Schema {
        return joi.object().keys({
            feed_id: joi.string().uuid(),
            feed_name: joi.string(),
            active: joi.boolean()
        });
    }
}