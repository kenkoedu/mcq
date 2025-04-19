import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Topic } from "~/types";
import TopicManager from '~/components/TopicManager';
import SubtopicManager from '~/components/SubtopicManager'; // Import new component
import QuestionAssignmentManager from '~/components/QuestionAssignmentManager'; // Import QuestionAssignmentManager directly
import TextbookManager from '~/components/TextbookManager'; // Import the new component
import { FaBook, FaTags } from 'react-icons/fa'; // Added FaBook

// Simple hardcoded password - this is not secure but meets the "simplest way" requirement
const ADMIN_PASSWORD = "admin123";

export function meta() {
  return [
    { title: "Admin Panel" },
    { name: "description", content: "Admin control panel" },
  ];
}

type TopicWithId = Topic & { id: string };

export default function AdminPage() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Topics, 2: Subtopics, 3: Questions
  const [selectedTopic, setSelectedTopic] = useState<TopicWithId | null>(null);
  const [managementSection, setManagementSection] = useState<'topics' | 'textbooks'>('topics'); // State for section selection

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError(t("error.generic.details"));
    }
  };

  const handleSelectTopic = useCallback((topic: TopicWithId) => {
    setSelectedTopic(topic);
    setCurrentStep(2); // Move to Step 2 (Subtopics)
  }, []);

  const handleGoBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2); // Go from Questions back to Subtopics
    } else if (currentStep === 2) {
      setCurrentStep(1); // Go from Subtopics back to Topics
      setSelectedTopic(null); // Clear selected topic when going back to step 1
    }
  };

  const handleProceed = () => {
    if (currentStep === 2) {
      setCurrentStep(3); // Go from Subtopics to Questions
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center">{t('pages.admin.title')}</h1>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full mt-1"
              />
            </div>

            {error && <p className="text-error text-sm">{error}</p>}

            <div>
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Admin panel content - show when authenticated
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('pages.admin.title', 'Admin Panel')}</h1>

      {/* Section Selector */}
      <div className="flex justify-center space-x-8 mb-8">
        <button
          onClick={() => setManagementSection('topics')}
          className={`card w-64 h-48 shadow-xl transition-all duration-300 ${managementSection === 'topics' ? 'bg-primary text-primary-content ring-4 ring-primary ring-offset-2' : 'bg-base-200 hover:bg-base-300'}`}
        >
          <div className="card-body items-center text-center justify-center">
            <FaTags className="text-6xl mb-2" />
            <h2 className="card-title text-2xl">Manage Topics & Questions</h2>
          </div>
        </button>
        <button
          onClick={() => setManagementSection('textbooks')}
          className={`card w-64 h-48 shadow-xl transition-all duration-300 ${managementSection === 'textbooks' ? 'bg-secondary text-secondary-content ring-4 ring-secondary ring-offset-2' : 'bg-base-200 hover:bg-base-300'}`}
        >
          <div className="card-body items-center text-center justify-center">
            <FaBook className="text-6xl mb-2" />
            <h2 className="card-title text-2xl">Manage Textbooks</h2>
          </div>
        </button>
      </div>

      {/* Conditional Rendering based on selection */}
      {managementSection === 'topics' && (
        <>
          {/* DaisyUI Steps - Updated to 3 steps */}
          <ul className="steps w-full mb-8">
            <li className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>
              {t('pages.admin.steps.topics', 'Manage Topics')}
            </li>
            <li className={`step ${currentStep >= 2 ? 'step-primary' : ''}`}>
              {t('pages.admin.steps.subtopics', 'Manage Subtopics')}
            </li>
            <li className={`step ${currentStep >= 3 ? 'step-primary' : ''}`}>
              {t('pages.admin.steps.questions', 'Manage Questions')}
            </li>
          </ul>

          {currentStep === 1 && (
            <TopicManager t={t} onSelectTopic={handleSelectTopic} /> // Pass onSelectTopic
          )}

          {currentStep === 2 && selectedTopic && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={handleGoBack}
                >
                  &larr; {t('pages.admin.backToTopics', 'Back to Topics')}
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleProceed}
                >
                  {t('pages.admin.proceedToQuestions', 'Proceed to Questions')} &rarr;
                </button>
              </div>
              <SubtopicManager t={t} selectedTopic={selectedTopic} />
            </div>
          )}

          {currentStep === 3 && selectedTopic && (
            <div>
              <button
                className="btn btn-sm btn-outline mb-4"
                onClick={handleGoBack}
              >
                &larr; {t('pages.admin.backToSubtopics', 'Back to Subtopics')}
              </button>
              <QuestionAssignmentManager t={t} selectedTopic={selectedTopic} />
            </div>
          )}
        </>
      )}

      {managementSection === 'textbooks' && (
        <TextbookManager /> // Render the Textbook Manager component
      )}
    </div>
  );
}
