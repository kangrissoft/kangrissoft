

export type LocalizedString = {
  en: string;
  id: string;
};

export interface Skill {
  name: string;
  level: number; // A value from 0 to 100
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface BioData {
  name: LocalizedString;
  title: LocalizedString;
  email: string;
  phone: string;
  location: string;
  summary: LocalizedString;
  skills: Skill[];
  imageUrl: string;
  socialLinks: SocialLink[];
  whatsapp?: string;
}

export interface Experience {
  id: string;
  type: 'work' | 'education';
  title: LocalizedString;
  entity: LocalizedString; // Company or Institution
  startDate: string;
  endDate: string; // Can be 'Present'
  description: LocalizedString;
}

export interface BlogPost {
  id: string;
  title: LocalizedString;
  content: LocalizedString;
  date: string;
  seoTitle?: LocalizedString;
  seoDescription?: LocalizedString;
  category?: LocalizedString;
  tags?: string[];
}

export interface Project {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  technologies: string[];
  link: string;
  imageUrl: string;
  altText: LocalizedString;
}

export type ServiceIconType = 'web' | 'ui-ux' | 'mobile' | 'backend' | 'consulting';

export interface Service {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: ServiceIconType;
}

export enum Section {
  Dashboard = 'Dashboard',
  About = 'About',
  Services = 'Services',
  Blog = 'Blog',
  Projects = 'Projects',
  Inbox = 'Inbox',
}

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  submittedAt: string;
}

export interface PortfolioTheme {
  id: string;
  name: string;
  class: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
}

export interface ThemeSettings {
  selectedThemeId: string;
  autoRotate: boolean;
}

export interface PortfolioBackup {
  bioData: BioData;
  blogPosts: BlogPost[];
  projects: Project[];
  services: Service[];
  themeSettings: ThemeSettings;
}