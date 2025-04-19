import React, { useState } from 'react';
import type { Topic } from "~/types";
import SubtopicManager from './SubtopicManager'; // Import new component
import QuestionAssignmentManager from './QuestionAssignmentManager'; // Import new component

type TopicWithId = Topic & { id: string };

interface QuestionManagerProps {
  t: (key: string, fallback?: string) => string;
  selectedTopic: TopicWithId | null;
}

export default function QuestionManager({ t, selectedTopic }: QuestionManagerProps) {
  const [innerTab, setInnerTab] = useState<'subtopics' | 'questions'>('subtopics');

  return (
    <>
      <div>
        {selectedTopic ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {t('pages.admin.questionsTitleFor', 'Manage for:')} {selectedTopic.tTitleE || selectedTopic.tTitleC} (ID: {selectedTopic.tId})
            </h2>

            {/* Inner Tab Navigation */}
            <div role="tablist" className="tabs tabs-boxed mb-4">
              <button
                role="tab"
                className={`tab ${innerTab === 'subtopics' ? 'tab-active' : ''}`}
                onClick={() => setInnerTab('subtopics')}
              >
                {t('pages.admin.tabs.subtopics', 'Manage Subtopics')}
              </button>
              <button
                role="tab"
                className={`tab ${innerTab === 'questions' ? 'tab-active' : ''}`}
                onClick={() => setInnerTab('questions')}
              >
                {t('pages.admin.tabs.assignQuestions', 'Assign Questions')}
              </button>
            </div>

            {/* Render content based on inner tab */}
            {innerTab === 'subtopics' && (
              <SubtopicManager t={t} selectedTopic={selectedTopic} />
            )}
            {innerTab === 'questions' && (
              <QuestionAssignmentManager t={t} selectedTopic={selectedTopic} />
            )}

          </>
        ) : (
          <p className="text-info">{t('pages.admin.selectTopicPrompt', 'Please select a topic from the "Manage Topics" tab first.')}</p>
        )}
      </div>
    </>
  );
}
