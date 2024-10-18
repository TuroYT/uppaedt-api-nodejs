/*
    * Database connection
*/

const mysql = require("mysql")
const { getIcalFromWeb, prepareIcalForDB } = require("./gestionPlanning");
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


async function insertCourse(idGroupe, nomCours, dateDeb, dateFin, prof, lieu) {
    const QUERY = `
        INSERT INTO uppaCours (idGroupe, nomCours, dateDeb, dateFin, prof, lieu)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    
    return new Promise((resolve, reject) => {
        pool.query(QUERY, [idGroupe, nomCours, dateDeb, dateFin, prof, lieu], (err, results) => {
            if (err) {
                console.error('Error inserting course:', err);
                reject(err);
                return;
            }
            resolve(results);
        });
    });
}


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
    const QUERY = "SELECT * FROM `uppaFormation` ORDER BY nom;";
    
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
    const QUERY = "SELECT * FROM `uppaGroupe` ORDER BY nom;";
    
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
    const QUERY = "SELECT * from `uppaGroupe` WHERE `idFormation` = ?";

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
const getIcsLinks = (formationId) => {
    const QUERY = "SELECT `lienICS` FROM `icsLink` WHERE idFormation = ? ;";
    
    return new Promise((resolve, reject) => {
        pool.query(QUERY, [formationId], (err, results) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            let toReturn = []
            results.map((ics) => {toReturn.push(ics.lienICS)})
            resolve(toReturn);
        });
    });
}


// ! A continuer a partir d'ici
const syncPlannings = async () => {

    // supprimer les cours futurs
    const QUERY = "DELETE FROM `planning` WHERE dateDeb > NOW();";
    pool.query(QUERY, async (err, results) => {
        if (err) {
            console.error('Error deleting future courses:', err);
            return;
        }
        console.log('Deleted future courses:', results.affectedRows);
    
    
    
    
        const groups = await getAllGroups()
    

        for (let i in groups){
    
            // verif si le group est actif
            if (groups[i].active === 0) {
                continue;
            }
    
            getIcalFromWeb(groups[i].lien_ics)
            .then((ical) =>{
                let parsedIcal = prepareIcalForDB(ical, groups[i].id)
                
                for (k in parsedIcal) {
                    currentCourse = parsedIcal[k]
                    if (currentCourse.dateDeb > new Date)
                    {
                        insertCourse(currentCourse.groupId, currentCourse.nomCours, currentCourse.dateDeb, currentCourse.dateFin, currentCourse.prof, currentCourse.lieu, currentCourse.nomTp)
                    }
    
                }
    
    
            })
            .catch((err) => {
                console.log(err)
            })
    
    
    
    
        }
    
    
        
    
        console.log("Base de donnée syncronisé")
    
    
    
    
    
    
    
    });

    


}


syncPlannings()


exports.getAllFormation = getAllFormation;
exports.getAllGroups = getAllGroups;
exports.getGroupsFromFormation = getGroupsFromFormation;
exports.getIcsLink = getIcsLink;