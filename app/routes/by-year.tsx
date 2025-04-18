import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import questionsData from "~/assets/db/questions.json";
import allTopicsData from "~/assets/db/topics.json"; // Keep for potential future use or remove if unused
import type { Question, Topic } from "~/types";
// Import QuestionSet
import QuestionSet from "~/components/QuestionSet"; // Import QuestionSet

const questions: Question[] = questionsData as Question[];
const allTopics: Topic[] = allTopicsData as Topic[]; // Keep or remove based on usage

// Calculate unique years
const uniqueYears = Array.from(new Set(questions.map(q => q.year))).sort((a, b) => b - a); // Sort descending

export default function ByYear() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<number>(uniqueYears[0]); // Default to the latest year

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const yearValue = event.target.value ? parseInt(event.target.value, 10) : null;
    setSelectedYear(yearValue ?? uniqueYears[0]); // Default to the latest year if none selected
    // No need to manage showAnswers here, QuestionSet uses context
  };

  // Filter questions based *only* on the selected year
  const filteredQuestions = useMemo(() => {
    if (!selectedYear) {
      return []; // Return empty if no year is selected
    }
    // No need to sort here, QuestionSet will handle sorting within groups
    return questions.filter(q => q.year === selectedYear);
  }, [selectedYear]);

  return (
    <div>
      <div className="no-print">
        <h1 className="text-2xl font-bold p-4">{t('pages.byYear.title')}</h1>
        <div className="p-4">
          <label htmlFor="year-select" className="mr-2">{t('pages.byYear.selectLabel')}:</label>
          <select
            id="year-select"
            value={selectedYear ?? ''} // Handle potential null value for select
            onChange={handleYearChange}
            className="p-2 border rounded select select-bordered" // Use daisyUI select
          >
            {/* <option value="">{t('pages.byYear.allYearsOption')}</option> */} {/* Removed 'All Years' as it complicates filtering */}
            {uniqueYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display questions using QuestionSet */}
      <div className="p-4">
        {selectedYear ? (
          <QuestionSet
            selectedYears={[selectedYear]} // Pass the selected year
            questions={filteredQuestions} // Pass pre-filtered questions
            allTopics={allTopics} // Pass allTopics for name lookup
            allQuestions={[]} // Pass empty or don't pass if not needed when `questions` is provided
            groupBy="year" // Group primarily by year (will only be one year)
            sortBy="year-qnum" // Explicitly set sorting by year then qNum
            showTitle={false} // Don't show the generic "Results" title
          />
        ) : (
          <p className="no-print">{t('pages.byYear.selectYearPrompt')}</p> // Show prompt if no year selected
        )}
      </div>
    </div>
  );
}
