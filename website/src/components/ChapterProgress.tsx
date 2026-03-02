import React, { useState, useEffect } from 'react';

interface ChapterProgressProps {
  currentChapter: string;
  totalChapters: number;
  completedChapters: number;
  estimatedReadingTime?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

const ChapterProgress: React.FC<ChapterProgressProps> = ({
  currentChapter,
  totalChapters,
  completedChapters,
  estimatedReadingTime = '15-30 min',
  difficulty = 'Intermediate'
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate progress percentage
    const calculatedProgress = Math.round((completedChapters / totalChapters) * 100);
    setProgress(calculatedProgress);
  }, [completedChapters, totalChapters]);

  // Determine difficulty color
  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-orange-500';
      case 'Expert': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="card margin-bottom--lg" style={{ border: '1px solid var(--ifm-color-emphasis-200)' }}>
      <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
          Chapter Progress
        </h3>
      </div>
      <div className="card__body" style={{ padding: '1.5rem' }}>
        <div className="margin-bottom--md">
          <div className="progress-bar" style={{ 
            height: '10px', 
            backgroundColor: 'var(--ifm-color-emphasis-200)', 
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div 
              className="progress-bar-fill" 
              style={{ 
                height: '100%', 
                width: `${progress}%`,
                backgroundColor: 'var(--ifm-color-primary)',
                transition: 'width 0.3s ease'
              }}
            ></div>
          </div>
          <div className="progress-text" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '0.5rem',
            fontSize: '0.9rem',
            color: 'var(--ifm-color-content-secondary)'
          }}>
            <span>{completedChapters} of {totalChapters} chapters completed</span>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="chapter-info" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-content-secondary)', marginBottom: '0.25rem' }}>Current Chapter</div>
            <div style={{ fontWeight: '500' }}>{currentChapter}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-content-secondary)', marginBottom: '0.25rem' }}>Reading Time</div>
            <div style={{ fontWeight: '500' }}>{estimatedReadingTime}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-content-secondary)', marginBottom: '0.25rem' }}>Difficulty</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`${getDifficultyColor()}`} style={{ 
                display: 'inline-block', 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%',
                verticalAlign: 'middle'
              }}></span>
              <span style={{ fontWeight: '500' }}>{difficulty}</span>
            </div>
          </div>
        </div>

        <div className="actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="button button--sm button--outline"
            style={{ flex: 1, minWidth: '120px' }}
          >
            Bookmark
          </button>
          <button 
            className="button button--sm button--outline"
            style={{ flex: 1, minWidth: '120px' }}
          >
            Notes
          </button>
          <button 
            className="button button--sm button--outline"
            style={{ flex: 1, minWidth: '120px' }}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterProgress;