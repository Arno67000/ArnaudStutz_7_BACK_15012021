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

export interface ForeignUser {
    pseudo: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface UserLogin {
    pseudo: string;
    password: string;
}

export interface LoggedUser {
    pseudo: string;
    password: string;
    firstName: string;
    lastName: string;
    id: string;
    token: string;
}

export interface User {
    pseudo: string;
    password: string;
    firstName: string;
    lastName: string;
    id: string;
}

export interface ResponseMessage {
    message: string;
}

export interface ErrorMessage {
    Error: string;
}
