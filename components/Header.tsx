
import React from 'react';
import type { Section } from '../types';
import { Section as SectionEnum } from '../types';
import { UserIcon, DocumentTextIcon, CollectionIcon, SunIcon, MoonIcon, ChartPieIcon, BriefcaseIcon, MailIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  theme: string;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, theme, toggleTheme }) => {
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { name: SectionEnum.Dashboard, icon: <ChartPieIcon />, label: t('dashboard') },
    { name: SectionEnum.About, icon: <UserIcon />, label: t('about') },
    { name: SectionEnum.Services, icon: <BriefcaseIcon />, label: t('services') },
    { name: SectionEnum.Projects, icon: <CollectionIcon />, label: t('projects') },
    { name: SectionEnum.Blog, icon: <DocumentTextIcon />, label: t('blog') },
    { name: SectionEnum.Inbox, icon: <MailIcon />, label: t('inbox') },
  ];

  return (
    <header className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold text-blue-600 dark:text-dark-accent mb-4 sm:mb-0">{t('adminPanelTitle')}</h1>
      <div className="flex items-center space-x-4">
        <nav className="flex space-x-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveSection(item.name)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-dark-secondary ${
                activeSection === item.name
                  ? 'bg-blue-600 dark:bg-dark-accent text-white font-bold shadow-lg'
                  : 'bg-gray-200 dark:bg-dark-highlight text-gray-700 dark:text-dark-text-secondary font-semibold hover:bg-gray-300 dark:hover:bg-dark-border-color'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center bg-gray-200 dark:bg-dark-highlight rounded-lg p-1">
          <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>EN</button>
          <button onClick={() => setLanguage('id')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'id' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>ID</button>
        </div>
        <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-gray-500 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-highlight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
};

export default Header;
