import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import type { Question, Topic } from '~/types';
import QuestionDisplay from './QuestionDisplay'; // Or QuestionCard
import { useDisplaySettings } from '~/contexts/DisplaySettingsContext'; // Import context hook

interface QuestionSetProps {
  selectedTopics?: number[];
  selectedYears?: number[];
  allQuestions: Question[];
  allTopics: Topic[];
  showTitle?: boolean;
  groupBy?: 'topic' | 'year'; // Add groupBy prop, default to 'topic'
  sortBy?: 'year-qnum' | 'hkPercent'; // Add sortBy prop
  questions?: Question[]; // Add optional questions prop for pre-filtered data
}

export default function QuestionSet({
  selectedTopics = [],
  selectedYears = [],
  allQuestions,
  allTopics,
  showTitle = true,
  groupBy = 'topic', // Default to 'topic'
  sortBy = 'year-qnum', // Default sort order
  questions: preFilteredQuestions // Rename prop for clarity
}: QuestionSetProps) {
  const { t, i18n } = useTranslation(); // Get i18n instance
  const { showAnswer } = useDisplaySettings(); // Get showAnswer from context

  // Use pre-filtered questions if provided, otherwise filter based on selections
  const filteredQuestions = preFilteredQuestions ?? allQuestions.filter(question => {
    const yearMatch = selectedYears.length === 0 || selectedYears.includes(question.year);
    const topicMatch = selectedTopics.length === 0 || question.tId.some(tid => selectedTopics.includes(tid));
    return yearMatch && topicMatch;
  });

  // Helper to get topic names string based on current language
  const getTopicNames = (topicIds: number[]): string => {
    const currentLang = i18n.language; // Get current language ('en', 'zh', etc.)
    return topicIds
      .map(id => {
        const topic = allTopics.find(topic => topic.tId === id);
        if (!topic) {
          return `Unknown Topic (${id})`;
        }
        // Prioritize title based on current language
        if (currentLang === 'zh') {
          return topic.tTitleC || topic.tTitleE || `Topic ${id}`; // Fallback to English then ID
        } else {
          return topic.tTitleE || topic.tTitleC || `Topic ${id}`; // Fallback to Chinese then ID
        }
      })
      .join(' / '); // Join multiple topic names with ' / '
  };

  // Helper sort function based on sortBy prop
  const sortQuestions = (a: Question, b: Question): number => {
    if (sortBy === 'hkPercent') {
      // Sort by hkPercent descending (higher percent first)
      // Handle cases where hkPercent might be undefined or null
      const percentA = a.hkPercent ?? -1; // Treat missing percent as lowest
      const percentB = b.hkPercent ?? -1;
      return percentB - percentA;
    } else { // Default to 'year-qnum'
      // Sort by year descending, then qNum ascending
      return a.year - b.year || a.qNum - b.qNum;
    }
  };

  // Grouping Logic based on groupBy prop
  let groupedAndSortedData: { groupKey: string | number; questions: Question[] }[] = [];

  if (groupBy === 'year') {
    const groupedByYear: { [year: number]: Question[] } = {};
    filteredQuestions.forEach(question => {
      if (!groupedByYear[question.year]) {
        groupedByYear[question.year] = [];
      }
      groupedByYear[question.year].push(question);
    });
    groupedAndSortedData = Object.entries(groupedByYear)
      .map(([year, questions]) => ({
        groupKey: parseInt(year, 10),
        questions: questions.sort(sortQuestions) // Use the sort helper function
      }))
      .sort((a, b) => b.groupKey - a.groupKey); // Sort years descending
  } else { // Default to groupBy 'topic'
    const groupedByTopic: { [topicName: string]: Question[] } = {};
    filteredQuestions.forEach(question => {
      const topicNames = getTopicNames(question.tId); // Use helper to get potentially combined topic names
      if (!groupedByTopic[topicNames]) {
        groupedByTopic[topicNames] = [];
      }
      groupedByTopic[topicNames].push(question);
    });
    groupedAndSortedData = Object.entries(groupedByTopic)
      .map(([topicName, questions]) => ({
        groupKey: topicName,
        questions: questions.sort(sortQuestions) // Use the sort helper function
      }))
      .sort((a, b) => a.groupKey.localeCompare(b.groupKey)); // Sort topics alphabetically
  }

  return (
    <div>
      {showTitle && (
        <h2 className="text-xl font-semibold mb-4">{t('pages.exerciseGenerator.resultsTitle')}</h2>
      )}
      {groupedAndSortedData.length > 0 ? (
        groupedAndSortedData.map(({ groupKey, questions }) => (
          <div key={groupKey} className="mb-6">
            {/* Display Year or Topic Name as header */}
            <h3 className={`text-lg font-semibold border-b my-2 break-before-avoid break-after-avoid ${groupBy === 'topic' ? 'italic' : ''}`}>
              {groupKey}
            </h3>
            {/* Use columns for questions */}
            <div className="columns-1 gap-2">
              {questions.map((question, index) => (
                <div key={question.qId} className="mb-2"> {/* Ensure each question card avoids breaking */}
                  <QuestionDisplay
                    question={question}
                    // Pass index relative to the group if needed, or absolute index if preferred
                    index={index} // Example: index within the group
                    showAnswer={showAnswer} // Pass showAnswer state
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>{t('common.noResultsFound')}</p> // Add a common translation key for no results
      )}
    </div>
  );
}
