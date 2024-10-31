"use strict";
/*
    ? Auteur : Romain PINSOLLE
    ? Site Web : romain-pinsolle.fr
    ? Projet : UPPAEDT - API REST
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importation des modules
const express_1 = __importDefault(require("express"));
const formations_routes_js_1 = require("./routes/formations.routes.js");
const plannings_route_js_1 = require("./routes/plannings.route.js");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
require('dotenv').config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json()); // to support JSON-encoded bodies
app.use(body_parser_1.default.urlencoded({
    extended: true
}));
app.use((0, cors_1.default)());
// LOGGING
app.use((req, res, next) => {
    console.log(`${new Date} : ${req.method} request for '${req.url}' by ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
    next(); // passe au middleware suivant
});
/*
    * Route principale
    * Description : Renvoie un message de bienvenue
*/
app.get('/', (req, res) => {
    res.send('UPPA - API REST <br> Auteur : Romain PINSOLLE <br> Site Web : romain-pinsolle.fr ');
});
// ? formations
app.get('/formations/getAll', formations_routes_js_1.retrieveAllFormations);
app.post('/formation/getGroups', formations_routes_js_1.getGroupsFromIdForamtion); // body : idFormation
//? Plannigs
app.post('/planning/GetPlanningIdFomrationNomGroupe', plannings_route_js_1.GetPlanningIdFomrationNomGroupe); // body.nomGroupe, body.idFormation, body.rangeDate = 30, body.centerDate = new Date()
app.get('/planning/syncAll', plannings_route_js_1.planningSyncAll);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
