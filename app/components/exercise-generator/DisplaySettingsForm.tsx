import React from 'react';
import type { TFunction } from 'i18next';
import { FaCheck, FaHashtag, FaPercent } from "react-icons/fa";

interface DisplaySettingsFormProps {
  showMetadata: boolean;
  showPercent: boolean;
  showAnswer: boolean;
  toggleMetadata: () => void;
  togglePercent: () => void;
  toggleAnswer: () => void;
  sortBy: 'year-qnum' | 'hkPercent';
  handleSortChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  t: TFunction;
}

const DisplaySettingsForm: React.FC<DisplaySettingsFormProps> = ({
  showMetadata,
  showPercent,
  showAnswer,
  toggleMetadata,
  togglePercent,
  toggleAnswer,
  sortBy,
  handleSortChange,
  t,
}) => {
  return (
    <fieldset className="fieldset bg-base-200 border-primary rounded-box border p-4 text-base-content">
      <legend className="fieldset-legend">{t('pages.exerciseGenerator.form.settingsLabel', 'Display Settings')}</legend>
      <label className="label cursor-pointer text-sm">
        <input type="checkbox" className="toggle toggle-primary" checked={showMetadata} onChange={toggleMetadata} />
        <FaHashtag />
        <span className="label-text">{t('navbar.settings.showMetadata')}</span>
      </label>
      <label className={`label cursor-pointer text-sm ${!showMetadata ? 'opacity-50' : ''}`}>
        <input type="checkbox" className="toggle toggle-primary" checked={showPercent} onChange={togglePercent} disabled={!showMetadata} />
        <FaPercent />
        <span className="label-text">{t('navbar.settings.showPercent')}</span>
      </label>
      <label className={`label cursor-pointer text-sm ${!showMetadata ? 'opacity-50' : ''}`}>
        <input type="checkbox" className="toggle toggle-primary" checked={showAnswer} onChange={toggleAnswer} disabled={!showMetadata} />
        <FaCheck />
        <span className="label-text">{t('navbar.settings.showAnswer')}</span>
      </label>
      <div className="divider divider-primary"></div>
      {/* Sort Selector */}
      <label htmlFor="sort-select" className="label">{t('pages.exerciseGenerator.form.sortByLabel', 'Sort By')}</label>
      <select id="sort-select" className="select select-primary" value={sortBy} onChange={handleSortChange}>
        <option value="year-qnum">{t('pages.exerciseGenerator.form.sortByYearQnum')}</option>
        <option value="hkPercent">{t('pages.exerciseGenerator.form.sortByHkPercent')}</option>
      </select>
    </fieldset>
  );
};

export default DisplaySettingsForm;
