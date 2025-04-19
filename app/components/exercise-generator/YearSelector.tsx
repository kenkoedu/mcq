import React from 'react';
import Select from 'react-select';
import type { TFunction } from 'i18next';

type SelectOption = { value: number; label: string };

interface YearSelectorProps {
  yearOptions: SelectOption[];
  selectedYearOptions: readonly SelectOption[];
  handleYearChange: (options: readonly SelectOption[]) => void;
  t: TFunction;
}

const YearSelector: React.FC<YearSelectorProps> = ({
  yearOptions,
  selectedYearOptions,
  handleYearChange,
  t,
}) => {
  return (
    <fieldset className="fieldset bg-base-200 border-primary rounded-box border p-4 text-base-content">
      <legend className="fieldset-legend">{t('pages.exerciseGenerator.form.yearsLabel', 'Years')}</legend>
      <Select<SelectOption, true>
        id="years"
        instanceId="years-select"
        isMulti
        options={yearOptions}
        value={selectedYearOptions}
        onChange={handleYearChange}
        className="mt-1"
        classNamePrefix="react-select"
        placeholder={t('pages.exerciseGenerator.form.selectYears', 'Select year(s)')}
      />
    </fieldset>
  );
};

export default YearSelector;
