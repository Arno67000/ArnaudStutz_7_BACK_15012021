/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { ErrorMessage, ResponseMessage, Tweet, TweetArray, TweetContent } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Tweets<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
    /**
     * @description This route is used to retrieve all the tweets from the database (`a JWT token is mandatory`).
     *
     * @tags Tweets
     * @name GetAll
     * @summary GET all the tweets
     * @request GET:/tweets
     * @secure
     */
    getAll = (params: RequestParams = {}) =>
        this.request<TweetArray, ErrorMessage>({
            path: `/tweets`,
            method: "GET",
            secure: true,
            format: "json",
            ...params,
        });
    /**
     * @description This route is used to post a new tweet (`a JWT token is mandatory`).
     *
     * @tags Tweets
     * @name Post
     * @summary POST a new tweet
     * @request POST:/tweets
     * @secure
     */
    post = (data: TweetContent, params: RequestParams = {}) =>
        this.request<Tweet, ErrorMessage>({
            path: `/tweets`,
            method: "POST",
            body: data,
            secure: true,
            type: ContentType.Json,
            format: "json",
            ...params,
        });
    /**
     * @description This route is used to remove a specific tweet (`a JWT token is mandatory`).
     *
     * @tags Tweets
     * @name DeleteTweet
     * @summary DELETE a tweet
     * @request DELETE:/tweets/{tweetId}
     * @secure
     */
    deleteTweet = (tweetId: string, params: RequestParams = {}) =>
        this.request<ResponseMessage, ErrorMessage>({
            path: `/tweets/${tweetId}`,
            method: "DELETE",
            secure: true,
            format: "json",
            ...params,
        });
    /**
     * @description This route is used to modify the content of a previously posted tweet (`a JWT token is mandatory`).
     *
     * @tags Tweets
     * @name ModifyContent
     * @summary MODIFY a tweet
     * @request PUT:/tweets/{tweetId}
     * @secure
     */
    modifyContent = (tweetId: string, data: TweetContent, params: RequestParams = {}) =>
        this.request<Tweet, ErrorMessage>({
            path: `/tweets/${tweetId}`,
            method: "PUT",
            body: data,
            secure: true,
            type: ContentType.Json,
            format: "json",
            ...params,
        });
}
