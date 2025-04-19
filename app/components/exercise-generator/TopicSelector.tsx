import React from 'react';
import Select from 'react-select';
import type { TFunction } from 'i18next';
import type { Topic, Chapter } from '~/types';

type SelectOption = { value: number; label: string };

interface TopicSelectorProps {
  topics: Topic[];
  chapters: Chapter[];
  selectedChapterOptions: readonly SelectOption[];
  selectedTopicOptions: readonly SelectOption[];
  handleChapterChange: (options: readonly SelectOption[]) => void;
  handleTopicChange: (options: readonly SelectOption[]) => void;
  loadingTopics: boolean;
  loadingChapters: boolean;
  showTopicWarning: boolean;
  t: TFunction;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  chapters,
  selectedChapterOptions,
  selectedTopicOptions,
  handleChapterChange,
  handleTopicChange,
  loadingTopics,
  loadingChapters,
  showTopicWarning,
  t,
}) => {
  const chapterOptions: SelectOption[] = React.useMemo(() => chapters.map(chapter => ({
    value: chapter.cNum,
    label: `${chapter.cNum}. ${chapter.chTitleE} (${chapter.chTitleC})`
  })), [chapters]);

  const filteredTopicOptions: SelectOption[] = React.useMemo(() => {
    const selectedChapterNumbers = selectedChapterOptions.map(option => option.value);
    const chapterFilteredTopics = topics.filter(topic =>
      selectedChapterNumbers.length === 0 || selectedChapterNumbers.includes(topic.aristo)
    );
    return chapterFilteredTopics.map(topic => ({
      value: topic.tId,
      label: `${topic.tTitleC} (${topic.tTitleE})`
    }));
  }, [topics, selectedChapterOptions]);

  const isLoading = loadingTopics || loadingChapters;

  return (
    <fieldset className="fieldset bg-base-200 border-primary rounded-box border p-4 text-base-content">
      <legend className="fieldset-legend">{t('pages.exerciseGenerator.form.topicsLabel', 'Select Topics')}</legend>
      {/* Chapter Selector */}
      <label htmlFor="chapters" className="label">{t('pages.exerciseGenerator.form.chaptersLabel', 'Chapters (Aristo)')}</label>
      <Select<SelectOption, true>
        id="chapters"
        instanceId="chapters-select"
        isMulti
        options={chapterOptions}
        value={selectedChapterOptions}
        onChange={handleChapterChange}
        isLoading={loadingChapters}
        className="mt-1 text-lg"
        classNamePrefix="react-select"
        placeholder={t('pages.exerciseGenerator.form.selectChapters', 'Select chapter(s) to filter topics')}
      />

      {/* Topic Selector */}
      <div
        className={`${showTopicWarning ? 'tooltip tooltip-warning tooltip-open' : ''}`}
        data-tip={showTopicWarning ? t('pages.exerciseGenerator.warnings.noTopicSelected') : ''}
      >
        <div className={`${showTopicWarning ? 'border-2 border-warning rounded-md p-1' : ''}`}>
          <label htmlFor="topics" className="label">{t('pages.exerciseGenerator.form.topicsLabel')}</label>
          <Select<SelectOption, true>
            id="topics"
            instanceId="topics-select"
            isMulti
            options={filteredTopicOptions}
            value={selectedTopicOptions}
            onChange={handleTopicChange}
            isLoading={isLoading}
            placeholder={
              selectedChapterOptions.length > 0 && filteredTopicOptions.length === 0 && !isLoading
                ? t('pages.exerciseGenerator.warnings.noTopicsForChapters')
                : t('pages.exerciseGenerator.form.selectTopics', 'Select topic(s)')
            }
            className="mt-1 text-lg"
            classNamePrefix="react-select"
            isDisabled={filteredTopicOptions.length === 0 && selectedChapterOptions.length > 0 && !isLoading}
          />
        </div>
      </div>
    </fieldset>
  );
};

export default TopicSelector;
