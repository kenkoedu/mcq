import React, { useState, useEffect, useCallback } from 'react';
import { db } from '~/firebaseConfig';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, runTransaction } from 'firebase/firestore';
import type { Topic, Subtopic } from '~/types';
import { FaEdit, FaTrash, FaSave, FaPlus, FaTimes } from 'react-icons/fa'; // Import icons

type TopicWithId = Topic & { id: string };

interface SubtopicManagerProps {
  t: (key: string, fallback?: string) => string;
  selectedTopic: TopicWithId;
}

export default function SubtopicManager({ t, selectedTopic }: SubtopicManagerProps) {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Start loading initially
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false); // Track initial load
  const [error, setError] = useState<string | null>(null);
  const [newSubtopicTitleC, setNewSubtopicTitleC] = useState('');
  const [newSubtopicTitleE, setNewSubtopicTitleE] = useState('');
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null); // Holds the subtopic being edited

  const subtopicsCollectionRef = collection(db, "subtopics");

  // Extract tId for dependency array stability
  const topicId = selectedTopic?.tId;

  const fetchSubtopics = useCallback(async () => {
    // Use topicId from the outer scope which is stable if selectedTopic.tId doesn't change
    if (!topicId) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(
        subtopicsCollectionRef,
        where("tId", "==", topicId), // Use the stable topicId
        orderBy("stSeq")
      );
      const querySnapshot = await getDocs(q);
      const fetchedSubtopics = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Subtopic));
      setSubtopics(fetchedSubtopics);
    } catch (err) {
      console.error("Error fetching subtopics: ", err);
      setError(t('pages.admin.errors.fetchSubtopics', 'Failed to fetch subtopics.'));
    } finally {
      setLoading(false);
      setInitialLoadComplete(true); // Mark initial load as complete
    }
    // Depend only on stable values or primitives if possible
  }, [topicId, subtopicsCollectionRef]); // Use topicId instead of selectedTopic

  useEffect(() => {
    // Only run fetch if topicId is valid
    if (topicId) {
      fetchSubtopics();
    } else {
      // Optionally clear subtopics if topic becomes invalid
      setSubtopics([]);
      setInitialLoadComplete(false); // Reset load state if topic is deselected
    }
  }, [topicId, t]); // Depend on fetchSubtopics

  const handleAddSubtopic = async () => {
    if (!newSubtopicTitleC.trim() || !newSubtopicTitleE.trim() || !selectedTopic) return;
    setLoading(true);
    setError(null);

    try {
      console.log("Adding subtopic...");
      await runTransaction(db, async (transaction) => {
        console.log("Running transaction...");
        // 1. Find the next stSeq 
        console.log("Finding next stSeq...");
        const q = query(
          subtopicsCollectionRef,
          where("tId", "==", selectedTopic.tId),
          orderBy("stSeq", "desc")
          // limit(1) // Firestore doesn't have limit in transactions directly, get all and check
        );
        console.log("q", q);
        // console.log(q.path)
        const querySnapshot = await getDocs(q); // Use getDocs to get the data
        const subtopicsArray = querySnapshot.docs;

        const lastSeq = subtopicsArray.length === 0 ? 0 : subtopicsArray[0].data().stSeq;
        // console.log(las)
        const nextSeq = lastSeq + 1;

        // 2. Calculate stId
        const stId = selectedTopic.tId * 100 + nextSeq; // Assuming tId < 1000

        // 3. Create new subtopic data
        const newSubtopicData: Omit<Subtopic, 'id'> = {
          tId: selectedTopic.tId,
          stSeq: nextSeq,
          stId: stId,
          stTitleC: newSubtopicTitleC.trim(),
          stTitleE: newSubtopicTitleE.trim(),
        };

        // 4. Add the new document using transaction.set with a new doc ref
        const newDocRef = doc(subtopicsCollectionRef); // Create a ref for the new doc
        transaction.set(newDocRef, newSubtopicData);
      });

      setNewSubtopicTitleC('');
      setNewSubtopicTitleE('');
      await fetchSubtopics(); // Refresh list
    } catch (err) {
      console.error("Error adding subtopic: ", err);
      setError(t('pages.admin.errors.addSubtopic', 'Failed to add subtopic.'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubtopic = async () => {
    if (!editingSubtopic || !editingSubtopic.id) return;
    setLoading(true);
    setError(null);
    const subtopicRef = doc(db, "subtopics", editingSubtopic.id);
    try {
      await updateDoc(subtopicRef, {
        stTitleC: editingSubtopic.stTitleC.trim(),
        stTitleE: editingSubtopic.stTitleE.trim(),
      });
      setEditingSubtopic(null);
      await fetchSubtopics(); // Refresh list
    } catch (err) {
      console.error("Error updating subtopic: ", err);
      setError(t('pages.admin.errors.updateSubtopic', 'Failed to update subtopic.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubtopic = async (subtopicId: string) => {
    if (!window.confirm(t('common.confirmDelete', 'Are you sure you want to delete this item?'))) return;
    setLoading(true);
    setError(null);
    const subtopicRef = doc(db, "subtopics", subtopicId);
    try {
      await deleteDoc(subtopicRef);
      // Note: Consider implications if questions are assigned to this subtopic.
      // You might need to update questions as well.
      await fetchSubtopics(); // Refresh list
    } catch (err) {
      console.error("Error deleting subtopic: ", err);
      setError(t('pages.admin.errors.deleteSubtopic', 'Failed to delete subtopic.'));
    } finally {
      setLoading(false);
    }
  };

  // Function to start editing a subtopic
  const startEditing = (subtopic: Subtopic) => {
    setEditingSubtopic({ ...subtopic }); // Clone the subtopic to avoid modifying state directly
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingSubtopic(null);
  };

  // Function to handle changes in the edit form
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingSubtopic) return;
    const { name, value } = e.target;
    setEditingSubtopic(prev => prev ? { ...prev, [name]: value } : null);
  };


  return (
    <div className="p-4 border rounded bg-base-100 shadow">
      <h2 className="text-xl font-semibold mb-4">
        {t('pages.admin.subtopicManager.title', 'Manage Subtopics for:')} {selectedTopic.tTitleE} / {selectedTopic.tTitleC} (ID: {selectedTopic.tId})
      </h2>

      {error && <div className="alert alert-error shadow-lg mb-4"><div><span>{error}</span></div></div>}

      {/* Add Subtopic Form */}
      <div className="mb-6 p-4 border rounded bg-base-200">
        <h3 className="text-lg font-medium mb-2">{t('pages.admin.subtopicManager.addTitle', 'Add New Subtopic')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="form-control">
            <label className="label"><span className="label-text">{t('pages.admin.subtopicManager.titleCLabel', 'Title (Chinese)')}</span></label>
            <input
              type="text"
              placeholder={t('pages.admin.subtopicManager.titleCPlaceholder', 'Enter Chinese title')}
              className="input input-bordered w-full"
              value={newSubtopicTitleC}
              onChange={(e) => setNewSubtopicTitleC(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">{t('pages.admin.subtopicManager.titleELabel', 'Title (English)')}</span></label>
            <input
              type="text"
              placeholder={t('pages.admin.subtopicManager.titleEPlaceholder', 'Enter English title')}
              className="input input-bordered w-full"
              value={newSubtopicTitleE}
              onChange={(e) => setNewSubtopicTitleE(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            onClick={handleAddSubtopic}
            disabled={loading || !newSubtopicTitleC.trim() || !newSubtopicTitleE.trim()}
          >
            <FaPlus className="mr-2" /> {t('common.add', 'Add')}
          </button>
        </div>
      </div>

      {/* Subtopic List */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">{t('pages.admin.subtopicManager.listTitle', 'Existing Subtopics')}</h3>
        {loading && !initialLoadComplete && <div className="text-center p-4"><span className="loading loading-spinner loading-lg"></span></div>}
        {!loading && initialLoadComplete && subtopics.length === 0 && (
          <p className="text-center text-gray-500 py-4">{t('pages.admin.subtopicManager.none', 'No subtopics found for this topic.')}</p>
        )}
        {initialLoadComplete && subtopics.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table w-full table-zebra table-compact">
              <thead>
                <tr>
                  <th>{t('pages.admin.subtopicManager.headerSeq', 'Seq')}</th>
                  <th>{t('pages.admin.subtopicManager.headerId', 'ID')}</th>
                  <th>{t('pages.admin.subtopicManager.headerTitleC', 'Title (Chinese)')}</th>
                  <th>{t('pages.admin.subtopicManager.headerTitleE', 'Title (English)')}</th>
                  <th>{t('pages.admin.subtopicManager.headerActions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {subtopics.map((st) => (
                  <tr key={st.id}>
                    {editingSubtopic?.id === st.id ? (
                      <>
                        <td>{st.stSeq}</td>
                        <td>{st.stId}</td>
                        <td>
                          <input
                            type="text"
                            name="stTitleC"
                            value={editingSubtopic.stTitleC ?? ''}
                            onChange={handleEditChange}
                            className="input input-bordered input-sm w-full"
                            disabled={loading}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="stTitleE"
                            value={editingSubtopic.stTitleE ?? ''}
                            onChange={handleEditChange}
                            className="input input-bordered input-sm w-full"
                            disabled={loading}
                          />
                        </td>
                        <td>
                          <div className="flex space-x-1">
                            <button
                              className={`btn btn-success btn-sm ${loading ? 'loading' : ''}`}
                              onClick={handleUpdateSubtopic}
                              disabled={loading || !editingSubtopic.stTitleC?.trim() || !editingSubtopic.stTitleE?.trim()}
                              title={t('common.save', 'Save')}
                            >
                              <FaSave />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={cancelEditing}
                              disabled={loading}
                              title={t('common.cancel', 'Cancel')}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{st.stSeq}</td>
                        <td>{st.stId}</td>
                        <td>{st.stTitleC}</td>
                        <td>{st.stTitleE}</td>
                        <td>
                          <div className="flex space-x-1">
                            <button
                              className="btn btn-ghost btn-sm text-blue-600"
                              onClick={() => startEditing(st)}
                              disabled={loading}
                              title={t('common.edit', 'Edit')}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className={`btn btn-ghost btn-sm text-red-600 ${loading ? 'loading' : ''}`}
                              onClick={() => st.id && handleDeleteSubtopic(st.id)}
                              disabled={loading || !st.id}
                              title={t('common.delete', 'Delete')}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
