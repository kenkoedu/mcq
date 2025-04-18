import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface DisplaySettings {
  showMetadata: boolean;
  showPercent: boolean;
  showAnswer: boolean;
  language: string; // Add language state
  toggleMetadata: () => void;
  togglePercent: () => void;
  toggleAnswer: () => void;
  toggleLanguage: () => void; // Add language toggle function
}

const DisplaySettingsContext = createContext<DisplaySettings | undefined>(undefined);

export const DisplaySettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation(); // Get i18n instance
  const [showMetadata, setShowMetadata] = useState(true);
  const [showPercent, setShowPercent] = useState(true);
  const [showAnswer, setShowAnswer] = useState(true);
  const [language, setLanguage] = useState(i18n.language); // Initialize language state

  const toggleMetadata = () => setShowMetadata(prev => !prev);
  const togglePercent = () => setShowPercent(prev => !prev);
  const toggleAnswer = () => setShowAnswer(prev => !prev);

  // Language toggle logic moved here
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
    setLanguage(newLang); // Update context state
  };

  // Ensure percent/answer are only shown if metadata is shown
  const effectiveShowPercent = showMetadata && showPercent;
  const effectiveShowAnswer = showMetadata && showAnswer;

  return (
    <DisplaySettingsContext.Provider value={{
      showMetadata,
      showPercent: effectiveShowPercent,
      showAnswer: effectiveShowAnswer,
      language, // Provide language state
      toggleMetadata,
      togglePercent,
      toggleAnswer,
      toggleLanguage // Provide toggle function
    }}>
      {children}
    </DisplaySettingsContext.Provider>
  );
};

export const useDisplaySettings = (): DisplaySettings => {
  const context = useContext(DisplaySettingsContext);
  if (context === undefined) {
    throw new Error('useDisplaySettings must be used within a DisplaySettingsProvider');
  }
  return context;
};
