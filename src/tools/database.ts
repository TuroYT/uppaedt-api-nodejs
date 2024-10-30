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

import { Formation, Groupe } from "./interfaces";
import mysql from "mysql";
import { getIcalFromWeb, prepareIcalForDB } from "./gestionPlanning.js";
import dotenv from "dotenv";
import { dbConfig } from "../configs/db.config"; // db config
dotenv.config();

//  ! Création de la connexion à la base de données
const pool = mysql.createPool({
  host: dbConfig.DB_HOST,
  user: dbConfig.DB_USER,
  password: dbConfig.DB_PASS,
  database: dbConfig.DB_NAME,
});

// Establish a connection to the database
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    console.log(dbConfig.DB_HOST, dbConfig.DB_USER )
    return;
  }
  console.log("Connected to the database", dbConfig.DB_HOST ,"with threadId:", connection.threadId);
  connection.release();
});

// ! DoQuery
export const DoQuery = (QUERY: string, PARAMETERS: any[] = []) => {
  return new Promise((resolve, reject) => {
    pool.query(QUERY, PARAMETERS, (err: any, results) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }

      let toReturn = [];

      for (let k in results) {
        toReturn.push(results[k]);
      }

      resolve(toReturn);
    });
  });
};

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
export const getAllFormation = async () => {
  // * Récupération de toutes les formations
  const QUERY = "SELECT * FROM `uppaFormation` ORDER BY nom;";

  return new Promise((resolve, reject) => {
    pool.query(QUERY, (err: any, results: Formation[]) => {
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
const addGroup = (idGroupe: string, nomGroupe: string, idFormation: number) => {
  const QUERY =
    "INSERT INTO 'uppaGroupe' (idGroupe, nomGroupe, idFormation) VALUES (?, ?, ?);";

  return new Promise((resolve, reject) => {
    pool.query(
      QUERY,
      [idGroupe, nomGroupe, idFormation],
      (err: any, results: any) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        // Return the ID of the created group
        resolve(results.insertId);
      }
    );
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
    pool.query(QUERY, (err: any, results: Groupe[]) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      resolve(results);
    });
  });
};

const getGroupsFromFormation = (formationId: number) => {
  const QUERY = "SELECT * from 'uppaGroupe' WHERE 'idFormation' = ?";

  return new Promise((resolve, reject) => {
    pool.query(QUERY, [formationId], (err: any, results: Groupe) => {
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
const getIcsLinks = (formationId: number) => {
  const QUERY = "SELECT 'lienICS' FROM 'icsLink' WHERE idFormation = ? ;";

  return new Promise((resolve, reject) => {
    pool.query(QUERY, [formationId], (err: any, results: any) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      let toReturn: string[] = [];
      results.map((ics: any) => {
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
    pool.query(QUERY, (err: any, results: any) => {
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
export const syncPlannings = async () => {
  let thereIsAnError = false;
  (global as any).totalSynced = 0;
  // supprimer les cours futurs
  const QUERY = `
        DELETE FROM \`uppaCours\` WHERE \`dateDeb\` > NOW();
    `;
  pool.query(QUERY, async (err: any, results: any) => {
    if (err) {
      console.error("Error deleting future courses:", err);
      return;
    }
    console.log("Deleted future courses:", results.affectedRows);
  });

  const doSync = async () => {
    // * get all ics links
    let icsLinks: any = await getAllIcsLinks();
    let listGroup = [];
    for (let i in icsLinks) {
      let ical = await getIcalFromWeb(icsLinks[i].lienICS);

      let parsedIcal = prepareIcalForDB(ical);

      for (let k in parsedIcal) {
        let currentCourse = parsedIcal[k];

        if (currentCourse.dateDeb > new Date()) {
          DoQuery(
            "INSERT INTO `uppaCours`(`nomGroupe`, `nomCours`, `dateDeb`, `dateFin`, `prof`, `lieu`, `idFormation`) VALUES (? , ? , ? , ? , ?, ?, ?)",
            [
              currentCourse.nomTp,
              currentCourse.nomCours,
              currentCourse.dateDeb,
              currentCourse.dateFin,
              currentCourse.prof,
              currentCourse.lieu,
              icsLinks[i].idFormation,
            ]
          );
        }
      }

      (global as any).totalSynced += parsedIcal.length;
      console.log(parsedIcal.length, " courses synced");
    }
  };

  await doSync().catch((err) => {
    thereIsAnError = true;
    console.log(err);
  });

  return { error: thereIsAnError, nbSynced: (global as any).totalSynced };
};
