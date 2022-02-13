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

import { ErrorMessage, ForeignUser, LoggedUser, ResponseMessage, UserLogin, UserPassword } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class User<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
    /**
     * @description This route is used to retrieve informations of the current user based on its token (`a JWT token is mandatory`).
     *
     * @tags Users
     * @name Get
     * @summary GET current user
     * @request GET:/user
     * @secure
     */
    get = (params: RequestParams = {}) =>
        this.request<LoggedUser, ErrorMessage>({
            path: `/user`,
            method: "GET",
            secure: true,
            format: "json",
            ...params,
        });
    /**
     * @description This route is used to add a new user to the application.
     *
     * @tags Users
     * @name Sign
     * @summary SIGNUP user
     * @request POST:/user/signup
     */
    sign = (data: ForeignUser, params: RequestParams = {}) =>
        this.request<ResponseMessage, ErrorMessage>({
            path: `/user/signup`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        });
    /**
     * @description This route is used to log the user in the application.
     *
     * @tags Users
     * @name Log
     * @summary LOG IN user
     * @request POST:/user/login
     */
    log = (data: UserLogin, params: RequestParams = {}) =>
        this.request<LoggedUser, ErrorMessage>({
            path: `/user/login`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        });
    /**
     * @description This route is used to remove user and all its informations from the database (`a JWT token is mandatory`).
     *
     * @tags Users
     * @name Delete
     * @summary DELETE user
     * @request DELETE:/user/{userId}
     * @secure
     */
    delete = (userId: string, params: RequestParams = {}) =>
        this.request<ResponseMessage, ErrorMessage>({
            path: `/user/${userId}`,
            method: "DELETE",
            secure: true,
            format: "json",
            ...params,
        });
    /**
     * @description This route is used to change the actual password of the user (`a JWT token is mandatory`).
     *
     * @tags Users
     * @name Modify
     * @summary MODIFY user's password
     * @request PUT:/user/{userId}
     * @secure
     */
    modify = (userId: string, data: UserPassword, params: RequestParams = {}) =>
        this.request<ResponseMessage, ErrorMessage>({
            path: `/user/${userId}`,
            method: "PUT",
            body: data,
            secure: true,
            type: ContentType.Json,
            format: "json",
            ...params,
        });
}
