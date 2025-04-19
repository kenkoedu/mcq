import { initializeApp } from "firebase/app";
import { collection, getFirestore } from "firebase/firestore";
import type { Question, Topic, Textbook } from "~/types";
import type { CollectionReference } from "firebase/firestore";

// Read Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Basic validation to ensure variables are loaded
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration environment variables are missing!");
  // Optionally, throw an error or handle this case appropriately
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const questionsCollection = collection(db, "questions") as CollectionReference<Question>; // Cast to CollectionReference<Question>
const topicsCollection = collection(db, "topics") as CollectionReference<Topic>; // Cast to CollectionReference<Question>
const textbooksCollection = collection(db, "textbooks") as CollectionReference<Textbook>; // Cast to CollectionReference<Question>

export { db, questionsCollection, topicsCollection, textbooksCollection };