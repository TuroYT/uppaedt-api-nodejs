"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPlannings = exports.getAllFormation = exports.DoQuery = void 0;
const mysql_1 = __importDefault(require("mysql"));
const gestionPlanning_js_1 = require("./gestionPlanning.js");
const dotenv_1 = __importDefault(require("dotenv"));
const db_config_1 = require("../configs/db.config"); // db config
dotenv_1.default.config();
//  ! Création de la connexion à la base de données
const pool = mysql_1.default.createPool({
    host: db_config_1.dbConfig.DB_HOST,
    user: db_config_1.dbConfig.DB_USER,
    password: db_config_1.dbConfig.DB_PASS,
    database: db_config_1.dbConfig.DB_NAME,
});
// Establish a connection to the database
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        console.log(db_config_1.dbConfig.DB_HOST, db_config_1.dbConfig.DB_USER);
        return;
    }
    console.log("Connected to the database", db_config_1.dbConfig.DB_HOST, "with threadId:", connection.threadId);
    connection.release();
});
// ! DoQuery
const DoQuery = (QUERY, PARAMETERS = []) => {
    return new Promise((resolve, reject) => {
        pool.query(QUERY, PARAMETERS, (err, results) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            console.log(QUERY, PARAMETERS);
            let toReturn = [];
            for (let k in results) {
                toReturn.push(results[k]);
            }
            resolve(toReturn);
        });
    });
};
exports.DoQuery = DoQuery;
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
const getAllFormation = () => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.getAllFormation = getAllFormation;
/**
 * Adds a new group to the database.
 *
 * @param {number} idGroupe - The ID of the group.
 * @param {string} nomGroupe - The name of the group.
 * @param {number} idFormation - The ID of the formation.
 * @returns {Promise<number>} A promise that resolves to the ID of the created group.
 */
const addGroup = (idGroupe, nomGroupe, idFormation) => {
    const QUERY = "INSERT INTO 'uppaGroupe' (idGroupe, nomGroupe, idFormation) VALUES (?, ?, ?);";
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
const syncPlannings = () => __awaiter(void 0, void 0, void 0, function* () {
    let thereIsAnError = false;
    global.totalSynced = 0;
    // supprimer les cours futurs
    const QUERY = `
        DELETE FROM \`uppaCours\` WHERE \`dateDeb\` > NOW();
    `;
    pool.query(QUERY, (err, results) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error("Error deleting future courses:", err);
            return;
        }
        console.log("Deleted future courses:", results.affectedRows);
    }));
    const doSync = () => __awaiter(void 0, void 0, void 0, function* () {
        // * get all ics links
        let icsLinks = yield getAllIcsLinks();
        let listGroup = [];
        for (let i in icsLinks) {
            let ical = yield (0, gestionPlanning_js_1.getIcalFromWeb)(icsLinks[i].lienICS);
            let parsedIcal = (0, gestionPlanning_js_1.prepareIcalForDB)(ical);
            for (let k in parsedIcal) {
                let currentCourse = parsedIcal[k];
                if (currentCourse.dateDeb > new Date()) {
                    (0, exports.DoQuery)("INSERT INTO `uppaCours`(`nomGroupe`, `nomCours`, `dateDeb`, `dateFin`, `prof`, `lieu`, `idFormation`) VALUES (? , ? , ? , ? , ?, ?, ?)", [
                        currentCourse.nomTp,
                        currentCourse.nomCours,
                        currentCourse.dateDeb,
                        currentCourse.dateFin,
                        currentCourse.prof,
                        currentCourse.lieu,
                        icsLinks[i].idFormation,
                    ]);
                }
            }
            global.totalSynced += parsedIcal.length;
            console.log(parsedIcal.length, " courses synced");
            // Remove duplicate courses with the same name and start date
            yield (0, exports.DoQuery)("DELETE c1 FROM `uppaCours` c1 INNER JOIN `uppaCours` c2 WHERE c1.idCours < c2.idCours AND c1.nomCours = c2.nomCours AND c1.dateDeb = c2.dateDeb;");
        }
    });
    yield doSync().catch((err) => {
        thereIsAnError = true;
        console.log(err);
    });
    return { error: thereIsAnError, nbSynced: global.totalSynced };
});
exports.syncPlannings = syncPlannings;
