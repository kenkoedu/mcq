import React from 'react';
import type { TFunction } from 'i18next';

interface PreviewHeaderProps {
  t: TFunction;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({ t }) => {
  return (
    <div className="max-w-none grid grid-cols-8 mb-4">
      <div className="col-span-3 flex flex-row items-end">
        <div className="me-2">{t('common.name')}:</div>
        <div className="border-b border-black grow me-2"></div>
      </div>
      <div className="col-span-3 flex flex-row items-end">
        <div className="me-2">{t('common.class')}({t('common.classNo')}):</div>
        <div className="border-b border-black grow me-2"></div>
      </div>
      <div className="col-span-2 flex flex-row items-end">
        <div className="me-2">{t('common.date')}:</div>
        <div className="border-b border-black grow me-2"></div>
      </div>
    </div>
  );
};

export default PreviewHeader;
