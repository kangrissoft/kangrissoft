

import React, { useState } from 'react';
import type { Experience, LocalizedString } from '../types';
import Modal from './Modal';
import { PlusIcon, DragHandleIcon, BriefcaseIcon, AcademicCapIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ExperienceSectionProps {
  experience: Experience[];
  setExperience: React.Dispatch<React.SetStateAction<Experience[]>>;
}

const createEmptyLocalizedString = (): LocalizedString => ({ en: '', id: '' });

const LanguageTabs: React.FC<{ activeLang: string, setActiveLang: (lang: string) => void }> = ({ activeLang, setActiveLang }) => (
  <div className="flex items-center bg-gray-200 dark:bg-dark-highlight rounded-lg p-1 mb-4 self-start">
    <button onClick={() => setActiveLang('en')} className={`px-3 py-1 text-sm font-bold rounded ${activeLang === 'en' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>EN</button>
    <button onClick={() => setActiveLang('id')} className={`px-3 py-1 text-sm font-bold rounded ${activeLang === 'id' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>ID</button>
  </div>
);

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience, setExperience }) => {
  const { language: currentLanguage, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<Experience> | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeEditLang, setActiveEditLang] = useState('en');

  const getLocalizedValue = (field: LocalizedString) => {
    return field[currentLanguage as keyof LocalizedString] || field.en;
  };

  const openModalForNew = () => {
    setEditingEntry({ 
        type: 'work', 
        title: createEmptyLocalizedString(), 
        entity: createEmptyLocalizedString(), 
        startDate: '', 
        endDate: '', 
        description: createEmptyLocalizedString() 
    });
    setActiveEditLang('en');
    setIsModalOpen(true);
  };

  const openModalForEdit = (entry: Experience) => {
    setEditingEntry(entry);
    setActiveEditLang('en');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingEntry || !editingEntry.title?.en || !editingEntry.entity?.en || !editingEntry.startDate) {
      alert(t('fillExperienceRequiredFields'));
      return;
    }

    if (editingEntry.id) {
      setExperience(experience.map(e => e.id === editingEntry.id ? (editingEntry as Experience) : e));
    } else {
      const newEntry: Experience = {
        ...editingEntry,
        id: new Date().toISOString(),
      } as Experience;
      setExperience([...experience, newEntry]);
    }
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDeleteExperience'))) {
      setExperience(experience.filter(e => e.id !== id));
    }
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const newExperience = [...experience];
    const draggedItem = newExperience[draggedIndex];
    newExperience.splice(draggedIndex, 1);
    newExperience.splice(targetIndex, 0, draggedItem);
    setExperience(newExperience);
    setDraggedIndex(null);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const handleModalChange = (field: keyof Omit<Experience, 'title' | 'entity' | 'description'>, value: string) => {
    if (editingEntry) {
      setEditingEntry({ ...editingEntry, [field]: value });
    }
  };
  
  const handleLocalizedModalChange = (field: 'title' | 'entity' | 'description', value: string) => {
    if (editingEntry) {
        setEditingEntry({
            ...editingEntry,
            [field]: {
                ...(editingEntry[field] as LocalizedString),
                [activeEditLang]: value
            }
        });
    }
  };

  const handlePresentCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingEntry) {
        const isChecked = e.target.checked;
        setEditingEntry({ ...editingEntry, endDate: isChecked ? t('present') : '' });
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('experienceEducation')}</h2>
        <button onClick={openModalForNew} className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
          <PlusIcon />
          <span>{t('newEntry')}</span>
        </button>
      </div>

      <div className="space-y-4">
        {experience.map((entry, index) => (
          <div
            key={entry.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color transition-all duration-300 ease-in-out
              ${draggedIndex === index
                ? 'opacity-50 scale-105 shadow-2xl bg-white dark:bg-dark-secondary ring-2 ring-blue-500 dark:ring-dark-accent'
                : 'hover:shadow-md hover:border-gray-300 dark:hover:border-dark-border-color'
              }`}
          >
            <div className="cursor-grab text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-primary p-2 mt-1">
              <DragHandleIcon />
            </div>
            <div className="flex-shrink-0 text-blue-600 dark:text-dark-accent mt-1.5">
              {entry.type === 'work' ? <BriefcaseIcon /> : <AcademicCapIcon />}
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-500 dark:text-dark-text-secondary text-sm">{entry.startDate} - {entry.endDate}</p>
              <h3 className="font-bold text-lg text-gray-800 dark:text-dark-text-primary">{getLocalizedValue(entry.title)}</h3>
              <h4 className="font-semibold text-md text-blue-600 dark:text-dark-accent mb-2">{getLocalizedValue(entry.entity)}</h4>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary whitespace-pre-line">{getLocalizedValue(entry.description)}</p>
            </div>
            <div className="flex flex-col space-y-2 flex-shrink-0">
              <button onClick={() => openModalForEdit(entry)} className="text-yellow-500 hover:text-yellow-400 dark:text-yellow-400 dark:hover:text-yellow-300 font-semibold text-sm">{t('edit')}</button>
              <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 font-semibold text-sm">{t('delete')}</button>
            </div>
          </div>
        ))}
        {experience.length === 0 && (
          <div className="text-center text-gray-500 dark:text-dark-text-secondary py-10 bg-gray-50 dark:bg-dark-secondary rounded-lg border border-dashed border-gray-300 dark:border-dark-border-color">
            <p>{t('noExperienceYet')}</p>
          </div>
        )}
      </div>

      {isModalOpen && editingEntry && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-4">{editingEntry.id ? t('editEntryTitle') : t('newEntryTitle')}</h2>
          <LanguageTabs activeLang={activeEditLang} setActiveLang={setActiveEditLang} />
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-2">{t('type')}</label>
                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input type="radio" name="type" value="work" checked={editingEntry.type === 'work'} onChange={() => handleModalChange('type', 'work')} className="form-radio text-blue-600 dark:text-dark-accent bg-gray-200 dark:bg-dark-highlight"/>
                        <span className="ml-2 text-gray-800 dark:text-dark-text-primary">{t('work')}</span>
                    </label>
                    <label className="flex items-center">
                        <input type="radio" name="type" value="education" checked={editingEntry.type === 'education'} onChange={() => handleModalChange('type', 'education')} className="form-radio text-blue-600 dark:text-dark-accent bg-gray-200 dark:bg-dark-highlight"/>
                        <span className="ml-2 text-gray-800 dark:text-dark-text-primary">{t('education')}</span>
                    </label>
                </div>
            </div>
            <input type="text" placeholder={t('titleRolePlaceholder')} value={editingEntry.title?.[activeEditLang as keyof LocalizedString] || ''} onChange={(e) => handleLocalizedModalChange('title', e.target.value)} className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2" />
            <input type="text" placeholder={t('companyInstitutionPlaceholder')} value={editingEntry.entity?.[activeEditLang as keyof LocalizedString] || ''} onChange={(e) => handleLocalizedModalChange('entity', e.target.value)} className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2" />
            <div className="flex gap-4">
                <input type="text" placeholder={t('startDatePlaceholder')} value={editingEntry.startDate || ''} onChange={(e) => handleModalChange('startDate', e.target.value)} className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2" />
                <input type="text" placeholder={t('endDatePlaceholder')} value={editingEntry.endDate || ''} onChange={(e) => handleModalChange('endDate', e.target.value)} disabled={editingEntry.endDate === t('present')} className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2 disabled:opacity-50" />
            </div>
             <label className="flex items-center">
                <input type="checkbox" checked={editingEntry.endDate === t('present')} onChange={handlePresentCheckbox} className="form-checkbox rounded text-blue-600 dark:text-dark-accent bg-gray-200 dark:bg-dark-highlight" />
                <span className="ml-2 text-sm text-gray-800 dark:text-dark-text-primary">{t('currentlyWorkStudyHere')}</span>
            </label>
            <textarea placeholder={t('descriptionPlaceholder')} value={editingEntry.description?.[activeEditLang as keyof LocalizedString] || ''} onChange={(e) => handleLocalizedModalChange('description', e.target.value)} rows={4} className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2" />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 dark:bg-dark-highlight hover:bg-gray-300 dark:hover:bg-dark-border-color text-gray-800 dark:text-dark-text-primary font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
            <button onClick={handleSave} className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">{t('save')}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ExperienceSection;