export interface Topic {
  "tId": number;
  "tTitleE": string;
  "tTitleC": string;
  "isJunior": boolean;
  "aristo": number;
}

export interface Subtopic {
  id?: string; // Firestore document ID (optional)
  tId: number; // Foreign key to Topic
  stSeq: number; // Sequence number within the topic
  stId: number; // Derived ID (tId * 100 + stSeq)
  stTitleC: string | null; // Allow null for empty title
  stTitleE: string | null; // Allow null for empty title
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
  stIds?: number[];
  ans: string;
  hkPercent: number;
}

export interface Chapter {
  cNum: number;
  chTitleC: string; // Corrected field name for Chinese Title
  chTitleE: string; // Corrected field name for English Title
}

export interface Textbook {
  chapters: Chapter[];
  isJunior: boolean;
  publisher: string;
  tbId: string; //The unique identifier for the textbook. Example: "ARISTO_INSIGHT"
  tbTitleC: string;
  tbTitleE: string;
}
