import { useTranslation } from "react-i18next";
import { useState } from "react";
import Select from 'react-select'; // Import react-select
import allTopics from "~/assets/db/topics.json";
import allQuestions from "~/assets/db/questions.json";
import type { Topic, Question } from "~/types";
import QuestionSet from "~/components/QuestionSet"; // Import QuestionSet
import MarkdownRenderer from "~/components/MarkdownRenderer"; // Import MarkdownRenderer
import MDEditor from '@uiw/react-md-editor';
import { useDisplaySettings } from '~/contexts/DisplaySettingsContext'; // Import context hook
import { FaEye, FaCalendarAlt, FaPercent, FaCheck, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa"; // Import icons

type SelectOption = { value: number; label: string };
const uniqueYears = [...new Set(allQuestions.map((q: Question) => q.year))].sort((a, b) => b - a); // Sort descending
const topics: Topic[] = allTopics; // Use the imported topics directly

// Prepare options for react-select
const topicOptions: SelectOption[] = topics.map(topic => ({
  value: topic.tId,
  label: `${topic.tTitleC} (${topic.tTitleE})`
}));

const yearOptions: SelectOption[] = uniqueYears.map(year => ({
  value: year,
  label: String(year)
}));

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

export default function ExerciseGenerator() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  // Update state to hold SelectOption arrays or null
  const [selectedTopicOptions, setSelectedTopicOptions] = useState<readonly SelectOption[]>([]);
  // Initialize selectedYearOptions with all yearOptions
  const [selectedYearOptions, setSelectedYearOptions] = useState<readonly SelectOption[]>(yearOptions);
  const [showQuestions, setShowQuestions] = useState(false); // Renamed state to control question visibility
  const [instructionsFieldVisible, setInstructionsFieldVisible] = useState(false); // State for instructions field visibility
  const [showTopicWarning, setShowTopicWarning] = useState(false); // State for topic selection warning
  // Get display settings from context
  const { showMetadata, showPercent, showAnswer, toggleMetadata, togglePercent, toggleAnswer } = useDisplaySettings();
  // Add state for sorting method
  const [sortBy, setSortBy] = useState<'year-qnum' | 'hkPercent'>('year-qnum'); // Default sort

  const handleTopicChange = (options: readonly SelectOption[]) => {
    setSelectedTopicOptions(options || []);
    setShowQuestions(false); // Hide questions when selections change
    setShowTopicWarning(false); // Hide warning when topics change
  };

  const handleYearChange = (options: readonly SelectOption[]) => {
    setSelectedYearOptions(options || []);
    setShowQuestions(false); // Hide questions when selections change
  };

  const handlePreview = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent form submission if it's inside the form
    if (selectedTopicOptions.length === 0) {
      setShowTopicWarning(true); // Show warning if no topics selected
      setShowQuestions(false); // Ensure questions are not shown
    } else {
      setShowTopicWarning(false); // Hide warning if topics are selected
      setShowQuestions(true); // Show the questions section
    }
  };

  const handleInstructionFieldVisible = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInstructionsFieldVisible(event.target.checked);
    if (event.target.checked && instructions === "") {
      setInstructions(defaultInstructions);
    }
    else if (!event.target.checked && instructions === defaultInstructions) {
      setInstructions("");
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy(event.target.value as 'year-qnum' | 'hkPercent');
    // Optionally hide questions preview when sort changes, or let it update dynamically
    // setShowQuestions(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedTopics = selectedTopicOptions.map(option => option.value);
    const selectedYears = selectedYearOptions.map(option => option.value);
    // console.log({ title, instructions, selectedTopics, selectedYears });
    alert("Worksheet generation logic not implemented yet.");
  };

  const selectedTopicIds = selectedTopicOptions.map(option => option.value);
  const selectedYearValues = selectedYearOptions.map(option => option.value);

  return (
    <div>
      <h1 className="text-2xl font-bold m-4 no-print" > {t('pages.exerciseGenerator.title')}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 m-4 no-print">
        {/* Change grid layout to 4 columns */}
        <div className="grid grid-cols-7 gap-4">
          {/* Title Field */}
          <div className="col-span-2">
            <label htmlFor="title" className="block font-medium text-gray-700">{t('pages.exerciseGenerator.form.titleLabel')}</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg"
            />
          </div>
          {/* Topic Selector - Replaced with react-select */}
          {/* Wrap the topic selector div with tooltip container */}
          <div
            className={`col-span-2 ${showTopicWarning ? 'tooltip tooltip-warning tooltip-open' : ''}`}
            data-tip={showTopicWarning ? t('pages.exerciseGenerator.warnings.noTopicSelected') : ''}
          >
            <div className={`${showTopicWarning ? 'border-2 border-warning rounded-md p-1' : ''}`}> {/* Add conditional border */}
              <label htmlFor="topics" className="block font-medium text-gray-700">{t('pages.exerciseGenerator.form.topicsLabel')}</label>
              <Select<SelectOption, true> // Specify type for multi-select
                id="topics"
                instanceId="topics-select" // Add unique instanceId for SSR/hydration
                isMulti
                options={topicOptions}
                value={selectedTopicOptions}
                onChange={handleTopicChange}
                className="mt-1"
                classNamePrefix="react-select" // Optional: for styling
              />
            </div>
          </div>

          {/* Year Selector - Replaced with react-select */}
          <div className="col-span-2">
            <label htmlFor="years" className="block font-medium text-gray-700">{t('pages.exerciseGenerator.form.yearsLabel')}</label>
            <Select<SelectOption, true> // Specify type for multi-select
              id="years"
              instanceId="years-select" // Add unique instanceId for SSR/hydration
              isMulti
              options={yearOptions}
              value={selectedYearOptions}
              onChange={handleYearChange}
              className="mt-1"
              classNamePrefix="react-select" // Optional: for styling
            />
          </div>

          {/* Display Settings Menu - New 4th column */}
          <div>
            <label className="block font-medium text-gray-700">{t('pages.exerciseGenerator.form.settingsLabel')}</label> {/* Add a label */}
            <ul className="menu bg-base-200 rounded-box mt-1 p-2"> {/* Use menu classes */}
              <li>
                <label className="label cursor-pointer">
                  <input type="checkbox" className="toggle" checked={showMetadata} onChange={toggleMetadata} /> {/* Use toggle-sm */}
                  <span className="label-text text-base-content text-lg">{t('navbar.settings.showMetadata')}</span>

                </label>
              </li>
              <li>
                <label className={`label cursor-pointer ${!showMetadata ? 'opacity-50' : ''}`}>
                  <input type="checkbox" className="toggle toggle-secondary" checked={showPercent} onChange={togglePercent} disabled={!showMetadata} /> {/* Use toggle-sm */}
                  <span className="label-text text-base-content text-lg">{t('navbar.settings.showPercent')}</span>
                </label>
              </li>
              <li>
                <label className={`label cursor-pointer ${!showMetadata ? 'opacity-50' : ''}`}>
                  <input type="checkbox" className="toggle toggle-accent" checked={showAnswer} onChange={toggleAnswer} disabled={!showMetadata} /> {/* Use toggle-sm */}
                  <span className="label-text text-base-content text-lg">{t('navbar.settings.showAnswer')}</span>
                </label>
              </li>

              {/* Divider */}
              <div className="divider"></div> {/* Added m-0 for potentially tighter spacing */}

              {/* Sort Options */}
              <li className="menu-title px-4 pt-2 pb-0 text-base-content text-lg"><span>{t('pages.exerciseGenerator.form.sortByLabel')}</span></li>
              <li>
                {/* Rearranged input and span, added text color */}
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="radio"
                    name="sort-option"
                    className="radio"
                    value="year-qnum"
                    checked={sortBy === 'year-qnum'}
                    onChange={handleSortChange}
                  />
                  <span className="label-text text-base-content text-lg">{t('pages.exerciseGenerator.form.sortByYearQnum')}</span>
                </label>
              </li>
              <li>
                {/* Rearranged input and span, added text color */}
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="radio"
                    name="sort-option"
                    className="radio radio-sm"
                    value="hkPercent"
                    checked={sortBy === 'hkPercent'}
                    onChange={handleSortChange}
                  />
                  <span className="label-text text-base-content text-lg">{t('pages.exerciseGenerator.form.sortByHkPercent')}</span>
                </label>
              </li>
            </ul>
          </div>
        </div>

        {/* Instructions Field */}
        <div tabIndex={0} className="collapse border">
          <input type="checkbox" checked={instructionsFieldVisible} onChange={handleInstructionFieldVisible} />
          <div className="collapse-title">{t('pages.exerciseGenerator.form.instructionsLabel')}</div>
          <div className="collapse-content grid grid-cols-2">
            {/* <label htmlFor="instructions" className="block font-medium text-gray-700">{t('pages.exerciseGenerator.form.instructionsLabel')}</label> */}
            {/* Consider replacing textarea with a Markdown editor component (e.g., react-simplemde-editor) */}
            <MDEditor
              data-color-mode="light"
              value={instructions}
              onChange={(val) => setInstructions(val as string)}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg"
              preview="edit" // Show preview in edit mode
              height={500} // Set height for the editor
            />
            <div className="prose *:my-1 m-3">
              <MarkdownRenderer>{instructions}</MarkdownRenderer>
            </div>
          </div>
        </div>



        {/* Preview Button - Moved dropdown logic to the grid */}
        <div className="flex space-x-4 items-center">
          <button
            type="button" // Change type to button to prevent form submission
            role="submit"
            onClick={handlePreview}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('pages.exerciseGenerator.form.previewButton')}
          </button>
          {/* Removed the dropdown from here */}
        </div>
      </form >
      <div className="w-full border-b-1 no-print text-center text-2xl">工作紙預覽</div>
      {/* Title and Instructions Section (Always Visible) */}
      <div className="max-w-none p-4 pb-0 bg-base-100" >
        {/* Display Title */}
        {title && <h3 className="text-2xl font-semibold mb-2">{title}</h3>}
        {/* Display Instructions using MarkdownRenderer */}
        {
          instructions && (
            <div className="mb-4 bg-base-200 rounded prose max-w-none *:my-1 ">
              <MarkdownRenderer>{instructions}</MarkdownRenderer>
            </div>
          )
        }
        <div className="max-w-none grid grid-cols-8">
          <div className="col-span-3 flex flex-row">
            <div className="me-2">Name:</div>
            <div className="border-b-1 grow me-2"></div>
          </div>
          <div className="col-span-3 flex flex-row">
            <div className="me-2">Class(Class No.):</div>
            <div className="border-b-1 grow me-2"></div>
          </div>
          <div className="col-span-2 flex flex-row">
            <div className="me-2">Date:</div>
            <div className="border-b-1 grow me-2"></div>
          </div>
        </div>
        {/* Conditionally render QuestionSet */}
        {
          showQuestions && selectedTopicIds.length > 0 && ( // Add check for selectedTopicIds length
            <QuestionSet
              selectedTopics={selectedTopicIds}
              selectedYears={selectedYearValues}
              allQuestions={allQuestions}
              allTopics={topics} // Pass allTopics here
              showTitle={false} // Don't show the inner title in preview
              groupBy="topic" // Group by topic for the generator preview
              sortBy={sortBy} // Pass the selected sort method
            />
          )
        }
      </div>
    </div >
  );
}
