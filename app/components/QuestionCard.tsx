import React from 'react';
import { useTranslation } from 'react-i18next';
import MarkdownRenderer from './MarkdownRenderer';
import type { Question } from '~/types'; // Import Question type from the new types file
import { FaCalendarAlt, FaHashtag, FaChartBar, FaCheck } from 'react-icons/fa'; // Import icons
import { useDisplaySettings } from '~/contexts/DisplaySettingsContext'; // Import context hook

interface QuestionCardProps {
  index: number; // Added index prop to track question number
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  question,
}) => {
  const { i18n } = useTranslation(); // Get i18n instance
  const { showMetadata, showPercent, showAnswer } = useDisplaySettings(); // Use context hook

  // Determine image suffix based on language
  const imageSuffix = i18n.language.startsWith('zh') ? 'c' : 'e'; // 'c' for Chinese, 'e' otherwise

  return (
    <div className="relative bg-primary-content mb-1 p-2 break-inside-avoid"> {/* Added relative positioning */}
      <div className="flex flex-row ">
        <div className="mr-2 font-semibold flex-none">{index + 1}.</div>
        <div className="grow shadow-xl/20 rounded-md">
          {question.hasImage || i18n.language.startsWith('en') ? (
            <img
              src={`/mcq/images/questions/${question.qId}${imageSuffix}.png`} // Use dynamic suffix
              alt={`Question ${question.qId}`}
              className="max-w-full h-auto shadow-2xl rounded-md p-2" // Add styling as needed
            />
          ) : (
            <div className="question-contents ps-2">
              <MarkdownRenderer>{question.qText}</MarkdownRenderer>
              {question.isStatements && (
                <ol className="list-[upper-roman] mb-4 space-y-1 ms-6">
                  {question.statements.map((statement, stmtIndex) => (
                    <li key={stmtIndex}>
                      <MarkdownRenderer>{statement}</MarkdownRenderer>
                    </li>
                  ))}
                </ol>
              )}
              <div className='border-s-1 bg-sky-100 rounded'>
                <ol className="space-y-2 list-[upper-alpha] ms-10 mt-1 py-1">
                  {/* {console.log(question)} */}
                  {question.choices.map((choice, choiceIndex) => (
                    <li key={choiceIndex}>
                      <MarkdownRenderer>{choice}</MarkdownRenderer>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div >
      {/* Metadata Badges Container */}
      {
        showMetadata && (
          // Change items-end to items-stretch
          <div className="absolute bottom-2 right-2 flex flex-col items-stretch space-y-1"> {/* Added w-16 for a fixed container width, adjust as needed */}
            {/* Add w-full and justify-center to each badge */}
            <div className="badge badge-outline w-full justify-center">
              <FaCalendarAlt className="h-3 w-3 mr-1" /> {/* Calendar Icon */}
              {question.year}
            </div>
            <div className="badge badge-outline w-full justify-center">
              <FaHashtag className="h-3 w-3 mr-1" /> {/* Hash Icon */}
              {question.qNum}
            </div>
            {showPercent && question.hkPercent !== undefined && (
              <div className="badge badge-outline w-full justify-center">
                <FaChartBar className="h-3 w-3 mr-1" /> {/* Chart Bar Icon */}
                {question.hkPercent}%
              </div>
            )}
            {showAnswer && (
              <div className="badge badge-outline w-full justify-center">
                <FaCheck className="h-3 w-3 mr-1" /> {/* Check Icon */}
                {question.ans}
              </div>
            )}
          </div>
        )
      }
    </div >
  );
};

export default QuestionCard;
