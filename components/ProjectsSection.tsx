

import React, { useState, useEffect } from 'react';
import type { Project, LocalizedString } from '../types';
import Modal from './Modal';
import { generateProjectDescription, generateProjectImage } from '../services/geminiService';
import { PlusIcon, SparklesIcon, LinkIcon, SpinnerIcon, PhotographIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ProjectsSectionProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const createEmptyLocalizedString = (): LocalizedString => ({ en: '', id: '' });

const LanguageTabs: React.FC<{ activeLang: string, setActiveLang: (lang: string) => void }> = ({ activeLang, setActiveLang }) => (
  <div className="flex items-center bg-gray-200 dark:bg-dark-highlight rounded-lg p-1 mb-4 self-start">
    <button onClick={() => setActiveLang('en')} className={`px-3 py-1 text-sm font-bold rounded ${activeLang === 'en' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>EN</button>
    <button onClick={() => setActiveLang('id')} className={`px-3 py-1 text-sm font-bold rounded ${activeLang === 'id' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>ID</button>
  </div>
);

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, setProjects }) => {
  const { language: currentLanguage, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> & { id?: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [isFetchingFavicon, setIsFetchingFavicon] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');
  const [activeEditLang, setActiveEditLang] = useState('en');

  // State for AI image generation
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);


  const handleFetchFavicon = (url: string) => {
    if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
      setFaviconUrl(null);
      return;
    }

    setIsFetchingFavicon(true);
    try {
      const domain = new URL(url).hostname;
      setFaviconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=32`);
    } catch (e) {
      setFaviconUrl(null);
    } finally {
      setTimeout(() => setIsFetchingFavicon(false), 500);
    }
  };

  useEffect(() => {
    if (isModalOpen && currentProject.link) {
      handleFetchFavicon(currentProject.link);
    }
    if (!isModalOpen) {
      setFaviconUrl(null);
      setIsFetchingFavicon(false);
    }
  }, [isModalOpen, currentProject.id]);
  
  // Auto-save effect
  useEffect(() => {
    if (!isModalOpen) {
      setDraftStatus('');
      return;
    }
    
    const draftKey = currentProject.id ? `project-draft-${currentProject.id}` : 'project-draft-new';

    const intervalId = setInterval(() => {
      if (currentProject.name?.en || currentProject.name?.id || currentProject.description?.en || currentProject.description?.id || (currentProject.technologies && currentProject.technologies.length > 0)) {
        localStorage.setItem(draftKey, JSON.stringify(currentProject));
        setDraftStatus(t('draftSavedAt', { time: new Date().toLocaleTimeString() }));
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isModalOpen, currentProject, t]);

  const getLocalizedValue = (field?: LocalizedString) => {
    if (!field) return '';
    return field[currentLanguage as keyof LocalizedString] || field.en;
  };
  
  const resetModalState = () => {
    setFaviconUrl(null);
    setIsFetchingFavicon(false);
    setAiImagePrompt('');
    setIsGeneratingImages(false);
    setGeneratedImages([]);
    setGenerationError(null);
    setDraftStatus('');
    setActiveEditLang('en');
  };

  const openModalForNew = () => {
    const draftKey = 'project-draft-new';
    const savedDraft = localStorage.getItem(draftKey);
    let projectData: Partial<Project> = { name: createEmptyLocalizedString(), description: createEmptyLocalizedString(), technologies: [], link: '', imageUrl: '', altText: createEmptyLocalizedString() };
    if (savedDraft) {
      if (window.confirm(t('unsavedProjectDraftFound'))) {
        projectData = JSON.parse(savedDraft);
      }
    }
    resetModalState();
    setCurrentProject(projectData);
    setIsModalOpen(true);
  };

  const openModalForEdit = (project: Project) => {
    const draftKey = `project-draft-${project.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    let projectData: Project | Partial<Project> = project;
    if (savedDraft) {
      if (window.confirm(t('unsavedDraftFoundFor', { title: getLocalizedValue(project.name) }))) {
        projectData = JSON.parse(savedDraft);
      }
    }
    resetModalState();
    setCurrentProject(projectData);
    setIsModalOpen(true);
  };

  const handleLocalizedInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject(prev => ({ 
        ...prev, 
        [name]: {
            ...(prev[name as keyof Project] as LocalizedString),
            [activeEditLang]: value
        }
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const techs = e.target.value.split(',').map(t => t.trim()).filter(t => t);
    setCurrentProject(prev => ({...prev, technologies: techs}));
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProject(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (currentProject.id) {
      setProjects(projects.map(p => p.id === currentProject.id ? currentProject as Project : p));
    } else {
      const newProject: Project = {
        ...currentProject,
        id: new Date().toISOString(),
        imageUrl: currentProject.imageUrl || `https://picsum.photos/seed/${Date.now()}/400/300`,
        altText: currentProject.altText?.en || currentProject.name?.en ? currentProject.altText : createEmptyLocalizedString(),
        name: currentProject.name || createEmptyLocalizedString(),
        description: currentProject.description || createEmptyLocalizedString(),
      } as Project;
      setProjects([newProject, ...projects]);
    }

    const draftKey = currentProject.id ? `project-draft-${currentProject.id}` : 'project-draft-new';
    localStorage.removeItem(draftKey);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDeleteProject'))) {
        setProjects(projects.filter(p => p.id !== id));
        const draftKey = `project-draft-${id}`;
        localStorage.removeItem(draftKey);
    }
  };

  const handleGenerateDesc = async () => {
      const currentName = currentProject.name?.[activeEditLang as keyof LocalizedString];
      if(!currentName || !currentProject.technologies?.length) {
          alert(t('enterProjectNameAndTechFirst'));
          return;
      }
      setIsGenerating(true);
      const desc = await generateProjectDescription(currentName, currentProject.technologies.join(', '));
      if(!desc.startsWith("Error:")) {
          setCurrentProject(prev => ({
              ...prev,
              description: {
                  ...(prev.description as LocalizedString),
                  [activeEditLang]: desc
              }
          }));
      }
      setIsGenerating(false);
  }
  
  const handleGenerateImages = async () => {
    if (!aiImagePrompt.trim()) {
      setGenerationError('Please enter a prompt to generate images.');
      return;
    }
    setIsGeneratingImages(true);
    setGeneratedImages([]);
    setGenerationError(null);

    const images = await generateProjectImage(aiImagePrompt);

    if (images.length > 0) {
      setGeneratedImages(images);
    } else {
      setGenerationError(t('imageGenerationError'));
    }
    setIsGeneratingImages(false);
  };

  const selectGeneratedImage = (base64Image: string) => {
    const newAltText: LocalizedString = {
        en: currentProject.altText?.en || aiImagePrompt,
        id: currentProject.altText?.id || aiImagePrompt,
    };
    setCurrentProject(prev => ({
        ...prev,
        imageUrl: `data:image/png;base64,${base64Image}`,
        altText: newAltText
    }));
    setGeneratedImages([]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t('projects')}</h2>
        <button onClick={openModalForNew} className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
            <PlusIcon />
            <span>{t('newProject')}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg overflow-hidden shadow-lg group">
            <img src={project.imageUrl} alt={getLocalizedValue(project.altText)} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-dark-accent mb-2">{getLocalizedValue(project.name)}</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4 h-24 overflow-y-auto">{getLocalizedValue(project.description)}</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {project.technologies.map(tech => (
                  <span key={tech} className="bg-gray-200 dark:bg-dark-highlight text-blue-700 dark:text-dark-accent text-xs font-semibold px-2.5 py-1 rounded-full">{tech}</span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-dark-accent hover:underline">{t('viewProject')}</a>
                  <div className="flex space-x-2">
                      <button onClick={() => openModalForEdit(project)} className="text-yellow-500 hover:text-yellow-400 dark:text-yellow-400 dark:hover:text-yellow-300">{t('edit')}</button>
                      <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400">{t('delete')}</button>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-4">{currentProject.id ? t('editProjectTitle') : t('newProjectTitle')}</h2>
          <LanguageTabs activeLang={activeEditLang} setActiveLang={setActiveEditLang} />
          <div className="space-y-4">
            <input type="text" name="name" placeholder={t('projectNamePlaceholder')} value={currentProject.name?.[activeEditLang as keyof LocalizedString] || ''} onChange={handleLocalizedInputChange} className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2" />
            <input type="text" name="technologies" placeholder={t('technologiesPlaceholder')} value={currentProject.technologies?.join(', ') || ''} onChange={handleTechChange} className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2" />
            <div className="relative">
              <textarea name="description" placeholder={t('descriptionPlaceholder')} value={currentProject.description?.[activeEditLang as keyof LocalizedString] || ''} onChange={handleLocalizedInputChange} rows={5} className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2" />
              <button onClick={handleGenerateDesc} disabled={isGenerating} className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded-lg flex items-center space-x-2 text-sm transition-colors disabled:opacity-50">
                  <SparklesIcon />
                  <span>{isGenerating ? t('generating') : t('generateWithAI')}</span>
              </button>
            </div>
            
            <div className="relative text-gray-500 dark:text-dark-text-secondary">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isFetchingFavicon ? (
                  <SpinnerIcon />
                ) : faviconUrl ? (
                  <img src={faviconUrl} alt="Favicon" className="w-5 h-5 rounded-sm" />
                ) : (
                  <LinkIcon />
                )}
              </div>
              <input 
                type="text" 
                name="link" 
                placeholder={t('projectLinkPlaceholder')} 
                value={currentProject.link || ''} 
                onChange={handleInputChange} 
                onBlur={(e) => handleFetchFavicon(e.target.value)}
                className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2 pl-10"
              />
            </div>
            
            <div className="pt-2">
                <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-2">{t('projectImage')}</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                        <input 
                          type="text" 
                          name="imageUrl" 
                          placeholder={t('pasteImageUrlPlaceholder')} 
                          value={currentProject.imageUrl || ''} 
                          onChange={handleInputChange} 
                          className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2" 
                        />
                         <input 
                          type="text" 
                          name="altText" 
                          placeholder={t('altTextPlaceholder')}
                          value={currentProject.altText?.[activeEditLang as keyof LocalizedString] || ''} 
                          onChange={handleLocalizedInputChange} 
                          className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2" 
                        />
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300 dark:border-dark-border-color" /></div>
                          <div className="relative flex justify-center"><span className="bg-white dark:bg-dark-secondary px-2 text-sm text-gray-500 dark:text-dark-text-secondary">{t('orDivider')}</span></div>
                        </div>
                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full text-sm text-gray-500 dark:text-dark-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 dark:file:bg-dark-accent file:text-white hover:file:bg-blue-700 dark:hover:file:bg-blue-500 file:transition-colors file:cursor-pointer"
                        />
                    </div>

                    <div className="sm:w-1/3 aspect-video bg-gray-100 dark:bg-dark-highlight border-2 border-dashed border-gray-300 dark:border-dark-border-color rounded-lg flex items-center justify-center overflow-hidden">
                        {currentProject.imageUrl ? (
                            <img src={currentProject.imageUrl} alt={getLocalizedValue(currentProject.altText)} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-gray-500 dark:text-dark-text-secondary p-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="mt-2 block text-xs">{t('imagePreview')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-dark-border-color">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-2">
                    <PhotographIcon />
                    <span>{t('generateImageWithAI')}</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder={t('imagePromptPlaceholder')}
                        value={aiImagePrompt}
                        onChange={(e) => setAiImagePrompt(e.target.value)}
                        disabled={isGeneratingImages}
                        className="flex-grow bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2"
                    />
                    <button
                        onClick={handleGenerateImages}
                        disabled={isGeneratingImages}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isGeneratingImages ? <SpinnerIcon /> : <SparklesIcon />}
                        <span>{isGeneratingImages ? t('generating') : t('generate')}</span>
                    </button>
                </div>

                {isGeneratingImages && (
                    <div className="mt-4 text-center text-sm text-gray-500 dark:text-dark-text-secondary">
                        <p>{t('aiCreatingImages')}</p>
                    </div>
                )}
                {generationError && (
                    <div className="mt-4 text-center text-sm text-red-500">
                        <p>{generationError}</p>
                    </div>
                )}
                {generatedImages.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm text-center text-gray-600 dark:text-dark-text-secondary mb-2">{t('selectGeneratedImage')}</p>
                        <div className="grid grid-cols-2 gap-4">
                            {generatedImages.map((img, index) => (
                                <div
                                    key={index}
                                    onClick={() => selectGeneratedImage(img)}
                                    className="cursor-pointer aspect-video bg-gray-100 dark:bg-dark-highlight rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-600 dark:hover:border-dark-accent transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-dark-accent"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Select generated image ${index + 1}`}
                                >
                                    <img src={`data:image/png;base64,${img}`} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover"/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
          <div className="flex justify-end items-center space-x-4 mt-6">
            <span className="text-sm text-gray-500 dark:text-dark-text-secondary mr-auto">{draftStatus}</span>
            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 dark:bg-dark-highlight hover:bg-gray-300 dark:hover:bg-dark-border-color text-gray-800 dark:text-dark-text-primary font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
            <button onClick={handleSave} className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">{t('save')}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsSection;