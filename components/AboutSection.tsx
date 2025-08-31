
import React, { useState } from 'react';
import type { BioData, Skill, SocialLink, LocalizedString } from '../types';
import { generateBio } from '../services/geminiService';
import SkillChart from './SkillChart';
import { SparklesIcon, PencilIcon, XIcon, CheckIcon, DragHandleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface AboutSectionProps {
  bioData: BioData;
  setBioData: React.Dispatch<React.SetStateAction<BioData>>;
}

const LanguageTabs: React.FC<{ activeLang: string, setActiveLang: (lang: string) => void }> = ({ activeLang, setActiveLang }) => (
  <div className="flex items-center bg-gray-200 dark:bg-dark-highlight rounded-lg p-1 mb-4 self-start">
    <button onClick={() => setActiveLang('en')} className={`px-3 py-1 text-sm font-bold rounded ${activeLang === 'en' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>EN</button>
    <button onClick={() => setActiveLang('id')} className={`px-3 py-1 text-sm font-bold rounded ${activeLang === 'id' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>ID</button>
  </div>
);

const AboutSection: React.FC<AboutSectionProps> = ({ bioData, setBioData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableBio, setEditableBio] = useState(bioData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedSkillIndex, setDraggedSkillIndex] = useState<number | null>(null);
  const { language: currentLanguage, t } = useLanguage();
  const [activeEditLang, setActiveEditLang] = useState('en');


  const handleLocalizedInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableBio(prev => ({
      ...prev,
      [name]: {
        ...(prev[name as keyof BioData] as LocalizedString),
        [activeEditLang]: value
      }
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableBio(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setBioData(editableBio);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditableBio(bioData);
    setIsEditing(false);
  };
  
  const handleGenerateBio = async () => {
    setIsGenerating(true);
    const currentSummary = editableBio.summary[activeEditLang as keyof LocalizedString];
    const newSummary = await generateBio(currentSummary);
    if (!newSummary.startsWith("Error:")) {
        setEditableBio(prev => ({
          ...prev,
          summary: {
            ...prev.summary,
            [activeEditLang]: newSummary
          }
        }));
    }
    setIsGenerating(false);
  };

  const handleSkillChange = (index: number, field: keyof Skill, value: string | number) => {
    const newSkills = [...editableBio.skills];
    // @ts-ignore
    newSkills[index][field] = value;
    setEditableBio(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkill = () => {
    setEditableBio(prev => ({ ...prev, skills: [...prev.skills, { name: 'New Skill', level: 50 }] }));
  }

  const removeSkill = (index: number) => {
    const newSkills = editableBio.skills.filter((_, i) => i !== index);
    setEditableBio(prev => ({ ...prev, skills: newSkills }));
  }

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedSkillIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedSkillIndex === null || draggedSkillIndex === targetIndex) return;

    const newSkills = [...editableBio.skills];
    const draggedItem = newSkills[draggedSkillIndex];
    
    // Remove the item from its original position
    newSkills.splice(draggedSkillIndex, 1);
    // Insert it at the new position
    newSkills.splice(targetIndex, 0, draggedItem);
    
    setEditableBio(prev => ({ ...prev, skills: newSkills }));
    setDraggedSkillIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedSkillIndex(null);
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...(editableBio.socialLinks || [])];
    newLinks[index][field] = value;
    setEditableBio(prev => ({...prev, socialLinks: newLinks}));
  };

  const addSocialLink = () => {
    const newLinks = [...(editableBio.socialLinks || []), { platform: '', url: '' }];
    setEditableBio(prev => ({...prev, socialLinks: newLinks}));
  };

  const removeSocialLink = (index: number) => {
    const newLinks = (editableBio.socialLinks || []).filter((_, i) => i !== index);
    setEditableBio(prev => ({...prev, socialLinks: newLinks}));
  };

  const getLocalizedValue = (field: LocalizedString) => {
    return field[currentLanguage as keyof LocalizedString] || field.en;
  }

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-6 shadow-lg flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
        <img src={editableBio.imageUrl} alt="Profile" className="w-32 h-32 rounded-full border-4 border-blue-500 dark:border-dark-accent" />
        <div className="flex-1 text-center md:text-left">
          {isEditing ? (
            <>
              <LanguageTabs activeLang={activeEditLang} setActiveLang={setActiveEditLang} />
              <input type="text" name="name" value={editableBio.name[activeEditLang as keyof LocalizedString]} onChange={handleLocalizedInputChange} className="bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2 text-3xl font-bold w-full mb-2" />
              <input type="text" name="title" value={editableBio.title[activeEditLang as keyof LocalizedString]} onChange={handleLocalizedInputChange} className="bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2 text-lg text-blue-600 dark:text-dark-accent w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <input type="email" name="email" value={editableBio.email} onChange={handleInputChange} placeholder={t('email')} className="bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-2 py-1 w-full" />
                  <input type="text" name="location" value={editableBio.location} onChange={handleInputChange} placeholder={t('locationPlaceholder')} className="bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-2 py-1 w-full" />
                  <input type="tel" name="phone" value={editableBio.phone} onChange={handleInputChange} placeholder={t('phonePlaceholder')} className="bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-2 py-1 w-full" />
                  <input type="text" name="whatsapp" value={editableBio.whatsapp || ''} onChange={handleInputChange} placeholder={t('whatsappNumberPlaceholder')} className="bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-2 py-1 w-full" />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold">{getLocalizedValue(bioData.name)}</h2>
              <p className="text-lg text-blue-600 dark:text-dark-accent">{getLocalizedValue(bioData.title)}</p>
              <div className="flex justify-center md:justify-start flex-wrap gap-x-4 gap-y-2 mt-4 text-gray-500 dark:text-dark-text-secondary text-sm">
                <span>{bioData.email}</span>
                <span className="hidden md:inline">|</span>
                <span>{bioData.location}</span>
                 <span className="hidden md:inline">|</span>
                <span>{bioData.phone}</span>
                {bioData.whatsapp && (
                    <>
                        <span className="hidden md:inline">|</span>
                        <span>WhatsApp: {bioData.whatsapp}</span>
                    </>
                )}
              </div>
            </>
          )}
        </div>
        <div>
          {isEditing ? (
            <div className="flex space-x-2">
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"><CheckIcon /><span>{t('save')}</span></button>
                <button onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"><XIcon /><span>{t('cancel')}</span></button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"><PencilIcon /> <span>{t('editProfile')}</span></button>
          )}
        </div>
      </div>
      
      {/* Summary Section */}
      <div className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">{t('aboutMe')}</h3>
        {isEditing ? (
            <>
                <LanguageTabs activeLang={activeEditLang} setActiveLang={setActiveEditLang} />
                <textarea name="summary" value={editableBio.summary[activeEditLang as keyof LocalizedString]} onChange={handleLocalizedInputChange} rows={6} className="bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md p-3 w-full text-gray-800 dark:text-dark-text-primary leading-relaxed"></textarea>
                <button onClick={handleGenerateBio} disabled={isGenerating} className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50">
                    <SparklesIcon /> 
                    <span>{isGenerating ? t('generating') : t('refineWithAI')}</span>
                </button>
            </>
        ) : (
            <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">{getLocalizedValue(bioData.summary)}</p>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">{t('skills')}</h3>
        {isEditing ? (
          <div className="space-y-3">
            {editableBio.skills.map((skill, index) => (
                <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-dark-highlight border border-gray-200 dark:border-dark-border-color transition-all duration-300 ease-in-out
                    ${draggedSkillIndex === index
                        ? 'opacity-50 scale-105 shadow-2xl bg-white dark:bg-dark-secondary ring-2 ring-blue-500 dark:ring-dark-accent'
                        : 'hover:shadow-md hover:border-gray-300 dark:hover:border-dark-border-color'
                    }`}
                >
                    <div className="cursor-grab text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-primary p-2" title={t('dragToReorder')}>
                      <DragHandleIcon />
                    </div>

                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                      className="flex-shrink-0 bg-white dark:bg-dark-secondary border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2 w-44 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:outline-none transition-colors"
                      placeholder={t('skillName')}
                    />

                    <div className="flex-grow flex items-center gap-3 px-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={skill.level}
                          onChange={(e) => handleSkillChange(index, 'level', parseInt(e.target.value, 10))}
                          className="w-full h-2 bg-gray-200 dark:bg-dark-border-color rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-dark-accent"
                        />
                        <div className="text-sm font-mono text-blue-600 dark:text-dark-accent bg-white dark:bg-dark-secondary px-2 py-1 rounded-md w-16 text-center border border-gray-300 dark:border-dark-border-color">
                          {skill.level}%
                        </div>
                    </div>

                    <button
                      onClick={() => removeSkill(index)}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                      aria-label={t('removeSkillAria', { skillName: skill.name })}
                    >
                      <XIcon />
                    </button>
                </div>
            ))}
            <button onClick={addSkill} className="text-blue-600 dark:text-dark-accent hover:text-blue-500 dark:hover:text-blue-400 font-semibold mt-4 px-3 py-2 rounded-lg hover:bg-blue-600/10 dark:hover:bg-dark-accent/10 transition-colors">
              {t('addSkill')}
            </button>
          </div>
        ) : (
          <SkillChart skills={bioData.skills} />
        )}
      </div>

       {/* Social Links Section */}
       {isEditing && (
        <div className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-6 shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">{t('socialLinks')}</h3>
            <div className="space-y-4">
                {(editableBio.socialLinks || []).map((link, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gray-100 dark:bg-dark-highlight">
                        <input type="text" placeholder={t('platformPlaceholder')} value={link.platform} onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)} className="bg-gray-50 dark:bg-dark-secondary border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2 w-1/3"/>
                        <input type="url" placeholder={t('urlPlaceholder')} value={link.url} onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)} className="bg-gray-50 dark:bg-dark-secondary border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2 flex-grow"/>
                        <button onClick={() => removeSocialLink(index)} className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-500/10"><XIcon /></button>
                    </div>
                ))}
                <button onClick={addSocialLink} className="text-blue-600 dark:text-dark-accent hover:text-blue-500 dark:hover:text-blue-400 font-semibold mt-4 px-3 py-2 rounded-lg hover:bg-blue-600/10 dark:hover:bg-dark-accent/10 transition-colors">
                    {t('addSocialLink')}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AboutSection;