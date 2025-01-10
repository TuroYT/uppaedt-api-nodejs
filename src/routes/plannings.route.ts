import express from "express";
import { DoQuery, syncPlannings } from "../tools/database";
import { Cours } from "../tools/interfaces";



// * route '/planning/GetPlanningIdFomrationNomGroupe'  body.nomGroupe, body.idFormation, body.rangeDate = 30, body.centerDate = new Date()
export const GetPlanningIdFomrationNomGroupe = (req : express.Request, res : express.Response, next: express.NextFunction) => {
    const rangeDate : number = req.body.rangeDate || 30;
    let startDate = new Date(req.body.centerDate) || new Date();
    let endDate = new Date(req.body.centerDate) || new Date();
    startDate.setDate(startDate.getDate() - Math.floor(rangeDate / 2));
    endDate.setDate(endDate.getDate() + Math.floor(rangeDate / 2));
    
    
    // Recupaération des nomGroupes et idFormations
    const nomGroupes  =  req.body.nomGroupes.split(',');
    const idFormations = req.body.idFormations.split(',');

    // récupération si il y a des profs
    if (req.body.profs === undefined){
        req.body.profs = ''
    }
    const profs = req.body.profs.split(',');
    console.log(profs.length, profs)

    // il existe des profs dans la requête
    if (profs[0] !== ''){
        DoQuery("SELECT * FROM `uppaCours` WHERE `prof` IN (?) AND `dateDeb` BETWEEN ? AND ? ORDER BY `dateDeb`", [profs, startDate, endDate])
        .then((resQuery) => {
            res.json(resQuery)
        })


    } else {
        DoQuery("SELECT * FROM `uppaCours` WHERE (`nomGroupe` IN (?) OR `nomGroupe` = 'NA') AND `idFormation` IN (?) AND `dateDeb` BETWEEN ? AND ? ORDER BY `dateDeb`", [nomGroupes, idFormations, startDate, endDate])
        .then((resQuery) => {
            res.json(resQuery)
        })
    
    
    }

    
    
    
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