

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { BioData, BlogPost, Project, PortfolioTheme, ThemeSettings, Service, PortfolioBackup } from '../types';
import ScoreGauge from './ScoreGauge';
import { CheckIcon, XIcon, DownloadIcon, UploadIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardSectionProps {
  bioData: BioData;
  blogPosts: BlogPost[];
  projects: Project[];
  services: Service[];
  themes: PortfolioTheme[];
  themeSettings: ThemeSettings;
  setBioData: React.Dispatch<React.SetStateAction<BioData>>;
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  setThemeSettings: React.Dispatch<React.SetStateAction<ThemeSettings>>;
}

interface CheckResult {
  text: string;
  passed: boolean;
  weight: number;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  bioData, blogPosts, projects, services, themes, themeSettings, setThemeSettings,
  setBioData, setBlogPosts, setProjects, setServices
}) => {
  const { t } = useLanguage();
  const [seoScore, setSeoScore] = useState(0);
  const [speedScore, setSpeedScore] = useState(0);
  const [seoChecks, setSeoChecks] = useState<CheckResult[]>([]);
  const [speedChecks, setSpeedChecks] = useState<CheckResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);


  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    
    // SEO Analysis
    const seoAnalysis: CheckResult[] = [];
    const checkTitle = bioData.name.en.length > 5 && bioData.title.en.length > 5;
    seoAnalysis.push({ text: t('meaningfulPortfolioTitle'), passed: checkTitle, weight: 20 });
    
    const checkMetaDescription = bioData.summary.en.length > 50 && bioData.summary.en.length < 160;
    seoAnalysis.push({ text: t('metaDescriptionGoodLength', { length: bioData.summary.en.length }), passed: checkMetaDescription, weight: 20 });

    const altTexts = projects.map(p => !!p.altText.en);
    const missingAltTexts = altTexts.filter(alt => !alt).length;
    seoAnalysis.push({ text: t('projectImagesHaveAltText', { count: projects.length - missingAltTexts, total: projects.length }), passed: missingAltTexts === 0, weight: 15 });

    const hasSocialLinks = bioData.socialLinks && bioData.socialLinks.length > 0;
    seoAnalysis.push({ text: t('socialLinksAdded'), passed: hasSocialLinks, weight: 10 });

    const blogSeoCount = blogPosts.filter(p => p.seoTitle?.en && p.seoDescription?.en).length;
    seoAnalysis.push({ text: t('blogPostsHaveSeoTags', { count: blogSeoCount, total: blogPosts.length }), passed: blogSeoCount / (blogPosts.length || 1) > 0.5, weight: 20 });

    const hasServices = services.length > 0;
    seoAnalysis.push({ text: t('servicesSectionFilled'), passed: hasServices, weight: 15 });

    const calculatedSeoScore = seoAnalysis.reduce((total, check) => total + (check.passed ? check.weight : 0), 0);
    setSeoChecks(seoAnalysis);
    setSeoScore(calculatedSeoScore);


    // Speed/Performance Analysis
    const speedAnalysis: CheckResult[] = [];
    const dataImages = projects.filter(p => p.imageUrl.startsWith('data:image')).length + (bioData.imageUrl.startsWith('data:image') ? 1 : 0);
    speedAnalysis.push({ text: t('avoidLargeDataImages'), passed: dataImages === 0, weight: 30 });

    const totalContent = projects.length + blogPosts.length + services.length;
    speedAnalysis.push({ text: t('reasonableContentAmount', { total: totalContent }), passed: totalContent < 25, weight: 20 });
    
    speedAnalysis.push({ text: t('altTextPreventsCLS'), passed: missingAltTexts / (projects.length || 1) < 0.5, weight: 30 });

    const hasFavicon = !!document.querySelector("link[rel='icon']");
    speedAnalysis.push({ text: t('siteHasFavicon'), passed: hasFavicon, weight: 20 });
    
    const calculatedSpeedScore = speedAnalysis.reduce((total, check) => total + (check.passed ? check.weight : 0), 0);
    setSpeedChecks(speedAnalysis);
    setSpeedScore(calculatedSpeedScore);

    setTimeout(() => setIsAnalyzing(false), 500);
  }, [bioData, blogPosts, projects, services, t]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  const handleExport = () => {
    const backupData: Omit<PortfolioBackup, 'experience' | 'sectionSettings'> = {
      bioData,
      blogPosts,
      projects,
      services,
      themeSettings,
    };
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `portfolio-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File format is incorrect.");
        }
        const importedData: PortfolioBackup = JSON.parse(text);

        if (!importedData.bioData || !importedData.blogPosts || !importedData.projects) {
          throw new Error("Invalid backup file structure.");
        }

        if (window.confirm(t('importConfirm'))) {
          setBioData(importedData.bioData);
          setBlogPosts(importedData.blogPosts);
          setProjects(importedData.projects);
          setServices(importedData.services || []);
          setThemeSettings(importedData.themeSettings);
          alert(t('importSuccess'));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Failed to import data:", error);
        alert(t('importError', { error: errorMessage }));
      } finally {
        if (importFileRef.current) {
          importFileRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };


  const ChecklistItem: React.FC<{ result: CheckResult }> = ({ result }) => (
    <li className={`flex items-start gap-3 transition-opacity duration-300 ${isAnalyzing ? 'opacity-50' : 'opacity-100'}`}>
        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}>
            {result.passed ? <CheckIcon /> : <XIcon />}
        </div>
        <span className="text-sm text-text-secondary dark:text-dark-text-secondary">{result.text}</span>
    </li>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">{t('dashboardTitle')}</h2>
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? t('analyzing') : t('reanalyze')}
        </button>
      </div>

       {/* Backup & Restore */}
      <div className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-2">{t('backupRestore')}</h3>
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-6">{t('backupRestoreDescription')}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleExport}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <DownloadIcon/>
            <span>{t('exportData')}</span>
          </button>
          <input type="file" accept=".json" ref={importFileRef} onChange={handleImport} className="hidden" />
          <button 
            onClick={() => importFileRef.current?.click()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <UploadIcon/>
            <span>{t('importData')}</span>
          </button>
        </div>
      </div>

      {/* Theme Settings Section */}
      <div className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-2">{t('themesAppearance')}</h3>
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-6">{t('themesAppearanceDescription')}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {themes.map(theme => (
            <div 
              key={theme.id}
              onClick={() => setThemeSettings(prev => ({ ...prev, selectedThemeId: theme.id }))}
              className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${themeSettings.selectedThemeId === theme.id ? 'border-blue-600 dark:border-dark-accent scale-105 shadow-xl' : 'border-gray-300 dark:border-dark-border-color hover:border-blue-400 dark:hover:border-dark-accent'}`}
            >
              <div className="flex space-x-1 h-10 mb-2 rounded">
                <div style={{ backgroundColor: theme.colors.primary }} className="w-1/4"></div>
                <div style={{ backgroundColor: theme.colors.secondary }} className="w-1/4"></div>
                <div style={{ backgroundColor: theme.colors.accent }} className="w-1/4"></div>
                <div style={{ backgroundColor: theme.colors.text }} className="w-1/4"></div>
              </div>
              <p className="text-sm font-semibold text-center text-text-primary dark:text-dark-text-primary">{theme.name}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between bg-gray-100 dark:bg-dark-highlight p-4 rounded-lg">
          <div>
            <h4 className="font-semibold text-text-primary dark:text-dark-text-primary">{t('autoRotateTheme')}</h4>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{t('autoRotateThemeDescription')}</p>
          </div>
          <button
            onClick={() => setThemeSettings(prev => ({ ...prev, autoRotate: !prev.autoRotate }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${themeSettings.autoRotate ? 'bg-blue-600 dark:bg-dark-accent' : 'bg-gray-300 dark:bg-dark-border-color'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${themeSettings.autoRotate ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SEO Score */}
        <div className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-6 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-center">{t('seoScore')}</h3>
          <ScoreGauge score={seoScore} />
          <div className="mt-6">
            <h4 className="font-semibold mb-3">{t('seoRecommendations')}</h4>
            <ul className="space-y-3">
              {seoChecks.map((check, i) => <ChecklistItem key={`seo-${i}`} result={check} />)}
            </ul>
          </div>
        </div>

        {/* Speed Score */}
        <div className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-6 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-center">{t('speedScore')}</h3>
          <ScoreGauge score={speedScore} />
          <div className="mt-6">
            <h4 className="font-semibold mb-3">{t('performanceRecommendations')}</h4>
            <ul className="space-y-3">
              {speedChecks.map((check, i) => <ChecklistItem key={`speed-${i}`} result={check} />)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;