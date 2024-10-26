export interface Formation {
  idFormation: number;
  nom: string;
  description: string;
  estActif: boolean;
}

export interface Groupe {
  idGroupe: string; // format : formationId-nomGroupe
  nomGroupe: string;
  idFormation: number;
}

export interface Cours {
  idCours : number,
  nomCours : string,
  dateDeb : Date,
  dateFin : Date,
  prof : string,
  lieu : string,
  idGroupe : string
}