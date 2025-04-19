import type { Route } from "./+types/home";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { Link } from "react-router"; // Import Link
import { FaCalendarAlt, FaTags, FaWrench } from "react-icons/fa"; // Import icons

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Mathematics MCQ - Home" },
    { name: "description", content: "Practice mathematics with multiple choice questions" },
  ];
}

export default function Home() {
  const { t } = useTranslation(); // Initialize the hook

  return (
    <div>
      {/* Clickable cards remain */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/by-year" className="card bg-primary text-primary-content shadow-xl hover:bg-primary-focus transition-colors">
          <div className="card-body items-center text-center">
            <FaCalendarAlt className="text-4xl mb-2" /> {/* Icon added */}
            <h2 className="card-title text-2xl">{t('navbar.byYear')}</h2>
            {/* Optional: Add an icon or description */}
          </div>
        </Link>
        <Link to="/by-topic" className="card bg-secondary text-secondary-content shadow-xl hover:bg-secondary-focus transition-colors">
          <div className="card-body items-center text-center">
            <FaTags className="text-4xl mb-2" /> {/* Icon added */}
            <h2 className="card-title text-2xl">{t('navbar.byTopic')}</h2>
            {/* Optional: Add an icon or description */}
          </div>
        </Link>
        <Link to="/exercise-generator" className="card bg-accent text-accent-content shadow-xl hover:bg-accent-focus transition-colors">
          <div className="card-body items-center text-center">
            <FaWrench className="text-4xl mb-2" /> {/* Icon added */}
            <h2 className="card-title text-2xl">{t('navbar.exerciseGenerator')}</h2>
            {/* Optional: Add an icon or description */}
          </div>
        </Link>
      </div>
    </div>
  );
}
