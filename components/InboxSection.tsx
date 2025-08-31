
import React, { useState, useEffect } from 'react';
import type { ContactSubmission } from '../types';
import { XIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

const InboxSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  
  useEffect(() => {
    try {
      const storedSubmissions = localStorage.getItem('portfolio-contactSubmissions');
      if (storedSubmissions) {
        const parsed = JSON.parse(storedSubmissions);
        // Sort by most recent first
        parsed.sort((a: ContactSubmission, b: ContactSubmission) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setSubmissions(parsed);
      }
    } catch (error) {
      console.error("Error loading contact submissions:", error);
    }
  }, []);

  const handleDelete = (submittedAt: string) => {
    if (window.confirm(t('confirmDeleteMessage'))) {
      const updatedSubmissions = submissions.filter(s => s.submittedAt !== submittedAt);
      localStorage.setItem('portfolio-contactSubmissions', JSON.stringify(updatedSubmissions));
      setSubmissions(updatedSubmissions);
    }
  };

  const formatDate = (dateString: string) => {
      const locale = language === 'id' ? 'id-ID' : 'en-US';
      return new Date(dateString).toLocaleString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      });
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-dark-border-color rounded-lg p-6 shadow-lg">
      <h2 className="text-3xl font-bold mb-6">{t('inboxTitle')}</h2>
      {submissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-100 dark:bg-dark-highlight">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-dark-text-secondary">{t('date')}</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-dark-text-secondary">{t('name')}</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-dark-text-secondary">{t('email')}</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-dark-text-secondary">{t('message')}</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-dark-text-secondary">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border-color">
              {submissions.map((submission) => (
                <tr key={submission.submittedAt} className="hover:bg-gray-100 dark:hover:bg-dark-highlight">
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-dark-text-secondary whitespace-nowrap">{formatDate(submission.submittedAt)}</td>
                  <td className="px-4 py-4 text-sm text-gray-800 dark:text-dark-text-primary font-medium">{submission.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-dark-text-secondary">
                    <a href={`mailto:${submission.email}`} className="text-blue-600 dark:text-dark-accent hover:underline">{submission.email}</a>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-dark-text-secondary max-w-sm truncate" title={submission.message}>
                    {submission.message}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <button
                      onClick={() => handleDelete(submission.submittedAt)}
                      className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-500/10"
                      aria-label="Delete message"
                    >
                      <XIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-dark-text-secondary py-16">
          <p className="text-lg">{t('inboxEmpty')}</p>
          <p>{t('inboxEmptyDescription')}</p>
        </div>
      )}
    </div>
  );
};

export default InboxSection;
