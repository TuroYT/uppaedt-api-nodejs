/*

? Auteur : Romain PINSOLLE
? fichier qui gère la connection à la base de donnée


! Listes des fontions de cette page  

* insertCourse(idGroupe, nomCours, dateDeb, dateFin, prof, lieu)
* getAllFormation()
* addGroup(idGroupe, nomGroupe, idFormation)
* getAllGroups()
* getGroupsFromFormation(formationId)
* getIcsLinks(formationId)
? syncPlannings() sync des plannings 

*/

const mysql = require("mysql");
const { getIcalFromWeb, prepareIcalForDB } = require("./gestionPlanning");
require("dotenv").config();

// Récupération des variables d'environnement
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

// Vérification des variables d'environnement
if (!DB_HOST || !DB_USER || !DB_PASS || !DB_NAME) {
  console.error("Missing environment variables. Please check the .env file.");
  process.exit(1);
}

//  ! Création de la connexion à la base de données
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});




async function insertCourse(idGroupe, nomCours, dateDeb, dateFin, prof, lieu) {
  const QUERY = `
        INSERT INTO \`uppaCours\` (\`idGroupe\`, \`nomCours\`, \`dateDeb\`, \`dateFin\`, \`prof\`, \`lieu\`)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

  return new Promise((resolve, reject) => {
    pool.query(
      QUERY,
      [idGroupe, nomCours, dateDeb, dateFin, prof, lieu],
      (err, results) => {
        if (err) {
          console.error("Error inserting course:", err);
          reject(err);
          return;
        }
        resolve(results);
      }
    );
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
  const QUERY = "SELECT * FROM 'uppaFormation' ORDER BY nom;";

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

/**
 * Adds a new group to the database.
 *
 * @param {number} idGroupe - The ID of the group.
 * @param {string} nomGroupe - The name of the group.
 * @param {number} idFormation - The ID of the formation.
 * @returns {Promise<number>} A promise that resolves to the ID of the created group.
 */
const addGroup = (idGroupe, nomGroupe, idFormation) => {
  const QUERY =
    "INSERT INTO 'uppaGroupe' (idGroupe, nomGroupe, idFormation) VALUES (?, ?, ?);";

  return new Promise((resolve, reject) => {
    pool.query(QUERY, [idGroupe, nomGroupe, idFormation], (err, results) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      // Return the ID of the created group
      resolve(results.insertId);
    });
  });
};

/**
 * Retrieves all groups from the 'uppaGroupe' table, ordered by the 'nom' column.
 *
 * @returns {Promise<Object[]>} A promise that resolves to an array of group objects.
 * @throws {Error} If there is an error executing the query.
 */
const getAllGroups = () => {
  const QUERY = "SELECT * FROM 'uppaGroupe' ORDER BY nom;";

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

const getGroupsFromFormation = (formationId) => {
  const QUERY = "SELECT * from 'uppaGroupe' WHERE 'idFormation' = ?";

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
};

/**
 * Retrieves the ICS link for a given group ID from the database.
 *
 * @param {formationId} formationId - The ID of the formation for which to retrieve the ICS link.
 * @returns {Promise<String>} A promise that resolves to the ICS link of the specified group.
 */
const getIcsLinks = (formationId) => {
  const QUERY = "SELECT 'lienICS' FROM 'icsLink' WHERE idFormation = ? ;";

  return new Promise((resolve, reject) => {
    pool.query(QUERY, [formationId], (err, results) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      let toReturn = [];
      results.map((ics) => {
        toReturn.push(ics.lienICS);
      });
      resolve(toReturn);
    });
  });
};

/**
 * Retrieves all active ICS links from the database.
 *
 * This function executes a SQL query to select `lienICS` and `idFormation` 
 * from the `icsLink` table, joining with the `uppaFormation` table to ensure 
 * that only active formations (`estActif` = 1) are included.
 *
 * @returns {Promise<Object[]>} A promise that resolves to an array of objects, 
 * each containing `lienICS` and `idFormation` properties.
 *
 * @throws {Error} If there is an error executing the query, the promise is rejected with the error.
 */
const getAllIcsLinks = () => {
  const QUERY = `
        SELECT \`lienICS\`, \`uppaFormation\`.\`idFormation\`
        FROM \`icsLink\`
        JOIN \`uppaFormation\` ON \`icsLink\`.\`idFormation\` = \`uppaFormation\`.\`idFormation\`
        WHERE \`uppaFormation\`.\`estActif\` = 1;
    `;

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

/**
 * Synchronizes planning data by performing the following steps:
 * 1. Deletes future courses from the `uppaCours` table.
 * 2. Retrieves all ICS links.
 * 3. Fetches and processes iCal data from each ICS link.
 * 4. Inserts new courses into the database if they are scheduled for the future.
 * 
 * @async
 * @function syncPlannings
 * @returns {Promise<Object>} An object containing an error flag and the number of synchronized courses.
 * @property {boolean} error - Indicates if there was an error during synchronization.
 * @property {number} nbSynced - The total number of courses synchronized.
 */
const syncPlannings = async () => {
    let thereIsAnError = false;
    global.totalSynced = 0;
  // supprimer les cours futurs
  const QUERY = `
        DELETE FROM \`uppaCours\` WHERE \`dateDeb\` > NOW();
    `;
  pool.query(QUERY, async (err, results) => {
    if (err) {
      console.error("Error deleting future courses:", err);
      return;
    }
    console.log("Deleted future courses:", results.affectedRows);
  });
  // * get all ics links
  let icsLinks = await getAllIcsLinks();
  let listGroup = [];

  const doSync = async () => { for (let i in icsLinks) {
    await getIcalFromWeb(icsLinks[i].lienICS)
      .then((ical) => {
        let parsedIcal = prepareIcalForDB(ical);

        for (k in parsedIcal) {
          currentCourse = parsedIcal[k];
          const groupId = icsLinks[i].idFormation + "-" + currentCourse.nomTp;

          if (currentCourse.dateDeb > new Date()) {
            // idGroupe, nomCours, dateDeb, dateFin, prof, lieu
            insertCourse(
              groupId,
              currentCourse.nomCours,
              currentCourse.dateDeb,
              currentCourse.dateFin,
              currentCourse.prof,
              currentCourse.lieu,
              currentCourse.nomTp
            );
          }
        }

        global.totalSynced += parsedIcal.length;
        console.log(parsedIcal.length,  " courses synced")

      })
      .catch((err) => {
        console.log(err);
      })
      
      
  }}

  await doSync().catch((err) => {
    thereIsAnError = true;
    console.log(err)
  })
  

  return({error: thereIsAnError, nbSynced : global.totalSynced});
};



exports.getAllFormation = getAllFormation;
exports.getAllGroups = getAllGroups;
exports.getGroupsFromFormation = getGroupsFromFormation;
//exports.getIcsLink = getIcsLink;
