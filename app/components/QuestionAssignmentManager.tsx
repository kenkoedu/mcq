import React, { useState, useEffect, useCallback } from 'react';
import { db } from '~/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch, orderBy } from 'firebase/firestore';
import Select from 'react-select'; // Assuming react-select is installed (#codebase shows it in package.json)
import type { Topic, Subtopic, Question } from '~/types';
import QuestionCard from './QuestionCard'; // Use QuestionCard directly

type TopicWithId = Topic & { id: string };
type QuestionWithId = Question & { id: string }; // Assuming questions also have Firestore IDs
type SelectOption = { value: number; label: string };

interface QuestionAssignmentManagerProps {
  t: (key: string, fallback?: string) => string;
  selectedTopic: TopicWithId;
}

export default function QuestionAssignmentManager({ t, selectedTopic }: QuestionAssignmentManagerProps) {
  const [questions, setQuestions] = useState<QuestionWithId[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedAssignments, setEditedAssignments] = useState<{ [qId: string]: number[] }>({}); // Store changes: { questionFirestoreId: [stId1, stId2] }

  // Define collection refs outside callbacks if they don't depend on props/state
  // Assuming 'db' is stable
  const questionsCollectionRef = collection(db, "questions");
  const subtopicsCollectionRef = collection(db, "subtopics");

  // Memoize fetch functions, depending only on necessary stable values or primitives
  const fetchSubtopics = useCallback(async (topicId: number) => {
    // Fetch subtopics for the dropdown
    try {
      const q = query(subtopicsCollectionRef, where("tId", "==", topicId), orderBy("stSeq"));
      const querySnapshot = await getDocs(q);
      const fetchedSubtopics = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subtopic));
      setSubtopics(fetchedSubtopics);
    } catch (err) {
      console.error("Error fetching subtopics for assignment: ", err);
      // Handle error display if needed
    }
  }, [subtopicsCollectionRef]); // Depends only on stable collection ref

  const fetchQuestions = useCallback(async (topicId: number) => {
    // Fetch questions originally belonging to this topic
    // setLoading(true);
    // setError(null);
    // setEditedAssignments({}); // Clear edits on fetch
    try {
      // Query questions where the original tId array contains the topicId
      const q = query(questionsCollectionRef, where("tId", "array-contains", topicId));
      const querySnapshot = await getDocs(q);
      const fetchedQuestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuestionWithId));
      // Sort fetched questions (e.g., by year, qNum)
      fetchedQuestions.sort((a, b) => a.year - b.year || a.qNum - b.qNum);
      setQuestions(fetchedQuestions);
    } catch (err) {
      console.error("Error fetching questions: ", err);
      setError(t('pages.admin.errors.fetchQuestions', 'Failed to fetch questions.'));
    } finally {
      setLoading(false);
    }
  }, [questionsCollectionRef, t]); // Depends on stable collection ref and t (assuming t might be needed for error)

  // Effect runs only when selectedTopic.tId changes
  useEffect(() => {
    if (selectedTopic?.tId) {
      // Call the memoized fetch functions
      fetchSubtopics(selectedTopic.tId);
      fetchQuestions(selectedTopic.tId);
    } else {
      // Optionally clear state if no topic is selected
      setSubtopics([]);
      setQuestions([]);
      setEditedAssignments({});
    }
    // Add t to dependency array if it's used inside fetchQuestions error handling and isn't stable
    // If t IS stable (e.g., from i18next useTranslation hook), it can be omitted here too.
    // For now, let's assume fetchQuestions needs it in its useCallback deps, but the effect itself only triggers on tId change.
  }, [selectedTopic?.tId]);

  const subtopicOptions: SelectOption[] = subtopics.map(st => ({
    value: st.stId,
    label: `${st.stId} - ${st.stTitleE} / ${st.stTitleC}`
  }));

  const handleAssignmentChange = (questionId: string, selectedOptions: readonly SelectOption[]) => {
    const assignedStIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setEditedAssignments(prev => ({
      ...prev,
      [questionId]: assignedStIds
    }));
  };

  const handleSaveAssignments = async () => {
    setSaving(true);
    setError(null);
    const batch = writeBatch(db);
    let changesMade = 0;

    Object.entries(editedAssignments).forEach(([questionId, stIds]) => {
      const questionRef = doc(db, "questions", questionId);
      batch.update(questionRef, { stIds: stIds }); // Update the stIds array
      changesMade++;
    });

    if (changesMade === 0) {
      setSaving(false);
      return;
    }

    try {
      await batch.commit();
      setEditedAssignments({}); // Clear edits after successful save
      // Re-fetch using the current topic ID after saving
      if (selectedTopic?.tId) {
        await fetchQuestions(selectedTopic.tId);
      }
      // Show success message?
    } catch (err) {
      console.error("Error saving assignments: ", err);
      setError(t('pages.admin.errors.saveAssignments', 'Failed to save assignments.'));
    } finally {
      setSaving(false);
    }
  };

  const isDirty = Object.keys(editedAssignments).length > 0;

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">{t('pages.admin.assignQuestions.title', 'Assign Questions to Subtopics')}</h3>
      {loading && <p>{t('common.loading', 'Loading...')}</p>}
      {error && <p className="text-error">{error}</p>}

      {questions.length === 0 && !loading && (
        <p>{t('pages.admin.assignQuestions.none', 'No questions found for this topic.')}</p>
      )}

      {questions.length > 0 && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              className={`btn btn-primary ${saving ? 'loading' : ''}`}
              onClick={handleSaveAssignments}
              disabled={!isDirty || saving || loading}
            >
              {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Assignments')}
            </button>
          </div>
          <div className="space-y-4">
            {questions.map((q, index) => {
              // Determine current value for the select component
              const currentStIds = editedAssignments[q.id] ?? q.stIds ?? [];
              const currentSelectedOptions = subtopicOptions.filter(option =>
                currentStIds.includes(option.value)
              );

              return (
                <div key={q.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-2 rounded bg-base-100">
                  <div className="md:col-span-2">
                    {/* Use QuestionCard for display */}
                    <QuestionCard question={q} index={index} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <label htmlFor={`subtopic-select-${q.id}`} className="block font-medium text-sm mb-1">
                      {t('pages.admin.assignQuestions.assignTo', 'Assign to Subtopics:')}
                    </label>
                    <Select<SelectOption, true>
                      id={`subtopic-select-${q.id}`}
                      instanceId={`subtopic-select-${q.id}-instance`}
                      isMulti
                      options={subtopicOptions}
                      value={currentSelectedOptions}
                      onChange={(options) => handleAssignmentChange(q.id, options)}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder={t('pages.admin.assignQuestions.selectPlaceholder', 'Select subtopics...')}
                      isDisabled={loading || saving}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className={`btn btn-primary ${saving ? 'loading' : ''}`}
              onClick={handleSaveAssignments}
              disabled={!isDirty || saving || loading}
            >
              {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Assignments')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
