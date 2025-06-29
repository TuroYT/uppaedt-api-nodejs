/*
? Gestion des plannings
*/

import { info } from "console";
import ical from "ical";
import { DoQuery } from "./database";
import https from "https";
import fetch from "node-fetch";

/*
 * fetch du ical et le parse
 */
export const getIcalFromWeb = async (icalURL: string) => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,  
  });

  const response = await fetch(icalURL, { agent: httpsAgent });
  const vcalendar = await response.text();
  const parsed = ical.parseICS(vcalendar);
  return parsed;
};

export const prepareIcalForDB = async (ical: any) => {
  let preparedEvent = [];

  // event Formating
  for (let k in ical) {
    // Verification si c'est un event
    if (ical[k].type === "VEVENT") {
      // Verif HyperPlanning
      if (ical[k].categories) {
        // ! le planning est au format hyperplanning
        // implémentation future
      } else {
        // * planning générique
        let infos = ical[k].description.split("\n");
        let prof;
        let groupeTp;
        if (infos.length === 5) {
          // pas de prof
          prof = "NA";
          groupeTp = infos[2]; // ex : 'TP 5'
        } else if (infos.length === 6) {
          prof = infos[3]; // ex : 'YESSOUFOU F. - Info'
          groupeTp = infos[2]; // ex : 'TP 5'
        } else {
          prof = "NA";
          groupeTp = "NA";
        }
        let event = {
          nomCours: ical[k].summary,
          dateDeb: new Date(ical[k].start),
          dateFin: new Date(ical[k].end),
          prof: prof,
          lieu: ical[k].location,
          nomTp: groupeTp,
        };
        preparedEvent.push(event);
      }
    }
  }
  return preparedEvent;
};

// ?
// ? Exemples de données
// ?

/*
iut info
getIcalFromWeb(
  "https://www.iutbayonne.univ-pau.fr/outils/edt/default/export?ID=361"
).then((res) => {
  prepareIcalForDB(res);
});
/*
ADE6049555464654261796f6e6e65323032342d323032352832292d333830342d302d30: {
    type: 'VEVENT',
    params: [],
    dtstamp: 2024-10-16T14:30:38.000Z { tz: undefined },
    start: 2024-10-25T09:00:00.000Z { tz: undefined },
    end: 2024-10-25T10:30:00.000Z { tz: undefined },
    summary: 'R1.04 - Intro. systèmes TP 5',
    location: 'S.021',
    description: '\n\nTP 5\nLEDOUX A.-INFO\n(Exporté le:16/10/2024 16:30)\n',
    uid: 'ADE6049555464654261796f6e6e65323032342d323032352832292d333830342d302d30',
    created: 1970-01-01T00:00:00.000Z { tz: undefined },
    lastmodified: 2024-10-16T14:30:38.000Z { tz: undefined },
    sequence: '-1865907858'
  }
*/

// LLCER

//getIcalFromWeb("https://univ-pau-planning2024-25.hyperplanning.fr/hp/Telechargements/ical/Edt_L1_LLCER___EA.ics?version=2024.0.8.0&icalsecurise=5325F56562BE3FC2802FB022452E2B39DBD97A98D5DE32A67275D56B03D3D0D7F82E9676C6048CB0BD98298EA97C99C1&param=643d5b312e2e36325d2666683d3126663d3131303030").then((res) => {
//  prepareIcalForDB(res)
//})

/*
'Ferie-409-L1_LLCER_-_EA-Index-Education': {
    type: 'VEVENT',
    params: [],
    categories: [ 'HYPERPLANNING' ],
    dtstamp: 2024-10-16T14:29:42.000Z { tz: undefined },
    uid: 'Ferie-409-L1_LLCER_-_EA-Index-Education',
    start: 2025-08-14T22:00:00.000Z { tz: undefined, dateOnly: true },
    end: 2025-08-15T22:00:00.000Z { tz: undefined, dateOnly: true },
    summary: { params: [Object], val: 'Férié' }
  }

  'Cours-42028-9-L1_LLCER_-_EA-Index-Education': {
    type: 'VEVENT',
    params: [],
    categories: [ 'HYPERPLANNING' ],
    dtstamp: 2024-10-16T14:31:29.000Z { tz: undefined },
    lastmodified: 2024-09-04T07:51:35.000Z { tz: undefined },
    uid: 'Cours-42028-9-L1_LLCER_-_EA-Index-Education',
    start: 2024-10-21T11:30:00.000Z { tz: undefined },
    end: 2024-10-21T13:00:00.000Z { tz: undefined },
    summary: {
      params: [Object],
      val: 'Découverte CM Lettres S1, Découverte CM Lettres S1 - Découverte Lettres S1 - ANDREUCCI - Cours'
    },
    location: { params: [Object], val: 'Amphi 2 (LET-00)' },
    description: {
      params: [Object],
      val: 'Options : Découverte CM Lettres S1, Découverte CM Lettres S1\n' +
        'Matière : Découverte Lettres S1\n' +
        'Enseignant : ANDREUCCI\n' +
        'Type : Cours\n' +
        'Salle : Amphi 2 (LET-00)\n'
    },
    'ALT-DESC': {
      params: [Object],
      val: 'Options : Découverte CM Lettres S1, Découverte CM Lettres S1<br/>Matière : Découverte Lettres S1<br/>Enseignant : ANDREUCCI<br/>Type : Cours<br/>Salle : Amphi 2 (LET-00)<br/>'
    }
  },



*/
