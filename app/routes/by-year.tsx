import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import type { Question } from "~/types";
import QuestionSet from "~/components/QuestionSet"; // Import QuestionSet
import { fetchQuestions } from "~/utils/fetchData"; // Adjust path as needed

const firstYear = 2012; // Define the first year for the dropdown

export function meta() {
  return [
    { title: "Mathematics MCQ - By Year" },
    { name: "description", content: "Browse mathematics multiple choice questions by examination year" },
  ];
}

export default function ByYear() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2012); // Initialize as null

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - firstYear + 1 }, (_, i) => firstYear + i);

  useEffect(() => {
    fetchQuestions({
      setLoading,
      setError,
      setQuestions,
      condition: { year: selectedYear }, // Fetch questions for the current year
      t
    })
  }, [t, selectedYear]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const yearValue = event.target.value ? parseInt(event.target.value, 10) : firstYear;
    setSelectedYear(yearValue);
  };

  if (error) {
    return <div className="p-4 text-center text-error">{error}</div>; // Use daisyUI text-error
  }

  return (
    <>
      <div className="no-print">
        <h1 className="text-2xl font-bold p-4">{t('pages.byYear.title')}</h1>
        <div className="p-4">
          <label htmlFor="year-select" className="select select-primary">
            <span className="label">{t('pages.byYear.selectLabel')}</span>
            <select
              id="year-select"
              value={selectedYear ?? ''} // Handle null value for select
              onChange={handleYearChange}
              className="p-2 select select-lg select-bordered" // Use daisyUI select
              disabled={loading} // Disable if no years loaded
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          {/* <label className="mr-2"></label> */}
        </div>
      </div>

      {/* Display questions using QuestionSet */}
      {!loading &&
        <div className="p-4">
          {selectedYear && questions.length > 0 ? (
            <QuestionSet
              title={selectedYear.toString()} // Use selected year as title
              questions={questions} // Pass pre-filtered questions based on state
              sortBy="year-qnum" // Explicitly set sorting by year then qNum
            />
          ) : (
            // Show prompt if no year selected OR if selected year has no questions (after loading)
            <p className="no-print">{selectedYear ? t('pages.byYear.noQuestionsForYear') : t('pages.byYear.selectYearPrompt')}</p>
          )}
        </div>
      }
    </>
  );
}
