import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError, // Import useRouteError if needed for ErrorBoundary
  Link, // Import Link
} from "react-router";
import { useTranslation } from "react-i18next"; // Import useTranslation
// Import FaHome along with other icons
// Import FaEye for the dropdown
import { FaCalendarAlt, FaTags, FaWrench, FaEye } from "react-icons/fa";
import { TbMath } from "react-icons/tb";
import { DisplaySettingsProvider, useDisplaySettings } from './contexts/DisplaySettingsContext'; // Import context

// import type { Route } from "./+types/root";
import "./app.css";
import "./i18n";

// Define a new component for the navbar content to use the context hook
const NavbarContent = () => {
  const { t } = useTranslation();
  // Get language and toggleLanguage from context
  const { showMetadata, showPercent, showAnswer, language, toggleMetadata, togglePercent, toggleAnswer, toggleLanguage } = useDisplaySettings();

  return (
    <div className="navbar bg-base-100 py-4">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl flex items-center place-content-start">
          <TbMath className="mr-2" />
          {t('navbar.title')}
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 items-center text-xl">
          <li><Link to="/by-year" className="flex items-center"><FaCalendarAlt className="mr-2" />{t('navbar.byYear')}</Link></li>
          <li><Link to="/by-topic" className="flex items-center"><FaTags className="mr-2" />{t('navbar.byTopic')}</Link></li>
          <li><Link to="/exercise-generator" className="flex items-center"><FaWrench className="mr-2" />{t('navbar.exerciseGenerator')}</Link></li>

          {/* Display Settings Dropdown */}
          <li>
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-circle">
                <FaEye className="h-5 w-5" /> {/* Eye icon for visibility settings */}
              </button>
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                <li>
                  <label className="label cursor-pointer">
                    <span className="label-text">{t('navbar.settings.showMetadata')}</span>
                    <input type="checkbox" className="toggle toggle-lg" checked={showMetadata} onChange={toggleMetadata} />
                  </label>
                </li>
                <li>
                  <label className={`label cursor-pointer ${!showMetadata ? 'opacity-50' : ''}`}>
                    <span className="label-text">{t('navbar.settings.showPercent')}</span>
                    <input type="checkbox" className="toggle toggle-lg toggle-secondary" checked={showPercent} onChange={togglePercent} disabled={!showMetadata} />
                  </label>
                </li>
                <li>
                  <label className={`label cursor-pointer ${!showMetadata ? 'opacity-50' : ''}`}>
                    <span className="label-text">{t('navbar.settings.showAnswer')}</span>
                    <input type="checkbox" className="toggle toggle-lg toggle-accent" checked={showAnswer} onChange={toggleAnswer} disabled={!showMetadata} />
                  </label>
                </li>
              </ul>
            </div>
          </li>

          {/* Language Swap - Use context values */}
          <li>
            <label className="swap swap-rotate btn btn-ghost text-5xl">
              <input
                type="checkbox"
                onChange={toggleLanguage} // Use context toggle function
                checked={language === 'en'} // Use context language state
              />
              {/* swap-off: Chinese (HK Flag) */}
              <div className="swap-off">🇭🇰</div>
              {/* swap-on: English (UK Flag) */}
              <div className="swap-on">🇬🇧</div>
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation(); // Get i18n instance

  // Removed toggleLanguage function from here

  return (
    // Use i18n.language for the lang attribute and set data-theme to "light"
    <html lang={i18n.language} dir={i18n.dir(i18n.language)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Wrap content with Provider - This one is sufficient */}
        <DisplaySettingsProvider>
          <div className="no-print">
            {/* Render NavbarContent which uses the context */}
            <NavbarContent />
          </div>
          {/* Page content rendered here */}
          {children}
          <ScrollRestoration />
          <Scripts />
        </DisplaySettingsProvider>
      </body>
    </html>
  );
}

export default function App() {
  // Remove the redundant Provider here. Outlet will render within Layout's provider.
  return (
    <Outlet />
  );
}

export function ErrorBoundary() { // Updated to use useRouteError hook
  const error = useRouteError(); // Use the hook to get the error
  const { t } = useTranslation(); // Use translation in error boundary

  let message = t('error.unexpected.title', "Oops!"); // Default translated title
  let details = t('error.unexpected.details', "An unexpected error occurred."); // Default translated details
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? t('error.404.title', "404") : t('error.generic.title', "Error");
    details =
      error.status === 404
        ? t('error.404.details', "The requested page could not be found.")
        : error.statusText || t('error.generic.details', "An error occurred.");
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Layout>
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </Layout>
  );
}
