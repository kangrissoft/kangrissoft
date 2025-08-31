

import React, { useEffect, useState, useRef } from 'react';
import type { BioData, BlogPost, Project, ContactSubmission, PortfolioTheme, ThemeSettings, Service, ServiceIconType, LocalizedString } from './types';
import { CollectionIcon, DocumentTextIcon, GithubIcon, LinkedInIcon, XSocialIcon, LinkIcon, MailIcon, FacebookIcon, BriefcaseIcon, CodeIcon, ColorSwatchIcon, DesktopComputerIcon, CogIcon, PortfolioLogoIcon, WhatsappIcon } from './components/icons';
import { marked } from 'marked';
import Modal from './components/Modal';
import { useLanguage } from './contexts/LanguageContext';


interface PortfolioProps {
  bioData: BioData;
  blogPosts: BlogPost[];
  projects: Project[];
  services: Service[];
  portfolioThemes: PortfolioTheme[];
  themeSettings: ThemeSettings;
}

const SocialIcon: React.FC<{ platform: string }> = ({ platform }) => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('github')) {
        return <GithubIcon />;
    }
    if (lowerPlatform.includes('linkedin')) {
        return <LinkedInIcon />;
    }
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) {
        return <XSocialIcon />;
    }
    return <LinkIcon />;
};

const ServiceIcon: React.FC<{ icon: ServiceIconType }> = ({ icon }) => {
    switch (icon) {
        case 'web': return <CodeIcon />;
        case 'ui-ux': return <ColorSwatchIcon />;
        case 'mobile': return <DesktopComputerIcon />;
        case 'backend': return <CogIcon />;
        case 'consulting': return <BriefcaseIcon />;
        default: return <BriefcaseIcon />;
    }
};


const BlogPostPreview: React.FC<{ content: string }> = ({ content }) => {
  const [parsedContent, setParsedContent] = useState('');
  useEffect(() => {
      const parse = async () => {
          let html = await marked.parse(content);
          html = html.replace(/<a /g, '<a style="color: var(--p-accent);" ').replace(/<h[1-3] /g, (match) => match + 'style="color: var(--p-text-primary);" ');
          setParsedContent(html);
      };
      parse();
  }, [content]);

  return (
      <div 
          className="prose-container text-[var(--p-text-primary)] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parsedContent }}
      />
  );
};


const Portfolio: React.FC<PortfolioProps> = ({ bioData, blogPosts, projects, services, portfolioThemes, themeSettings }) => {
  const { language, setLanguage, t } = useLanguage();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [effectiveThemeClass, setEffectiveThemeClass] = useState('');
  const [parsedPostContent, setParsedPostContent] = useState('');
  const [blogFilter, setBlogFilter] = useState<{ type: 'category' | 'tag'; value: string } | null>(null);

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const getLocalizedValue = (field: LocalizedString, lang: string) => {
    return field?.[lang as keyof LocalizedString] || field?.en || '';
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const currentRefs = sectionRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, [bioData, services, projects, blogPosts]);


  const activePost = activePostId ? blogPosts.find(p => p.id === activePostId) : null;

  useEffect(() => {
    let theme: PortfolioTheme | undefined;
    if(themeSettings.autoRotate) {
        const dayOfWeek = new Date().getDay();
        theme = portfolioThemes[dayOfWeek % portfolioThemes.length];
    } else {
        theme = portfolioThemes.find(t => t.id === themeSettings.selectedThemeId);
    }
    
    setEffectiveThemeClass(theme ? theme.class : 'theme-default-dark');
  }, [themeSettings, portfolioThemes]);

  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#/blog/')) {
            const id = hash.substring('#/blog/'.length);
            setActivePostId(id);
            window.scrollTo(0, 0);
        } else if (hash.startsWith('#blog-category-')) {
            const category = decodeURIComponent(hash.substring('#blog-category-'.length));
            setActivePostId(null);
            setBlogFilter({ type: 'category', value: category });
        } else if (hash.startsWith('#blog-tag-')) {
            const tag = decodeURIComponent(hash.substring('#blog-tag-'.length));
            setActivePostId(null);
            setBlogFilter({ type: 'tag', value: tag });
        } else if (hash === '#blog') {
             setActivePostId(null);
             setBlogFilter(null);
        } else {
             setActivePostId(null);
        }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const setMeta = (type: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(`meta[${type}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(type, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const baseUrl = window.location.origin + window.location.pathname;

    if (activePost) {
        const title = getLocalizedValue(activePost.seoTitle || activePost.title, language);
        const description = getLocalizedValue(activePost.seoDescription || activePost.content, language).substring(0, 160).trim().replace(/\s+/g, ' ') + '...';
        const url = `${baseUrl}#/blog/${activePost.id}`;
        const keywords = [getLocalizedValue(activePost.title, 'en'), getLocalizedValue(activePost.category!, 'en'), ...(activePost.tags || []), 'Blog', getLocalizedValue(bioData.name, 'en')].filter(Boolean).join(', ');
        
        document.title = title;
        setMeta('name', 'description', description);
        setMeta('name', 'keywords', keywords);
        setMeta('property', 'og:title', title);
        setMeta('property', 'og:description', description);
        setMeta('property', 'og:type', 'article');
        setMeta('property', 'og:url', url);
        setMeta('property', 'og:image', bioData.imageUrl);
        setMeta('property', 'twitter:card', 'summary_large_image');
        setMeta('property', 'twitter:title', title);
        setMeta('property', 'twitter:description', description);
        setMeta('property', 'twitter:image', bioData.imageUrl);

    } else {
        const title = `${getLocalizedValue(bioData.name, language)} | ${getLocalizedValue(bioData.title, language)}`;
        const description = getLocalizedValue(bioData.summary, language).substring(0, 160).trim() + '...';
        const keywords = [
          getLocalizedValue(bioData.name, 'en'),
          getLocalizedValue(bioData.title, 'en'),
          ...bioData.skills.map(skill => skill.name),
          'Portfolio', 'CV', 'Resume',
        ].join(', ');
        const url = baseUrl;

        document.title = title;
        setMeta('name', 'description', description);
        setMeta('name', 'keywords', keywords);
        setMeta('property', 'og:title', title);
        setMeta('property', 'og:description', description);
        setMeta('property', 'og:type', 'website');
        setMeta('property', 'og:url', url);
        setMeta('property', 'og:image', bioData.imageUrl);
        setMeta('property', 'twitter:card', 'summary_large_image');
        setMeta('property', 'twitter:title', title);
        setMeta('property', 'twitter:description', description);
        setMeta('property', 'twitter:image', bioData.imageUrl);
    }

  }, [bioData, activePost, language]);

  useEffect(() => {
    if (activePost) {
        const parseContent = async () => {
            let html = await marked.parse(getLocalizedValue(activePost.content, language));
            html = html.replace(/<a /g, '<a style="color: var(--p-accent);" ').replace(/<h[1-3] /g, (match) => match + 'style="color: var(--p-text-primary);" ');
            setParsedPostContent(html);
        };
        parseContent();
    }
  }, [activePost, language]);

  const scrollToSection = (id: string) => {
    window.location.hash = '';
    setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setFormStatus(t('formStatusFillAll'));
      return;
    }
    const newSubmission: ContactSubmission = {
      ...contactForm,
      submittedAt: new Date().toISOString(),
    };

    try {
      const submissions = JSON.parse(localStorage.getItem('portfolio-contactSubmissions') || '[]');
      submissions.push(newSubmission);
      localStorage.setItem('portfolio-contactSubmissions', JSON.stringify(submissions));
      setFormStatus(t('formStatusSuccess'));
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => {
        setFormStatus('');
        setIsContactModalOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save contact submission:', error);
      setFormStatus(t('formStatusError'));
    }
  };

  const commonWrapperClass = `min-h-screen font-sans ${effectiveThemeClass} bg-[var(--p-bg-primary)]`;

  const handleFilterClick = (type: 'category' | 'tag', value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.hash = `#blog-${type}-${encodeURIComponent(value)}`;
  };
  
  const formatWhatsappUrl = (number: string | undefined): string => {
    if (!number) return '#';
    const digitsOnly = number.replace(/\D/g, '');
    return `https://wa.me/${digitsOnly}`;
  };

  if (activePost) {
    const baseUrl = window.location.origin + window.location.pathname;
    const postUrl = `${baseUrl}#/blog/${activePost.id}`;
    const shareTitle = encodeURIComponent(getLocalizedValue(activePost.seoTitle || activePost.title, language));
    const shareDescription = encodeURIComponent(getLocalizedValue(activePost.seoDescription || activePost.content, language).substring(0, 100) + '...');

    const shareLinks = [
        { name: 'X', icon: <XSocialIcon />, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${shareTitle}` },
        { name: 'LinkedIn', icon: <LinkedInIcon />, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}` },
        { name: 'Facebook', icon: <FacebookIcon />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}` },
        { name: 'Email', icon: <MailIcon />, url: `mailto:?subject=${shareTitle}&body=${shareDescription}%0A%0ARead more: ${encodeURIComponent(postUrl)}` },
    ];

    return (
      <div className={commonWrapperClass}>
         <header className="bg-[var(--p-bg-secondary)]/80 backdrop-blur-sm sticky top-0 z-40 border-b border-[var(--p-border)]">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
              <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''}} className="text-xl font-bold text-[var(--p-accent)] flex items-center gap-2">
                <PortfolioLogoIcon />
                <span>{getLocalizedValue(bioData.name, language)}</span>
              </a>
               <div className="flex items-center gap-4">
                  <a href="#blog" onClick={(e) => { e.preventDefault(); window.location.hash = '#blog'}} className="bg-[var(--p-accent)] hover:bg-[var(--p-accent-hover)] text-white font-bold py-2 px-4 rounded-lg transition-colors">{t('backToBlog')}</a>
               </div>
            </nav>
          </header>
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <article className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold mb-3 text-[var(--p-text-primary)]">{getLocalizedValue(activePost.title, language)}</h1>
              <div className="flex items-center gap-4 text-sm text-[var(--p-text-secondary)] mb-4">
                 <p>{new Date(activePost.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                  {getLocalizedValue(activePost.category!, language) && <span>&bull;</span>}
                  {getLocalizedValue(activePost.category!, language) && (
                    <a href={`#blog-category-${encodeURIComponent(getLocalizedValue(activePost.category!, 'en'))}`} onClick={(e) => handleFilterClick('category', getLocalizedValue(activePost.category!, 'en'), e)} className="font-semibold text-[var(--p-accent)] hover:underline">{getLocalizedValue(activePost.category!, language)}</a>
                  )}
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm font-semibold text-[var(--p-text-secondary)]">{t('share')}</span>
                <div className="flex gap-1">
                    {shareLinks.map(link => (
                        <a 
                            key={link.name} 
                            href={link.url}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            aria-label={`Share on ${link.name}`}
                            className="p-2 rounded-full text-[var(--p-text-secondary)] hover:bg-[var(--p-highlight)] hover:text-[var(--p-accent)] transition-colors"
                        >
                            {link.icon}
                        </a>
                    ))}
                </div>
              </div>
              
              <div
                className="prose-container text-[var(--p-text-primary)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parsedPostContent }}
              />
               {activePost.tags && activePost.tags.length > 0 && (
                <div className="mt-8 pt-4 border-t border-[var(--p-border)] flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[var(--p-text-secondary)]">{t('tags')}</span>
                  {activePost.tags.map(tag => (
                     <a href={`#blog-tag-${encodeURIComponent(tag)}`} onClick={(e) => handleFilterClick('tag', tag, e)} key={tag} className="bg-[var(--p-highlight)] text-[var(--p-accent)] text-xs font-semibold px-2.5 py-1 rounded-full hover:shadow-md transition-shadow">#{tag}</a>
                  ))}
                </div>
              )}
            </article>
          </main>
           <footer className="border-t border-[var(--p-border)] mt-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-[var(--p-text-secondary)]">
              <p>{t('footerRights', { year: new Date().getFullYear(), name: getLocalizedValue(bioData.name, language) })}</p>
            </div>
          </footer>
      </div>
    )
  }

  const allCategories = [...new Set(blogPosts.map(p => getLocalizedValue(p.category!, 'en')).filter(Boolean) as string[])];
  const allTags = [...new Set(blogPosts.flatMap(p => p.tags || []))];
  
  const filteredBlogPosts = blogFilter
    ? blogPosts.filter(post => 
        blogFilter.type === 'category' 
          ? getLocalizedValue(post.category!, 'en') === blogFilter.value 
          : post.tags?.includes(blogFilter.value)
      )
    : blogPosts;


  return (
    <div className={commonWrapperClass}>
      <header className="bg-[var(--p-bg-secondary)]/80 backdrop-blur-sm sticky top-0 z-40 border-b border-[var(--p-border)]">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <h1 className="text-xl font-bold text-[var(--p-accent)] flex items-center gap-2">
            <PortfolioLogoIcon />
            <span>{getLocalizedValue(bioData.name, language)}</span>
          </h1>
          <div className="hidden md:flex space-x-6 items-center">
            <button onClick={() => scrollToSection('about')} className="text-[var(--p-text-secondary)] hover:text-[var(--p-accent)] transition-colors">{t('portfolioHeaderAbout')}</button>
            <button onClick={() => scrollToSection('services')} className="text-[var(--p-text-secondary)] hover:text-[var(--p-accent)] transition-colors">{t('portfolioHeaderServices')}</button>
            <button onClick={() => scrollToSection('projects')} className="text-[var(--p-text-secondary)] hover:text-[var(--p-accent)] transition-colors">{t('portfolioHeaderProjects')}</button>
            <a href="#blog" onClick={() => { window.location.hash = '#blog'; }} className="text-[var(--p-text-secondary)] hover:text-[var(--p-accent)] transition-colors">{t('portfolioHeaderBlog')}</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsContactModalOpen(true)} className="bg-[var(--p-accent)] hover:bg-[var(--p-accent-hover)] text-white font-bold py-2 px-4 rounded-lg transition-colors">{t('contactMe')}</button>
            <div className="flex items-center bg-[var(--p-highlight)] rounded-lg p-1">
              <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-[var(--p-bg-primary)] text-[var(--p-accent)]' : 'text-[var(--p-text-secondary)]'}`}>EN</button>
              <button onClick={() => setLanguage('id')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'id' ? 'bg-[var(--p-bg-primary)] text-[var(--p-accent)]' : 'text-[var(--p-text-secondary)]'}`}>ID</button>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section id="about" ref={el => { sectionRefs.current[0] = el; }} className="mb-24 scroll-mt-20 fade-in-section">
            <div className="flex flex-col md:flex-row items-center gap-12">
                <img src={bioData.imageUrl} alt={getLocalizedValue(bioData.name, language)} className="w-48 h-48 rounded-full border-4 border-[var(--p-accent)] shadow-lg"/>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-4xl font-bold mb-2 text-[var(--p-text-primary)]">{getLocalizedValue(bioData.name, language)}</h2>
                    <p className="text-2xl text-[var(--p-accent)] mb-4">{getLocalizedValue(bioData.title, language)}</p>
                    <p className="text-[var(--p-text-secondary)] leading-relaxed mb-6">{getLocalizedValue(bioData.summary, language)}</p>
                     <div className="flex justify-center md:justify-start gap-6 mb-6">
                        {(bioData.socialLinks || []).map(link => (
                            <a 
                                key={link.platform} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={`Visit my ${link.platform} profile`}
                                className="text-[var(--p-text-secondary)] hover:text-[var(--p-accent)] transition-colors"
                            >
                                <SocialIcon platform={link.platform} />
                            </a>
                        ))}
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {bioData.skills.map(skill => (
                            <span key={skill.name} className="bg-[var(--p-highlight)] text-[var(--p-accent)] text-sm font-semibold px-3 py-1.5 rounded-full">{skill.name}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {services.length > 0 && (
          <section id="services" ref={el => { sectionRefs.current[1] = el; }} className="mb-24 scroll-mt-20 fade-in-section">
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3 text-[var(--p-text-primary)]"><BriefcaseIcon /> {t('servicesIOffer')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map(service => (
                <div key={service.id} className="bg-[var(--p-bg-secondary)] border border-[var(--p-border)] rounded-lg p-8 text-center shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="inline-block p-4 bg-[var(--p-highlight)] rounded-full mb-4 text-[var(--p-accent)]">
                      <ServiceIcon icon={service.icon} />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--p-text-primary)] mb-2">{getLocalizedValue(service.name, language)}</h3>
                  <p className="text-[var(--p-text-secondary)]">{getLocalizedValue(service.description, language)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="projects" ref={el => { sectionRefs.current[2] = el; }} className="mb-24 scroll-mt-20 fade-in-section">
          <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3 text-[var(--p-text-primary)]"><CollectionIcon /> {t('projects')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map(project => (
              <div key={project.id} className="bg-[var(--p-bg-secondary)] border border-[var(--p-border)] rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <img src={project.imageUrl} alt={getLocalizedValue(project.altText, language)} className="w-full h-56 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[var(--p-accent)] mb-2">{getLocalizedValue(project.name, language)}</h3>
                  <p className="text-[var(--p-text-secondary)] mb-4 min-h-[6rem]">{getLocalizedValue(project.description, language)}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.technologies.map(tech => (
                      <span key={tech} className="bg-[var(--p-highlight)] text-[var(--p-accent)] text-xs font-semibold px-2.5 py-1 rounded-full">{tech}</span>
                    ))}
                  </div>
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-[var(--p-accent)] hover:underline font-semibold">{t('viewProject')}</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="blog" ref={el => { sectionRefs.current[3] = el; }} className="mb-24 scroll-mt-20 fade-in-section">
           <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3 text-[var(--p-text-primary)]"><DocumentTextIcon /> {t('blog')}</h2>
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                    <button onClick={() => window.location.hash = '#blog'} className={`font-semibold px-4 py-2 rounded-full text-sm transition-colors ${!blogFilter ? 'bg-[var(--p-accent)] text-white' : 'bg-[var(--p-highlight)] text-[var(--p-accent)] hover:bg-[var(--p-border)]'}`}>{t('allPosts')}</button>
                    {allCategories.map(cat => (
                        <button key={cat} onClick={() => window.location.hash = `#blog-category-${encodeURIComponent(cat)}`} className={`font-semibold px-4 py-2 rounded-full text-sm transition-colors ${blogFilter?.type === 'category' && blogFilter.value === cat ? 'bg-[var(--p-accent)] text-white' : 'bg-[var(--p-highlight)] text-[var(--p-accent)] hover:bg-[var(--p-border)]'}`}>{cat}</button>
                    ))}
                    {allTags.map(tag => (
                        <button key={tag} onClick={() => window.location.hash = `#blog-tag-${encodeURIComponent(tag)}`} className={`font-semibold px-4 py-2 rounded-full text-sm transition-colors ${blogFilter?.type === 'tag' && blogFilter.value === tag ? 'bg-[var(--p-accent)] text-white' : 'bg-[var(--p-highlight)] text-[var(--p-accent)] hover:bg-[var(--p-border)]'}`}>{tag}</button>
                    ))}
                </div>

                <div className="space-y-8">
                    {filteredBlogPosts.map(post => (
                        <div key={post.id} className="bg-[var(--p-bg-secondary)] border border-[var(--p-border)] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.hash = `#/blog/${post.id}`}>
                            {getLocalizedValue(post.category!, language) && <p className="text-sm font-semibold text-[var(--p-accent)] mb-2">{getLocalizedValue(post.category!, language)}</p>}
                            <h3 className="text-2xl font-semibold text-[var(--p-text-primary)] mb-2">{getLocalizedValue(post.title, language)}</h3>
                            <p className="text-sm text-[var(--p-text-secondary)] mb-4">{
                              new Date(post.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
                            }</p>
                            <BlogPostPreview content={getLocalizedValue(post.content, language).substring(0, 200) + '...'} />
                            {post.tags && post.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="bg-[var(--p-highlight)] text-[var(--p-text-secondary)] text-xs font-semibold px-2.5 py-1 rounded-full">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredBlogPosts.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-semibold text-[var(--p-text-primary)]">{t('noPostsFoundFilter')}</h3>
                            <p className="text-[var(--p-text-secondary)]">{t('noPostsFoundFilterDescription')}</p>
                        </div>
                    )}
                </div>
           </div>
        </section>
      </main>
      
      {isContactModalOpen && (
        <Modal onClose={() => setIsContactModalOpen(false)}>
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3 text-text-primary dark:text-dark-text-primary">
                    <MailIcon />
                    {t('contactModalTitle')}
                </h2>
                <p className="text-text-secondary dark:text-dark-text-secondary mb-6">{t('contactModalDescription')}</p>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">{t('name')}</label>
                <input type="text" id="name" name="name" value={contactForm.name} onChange={handleContactChange} required className="w-full bg-highlight dark:bg-dark-highlight border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent text-text-primary dark:text-dark-text-primary" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">{t('email')}</label>
                <input type="email" id="email" name="email" value={contactForm.email} onChange={handleContactChange} required className="w-full bg-highlight dark:bg-dark-highlight border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent text-text-primary dark:text-dark-text-primary" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">{t('message')}</label>
                <textarea id="message" name="message" value={contactForm.message} onChange={handleContactChange} rows={5} required className="w-full bg-highlight dark:bg-dark-highlight border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent text-text-primary dark:text-dark-text-primary"></textarea>
              </div>
              <div className="text-center">
                <button type="submit" className="bg-accent dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto">{t('sendMessage')}</button>
              </div>
              {formStatus && (
                <p className={`text-center text-sm mt-4 ${formStatus.includes('error') ? 'text-red-500' : 'text-green-500'}`}>{formStatus}</p>
              )}
            </form>

            {bioData.whatsapp && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-border-color dark:border-dark-border-color" /></div>
                  <div className="relative flex justify-center"><span className="bg-white dark:bg-dark-secondary px-3 text-sm text-text-secondary dark:text-dark-text-secondary">{t('orDivider')}</span></div>
                </div>
                
                <div className="text-center">
                    <a
                        href={formatWhatsappUrl(bioData.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto"
                    >
                        <WhatsappIcon />
                        <span>{t('chatOnWhatsApp')}</span>
                    </a>
                </div>
              </>
            )}
        </Modal>
      )}

      <footer className="border-t border-[var(--p-border)] mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-[var(--p-text-secondary)]">
          <p>{t('footerRights', { year: new Date().getFullYear(), name: getLocalizedValue(bioData.name, language) })}</p>
          <p>{t('footerManagedBy')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;