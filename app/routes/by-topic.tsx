import { useTranslation } from "react-i18next";

export default function ByTopic() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold p-4">{t('pages.byTopic.title')}</h1>
      {/* Add content for browsing by topic here */}
    </div>
  );
}
