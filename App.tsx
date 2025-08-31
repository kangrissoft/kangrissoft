
import React, { useState, useEffect } from 'react';
import type { BioData, BlogPost, Project, ThemeSettings, PortfolioTheme, Service, LocalizedString } from './types';
import AdminPanel from './AdminPanel';
import Portfolio from './Portfolio';

// --- THEME DEFINITIONS ---
export const PORTFOLIO_THEMES: PortfolioTheme[] = [
  { id: 'default-light', name: 'Default Light', class: 'theme-default-light', colors: { primary: '#FFFFFF', secondary: '#F9FAFB', accent: '#2563EB', text: '#1F2937' } },
  { id: 'default-dark', name: 'Default Dark', class: 'theme-default-dark', colors: { primary: '#0D1117', secondary: '#161B22', accent: '#58A6FF', text: '#C9D1D9' } },
  { id: 'sunrise', name: 'Sunrise', class: 'theme-sunrise', colors: { primary: '#FFFBF5', secondary: '#FFF7ED', accent: '#F97316', text: '#4C2B0A' } },
  { id: 'oceanic', name: 'Oceanic', class: 'theme-oceanic', colors: { primary: '#F0F9FF', secondary: '#E0F2FE', accent: '#0EA5E9', text: '#082F49' } },
];

const createLocalizedString = (en: string, id: string): LocalizedString => ({ en, id });

// --- DEFAULT DATA ---
const defaultBioData: BioData = {
    name: createLocalizedString('Kangris Soft', 'Kangris Soft'),
    title: createLocalizedString('Senior Frontend Engineer', 'Insinyur Frontend Senior'),
    email: 'contact@kangrissoft.com',
    phone: '+1 (555) 123-4567',
    whatsapp: '+6281234567890',
    location: 'San Francisco, CA',
    summary: createLocalizedString('A passionate Senior Frontend Engineer with over 10 years of experience in building rich, interactive, and performant web applications. Expertise in React, TypeScript, and modern web technologies. Proven ability to lead projects, mentor junior developers, and collaborate effectively with cross-functional teams to deliver high-quality products.', 'Seorang Insinyur Frontend Senior yang bersemangat dengan pengalaman lebih dari 10 tahun dalam membangun aplikasi web yang kaya, interaktif, dan berkinerja tinggi. Keahlian dalam React, TypeScript, dan teknologi web modern. Kemampuan yang terbukti untuk memimpin proyek, membimbing pengembang junior, dan berkolaborasi secara efektif dengan tim lintas fungsi untuk memberikan produk berkualitas tinggi.'),
    skills: [
        { name: 'React', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'JavaScript', level: 98 },
        { name: 'Tailwind CSS', level: 85 },
        { name: 'Node.js', level: 70 },
        { name: 'UI/UX Design', level: 80 },
    ],
    imageUrl: 'https://picsum.photos/seed/dev1/200/200',
    socialLinks: [
        { platform: 'GitHub', url: 'https://github.com' },
        { platform: 'LinkedIn', url: 'https://linkedin.com' },
        { platform: 'Twitter', url: 'https://x.com' },
    ]
};

const defaultBlogPosts: BlogPost[] = [
    { id: '1', title: createLocalizedString('Deep Dive into React Hooks', 'Mendalami React Hooks'), content: createLocalizedString('In this post, we explore the power and flexibility of React Hooks, covering useState, useEffect, useContext, and custom hooks for cleaner, more reusable component logic.', 'Dalam tulisan ini, kita menjelajahi kekuatan dan fleksibilitas React Hooks, mencakup useState, useEffect, useContext, dan hook kustom untuk logika komponen yang lebih bersih dan dapat digunakan kembali.'), date: '2024-07-15', seoTitle: createLocalizedString('A Comprehensive Guide to React Hooks', 'Panduan Komprehensif tentang React Hooks'), seoDescription: createLocalizedString('Learn everything about React Hooks, from useState and useEffect to custom hooks, to write cleaner and more efficient React components.', 'Pelajari segala sesuatu tentang React Hooks, mulai dari useState dan useEffect hingga hook kustom, untuk menulis komponen React yang lebih bersih dan efisien.'), category: createLocalizedString('React', 'React'), tags: ['hooks', 'frontend', 'javascript'] },
    { id: '2', title: createLocalizedString('Why TypeScript is a Game-Changer for Large-Scale Apps', 'Mengapa TypeScript Mengubah Permainan untuk Aplikasi Skala Besar'), content: createLocalizedString('Discover how TypeScript\'s static typing can prevent common bugs, improve code maintainability, and enhance developer productivity in complex projects.', 'Temukan bagaimana pengetikan statis TypeScript dapat mencegah bug umum, meningkatkan pemeliharaan kode, dan meningkatkan produktivitas pengembang dalam proyek yang kompleks.'), date: '2024-06-28', seoTitle: createLocalizedString('The Benefits of TypeScript in Large-Scale Applications', 'Manfaat TypeScript dalam Aplikasi Skala Besar'), seoDescription: createLocalizedString('An in-depth look at how TypeScript improves code quality, maintainability, and developer experience in enterprise-level projects.', 'Tinjauan mendalam tentang bagaimana TypeScript meningkatkan kualitas kode, pemeliharaan, dan pengalaman pengembang dalam proyek tingkat perusahaan.'), category: createLocalizedString('TypeScript', 'TypeScript'), tags: ['development', 'best-practices'] },
];

const defaultProjects: Project[] = [
    { id: '1', name: createLocalizedString('E-commerce Platform', 'Platform E-commerce'), description: createLocalizedString('A full-stack e-commerce solution with a custom shopping cart, product management, and Stripe integration, built with a React frontend and Node.js backend.', 'Solusi e-commerce tumpukan penuh dengan keranjang belanja khusus, manajemen produk, dan integrasi Stripe, dibangun dengan frontend React dan backend Node.js.'), technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'], link: '#', imageUrl: 'https://picsum.photos/seed/proj1/400/300', altText: createLocalizedString('Screenshot of the E-commerce Platform homepage', 'Tangkapan layar beranda Platform E-commerce') },
    { id: '2', name: createLocalizedString('Data Visualization Dashboard', 'Dasbor Visualisasi Data'), description: createLocalizedString('An interactive dashboard for visualizing complex datasets using D3.js and Recharts, offering real-time data updates and customizable chart views.', 'Dasbor interaktif untuk memvisualisasikan kumpulan data kompleks menggunakan D3.js dan Recharts, menawarkan pembaruan data waktu nyata dan tampilan bagan yang dapat disesuaikan.'), technologies: ['React', 'D3.js', 'Recharts', 'Tailwind CSS'], link: '#', imageUrl: 'https://picsum.photos/seed/proj2/400/300', altText: createLocalizedString('A dashboard showing various charts and graphs', 'Dasbor yang menunjukkan berbagai bagan dan grafik') },
];

const defaultServices: Service[] = [
    { id: '1', name: createLocalizedString('Web Development', 'Pengembangan Web'), description: createLocalizedString('Building responsive, high-performance websites and web applications using modern technologies like React and Next.js.', 'Membangun situs web dan aplikasi web yang responsif dan berkinerja tinggi menggunakan teknologi modern seperti React dan Next.js.'), icon: 'web' },
    { id: '2', name: createLocalizedString('UI/UX Design', 'Desain UI/UX'), description: createLocalizedString('Creating intuitive and visually appealing user interfaces with a focus on user experience and accessibility.', 'Membuat antarmuka pengguna yang intuitif dan menarik secara visual dengan fokus pada pengalaman pengguna dan aksesibilitas.'), icon: 'ui-ux' },
    { id: '3', name: createLocalizedString('Mobile App Development', 'Pengembangan Aplikasi Seluler'), description: createLocalizedString('Developing cross-platform mobile applications for iOS and Android using frameworks like React Native.', 'Mengembangkan aplikasi seluler lintas platform untuk iOS dan Android menggunakan kerangka kerja seperti React Native.'), icon: 'mobile' },
];

const defaultThemeSettings: ThemeSettings = {
    selectedThemeId: 'default-dark',
    autoRotate: false,
};

// --- DATA MIGRATION HELPERS ---
const isLocalizedString = (obj: any): obj is LocalizedString => {
  return typeof obj === 'object' && obj !== null && 'en' in obj && 'id' in obj;
};

const toLocalizedString = (value: any, fallbackId: string = ''): LocalizedString => {
  if (isLocalizedString(value)) return value;
  if (typeof value === 'string') return { en: value, id: fallbackId };
  return { en: '', id: '' };
};

const migrateBioData = (data: any): BioData => ({
  ...data,
  name: toLocalizedString(data.name),
  title: toLocalizedString(data.title),
  summary: toLocalizedString(data.summary),
});

const migrateBlogPosts = (posts: any[]): BlogPost[] => posts.map(post => ({
  ...post,
  title: toLocalizedString(post.title),
  content: toLocalizedString(post.content),
  seoTitle: toLocalizedString(post.seoTitle),
  seoDescription: toLocalizedString(post.seoDescription),
  category: toLocalizedString(post.category),
}));

const migrateProjects = (projects: any[]): Project[] => projects.map(project => ({
  ...project,
  name: toLocalizedString(project.name),
  description: toLocalizedString(project.description),
  altText: toLocalizedString(project.altText),
}));

const migrateServices = (services: any[]): Service[] => services.map(service => ({
  ...service,
  name: toLocalizedString(service.name),
  description: toLocalizedString(service.description),
}));


// Helper function to load state from localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T, migrationFn?: (data: any) => T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      const parsed = JSON.parse(storedValue);
      return migrationFn ? migrationFn(parsed) : parsed;
    }
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
  }
  return defaultValue;
};


const App: React.FC = () => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');

    // --- STATE MANAGEMENT ---
    const [bioData, setBioData] = useState<BioData>(() => {
        const loaded = loadFromLocalStorage<BioData>('portfolio-bioData', defaultBioData, migrateBioData);
        if (!loaded.socialLinks) {
            loaded.socialLinks = defaultBioData.socialLinks || [];
        }
        if (typeof loaded.whatsapp === 'undefined') {
            loaded.whatsapp = defaultBioData.whatsapp || '';
        }
        return loaded;
    });
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => loadFromLocalStorage('portfolio-blogPosts', defaultBlogPosts, migrateBlogPosts));
    const [projects, setProjects] = useState<Project[]>(() => loadFromLocalStorage('portfolio-projects', defaultProjects, migrateProjects));
    const [services, setServices] = useState<Service[]>(() => loadFromLocalStorage('portfolio-services', defaultServices, migrateServices));
    const [theme, setTheme] = useState('dark');
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => loadFromLocalStorage('portfolio-themeSettings', defaultThemeSettings));


    // --- EFFECTS ---
    // Admin Panel Theme initialization effect
    useEffect(() => {
        const savedTheme = localStorage.getItem('admin-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (prefersDark) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }, []);

    // Effect to apply the Admin Panel theme and save it to localStorage
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('admin-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };
    
    // Effects to save main data state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('portfolio-bioData', JSON.stringify(bioData));
    }, [bioData]);

    useEffect(() => {
        localStorage.setItem('portfolio-blogPosts', JSON.stringify(blogPosts));
    }, [blogPosts]);

    useEffect(() => {
        localStorage.setItem('portfolio-projects', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem('portfolio-services', JSON.stringify(services));
    }, [services]);
    
    useEffect(() => {
        localStorage.setItem('portfolio-themeSettings', JSON.stringify(themeSettings));
    }, [themeSettings]);


    if (isAdminRoute) {
        return <AdminPanel
            bioData={bioData}
            setBioData={setBioData}
            blogPosts={blogPosts}
            setBlogPosts={setBlogPosts}
            projects={projects}
            setProjects={setProjects}
            services={services}
            setServices={setServices}
            theme={theme}
            toggleTheme={toggleTheme}
            portfolioThemes={PORTFOLIO_THEMES}
            themeSettings={themeSettings}
            setThemeSettings={setThemeSettings}
        />;
    }

    return <Portfolio
        bioData={bioData}
        blogPosts={blogPosts}
        projects={projects}
        services={services}
        portfolioThemes={PORTFOLIO_THEMES}
        themeSettings={themeSettings}
    />;
};

export default App;