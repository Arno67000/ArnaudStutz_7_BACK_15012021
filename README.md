# GroupomaniaProject Back-end (Typescript)

This API uses a MySQL Database with Typeorm. 

Find the Front-end app at: https://github.com/Arno67000/ArnaudStutz_7_FRONT_15012021


## Installation (nodeJs required)

Clone the repository.
In the created directory, run npm install.

## Config

Rename the `.env.example` file to `.env`.
In the `.env` file, replace the `****` fields with the required informations (Database informations like Host, Username, Password etc AND the APP_PORT you want for the server).
Run `npm run tsc` to transpile the typescript (.ts) files to javascript (.js) in a `dist/` directory.

## START

Run `npm start` to start the server and wait for the console to show : `Connecté à la DATABASE`.
