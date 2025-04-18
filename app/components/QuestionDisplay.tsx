import React from 'react';
import type { Question } from '~/types';
import QuestionCard from './QuestionCard'; // Assuming QuestionCard exists

interface QuestionDisplayProps {
  question: Question;
  index: number;
  showAnswer: boolean;
}

// Helper function renderTextWithMath is removed as it's assumed to be handled by QuestionCard

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, index, showAnswer }) => {
  // Removed direct rendering logic for qNum, qText, choices, etc.

  return (
    <QuestionCard
      question={question}
      index={index}
    />
  );
};

export default QuestionDisplay;
