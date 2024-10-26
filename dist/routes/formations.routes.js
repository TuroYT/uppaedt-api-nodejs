"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveAllFormations = void 0;
const database_1 = require("../tools/database");
const retrieveAllFormations = (req, res, next) => {
    (0, database_1.getAllFormation)()
        .then((results) => {
        res.json(results);
    })
        .catch((err) => {
        res.status(500).send('Internal Server Error');
    });
};
exports.retrieveAllFormations = retrieveAllFormations;
