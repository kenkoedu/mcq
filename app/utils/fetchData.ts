import { getDocs, query, where, collection, orderBy, limit, QuerySnapshot, doc, getDoc } from "firebase/firestore"; // Added getDoc, QuerySnapshot, doc
import { db, questionsCollection, topicsCollection, textbooksCollection } from "~/firebaseConfig"; // Import textbooksCollection
import type { Question, Topic, Textbook, Chapter } from "~/types"; // Add Chapter type
import type { TFunction } from "i18next";

// export const textbooksCollection = collection(db, "textbooks"); // Export textbooks collection

export const getQuestions = async (condition: { year?: number, tId?: number }): Promise<Question[]> => {
  const q = query(questionsCollection, where(
    condition.year ? "year" : "tId",
    condition.year ? "==" : "array-contains",
    condition.year ?? condition.tId)); // Order by qNum
  const questionsSnapshot: QuerySnapshot<Question> = await getDocs(q);
  return questionsSnapshot.docs.map(doc => doc.data()); // Sort by qNum
}

export const fetchQuestions = async (param: {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>,
  condition: { year?: number, tId?: number },
  t: (key: string) => string
}) => {
  param.setLoading(true);
  param.setError(null);
  try {
    const fetchedQuestions = await getQuestions(param.condition); // Fetch questions for the current year
    param.setQuestions(fetchedQuestions.sort((a, b) => a.qNum - b.qNum)); // Sort by qNum
  }
  catch (err) {
    console.error("Error fetching data from Firestore:", err);
    param.setError(param.t('errors.fetchError')); // Use translation key for error
  }
  finally {
    param.setLoading(false);
  }
};

export const fetchTopics = async (param: {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>,
  t: (key: string) => string
}) => {
  param.setLoading(true);
  param.setError(null);
  try {
    const topicsSnapshot: QuerySnapshot<Topic> = await getDocs(topicsCollection);
    param.setTopics(topicsSnapshot.docs.map(doc => doc.data()).sort((a, b) => a.tId - b.tId).sort((a, b) => a.aristo - b.aristo)); // Sort by tId
  }
  catch (err) {
    console.error("Error fetching data from Firestore:", err);
    param.setError(param.t('errors.fetchError')); // Use translation key for error
  }
  finally {
    param.setLoading(false);
  }
};

interface FetchTextbooksArgs {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTextbooks: (textbooks: Textbook[]) => void;
  t: TFunction; // For potential translated error messages
}

export const fetchTextbooks = async ({ setLoading, setError, setTextbooks, t }: FetchTextbooksArgs): Promise<void> => {
  setLoading(true);
  setError(null);
  try {
    // Fetch all textbooks, maybe order by publisher or title later if needed
    const textbooksQuery = query(textbooksCollection);
    const querySnapshot = await getDocs(textbooksQuery);
    const fetchedTextbooks = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      // Ensure chapters are sorted if not already done in Firestore
      chapters: doc.data().chapters?.sort((a: any, b: any) => a.cNum - b.cNum) || []
    } as Textbook));
    setTextbooks(fetchedTextbooks);
  } catch (err) {
    console.error("Error fetching textbooks:", err);
    setError(t('error.fetchTextbooks', "Failed to fetch textbooks. Please try again later."));
  } finally {
    setLoading(false);
  }
};

interface FetchChaptersArgs {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setChapters: (chapters: Chapter[]) => void;
  textbookId: string; // ID of the textbook to fetch chapters from
  t: TFunction;
}

export const fetchChaptersByTextbook = async ({ setLoading, setError, setChapters, textbookId, t }: FetchChaptersArgs): Promise<void> => {
  setLoading(true);
  setError(null);
  try {
    // Query for the specific textbook document using its tbId
    const q = query(textbooksCollection, where("tbId", "==", textbookId), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(`Textbook with ID ${textbookId} not found.`);
    }

    const textbookDoc = querySnapshot.docs[0];
    const textbookData = textbookDoc.data() as Textbook;

    const fetchedChapters = textbookData.chapters?.sort((a, b) => a.cNum - b.cNum) || [];
    setChapters(fetchedChapters);

  } catch (err: any) {
    console.error(`Error fetching chapters for textbook ${textbookId}:`, err);
    setError(t('error.fetchChapters', "Failed to fetch chapters. Please try again later."));
  } finally {
    setLoading(false);
  }
};