import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import MarkdownRenderer from '~/components/MarkdownRenderer';
import type { TFunction } from 'i18next';

interface InstructionsEditorProps {
  title: string;
  setTitle: (value: string) => void;
  instructions: string;
  setInstructions: (value: string) => void;
  instructionsFieldVisible: boolean;
  handleInstructionFieldVisible: (event: React.ChangeEvent<HTMLInputElement>) => void;
  t: TFunction;
}

const InstructionsEditor: React.FC<InstructionsEditorProps> = ({
  title,
  setTitle,
  instructions,
  setInstructions,
  instructionsFieldVisible,
  handleInstructionFieldVisible,
  t,
}) => {
  return (
    <fieldset className="fieldset bg-base-200 border-primary rounded-box border p-4 text-base-content">
      <legend className="fieldset-legend">{t('pages.exerciseGenerator.form.instructionsLabel')}</legend>
      <label className="input input-primary input-lg">
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="grow"
          placeholder={t('pages.exerciseGenerator.form.titleLabel')}
        />
      </label>

      <div tabIndex={0} className={`collapse collapse-arrow border border-primary mt-4 ` + (instructionsFieldVisible ? 'w-full' : 'w-1/2')}>
        <input type="checkbox" className="peer" checked={instructionsFieldVisible} onChange={handleInstructionFieldVisible} />
        <div className="collapse-title text-lg">{t('pages.exerciseGenerator.form.instructionsLabel', 'Edit Instructions')}</div>
        <div className="collapse-content grid grid-cols-1 md:grid-cols-2 gap-4">
          <MDEditor
            data-color-mode="light"
            value={instructions}
            onChange={(val) => setInstructions(val || '')} // Ensure val is not undefined
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg"
            preview="edit"
            height={500}
          />
          <div className="prose *:my-1 m-3">
            <MarkdownRenderer>{instructions}</MarkdownRenderer>
          </div>
        </div>
      </div>
    </fieldset>
  );
};

export default InstructionsEditor;
