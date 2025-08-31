

import React, { useState } from 'react';
import type { Service, ServiceIconType, LocalizedString } from '../types';
import Modal from './Modal';
import { PlusIcon, XIcon, DragHandleIcon, CodeIcon, ColorSwatchIcon, DesktopComputerIcon, CogIcon, BriefcaseIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ServicesSectionProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const iconMap: { [key in ServiceIconType]: { component: React.FC; name: string } } = {
  'web': { component: CodeIcon, name: 'Web Dev' },
  'ui-ux': { component: ColorSwatchIcon, name: 'UI/UX' },
  'mobile': { component: DesktopComputerIcon, name: 'Mobile' },
  'backend': { component: CogIcon, name: 'Backend' },
  'consulting': { component: BriefcaseIcon, name: 'Consulting' },
};

const createEmptyLocalizedString = (): LocalizedString => ({ en: '', id: '' });

const LanguageTabs: React.FC<{ activeLang: string, setActiveLang: (lang: string) => void }> = ({ activeLang, setActiveLang }) => (
  <div className="flex items-center bg-gray-200 dark:bg-dark-highlight rounded-lg p-1 mb-4 self-start">
    <button onClick={() => setActiveLang('en')} className={`px-3 py-1 text-sm font-bold rounded ${activeLang === 'en' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>EN</button>
    <button onClick={() => setActiveLang('id')} className={`px-3 py-1 text-sm font-bold rounded ${activeLang === 'id' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>ID</button>
  </div>
);

const ServicesSection: React.FC<ServicesSectionProps> = ({ services, setServices }) => {
  const { language: currentLanguage, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [draggedServiceIndex, setDraggedServiceIndex] = useState<number | null>(null);
  const [activeEditLang, setActiveEditLang] = useState('en');

  const getLocalizedValue = (field: LocalizedString) => {
    return field[currentLanguage as keyof LocalizedString] || field.en;
  };

  const openModalForNew = () => {
    setEditingService({ name: createEmptyLocalizedString(), description: createEmptyLocalizedString(), icon: 'web' });
    setActiveEditLang('en');
    setIsModalOpen(true);
  };

  const openModalForEdit = (service: Service) => {
    setEditingService(service);
    setActiveEditLang('en');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingService || !editingService.name?.en || !editingService.description?.en) {
        alert(t('fillAllFields'));
        return;
    }
    if (editingService.id) {
      setServices(services.map(s => s.id === editingService.id ? (editingService as Service) : s));
    } else {
      const newService: Service = {
        ...editingService,
        id: new Date().toISOString(),
      } as Service;
      setServices([...services, newService]);
    }
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDeleteService'))) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleDragStart = (index: number) => setDraggedServiceIndex(index);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (targetIndex: number) => {
    if (draggedServiceIndex === null || draggedServiceIndex === targetIndex) return;
    const newServices = [...services];
    const draggedItem = newServices[draggedServiceIndex];
    newServices.splice(draggedServiceIndex, 1);
    newServices.splice(targetIndex, 0, draggedItem);
    setServices(newServices);
    setDraggedServiceIndex(null);
  };
  const handleDragEnd = () => setDraggedServiceIndex(null);
  
  const handleLocalizedInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingService) {
        setEditingService({
            ...editingService,
            [name]: {
                ...(editingService[name as keyof Service] as LocalizedString),
                [activeEditLang]: value
            }
        });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t('services')}</h2>
        <button onClick={openModalForNew} className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
          <PlusIcon />
          <span>{t('newService')}</span>
        </button>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div
            key={service.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color transition-all duration-300 ease-in-out
              ${draggedServiceIndex === index
                ? 'opacity-50 scale-105 shadow-2xl bg-white dark:bg-dark-secondary ring-2 ring-blue-500 dark:ring-dark-accent'
                : 'hover:shadow-md hover:border-gray-300 dark:hover:border-dark-border-color'
              }`}
          >
            <div className="cursor-grab text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-primary p-2">
              <DragHandleIcon />
            </div>
            <div className="flex-shrink-0 text-blue-600 dark:text-dark-accent">
                {React.createElement(iconMap[service.icon].component)}
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-gray-800 dark:text-dark-text-primary">{getLocalizedValue(service.name)}</h3>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{getLocalizedValue(service.description)}</p>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <button onClick={() => openModalForEdit(service)} className="text-yellow-500 hover:text-yellow-400 dark:text-yellow-400 dark:hover:text-yellow-300 font-semibold">{t('edit')}</button>
              <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 font-semibold">{t('delete')}</button>
            </div>
          </div>
        ))}
         {services.length === 0 && (
          <div className="text-center text-gray-500 dark:text-dark-text-secondary py-10 bg-gray-50 dark:bg-dark-secondary rounded-lg border border-dashed border-gray-300 dark:border-dark-border-color">
            <p>{t('noServicesYet')}</p>
          </div>
        )}
      </div>

      {isModalOpen && editingService && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-4">{editingService.id ? t('editServiceTitle') : t('newServiceTitle')}</h2>
          <LanguageTabs activeLang={activeEditLang} setActiveLang={setActiveEditLang} />
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder={t('serviceNamePlaceholder')}
              value={editingService.name?.[activeEditLang as keyof LocalizedString] || ''}
              onChange={handleLocalizedInputChange}
              className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2"
            />
            <textarea
              name="description"
              placeholder={t('serviceDescriptionPlaceholder')}
              value={editingService.description?.[activeEditLang as keyof LocalizedString] || ''}
              onChange={handleLocalizedInputChange}
              rows={4}
              className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2"
            />
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-2">{t('icon')}</label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(iconMap).map(([key, { component: IconComponent, name }]) => (
                  <button
                    key={key}
                    onClick={() => setEditingService({ ...editingService, icon: key as ServiceIconType })}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${editingService.icon === key ? 'border-blue-600 dark:border-dark-accent bg-blue-50 dark:bg-dark-highlight' : 'border-gray-300 dark:border-dark-border-color hover:border-blue-400 dark:hover:border-dark-accent'}`}
                    title={name}
                  >
                    <IconComponent />
                    <span className="text-xs mt-1 text-gray-600 dark:text-dark-text-secondary">{name}</span>
                  </button>
                ))}
              </div>
            </div>
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

export default ServicesSection;