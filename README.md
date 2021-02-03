# GroupomaniaProject Back-end (Typescript)

This API uses a MySQL Database with Typeorm. 

Find the Front-end app at: https://github.com/Arno67000/ArnaudStutz_7_FRONT_15012021


## Installation (nodeJs required)

Clone the repository.
In the created directory, run npm install.

## Config

Rename the `.env.example` file to `.env`.
In the `.env` file, replace the `****` fields with the required informations (Database informations like Host, Username, Password etc AND the APP_PORT you want for the server).

## START (JavaScript mode)

Run `npm run tsc` to transpile the typescript (.ts) files to javascript (.js) in a `dist/` directory.
Run `npm start` to start the server and wait for the console to show : `Connecté à la DATABASE`.

## START in DEV mode (from typescript)

In the `.env` file, change the TYPEORM_ENTITIES line to : `TYPEORM_ENTITIES= entity/*.js, src/entity/**/*.ts`. 
Run `npm run dev` to start the server and wait for the console to show : `Connecté à la DATABASE`.
