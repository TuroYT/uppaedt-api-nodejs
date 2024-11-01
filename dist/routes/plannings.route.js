"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planningSyncAll = exports.GetPlanningIdFomrationNomGroupe = void 0;
const database_1 = require("../tools/database");
// * route '/planning/GetPlanningIdFomrationNomGroupe'  body.nomGroupe, body.idFormation, body.rangeDate = 30, body.centerDate = new Date()
const GetPlanningIdFomrationNomGroupe = (req, res, next) => {
    const rangeDate = req.body.rangeDate || 30;
    let startDate = new Date(req.body.centerDate) || new Date();
    let endDate = new Date(req.body.centerDate) || new Date();
    startDate.setDate(startDate.getDate() - Math.floor(rangeDate / 2));
    endDate.setDate(endDate.getDate() + Math.floor(rangeDate / 2));
    console.log(startDate, endDate);
    // ! ne marche pas 
    const nomGroupes = Array.isArray(req.body.nomGroupes) ? req.body.nomGroupes : [];
    const idFormations = Array.isArray(req.body.idFormations) ? req.body.idFormations : [];
    (0, database_1.DoQuery)("SELECT * FROM `uppaCours` WHERE (`nomGroupe` IN (?) OR `nomGroupe` = 'NA') AND `idFormation` IN (?) AND `dateDeb` BETWEEN ? AND ? ORDER BY `dateDeb`", [nomGroupes, idFormations, startDate, endDate])
        .then((resQuery) => {
        res.json(resQuery);
    });
};
exports.GetPlanningIdFomrationNomGroupe = GetPlanningIdFomrationNomGroupe;
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
