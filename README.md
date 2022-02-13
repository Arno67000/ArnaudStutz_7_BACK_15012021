# **Groupomania_Project** _Back-end (Typescript)_

## **Introduction :**

This API is using a **_MySQL_** Database with **_Typeorm_** and is documented with **_swagger_**.

Find the Front-end app at: *https://github.com/Arno67000/ArnaudStutz_7_FRONT_15012021*

This project is controlled and formatted automatically by **_husky/prettier/ESlint_** and tested with **_jest_**.

#### _Prerequisites :_

-   MySQL database set up locally
-   Nodejs & yarn

#

## **Installation :**

Clone the repository.
In the newly created directory, run `yarn install`.

<br />

#### **Config :**

Rename the `.env.example` file to `.env`.
In the `.env` file, replace the `****` fields with the required informations (Database informations like Host, Username, Password etc AND the APP_PORT you want for the server).

#

## **START** _(production mode)_

-   Run `yarn build` to transpile the typescript (.ts) files to javascript (.js) in a `dist/` directory.
-   Make sure you have the right line related to typeOrm entities for production.
-   Run `yarn start` to start the server and wait for the console to show : <br /> `Connected to [TYPEORM_DATABASE] DB on port: [TYPEORM_PORT]` <br /> `Server running on port: [APP_PORT]`.

## **START in DEV mode** _(from typescript/nodemon)_

-   In the `.env` file, change the TYPEORM_ENTITIES line to : <br /> `TYPEORM_ENTITIES= entity/*.js, src/entity/**/*.ts`.
-   Run `yarn dev` to start the server and wait for the console to show : <br /> `Connected to [TYPEORM_DATABASE] DB on port: [TYPEORM_PORT]` <br /> `Server running on port: [APP_PORT]`..

#

## **Documentation :**

This api is documented with swagger, openApi 3.0.

#### _To explore all available api routes :_

-   run the application with `yarn dev` or `yarn build` + `yarn start` and open your browser to http://localhost:8000/docs

Data types and interfaces are auto-generated using `yarn swagger:full` :
this command runs `yarn swagger:bundle` (to generate the swagger.json file), `yarn swagger:gen` (to generate all types, interfaces, and api routes), and `yarn prettier:fix` (to format all generated files to crlf).

#

## **Husky, Prettier, ESlint**

To always maintain the quality and formatting of the code, I choose to set up several tools :

-   Prettier and ESlint to format the code and save all files in crlf to prevent merging troubles while working alternatively on Linux and Windows
-   husky : to setup several hooks on pre-commit and pre-push to help maintain automatically the quality of the code running Prettier and ESlint before commiting on running `git commit` and running `yarn test` (to make sure all tests are passing) and `yarn build` before pushing to github on running a `git push`.

Running `yarn husky:setup` will setup these hooks once and for all.

#

## **Testing with jest :**

-   run `yarn test` or `yarn test:watch` to run all the tests
-   run `yarn test:coverage` to run all the tests and check the actual coverage of the application

#
