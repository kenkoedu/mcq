import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import type { Question, Topic } from "~/types";
import QuestionSet from "~/components/QuestionSet"; // Import QuestionSet
import { fetchQuestions, fetchTopics } from "~/utils/fetchData"; // Adjust path as needed

export function meta() {
  return [
    { title: "Mathematics MCQ - By Topic" },
    { name: "description", content: "Browse mathematics multiple choice questions by topic" },
  ];
}

export default function ByTopic() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number>(101); // Initialize as 101
  const [topics, setTopics] = useState<Topic[]>([]); // Initialize topics state 

  useEffect(() => {
    fetchTopics({
      setLoading,
      setError,
      setTopics,
      t
    });
  }, [])

  useEffect(() => {
    fetchQuestions({
      setLoading,
      setError,
      setQuestions,
      condition: { tId: selectedTopic },
      t
    });
  }, [t, selectedTopic]);

  const handleTopicChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const topicValue = event.target.value ? parseInt(event.target.value, 10) : 0;
    setSelectedTopic(topicValue);
  };

  if (error) {
    return <div className="p-4 text-center text-error">{error}</div>; // Use daisyUI text-error
  }
  return (
    <div>
      <div className="no-print">
        <h1 className="text-2xl font-bold p-4">{t('pages.byTopic.title')}</h1> {/* Corrected key */}
        <div className="p-4">
          <label htmlFor="topic-select" className="select select-primary w-1/2">
            <span className="label">{t('pages.byTopic.selectLabel')}</span>
            <select
              id="topic-select"
              value={selectedTopic ?? ''} // Handle null value for select
              onChange={handleTopicChange}
              className="p-2 select select-lg select-bordered" // Use daisyUI select
              disabled={loading} // Disable if no years loaded
            >
              {topics.map(topic => (
                <option key={topic.tId} value={topic.tId}>
                  {`${topic.tTitleC} / ${topic.tTitleE}`}
                </option>
              ))}
            </select>
          </label>

        </div>
      </div>
      {
        !loading && topics.length &&
        <div className="p-4">
          {selectedTopic && questions.length > 0 ? (
            <QuestionSet
              title={(({ tTitleC, tTitleE }) => (`${tTitleC} / ${tTitleE}`))(topics.find(t => t.tId == selectedTopic) as Topic) ?? ""} // Use selected topic as title
              questions={questions} // Pass pre-filtered questions based on state
              sortBy="year-qnum" // Explicitly set sorting by year then qNum
            />
          ) : (
            <p className="no-print">{selectedTopic ? t('pages.byTopic.noQuestionsForTopic') : t('pages.byTopic.selectTopicPrompt')}</p>)

          }
        </div>
      }
    </div>
  );
}