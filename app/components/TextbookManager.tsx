import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Import FaTimesCircle
import { FaBookOpen, FaPlus, FaEdit, FaTrash, FaSpinner, FaSave, FaTimesCircle } from 'react-icons/fa';
import { textbooksCollection } from '~/firebaseConfig'; // Import Firestore collection
import { fetchTextbooks } from '~/utils/fetchData';
// Import query and where for finding documents by tbId
import { doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import type { Textbook, Chapter } from '~/types';

// Helper function to generate a unique-ish ID (replace with a better method if needed)
const generateTempId = () => `TEMP_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export default function TextbookManager() {
  const { t } = useTranslation();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({}); // Track saving status per textbook

  useEffect(() => {
    // Pass the actual setter functions to fetchTextbooks
    fetchTextbooks({ setLoading, setError, setTextbooks, t });
  }, [t]);

  // --- State Update Handlers ---

  const handleInputChange = (tbId: string, field: keyof Textbook, value: any) => {
    setTextbooks(currentTextbooks =>
      currentTextbooks.map(tb =>
        tb.tbId === tbId ? { ...tb, [field]: value } : tb
      )
    );
  };

  const handleChapterChange = (tbId: string, chapterIndex: number, field: keyof Chapter, value: any) => {
    setTextbooks(currentTextbooks =>
      currentTextbooks.map(tb => {
        if (tb.tbId === tbId) {
          const updatedChapters = tb.chapters ? [...tb.chapters] : [];
          if (updatedChapters[chapterIndex]) {
            updatedChapters[chapterIndex] = { ...updatedChapters[chapterIndex], [field]: value };
          }
          return { ...tb, chapters: updatedChapters };
        }
        return tb;
      })
    );
  };

  const handleAddChapter = (tbId: string) => {
    setTextbooks(currentTextbooks =>
      currentTextbooks.map(tb => {
        if (tb.tbId === tbId) {
          const newChapter: Chapter = {
            cNum: (tb.chapters?.length || 0) + 1, // Basic sequencing
            chTitleC: '',
            chTitleE: '', // Corresponds to cTitleC in the type, adjust if type changes
          };
          const updatedChapters = tb.chapters ? [...tb.chapters, newChapter] : [newChapter];
          return { ...tb, chapters: updatedChapters };
        }
        return tb;
      })
    );
  };

  const handleRemoveChapter = (tbId: string, chapterIndex: number) => {
    setTextbooks(currentTextbooks =>
      currentTextbooks.map(tb => {
        if (tb.tbId === tbId) {
          const updatedChapters = tb.chapters ? tb.chapters.filter((_, index) => index !== chapterIndex) : [];
          // Optional: Re-sequence cNum after removal if desired
          // updatedChapters.forEach((ch, idx) => ch.cNum = idx + 1);
          return { ...tb, chapters: updatedChapters };
        }
        return tb;
      })
    );
  };

  // --- Firestore Interaction Handlers ---

  const handleSaveChanges = async (tbId: string) => {
    const textbookToSave = textbooks.find(tb => tb.tbId === tbId);
    if (!textbookToSave) return;

    setSavingStates(prev => ({ ...prev, [tbId]: true }));
    setError(null); // Clear previous errors

    try {
      // Ensure chapters are sorted by cNum before saving
      const chaptersToSave = textbookToSave.chapters?.sort((a, b) => a.cNum - b.cNum) || [];
      const dataToSave = { ...textbookToSave, chapters: chaptersToSave };

      if (tbId.startsWith('TEMP_')) {
        // Add new textbook (logic remains the same)
        const { tbId: tempId, ...newData } = dataToSave;
        // Check if a textbook with the same custom tbId already exists before adding
        const checkQuery = query(textbooksCollection, where("tbId", "==", newData.tbId), limit(1));
        const checkSnapshot = await getDocs(checkQuery);
        if (!checkSnapshot.empty) {
          throw new Error(`Textbook with ID ${newData.tbId} already exists.`);
        }

        const docRef = await addDoc(textbooksCollection, {
          ...newData,
          createdAt: serverTimestamp()
        });
        setTextbooks(prev => [
          ...prev.filter(tb => tb.tbId !== tbId),
          { ...newData, tbId: newData.tbId } // Use the intended tbId, not docRef.id
        ]);
        console.log("New textbook added with custom ID: ", newData.tbId);

      } else {
        // Update existing textbook: Find Firestore doc ID first
        const q = query(textbooksCollection, where("tbId", "==", tbId), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(`Textbook with ID ${tbId} not found in database.`);
        }

        const firestoreDocId = querySnapshot.docs[0].id;
        const textbookRef = doc(textbooksCollection, firestoreDocId);

        // Remove tbId from the data object before updating as it's the custom ID
        const { tbId: customId, ...updateData } = dataToSave;
        await updateDoc(textbookRef, updateData);
        console.log(`Textbook ${tbId} (Doc ID: ${firestoreDocId}) updated successfully.`);
      }

    } catch (err: any) { // Catch specific error type
      console.error(`Error saving textbook ${tbId}:`, err);
      // Provide more specific error message if possible
      const message = err.message.includes("already exists")
        ? err.message
        : t('error.saveTextbook', 'Failed to save textbook. Please try again.');
      setError(message);
    } finally {
      setSavingStates(prev => ({ ...prev, [tbId]: false }));
    }
  };

  const handleDeleteTextbook = async (tbId: string) => {
    if (!window.confirm(t('common.confirmDelete', 'Are you sure you want to delete this item?'))) {
      return;
    }

    // If it's a temporary (unsaved) textbook, just remove from local state
    if (tbId.startsWith('TEMP_')) {
      setTextbooks(prev => prev.filter(tb => tb.tbId !== tbId));
      return;
    }

    setSavingStates(prev => ({ ...prev, [tbId]: true })); // Indicate loading state
    setError(null);

    try {
      // Find Firestore doc ID first
      const q = query(textbooksCollection, where("tbId", "==", tbId), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // If not found in DB, maybe it was already deleted? Remove locally.
        console.warn(`Textbook with ID ${tbId} not found in database for deletion. Removing locally.`);
        setTextbooks(prev => prev.filter(tb => tb.tbId !== tbId));
        return; // Exit successfully
      }

      const firestoreDocId = querySnapshot.docs[0].id;
      const textbookRef = doc(textbooksCollection, firestoreDocId);
      await deleteDoc(textbookRef);

      setTextbooks(prev => prev.filter(tb => tb.tbId !== tbId));
      console.log(`Textbook ${tbId} (Doc ID: ${firestoreDocId}) deleted successfully.`);

    } catch (err) {
      console.error(`Error deleting textbook ${tbId}:`, err);
      setError(t('error.deleteTextbook', 'Failed to delete textbook. Please try again.'));
    } finally {
      // Reset loading state only on error, otherwise item is removed
      setSavingStates(prev => ({ ...prev, [tbId]: false }));
    }
  };

  const handleAddNewTextbook = () => {
    const tempId = generateTempId();
    const newTextbookTemplate: Textbook = {
      tbId: tempId, // Temporary ID
      tbTitleE: '',
      tbTitleC: '',
      publisher: '',
      isJunior: false,
      chapters: [],
    };
    // Add to the beginning of the list for visibility
    setTextbooks(prev => [newTextbookTemplate, ...prev]);
    // Optionally scroll to the new form or focus the first field
  };


  return (
    <div className="p-4 bg-base-100 rounded-lg shadow">
      <h2 className="text-3xl font-semibold mb-6 flex items-center"> {/* Increased title size */}
        <FaBookOpen className="mr-3" /> {t('pages.admin.textbooks.title', 'Textbook Management')}
      </h2>

      <div className="mb-8">
        <button className="btn btn-primary btn-md" onClick={handleAddNewTextbook}> {/* Attach handler */}
          <FaPlus className="mr-2" /> {t('pages.admin.textbooks.addNew', 'Add New Textbook')}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center p-4 text-lg"> {/* Increased loading text size */}
          <FaSpinner className="animate-spin inline-block mr-2" /> {t('common.loading', 'Loading...')}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-error shadow-lg text-lg">
          <div className="flex items-center"> {/* Ensure vertical alignment */}
            <FaTimesCircle className="h-6 w-6 mr-2 flex-shrink-0" /> {/* Added margin */}
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* List of Textbooks - Use fetched data */}
      {!loading && !error && (
        <div className="space-y-8"> {/* Increased spacing */}
          {textbooks.length === 0 && <p className="text-lg">{t('common.noResultsFound', 'No results found.')}</p>} {/* Increased text size */}
          {textbooks.map((textbook) => (
            <form key={textbook.tbId} className={`p-6 border border-base-300 bg-base-200 rounded-box space-y-6 ${savingStates[textbook.tbId] ? 'opacity-70 pointer-events-none' : ''}`} onSubmit={(e) => { e.preventDefault(); handleSaveChanges(textbook.tbId); }}>
              {/* Saving Indicator */}
              {savingStates[textbook.tbId] && (
                <div className="absolute inset-0 bg-base-100 bg-opacity-50 flex items-center justify-center z-10 rounded-box">
                  <FaSpinner className="animate-spin text-primary text-3xl" />
                </div>
              )}

              {/* Textbook Info Fields (Inputs remain the same) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Increased gap */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg">{t('pages.admin.textbooks.fields.tbId', 'Textbook ID')}</span> {/* Increased label size */}
                  </label>
                  {/* Input for tbId - Make editable only for new (TEMP) textbooks */}
                  <input
                    type="text"
                    value={textbook.tbId.startsWith('TEMP_') ? '' : textbook.tbId} // Show empty for new, value for existing
                    placeholder={textbook.tbId.startsWith('TEMP_') ? t('pages.admin.textbooks.fields.newIdPlaceholder', 'Enter Unique ID (e.g., ARISTO_INSIGHT)') : ''}
                    readOnly={!textbook.tbId.startsWith('TEMP_')} // Readonly if not new
                    onChange={(e) => textbook.tbId.startsWith('TEMP_') && handleInputChange(textbook.tbId, 'tbId', e.target.value.toUpperCase().replace(/\s+/g, '_'))} // Allow editing only for new, enforce format
                    className={`input input-bordered input-md w-full text-lg ${!textbook.tbId.startsWith('TEMP_') ? 'bg-base-300' : ''}`} // Style differently if readonly
                    required // Make tbId required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg">{t('pages.admin.textbooks.fields.publisher', 'Publisher')}</span> {/* Increased label size */}
                  </label>
                  <input
                    type="text"
                    value={textbook.publisher}
                    onChange={(e) => handleInputChange(textbook.tbId, 'publisher', e.target.value)}
                    className="input input-bordered input-md w-full text-lg" // Increased input size and text size
                    required // Example: Make publisher required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg">{t('pages.admin.textbooks.fields.titleE', 'Title (English)')}</span> {/* Increased label size */}
                  </label>
                  <input
                    type="text"
                    value={textbook.tbTitleE}
                    onChange={(e) => handleInputChange(textbook.tbId, 'tbTitleE', e.target.value)}
                    className="input input-bordered input-md w-full text-lg" // Increased input size and text size
                    required // Example: Make title required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg">{t('pages.admin.textbooks.fields.titleC', 'Title (Chinese)')}</span> {/* Increased label size */}
                  </label>
                  <input
                    type="text"
                    value={textbook.tbTitleC}
                    onChange={(e) => handleInputChange(textbook.tbId, 'tbTitleC', e.target.value)}
                    className="input input-bordered input-md w-full text-lg" // Increased input size and text size
                  />
                </div>
                <div className="form-control items-start pt-2"> {/* Added padding top */}
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      checked={textbook.isJunior}
                      onChange={(e) => handleInputChange(textbook.tbId, 'isJunior', e.target.checked)}
                      className="checkbox checkbox-primary checkbox-md mr-3" // Increased checkbox size and margin
                    />
                    <span className="label-text text-lg">{t('pages.admin.textbooks.fields.isJunior', 'Junior Form')}</span> {/* Increased label size */}
                  </label>
                </div>
              </div>

              {/* Chapters Table */}
              <div>
                <h4 className="text-xl font-semibold mt-6 mb-3">{t('pages.admin.textbooks.chaptersTitle', 'Chapters')}</h4> {/* Increased size and margins */}
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full text-base">
                    <thead>
                      <tr className="text-lg">
                        <th>{t('pages.admin.textbooks.chapters.cNum', 'No.')}</th>
                        <th>{t('pages.admin.textbooks.chapters.titleE', 'Title (Eng)')}</th>
                        <th>{t('pages.admin.textbooks.chapters.titleC', 'Title (Chi)')}</th>
                        <th>{t('common.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {textbook.chapters?.map((chapter, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="number"
                              value={chapter.cNum}
                              onChange={(e) => handleChapterChange(textbook.tbId, index, 'cNum', parseInt(e.target.value) || 0)}
                              className="input input-bordered input-sm w-20 text-base" // Adjusted size, increased text size
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={chapter.chTitleC}
                              onChange={(e) => handleChapterChange(textbook.tbId, index, 'chTitleC', e.target.value)}
                              className="input input-bordered input-sm w-full text-base" // Adjusted size, increased text size
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={chapter.chTitleE} // Corresponds to cTitleC in type
                              onChange={(e) => handleChapterChange(textbook.tbId, index, 'chTitleE', e.target.value)}
                              className="input input-bordered input-sm w-full text-base" // Adjusted size, increased text size
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost text-error" // Kept button size reasonable
                              title={t('common.delete', 'Delete')}
                              onClick={() => handleRemoveChapter(textbook.tbId, index)}
                              disabled={savingStates[textbook.tbId]} // Disable while saving
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className="btn btn-md btn-secondary mt-4" // Increased button size and margin
                  onClick={() => handleAddChapter(textbook.tbId)}
                  disabled={savingStates[textbook.tbId]} // Disable while saving
                >
                  <FaPlus className="mr-1" /> {t('pages.admin.textbooks.addChapter', 'Add Chapter')}
                </button>
              </div>

              {/* Action Buttons for the Textbook */}
              <div className="flex justify-end space-x-3 mt-6"> {/* Increased spacing and margin */}
                <button
                  type="button"
                  className="btn btn-md btn-error btn-outline" // Increased button size
                  onClick={() => handleDeleteTextbook(textbook.tbId)}
                  disabled={savingStates[textbook.tbId]} // Disable while saving
                >
                  <FaTrash className="mr-1" /> {textbook.tbId.startsWith('TEMP_') ? t('common.cancel', 'Cancel') : t('common.delete', 'Delete Textbook')}
                </button>
                <button
                  type="submit"
                  className={`btn btn-md btn-primary ${savingStates[textbook.tbId] ? 'loading' : ''}`} // Show loading state on button
                  disabled={savingStates[textbook.tbId] || (textbook.tbId.startsWith('TEMP_') && !textbook.tbId)} // Disable save if new and tbId is empty
                >
                  {!savingStates[textbook.tbId] && <FaSave className="mr-1" />} {/* Show icon only when not loading */}
                  {savingStates[textbook.tbId] ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
                </button>
              </div>
            </form>
          ))}
        </div>
      )}

      {/* Placeholder for Add/Edit Textbook Modal/Form */}
      {/* ... existing modal placeholder ... */}
    </div>
  );
}
