import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FaCalendarAlt, FaTags, FaWrench, FaEye, FaUserShield } from 'react-icons/fa';
import { TbMath } from 'react-icons/tb';
import { useDisplaySettings } from '~/contexts/DisplaySettingsContext';

const NavbarContent = () => {
  const { t } = useTranslation();
  const { showMetadata, showPercent, showAnswer, language, toggleMetadata, togglePercent, toggleAnswer, toggleLanguage } = useDisplaySettings();

  return (
    <div className="navbar bg-sky-200 py-4">
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
          {/* Add Admin Link */}
          <li><Link to="/admin" className="flex items-center"><FaUserShield className="mr-2" />{t('navbar.admin', 'Admin')}</Link></li>

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

          {/* Language Swap */}
          <li>
            <label className="swap swap-rotate btn btn-ghost text-5xl">
              <input
                type="checkbox"
                onChange={toggleLanguage}
                checked={language === 'en'}
              />
              <div className="swap-off">🇭🇰</div>
              <div className="swap-on">🇬🇧</div>
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavbarContent;
