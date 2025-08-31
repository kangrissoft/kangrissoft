
import React, { useState } from 'react';
import type { BioData, BlogPost, Project, PortfolioTheme, ThemeSettings, Service } from './types';
import { Section } from './types';
import Header from './components/Header';
import AboutSection from './components/AboutSection';
import BlogSection from './components/BlogSection';
import ProjectsSection from './components/ProjectsSection';
import DashboardSection from './components/DashboardSection';
import ServicesSection from './components/ServicesSection';
import InboxSection from './components/InboxSection';

interface AdminPanelProps {
  bioData: BioData;
  setBioData: React.Dispatch<React.SetStateAction<BioData>>;
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  theme: string;
  toggleTheme: () => void;
  portfolioThemes: PortfolioTheme[];
  themeSettings: ThemeSettings;
  setThemeSettings: React.Dispatch<React.SetStateAction<ThemeSettings>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  bioData, setBioData, blogPosts, setBlogPosts, projects, setProjects, services, setServices, theme, toggleTheme, portfolioThemes, themeSettings, setThemeSettings
}) => {
  const [activeSection, setActiveSection] = useState<Section>(Section.Dashboard);

  const renderSection = () => {
    switch (activeSection) {
      case Section.Dashboard:
        return <DashboardSection 
                  bioData={bioData} 
                  blogPosts={blogPosts} 
                  projects={projects}
                  services={services}
                  themes={portfolioThemes}
                  themeSettings={themeSettings}
                  setBioData={setBioData}
                  setBlogPosts={setBlogPosts}
                  setProjects={setProjects}
                  setServices={setServices}
                  setThemeSettings={setThemeSettings}
                />;
      case Section.About:
        return <AboutSection bioData={bioData} setBioData={setBioData} />;
      case Section.Services:
        return <ServicesSection services={services} setServices={setServices} />;
      case Section.Blog:
        return <BlogSection blogPosts={blogPosts} setBlogPosts={setBlogPosts} />;
      case Section.Projects:
        return <ProjectsSection projects={projects} setProjects={setProjects} />;
      case Section.Inbox:
        return <InboxSection />;
      default:
        return <DashboardSection 
                  bioData={bioData} 
                  blogPosts={blogPosts} 
                  projects={projects} 
                  services={services}
                  themes={portfolioThemes}
                  themeSettings={themeSettings}
                  setBioData={setBioData}
                  setBlogPosts={setBlogPosts}
                  setProjects={setProjects}
                  setServices={setServices}
                  setThemeSettings={setThemeSettings}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-primary dark:bg-dark-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          theme={theme} 
          toggleTheme={toggleTheme}
        />
        <main className="mt-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;