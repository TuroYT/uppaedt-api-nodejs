import { DoQuery } from "./database";
import express from "express";


export const logsSomething = (endpoint : string, content : string, req : express.Request) => {
    DoQuery("INSERT INTO `logs` (`endpoint`, `timestamp`, `requestBody`, `ip`) VALUES (?, ?, ?, ?)", [
        "GetPlanningIdFomrationNomGroupe",
        new Date(),
        JSON.stringify(req.body),
        req.ip
    ])
    .then(() => console.log("Request logged"))
    .catch((error) => console.error("Logging error:", error));

}

