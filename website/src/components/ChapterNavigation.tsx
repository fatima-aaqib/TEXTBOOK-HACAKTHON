import React from 'react';
import Link from '@docusaurus/Link';

interface ChapterNavigationProps {
  previousChapter?: {
    title: string;
    path: string;
  };
  nextChapter?: {
    title: string;
    path: string;
  };
}

const ChapterNavigation: React.FC<ChapterNavigationProps> = ({ 
  previousChapter, 
  nextChapter 
}) => {
  return (
    <div className="card margin-bottom--lg" style={{ border: '1px solid var(--ifm-color-emphasis-200)' }}>
      <div className="card__body" style={{ padding: '1.5rem' }}>
        <div className="chapter-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            {previousChapter ? (
              <Link 
                to={previousChapter.path}
                style={{
                  display: 'block',
                  padding: '1rem',
                  border: '1px solid var(--ifm-color-emphasis-200)',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: 'var(--ifm-font-color-base)',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-200)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-content-secondary)', marginBottom: '0.25rem' }}>
                  ← Previous
                </div>
                <div style={{ fontWeight: '500' }}>{previousChapter.title}</div>
              </Link>
            ) : (
              <div 
                style={{
                  padding: '1rem',
                  border: '1px dashed var(--ifm-color-emphasis-200)',
                  borderRadius: '0.5rem',
                  color: 'var(--ifm-color-content-secondary)',
                  opacity: 0.6
                }}
              >
                ← First Chapter
              </div>
            )}
          </div>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Link 
              to="/docs/intro"
              className="button button--outline button--sm"
              style={{ margin: '0 auto' }}
            >
              Contents
            </Link>
          </div>
          
          <div style={{ flex: 1 }}>
            {nextChapter ? (
              <Link 
                to={nextChapter.path}
                style={{
                  display: 'block',
                  padding: '1rem',
                  border: '1px solid var(--ifm-color-emphasis-200)',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: 'var(--ifm-font-color-base)',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-200)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-content-secondary)', marginBottom: '0.25rem', textAlign: 'right' }}>
                  Next →
                </div>
                <div style={{ fontWeight: '500', textAlign: 'right' }}>{nextChapter.title}</div>
              </Link>
            ) : (
              <div 
                style={{
                  padding: '1rem',
                  border: '1px dashed var(--ifm-color-emphasis-200)',
                  borderRadius: '0.5rem',
                  color: 'var(--ifm-color-content-secondary)',
                  opacity: 0.6,
                  textAlign: 'right'
                }}
              >
                Last Chapter →
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterNavigation;