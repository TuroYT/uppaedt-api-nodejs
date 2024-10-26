"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planningSyncAll = exports.getPlanningfromIdGroupe = void 0;
const database_1 = require("../tools/database");
// * route '/planning/getFromGroupeId'
const getPlanningfromIdGroupe = (req, res, next) => {
    (0, database_1.DoQuery)("SELECT * FROM `uppaCours` WHERE `idGroupe` = ?", [req.body.idGroupe])
        .then((resQuery) => {
        res.json(resQuery);
    });
};
exports.getPlanningfromIdGroupe = getPlanningfromIdGroupe;
// * route '/planning/syncAll'
const planningSyncAll = (req, res, next) => {
    (0, database_1.syncPlannings)().then((result) => {
        if (result.error) {
            res.status(500).send('internal server Error');
        }
        else {
            res.json(result);
        }
    });
};
exports.planningSyncAll = planningSyncAll;
