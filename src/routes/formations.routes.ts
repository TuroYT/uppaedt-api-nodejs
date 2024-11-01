import express, { query } from "express";
import { DoQuery, getAllFormation } from "../tools/database";

export const retrieveAllFormations = (req : express.Request, res : express.Response, next: express.NextFunction) => {
    getAllFormation()
        .then((results : any) => {
            res.json(results);
        })
        .catch((err: any) => {
            res.status(500).send('Internal Server Error');
        });
}


export const getGroupsFromIdForamtion = (req : express.Request, res : express.Response, next: express.NextFunction) => {
    DoQuery("SELECT DISTINCT nomGroupe, idFormation FROM `uppaCours` WHERE idFormation = ? AND NOT `nomGroupe` = 'NA' ORDER BY nomGroupe ;", [req.body.idFormation])
    .then((result) => {
        res.send(result)
    })
}
