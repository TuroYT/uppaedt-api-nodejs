import express from "express";
import { DoQuery, syncPlannings } from "../tools/database";
import { Cours } from "../tools/interfaces";



// * route '/planning/getFromGroupeId'
export const getPlanningfromIdGroupe = (req : express.Request, res : express.Response, next: express.NextFunction) => {
    DoQuery("SELECT * FROM `uppaCours` WHERE `idGroupe` = ?", [req.body.idGroupe])
    .then((resQuery) => {
        res.json(resQuery)
    })
}

// * route '/planning/syncAll'
export const planningSyncAll = (req : express.Request, res : express.Response, next: express.NextFunction) => {
    syncPlannings().then(
        (result) => {
            if (result.error){
                res.status(500).send('internal server Error')
            }
            else
            {
                res.json(result)
            }

        }
    )
}