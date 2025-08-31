

import React, { useState, useEffect } from 'react';
import type { BlogPost, LocalizedString } from '../types';
import Modal from './Modal';
import { generateBlogPost, generateSeoSuggestions } from '../services/geminiService';
import { PlusIcon, SparklesIcon, SearchIcon, ChevronDownIcon, SpinnerIcon } from './icons';
import { marked } from 'marked';
import { useLanguage } from '../contexts/LanguageContext';

interface BlogSectionProps {
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

const createEmptyLocalizedString = (): LocalizedString => ({ en: '', id: '' });

const LanguageTabs: React.FC<{ activeLang: string, setActiveLang: (lang: string) => void }> = ({ activeLang, setActiveLang }) => (
  <div className="flex items-center bg-gray-200 dark:bg-dark-highlight rounded-lg p-1 mb-4 self-start">
    <button onClick={() => setActiveLang('en')} className={`px-3 py-1 text-sm font-bold rounded ${activeLang === 'en' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>EN</button>
    <button onClick={() => setActiveLang('id')} className={`px-3 py-1 text-sm font-bold rounded ${activeLang === 'id' ? 'bg-white dark:bg-dark-secondary text-blue-600 dark:text-dark-accent' : 'text-gray-600 dark:text-dark-text-secondary'}`}>ID</button>
  </div>
);

const BlogSection: React.FC<BlogSectionProps> = ({ blogPosts, setBlogPosts }) => {
  const { language: currentLanguage, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  // State for editable fields
  const [postTitle, setPostTitle] = useState<LocalizedString>(createEmptyLocalizedString());
  const [postContent, setPostContent] = useState<LocalizedString>(createEmptyLocalizedString());
  const [postDate, setPostDate] = useState('');
  const [postCategory, setPostCategory] = useState<LocalizedString>(createEmptyLocalizedString());
  const [postTags, setPostTags] = useState('');
  const [postSeoTitle, setPostSeoTitle] = useState<LocalizedString>(createEmptyLocalizedString());
  const [postSeoDescription, setPostSeoDescription] = useState<LocalizedString>(createEmptyLocalizedString());

  const [isGenerating, setIsGenerating] = useState(false);
  const [editorView, setEditorView] = useState<'write' | 'preview'>('write');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [activeEditLang, setActiveEditLang] = useState('en');

  // Auto-save effect
  useEffect(() => {
    if (!isModalOpen) {
      setDraftStatus('');
      return;
    }

    const draftKey = editingPost ? `blog-draft-${editingPost.id}` : 'blog-draft-new';

    const intervalId = setInterval(() => {
      const draft = {
        title: postTitle,
        content: postContent,
        date: postDate,
        category: postCategory,
        tags: postTags,
        seoTitle: postSeoTitle,
        seoDescription: postSeoDescription,
      };
      if (draft.title.en || draft.content.en || draft.title.id || draft.content.id) {
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setDraftStatus(t('draftSavedAt', { time: new Date().toLocaleTimeString() }));
      }
    }, 5000); // 5 seconds

    return () => clearInterval(intervalId);
  }, [isModalOpen, editingPost, postTitle, postContent, postDate, postCategory, postTags, postSeoTitle, postSeoDescription, t]);
  
  const getLocalizedValue = (field: LocalizedString) => {
    return field[currentLanguage as keyof LocalizedString] || field.en;
  }

  const openModalForNew = () => {
    setEditingPost(null);
    const draftKey = 'blog-draft-new';
    const savedDraft = localStorage.getItem(draftKey);
    
    const clearState = () => {
      setPostTitle(createEmptyLocalizedString());
      setPostContent(createEmptyLocalizedString());
      setPostDate(new Date().toLocaleDateString('en-CA'));
      setPostCategory(createEmptyLocalizedString());
      setPostTags('');
      setPostSeoTitle(createEmptyLocalizedString());
      setPostSeoDescription(createEmptyLocalizedString());
    };

    if (savedDraft) {
      if (window.confirm(t('unsavedDraftFound'))) {
        const draft = JSON.parse(savedDraft);
        setPostTitle(draft.title || createEmptyLocalizedString());
        setPostContent(draft.content || createEmptyLocalizedString());
        setPostDate(draft.date || new Date().toLocaleDateString('en-CA'));
        setPostCategory(draft.category || createEmptyLocalizedString());
        setPostTags(draft.tags || '');
        setPostSeoTitle(draft.seoTitle || createEmptyLocalizedString());
        setPostSeoDescription(draft.seoDescription || createEmptyLocalizedString());
      } else {
        clearState();
      }
    } else {
      clearState();
    }
    setEditorView('write');
    setIsSeoOpen(false);
    setActiveEditLang('en');
    setIsModalOpen(true);
  };
  
  const openModalForEdit = (post: BlogPost) => {
    setEditingPost(post);
    const draftKey = `blog-draft-${post.id}`;
    const savedDraft = localStorage.getItem(draftKey);

    const applyData = (source: any) => {
      setPostTitle(source.title);
      setPostContent(source.content);
      setPostDate(source.date);
      setPostCategory(source.category || createEmptyLocalizedString());
      setPostTags(source.tags?.join ? source.tags.join(', ') : source.tags || '');
      setPostSeoTitle(source.seoTitle || createEmptyLocalizedString());
      setPostSeoDescription(source.seoDescription || createEmptyLocalizedString());
      setIsSeoOpen(!!(getLocalizedValue(source.seoTitle) || getLocalizedValue(source.seoDescription)));
    };

    if (savedDraft) {
      if (window.confirm(t('unsavedDraftFoundFor', { title: getLocalizedValue(post.title) }))) {
        applyData(JSON.parse(savedDraft));
      } else {
        applyData(post);
      }
    } else {
      applyData(post);
    }
    
    setEditorView('write');
    setActiveEditLang('en');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const tagsArray = postTags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingPost) {
      setBlogPosts(blogPosts.map(p => p.id === editingPost.id ? { ...p, title: postTitle, content: postContent, date: postDate, category: postCategory, tags: tagsArray, seoTitle: postSeoTitle, seoDescription: postSeoDescription } : p));
    } else {
      const newPost: BlogPost = {
        id: new Date().toISOString(),
        title: postTitle,
        content: postContent,
        date: postDate,
        category: postCategory,
        tags: tagsArray,
        seoTitle: postSeoTitle,
        seoDescription: postSeoDescription,
      };
      setBlogPosts([newPost, ...blogPosts]);
    }
    
    const draftKey = editingPost ? `blog-draft-${editingPost.id}` : 'blog-draft-new';
    localStorage.removeItem(draftKey);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDeletePost'))) {
        setBlogPosts(blogPosts.filter(p => p.id !== id));
        const draftKey = `blog-draft-${id}`;
        localStorage.removeItem(draftKey);
    }
  };
  
  const handleGeneratePost = async () => {
      const currentTitle = postTitle[activeEditLang as keyof LocalizedString];
      if(!currentTitle) {
          alert(t('enterTopicFirst'));
          return;
      }
      setIsGenerating(true);
      const content = await generateBlogPost(currentTitle);
      if(!content.startsWith("Error:")) {
          setPostContent(prev => ({...prev, [activeEditLang]: content}));
          setEditorView('write');
      }
      setIsGenerating(false);
  }

  const handleGenerateSeo = async () => {
    const currentTitle = postTitle[activeEditLang as keyof LocalizedString];
    const currentContent = postContent[activeEditLang as keyof LocalizedString];
    if (!currentContent) {
        alert(t('writeContentFirst'));
        return;
    }
    setIsGeneratingSeo(true);
    const suggestions = await generateSeoSuggestions(currentTitle, currentContent);
    if (!suggestions.seoTitle.startsWith("Error:")) {
        setPostSeoTitle(prev => ({...prev, [activeEditLang]: suggestions.seoTitle}));
        setPostSeoDescription(prev => ({...prev, [activeEditLang]: suggestions.seoDescription}));
    } else {
        alert(t('seoGenerationError'));
    }
    setIsGeneratingSeo(false);
  };
  
  const handleLocalizedInputChange = (field: 'title' | 'content' | 'category' | 'seoTitle' | 'seoDescription', value: string) => {
    const setters = {
      title: setPostTitle,
      content: setPostContent,
      category: setPostCategory,
      seoTitle: setPostSeoTitle,
      seoDescription: setPostSeoDescription,
    };
    setters[field](prev => ({ ...prev, [activeEditLang]: value }));
  };


  const filteredPosts = blogPosts.filter(post =>
    getLocalizedValue(post.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocalizedValue(post.content).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('blog')}</h2>
        <button onClick={openModalForNew} className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
            <PlusIcon />
            <span>{t('newPost')}</span>
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-dark-text-secondary">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder={t('searchPostsPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
        />
      </div>

      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <div key={post.id} className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-6 shadow-lg transition-transform hover:scale-[1.02]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-semibold text-blue-600 dark:text-dark-accent">{getLocalizedValue(post.title)}</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-2">{post.date}</p>
                   <div className="flex items-center gap-2 flex-wrap mb-4">
                        {getLocalizedValue(post.category!) && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{getLocalizedValue(post.category!)}</span>
                        )}
                        {post.tags?.map(tag => (
                            <span key={tag} className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">#{tag}</span>
                        ))}
                    </div>
                  <div 
                    className="prose-container text-gray-800 dark:text-dark-text-primary" 
                    dangerouslySetInnerHTML={{ __html: marked.parse(getLocalizedValue(post.content)) }} 
                  />
                </div>
                <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <button onClick={() => openModalForEdit(post)} className="text-yellow-500 hover:text-yellow-400 dark:text-yellow-400 dark:hover:text-yellow-300">{t('edit')}</button>
                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400">{t('delete')}</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-dark-text-secondary py-10 bg-gray-50 dark:bg-dark-secondary rounded-lg border border-gray-200 dark:border-dark-border-color">
            <p>{t('noPostsFound')}</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-4">{editingPost ? t('editPostTitle') : t('newPostTitle')}</h2>
          <LanguageTabs activeLang={activeEditLang} setActiveLang={setActiveEditLang} />
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="post-title" className="sr-only">{t('postTitlePlaceholder')}</label>
                <input
                  id="post-title"
                  type="text"
                  placeholder={t('postTitlePlaceholder')}
                  value={postTitle[activeEditLang as keyof LocalizedString]}
                  onChange={(e) => handleLocalizedInputChange('title', e.target.value)}
                  className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2"
                />
              </div>
              <div className="flex-shrink-0">
                  <label htmlFor="post-date" className="sr-only">{t('publishDate')}</label>
                  <input
                    id="post-date"
                    type="date"
                    value={postDate}
                    onChange={(e) => setPostDate(e.target.value)}
                    className="bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2 text-gray-600 dark:text-dark-text-secondary"
                  />
              </div>
            </div>
             <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder={t('categoryPlaceholder')}
                  value={postCategory[activeEditLang as keyof LocalizedString]}
                  onChange={(e) => handleLocalizedInputChange('category', e.target.value)}
                  className="w-full sm:w-1/3 bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder={t('tagsPlaceholder')}
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  className="w-full sm:w-2/3 bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2"
                />
            </div>
            {/* Editor Tabs */}
            <div className="flex border-b border-gray-300 dark:border-dark-border-color">
                <button 
                  onClick={() => setEditorView('write')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${editorView === 'write' ? 'border-blue-600 dark:border-dark-accent text-blue-600 dark:text-dark-accent' : 'border-transparent text-gray-500 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary'}`}
                >
                  {t('write')}
                </button>
                 <button 
                  onClick={() => setEditorView('preview')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${editorView === 'preview' ? 'border-blue-600 dark:border-dark-accent text-blue-600 dark:text-dark-accent' : 'border-transparent text-gray-500 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary'}`}
                >
                  {t('preview')}
                </button>
            </div>
            
            {editorView === 'write' ? (
              <div className="relative">
                <textarea
                  placeholder={t('postContentPlaceholder')}
                  value={postContent[activeEditLang as keyof LocalizedString]}
                  onChange={(e) => handleLocalizedInputChange('content', e.target.value)}
                  rows={10}
                  className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2"
                />
                <button onClick={handleGeneratePost} disabled={isGenerating} className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded-lg flex items-center space-x-2 text-sm transition-colors disabled:opacity-50">
                    <SparklesIcon />
                    <span>{isGenerating ? t('generating') : t('generateWithAI')}</span>
                </button>
              </div>
            ) : (
                <div 
                    className="prose-container bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md p-3 min-h-[240px] max-h-[240px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: marked.parse(postContent[activeEditLang as keyof LocalizedString]) }}
                />
            )}

            {/* SEO Settings */}
            <div className="border-t border-gray-200 dark:border-dark-border-color pt-4">
              <button
                onClick={() => setIsSeoOpen(!isSeoOpen)}
                className="flex justify-between items-center w-full text-left text-sm font-medium text-gray-600 dark:text-dark-text-secondary"
              >
                <span>{t('seoSettings')}</span>
                <ChevronDownIcon className={`transform transition-transform ${isSeoOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSeoOpen && (
                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{t('seoSuggestionInfo')}</p>
                        <button
                            onClick={handleGenerateSeo}
                            disabled={isGeneratingSeo}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded-lg flex items-center justify-center space-x-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-wait shrink-0"
                        >
                            {isGeneratingSeo ? <SpinnerIcon /> : <SparklesIcon />}
                            <span>{isGeneratingSeo ? t('suggesting') : t('suggestWithAI')}</span>
                        </button>
                    </div>
                  <input
                    type="text"
                    placeholder={t('seoTitlePlaceholder')}
                    value={postSeoTitle[activeEditLang as keyof LocalizedString]}
                    onChange={(e) => handleLocalizedInputChange('seoTitle', e.target.value)}
                    className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder={t('seoDescriptionPlaceholder')}
                    value={postSeoDescription[activeEditLang as keyof LocalizedString]}
                    onChange={(e) => handleLocalizedInputChange('seoDescription', e.target.value)}
                    rows={3}
                    className="w-full bg-gray-100 dark:bg-dark-highlight border border-gray-300 dark:border-dark-border-color rounded-md px-3 py-2 text-sm"
                  />
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

export default BlogSection;