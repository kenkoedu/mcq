import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, getDocs, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from '~/firebaseConfig';
import type { Topic } from "~/types";

type TopicWithId = Topic & { id: string };

interface TopicManagerProps {
  t: (key: string, fallback?: string) => string;
  onSelectTopic: (topic: TopicWithId) => void;
}

export default function TopicManager({ t, onSelectTopic }: TopicManagerProps) {
  const [topics, setTopics] = useState<TopicWithId[]>([]);
  const [editedTopics, setEditedTopics] = useState<TopicWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const initialTopicsRef = useRef<TopicWithId[]>([]);

  const checkDirty = useCallback((currentEditedTopics: TopicWithId[]) => {
    if (initialTopicsRef.current.length !== currentEditedTopics.length) return true;
    for (let i = 0; i < currentEditedTopics.length; i++) {
      const initial = initialTopicsRef.current[i];
      const edited = currentEditedTopics[i];
      if (
        initial?.tTitleC !== edited?.tTitleC ||
        initial?.tTitleE !== edited?.tTitleE ||
        initial?.isJunior !== edited?.isJunior ||
        (initial?.aristo ?? '') !== (edited?.aristo ?? '')
      ) {
        return true;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setError(null);
      setIsDirty(false);
      try {
        const querySnapshot = await getDocs(collection(db, "topics"));
        const topicsData = querySnapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          const tId = data.tId || parseInt(docSnapshot.id, 10);
          return {
            ...data,
            id: docSnapshot.id,
            tId: tId,
            aristo: data.aristo ?? '',
          } as TopicWithId;
        });
        topicsData.sort((a, b) => a.tId - b.tId).sort((a, b) => a.aristo - b.aristo);
        setTopics(topicsData);
        setEditedTopics(JSON.parse(JSON.stringify(topicsData)));
        initialTopicsRef.current = JSON.parse(JSON.stringify(topicsData));
      } catch (err) {
        console.error("Error fetching topics: ", err);
        setError(t('pages.admin.errors.fetchTopics', 'Failed to fetch topics. Please try again.'));
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [t]);

  // Effect to prevent leaving page with unsaved changes (can be moved to parent if needed globally)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        const message = t('common.unsavedChanges', 'You have unsaved changes. Are you sure you want to leave?');
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, t]);


  const handleInputChange = (tId: number | string, field: keyof Topic, value: string) => {
    setEditedTopics(currentTopics => {
      const updatedTopics = currentTopics.map(topic =>
        topic.tId === tId ? { ...topic, [field]: value } : topic
      );
      setIsDirty(checkDirty(updatedTopics));
      return updatedTopics;
    });
  };

  const handleCheckboxChange = (tId: number | string, field: keyof Topic, checked: boolean) => {
    setEditedTopics(currentTopics => {
      const updatedTopics = currentTopics.map(topic =>
        topic.tId === tId ? { ...topic, [field]: checked } : topic
      );
      setIsDirty(checkDirty(updatedTopics));
      return updatedTopics;
    });
  };

  const handleAristoChange = (tId: number | string, value: string) => {
    setEditedTopics(currentTopics => {
      const updatedTopics = currentTopics.map(topic =>
        topic.tId === tId ? { ...topic, aristo: value === '' ? undefined : Number(value) } : topic
      );
      setIsDirty(checkDirty(updatedTopics));
      return updatedTopics;
    });
  };

  const handleUndo = (tId: number | string) => {
    const originalTopicIndex = initialTopicsRef.current.findIndex(topic => topic.tId === tId);
    if (originalTopicIndex !== -1) {
      const originalTopic = initialTopicsRef.current[originalTopicIndex];
      setEditedTopics(currentTopics => {
        const updatedTopics = [...currentTopics];
        updatedTopics[originalTopicIndex] = { ...originalTopic };
        setIsDirty(checkDirty(updatedTopics));
        return updatedTopics;
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const batch = writeBatch(db);
    let changesMade = 0;

    editedTopics.forEach((editedTopic, index) => {
      const originalTopic = initialTopicsRef.current[index];
      const changes: Partial<Topic> = {};

      if (originalTopic?.tTitleC !== editedTopic?.tTitleC) changes.tTitleC = editedTopic.tTitleC;
      if (originalTopic?.tTitleE !== editedTopic?.tTitleE) changes.tTitleE = editedTopic.tTitleE;
      if (originalTopic?.isJunior !== editedTopic?.isJunior) changes.isJunior = editedTopic.isJunior;

      const originalAristo = originalTopic?.aristo ?? '';
      const editedAristo = editedTopic?.aristo ?? '';
      if (originalAristo !== editedAristo) {
        const valueToSave = editedAristo === '' ? null : Number(editedAristo);
        if (!isNaN(valueToSave as number) || valueToSave === null) {
          changes.aristo = valueToSave;
        } else {
          console.warn(`Invalid number format for aristo on topic ${editedTopic.tId}: ${editedAristo}`);
        }
      }

      if (Object.keys(changes).length > 0 && editedTopic.id) {
        const topicRef = doc(db, "topics", editedTopic.id);
        batch.update(topicRef, changes);
        changesMade++;
      }
    });


    if (changesMade === 0) {
      setSaving(false);
      return;
    }

    try {
      await batch.commit();
      const newBaseTopics = JSON.parse(JSON.stringify(editedTopics));
      setTopics(newBaseTopics); // Update displayed topics if needed, though not strictly necessary here
      initialTopicsRef.current = newBaseTopics; // Update baseline for future edits
      setIsDirty(false);
    } catch (err) {
      console.error("Error saving topics: ", err);
      setError(t('pages.admin.errors.saveTopics', 'Failed to save changes. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleManageQuestionsClick = (topic: TopicWithId) => {
    if (isDirty) {
      if (window.confirm(t('pages.admin.unsavedChangesConfirm', 'You have unsaved changes. Are you sure you want to leave?'))) {
        onSelectTopic(topic);
      }
    } else {
      onSelectTopic(topic);
    }
  };

  return (
    <>
      {loading && <p>{t('common.loading', 'Loading...')}</p>}
      {error && <p className="text-error">{error}</p>}

      {!loading && !error && topics.length === 0 && (
        <p>{t('pages.admin.noTopics', 'No topics found.')}</p>
      )}

      {!loading && topics.length > 0 && (
        <>
          <table className="table table-zebra text-base">
            <thead>
              <tr>
                <th>{t('pages.admin.table.id', 'ID')}</th>
                <th>{t('pages.admin.table.titleC', 'Title (Chinese)')}</th>
                <th>{t('pages.admin.table.titleE', 'Title (English)')}</th>
                <th>{t('pages.admin.table.isJunior', 'Junior?')}</th>
                <th>{t('pages.admin.table.aristo', 'Aristo')}</th>
                <th>{t('pages.admin.table.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {editedTopics.map((topic, index) => {
                const originalTopic = initialTopicsRef.current[index];
                const hasChanged = JSON.stringify(originalTopic) !== JSON.stringify(topic);

                return (
                  <tr key={topic.id}>
                    <th>{topic.tId}</th>
                    <td>
                      <input
                        type="text"
                        className="input input-bordered w-full text-base"
                        value={topic.tTitleC ?? ''}
                        onChange={(e) => handleInputChange(topic.tId, 'tTitleC', e.target.value)}
                        placeholder={t('pages.admin.table.titleCPlaceholder', 'Enter Chinese Title')}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="input input-bordered w-full text-base"
                        value={topic.tTitleE ?? ''}
                        onChange={(e) => handleInputChange(topic.tId, 'tTitleE', e.target.value)}
                        placeholder={t('pages.admin.table.titleEPlaceholder', 'Enter English Title')}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-lg"
                        checked={topic.isJunior ?? false}
                        onChange={(e) => handleCheckboxChange(topic.tId, 'isJunior', e.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="input input-bordered w-24 text-base"
                        value={topic.aristo ?? ''}
                        onChange={(e) => handleAristoChange(topic.tId, e.target.value)}
                        placeholder={t('pages.admin.table.aristoPlaceholder', 'Number')}
                      />
                    </td>
                    <td className="space-x-1">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleUndo(topic.tId)}
                        disabled={!hasChanged || saving}
                      >
                        {t('common.undo', 'Undo')}
                      </button>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => handleManageQuestionsClick(topic)}
                        disabled={saving}
                      >
                        {t('pages.admin.manageQs', 'Manage Qs')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <button
              className={`btn btn-primary ${saving ? 'loading' : ''}`}
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
            </button>
          </div>
        </>
      )}
    </>
  );
}
