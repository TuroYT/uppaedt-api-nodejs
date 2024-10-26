import express from "express";
import { getAllFormation } from "../tools/database";

export const retrieveAllFormations = (req : express.Request, res : express.Response, next: express.NextFunction) => {
    getAllFormation()
        .then((results : any) => {
            res.json(results);
        })
        .catch((err: any) => {
            res.status(500).send('Internal Server Error');
        });
}



