import express, { query } from "express";
import { DoQuery, getAllFormation } from "../tools/database";


export const getProfs = (req : express.Request, res : express.Response, next: express.NextFunction) => {
    DoQuery("SELECT DISTINCT prof FROM `uppaCours` WHERE prof != 'NA'; ")
    .then((result) => {
        res.send(result)
    })
}