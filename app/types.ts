export interface Topic {
  "tId": number;
  "tTitleE": string;
  "tTitleC": string;
  "isJunior": boolean;
  "mia_e2": number | null;
}

export interface Question {
  year: number;
  paper: number;
  qNum: number;
  qText: string;
  isStatements: boolean;
  statements: string[];
  choices: string[];
  hasImage: boolean;
  qId: number;
  tId: number[];
  ans: string;
  hkPercent: number;
}
