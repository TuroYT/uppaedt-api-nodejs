/*
    ? Auteur : Romain PINSOLLE
    ? Site Web : romain-pinsolle.fr
    ? Projet : UPPAEDT - API REST
*/

// Importation des modules
const express = require('express');
const { getAllFormation } = require('./tools/database.tsx');
require('dotenv').config();

const app = express();


const API_VERSION = 'v1.0.0';


/*
    * Route principale
    * Description : Renvoie un message de bienvenue
*/
app.get('/', (req, res) => {
    res.send('UPPA - API REST <br> Auteur : Romain PINSOLLE <br> Site Web : romain-pinsolle.fr <br> Version ' + API_VERSION)
});

app.get('/formations/getall', (req, res) => {
    getAllFormation()
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            res.status(500).send('Internal Server Error');
        });
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



