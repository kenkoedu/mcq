import { useTranslation } from 'react-i18next'; // Import useTranslation
import type { Question } from '~/types';
import QuestionCard from './QuestionCard'; // Or QuestionCard
interface QuestionSetProps {
  title?: string; // Optional title prop
  sortBy?: 'year-qnum' | 'hkPercent'; // Add sortBy prop
  questions?: Question[]; // Add optional questions prop for pre-filtered data
}

export default function QuestionSet({
  title = '', // Default title
  sortBy = 'year-qnum', // Default sort order
  questions = [] // Rename prop for clarity
}: QuestionSetProps) {
  const { t, i18n } = useTranslation(); // Get i18n instance

  const sortQuestions = (a: Question, b: Question): number => {
    if (sortBy === 'hkPercent') {
      const percentA = a.hkPercent ?? -1; // Treat missing percent as lowest
      const percentB = b.hkPercent ?? -1;
      return percentB - percentA;
    } else { // Default to 'year-qnum'
      // Sort by year descending, then qNum ascending
      return a.year - b.year || a.qNum - b.qNum;
    }
  };

  const sortedQuestions = questions.sort(sortQuestions);

  return (
    <div>
      <h3 className={`text-2xl text-shadow-md font-semibold border-b my-2`}>
        {title}
      </h3>
      {sortedQuestions.map((question, index) => (
        <QuestionCard
          key={question.qId}
          question={question}
          index={index}
        />
      ))}
    </div>
  );
}
