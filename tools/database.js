/*
    * Database connection
*/

const mysql = require("mysql")
require('dotenv').config();

// Récupération des variables d'environnement
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

// Vérification des variables d'environnement
if (!DB_HOST || !DB_USER || !DB_PASS || !DB_NAME) {
    console.error('Missing environment variables. Please check the .env file.');
    process.exit(1);
}

// Création de la connexion à la base de données
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME
});





/**
 * Retrieves all formations from the database.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of formations.
 * @throws {Error} If there is an error executing the query.
 * 
 * Exemple de données retournées :
  {
    id: 3,
    nom: 'LLCER - EA',
    description: '',
    lieux: 'Pau'
  }

 * 
 */
const getAllFormation = async () => {
    // * Récupération de toutes les formations
    const QUERY = "SELECT * FROM `uppa_formation` ORDER BY nom;";
    
    return new Promise((resolve, reject) => {
        pool.query(QUERY, (err, results) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(results);
        });
    });
};


const getAllGroups = () => {
    const QUERY = "SELECT * FROM `uppa_groupe` ORDER BY nom;";
    
    return new Promise((resolve, reject) => {
        pool.query(QUERY, (err, results) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(results);
        });
    });
}


const getGroupsFromFormation = (formationId) => {
    const QUERY = "SELECT g.id, g.nom, g.lien_ics FROM uppa_groupe g INNER JOIN uppa_rel_formation_groupe fg ON g.id = fg.groupe_id WHERE fg.formation_id = ? ORDER BY g.nom";

    return new Promise((resolve, reject) => {
        pool.query(QUERY, [formationId], (err, results) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(results);
        });
    });
}

/**
 * Retrieves the ICS link for a given group ID from the database.
 *
 * @param {Numbereee} groupId - The ID of the group for which to retrieve the ICS link.
 * @returns {Promise<String>} A promise that resolves to the ICS link of the specified group.
 */
const getIcsLink = (groupId) => {
    const QUERY = "SELECT lien_ics FROM `uppa_groupe` WHERE id = ? ;";
    
    return new Promise((resolve, reject) => {
        pool.query(QUERY, [groupId], (err, results) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(results[0].lien_ics);
        });
    });
}

getGroupsFromFormation(2).then((res) => {console.log(res)})

exports.getAllFormation = getAllFormation;
exports.getAllGroups = getAllGroups;
exports.getGroupsFromFormation = getGroupsFromFormation;
exports.getIcsLink = getIcsLink;