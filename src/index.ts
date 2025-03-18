/*
    ? Auteur : Romain PINSOLLE
    ? Site Web : romain-pinsolle.fr
    ? Projet : UPPAEDT - API REST
*/

// Importation des modules
import express from 'express';
import { getGroupsFromIdForamtion, retrieveAllFormations } from './routes/formations.routes.js';
import { GetPlanningIdFomrationNomGroupe, planningSyncAll } from './routes/plannings.route.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getProfs } from './routes/autres.routes.js';
import cron from 'node-cron';
import { syncPlannings } from './tools/database.js';
import axios from 'axios';

require('dotenv').config();

const app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(cors())


// LOGGING
app.use((req, res, next) => {
    console.log(`${new Date} : ${req.method} request for '${req.url}' by ${req.headers['x-forwarded-for'] || req.socket.remoteAddress }`);
    next(); // passe au middleware suivant
  });


/*
    * Route principale
    * Description : Renvoie un message de bienvenue
*/
app.get('/', (req: express.Request, res: express.Response) => {
    console.log(req.headers)
    res.send('UPPA - API REST <br> Auteur : Romain PINSOLLE <br> Site Web : romain-pinsolle.fr <br> modif du 13/03/2025 - 2<br><br> <a href="/planning/syncAll">Syncro manuelle</a>');
});



// ? formations
app.get('/formations/getAll', retrieveAllFormations)
app.post('/formation/getGroups', getGroupsFromIdForamtion) // body : idFormation

//? Autres
app.get('/getProfs', getProfs)

//? Plannigs
app.post('/planning/GetPlanningIdFomrationNomGroupe', GetPlanningIdFomrationNomGroupe) // body.nomGroupe, body.idFormation, body.rangeDate = 30, body.centerDate = new Date()
app.get('/planning/syncAll', planningSyncAll)



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    if (process.env.CRON_ENABLED === "1") {
        console.log("Les updates automatiques sont activés")
        cron.schedule('0 2 * * *', () => {
            console.log('Running syncAll at 2AM');

            const webhookUrl = process.env.DISCORD_WEBHOOK_URL ;

            if (webhookUrl) {
                axios.post(webhookUrl, {
                    content: 'Running syncAll at 2AM',
                }).catch(error => {
                    console.error('Error sending Discord webhook:', error.message);
                });
            } else {
                console.warn('Discord webhook URL is not defined in environment variables.');
            }

            syncPlannings();
        });
    }


});



