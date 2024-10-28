//
// ? DB config file
//

import dotenv from 'dotenv';
dotenv.config();


// * DATABASE CONFIG
export const dbConfig = {
    DB_HOST: process.env.DB_HOST,
    DB_USER : process.env.DB_USER,
    DB_PASS : process.env.DB_PASS,
    DB_NAME : process.env.DB_NAME,
}

