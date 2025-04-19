import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo } from "react";
// Removed Select import as it's now in sub-components
import type { Topic, Question, Chapter } from "~/types";
import QuestionSet from "~/components/QuestionSet";
import MarkdownRenderer from "~/components/MarkdownRenderer";
// Removed MDEditor import
import { useDisplaySettings } from '~/contexts/DisplaySettingsContext';
import { getDocs, query, where, QuerySnapshot } from "firebase/firestore";
import { questionsCollection } from "~/firebaseConfig";
import { fetchTopics, fetchChaptersByTextbook } from "~/utils/fetchData";
import { FaEye } from "react-icons/fa"; // Removed unused icons

// Import new components
import TopicSelector from "~/components/exercise-generator/TopicSelector";
import YearSelector from "~/components/exercise-generator/YearSelector";
import DisplaySettingsForm from "~/components/exercise-generator/DisplaySettingsForm";
import InstructionsEditor from "~/components/exercise-generator/InstructionsEditor";
import PreviewHeader from "~/components/exercise-generator/PreviewHeader";


type SelectOption = { value: number; label: string };
const defaultInstructions =
  `>這是你用來編寫工作紙指示的格式（Markdown）的方法。
# Markdown 簡單使用方法：
## 標題
* Hash sign(#)，之後加一個空格，用來表示標題。
* 兩個 Hash sign(\\#\\#) 用來表示第二級標題，如此類推。
## 平時打字
與平時**無異**，除了*換行前*要加***兩個空格***。  
就好像這樣。
## 列表
1. 第一點
1. 第二點
* 第一點
* 第二點
## 數學式
數學公式：@@a^2+2ab+b^2##
`

const getQuestions = async (condition: { years?: number[], tId?: number }): Promise<Question[]> => {
  // Ensure years array is not empty, Firestore 'in' queries require a non-empty array
  const validYears = condition.years && condition.years.length > 0 ? condition.years : [0]; // Use a dummy value if empty
  const q = query(questionsCollection, where("year", "in", validYears), where("tId", "array-contains", condition.tId));
  const questionsSnapshot: QuerySnapshot<Question> = await getDocs(q);
  return questionsSnapshot.docs.map(doc => doc.data());
}

export function meta() {
  return [
    { title: "Mathematics MCQ - Exercise Generator" },
    { name: "description", content: "Generate customized mathematics worksheets from multiple choice questions" },
  ];
}

export default function ExerciseGenerator() {
  const { t } = useTranslation();
  const [loadingTopics, setLoadingTopics] = useState<boolean>(true);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  // Removed topicOptions definition, handled in TopicSelector

  const currentYear = new Date().getFullYear();
  const firstYear = 2012
  const years = Array.from({ length: currentYear - firstYear + 1 }, (_, i) => firstYear + i);
  const yearOptions: SelectOption[] = years.map(year => ({
    value: year,
    label: String(year)
  }));

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedTopicOptions, setSelectedTopicOptions] = useState<readonly SelectOption[]>([]);
  const [selectedChapterOptions, setSelectedChapterOptions] = useState<readonly SelectOption[]>([]);
  const [selectedYearOptions, setSelectedYearOptions] = useState<readonly SelectOption[]>(yearOptions);
  const [showQuestions, setShowQuestions] = useState(false);
  const [instructionsFieldVisible, setInstructionsFieldVisible] = useState<boolean>(false);
  const [showTopicWarning, setShowTopicWarning] = useState(false);
  const { showMetadata, showPercent, showAnswer, toggleMetadata, togglePercent, toggleAnswer } = useDisplaySettings();
  const [sortBy, setSortBy] = useState<'year-qnum' | 'hkPercent'>('year-qnum');
  const [questions, setQuestions] = useState<Question[][]>([]);

  useEffect(() => {
    fetchTopics({
      setLoading: setLoadingTopics,
      setError,
      setTopics,
      t
    });
    fetchChaptersByTextbook({
      setLoading: setLoadingChapters,
      setError,
      setChapters,
      textbookId: "ARISTO_INSIGHT",
      t
    });
  }, [t]);

  // Removed Memoized chapterOptions and filteredTopicOptions, handled in TopicSelector

  const handleTopicChange = (options: readonly SelectOption[]) => {
    setSelectedTopicOptions(options || []);
    setShowQuestions(false);
    setShowTopicWarning(false);
  };

  const handleChapterChange = (options: readonly SelectOption[]) => {
    setSelectedChapterOptions(options || []);
    setSelectedTopicOptions([]);
    setShowQuestions(false);
    setShowTopicWarning(false);
  };

  const handleYearChange = (options: readonly SelectOption[]) => {
    setSelectedYearOptions(options || []);
    setShowQuestions(false);
  };

  const handlePreview = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const selectedTopicIds = selectedTopicOptions.map(option => option.value);
    const selectedYearValues = selectedYearOptions.map(option => option.value);

    if (selectedTopicIds.length === 0) {
      setShowTopicWarning(true);
      setShowQuestions(false);
      setError(null);
      setQuestions([]); // Clear questions if no topics selected
    } else {
      setError(null);
      setShowTopicWarning(false);
      setShowQuestions(true); // Show loading/preview area immediately
      setQuestions([]); // Clear previous questions while fetching

      try {
        const questionPromises = selectedTopicIds.map(tId => getQuestions({ years: selectedYearValues, tId }));
        const fetchedQuestions = await Promise.all(questionPromises);
        setQuestions(fetchedQuestions);
        // console.log(fetchedQuestions);
      } catch (fetchError) {
        console.error("Error fetching questions:", fetchError);
        setError(t('errors.fetchQuestionsFailed')); // Set user-friendly error message
        setShowQuestions(false); // Hide question area on error
      }
    }
  };


  const handleInstructionFieldVisible = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInstructionsFieldVisible(event.target.checked);
    if (event.target.checked && instructions === "") {
      setInstructions(defaultInstructions);
    } else if (!event.target.checked && instructions === defaultInstructions) {
      setInstructions("");
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as 'year-qnum' | 'hkPercent');
  };

  // Removed unused handleSubmit function

  const selectedTopicIds = selectedTopicOptions.map(option => option.value);
  // Removed isLoading definition, handled in TopicSelector

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold m-4 no-print" > {t('pages.exerciseGenerator.title')}</h1>

        {/* Form Section */}
        <div className="space-y-4 m-4 no-print">
          {/* Grid for Selectors and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {/* Topic/Chapter Selector */}
            <div className="col-span-1 md:col-span-3">
              <TopicSelector
                topics={topics}
                chapters={chapters}
                selectedChapterOptions={selectedChapterOptions}
                selectedTopicOptions={selectedTopicOptions}
                handleChapterChange={handleChapterChange}
                handleTopicChange={handleTopicChange}
                loadingTopics={loadingTopics}
                loadingChapters={loadingChapters}
                showTopicWarning={showTopicWarning}
                t={t}
              />
            </div>

            {/* Year Selector */}
            <div className="col-span-1 md:col-span-2">
              <YearSelector
                yearOptions={yearOptions}
                selectedYearOptions={selectedYearOptions}
                handleYearChange={handleYearChange}
                t={t}
              />
            </div>

            {/* Display Settings */}
            <div className="col-span-1 md:col-span-2">
              <DisplaySettingsForm
                showMetadata={showMetadata}
                showPercent={showPercent}
                showAnswer={showAnswer}
                toggleMetadata={toggleMetadata}
                togglePercent={togglePercent}
                toggleAnswer={toggleAnswer}
                sortBy={sortBy}
                handleSortChange={handleSortChange}
                t={t}
              />
            </div>
          </div>

          {/* Instructions Editor */}
          <InstructionsEditor
            title={title}
            setTitle={setTitle}
            instructions={instructions}
            setInstructions={setInstructions}
            instructionsFieldVisible={instructionsFieldVisible}
            handleInstructionFieldVisible={handleInstructionFieldVisible}
            t={t}
          />

          {/* Preview Button */}
          <div className="flex space-x-4 items-center" >
            <button
              type="button"
              onClick={handlePreview}
              className="btn btn-primary btn-lg"
              disabled={loadingTopics || loadingChapters} // Disable button while initial data is loading
            >
              <FaEye />
              {t('pages.exerciseGenerator.form.previewButton')}
            </button>
          </div >
        </div>

        {/* Preview Section Separator */}
        <div className="border-b my-4 mx-2 no-print text-center text-2xl">{t('pages.exerciseGenerator.previewTitle')}</div>

        {/* Preview Content Area */}
        <div className="max-w-none p-4 pb-0 bg-base-100" >
          {/* Display Title */}
          {title && <h3 className="text-4xl font-semibold mb-2 text-border text-shadow-lg ps-2 pb-4 underline">{title}</h3>}

          {/* Display Instructions */}
          {instructions && (
            <div className="mb-4 bg-base-200 rounded prose max-w-none *:my-1 p-2">
              <MarkdownRenderer>{instructions}</MarkdownRenderer>
            </div>
          )}

          {/* Preview Header (Name, Class, Date) */}
          <PreviewHeader t={t} />

          {/* Error Display */}
          {error && <div className="p-4 text-center text-error">{error}</div>}

          {/* Conditionally render QuestionSet */}
          {showQuestions && !error && selectedTopicIds.length > 0 && (
            selectedTopicIds.map((topicId, index) => {
              const topic = topics.find((topic) => topic.tId === topicId);
              const currentQuestions = questions[index]; // Get questions for this topicId

              // Handle case where questions might still be loading or failed for a specific topic
              if (!currentQuestions) {
                // Optionally show a loading indicator per topic or handle empty state
                return <div key={topicId} className="text-center p-4">{t('common.loading', 'Loading...')} {topic?.tTitleC}</div>;
              }

              return (
                <div key={topicId} className="mb-4">
                  <QuestionSet
                    title={`${topic?.tTitleC} (${topic?.tTitleE})`}
                    questions={currentQuestions}
                    sortBy={sortBy}
                  />
                </div>
              );
            })
          )}
          {/* Handle case where preview is shown but questions array is empty (still loading/no results) */}
          {showQuestions && !error && questions.flat().length === 0 && selectedTopicIds.length > 0 && (
            <div className="text-center p-4">{t('pages.exerciseGenerator.warnings.noQuestionsFound', 'No questions found for the selected criteria.')}</div>
          )}
        </div >
      </div >
    </>
  );
}
