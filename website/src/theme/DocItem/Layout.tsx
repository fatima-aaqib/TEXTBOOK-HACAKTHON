import React from 'react';
import OriginalDocItemLayout from '@theme-original/DocItem/Layout';
import ChapterProgress from '@site/src/components/ChapterProgress';
import ChapterNavigation from '@site/src/components/ChapterNavigation';
import QuizComponent from '@site/src/components/QuizComponent';

// Define quiz questions for each chapter (example)
const chapterQuizzes = {
  '01-introduction': [
    {
      id: 1,
      question: "What is the primary purpose of ROS 2?",
      options: [
        "To provide a real-time operating system",
        "To serve as a middleware for robotics applications",
        "To replace all existing robotics frameworks",
        "To provide a programming language for robotics"
      ],
      correctAnswer: 1,
      explanation: "ROS 2 serves as a middleware that provides services designed for a heterogeneous computer cluster, including hardware abstraction, device drivers, libraries, visualizers, message-passing, package management, and more."
    }
  ],
  '02-installation': [
    {
      id: 1,
      question: "Which ROS 2 distribution is recommended for beginners?",
      options: [
        "Rolling Ridley",
        "Humble Hawksbill",
        "Foxy Fitzroy",
        "Galactic Geochelone"
      ],
      correctAnswer: 1,
      explanation: "Humble Hawksbill is an LTS (Long Term Support) version that is recommended for beginners due to its stability and long-term support."
    }
  ]
  // Add more quizzes for other chapters as needed
};

const DocItemLayout = (props) => {
  // Extract chapter information from route
  const { route } = props;
  const slug = route?.path || '';
  
  if (!slug) {
    // If no route is available, render the original layout without enhancements
    return <OriginalDocItemLayout {...props} />;
  }
  
  const slugParts = slug.split('/');
  const chapterSlug = slugParts[slugParts.length - 1];
  const moduleName = slugParts[slugParts.length - 2];
  
  // Get module information
  let moduleInfo = {
    title: "Unknown Module",
    totalChapters: 6,
    currentChapterIndex: 1
  };
  
  if (moduleName === 'module-1-ros2') {
    moduleInfo = {
      title: "ROS 2 Fundamentals",
      totalChapters: 6,
      currentChapterIndex: parseInt(chapterSlug.match(/^\d+/)?.[0] || '1')
    };
  } else if (moduleName === 'module-2-gazebo-unity') {
    moduleInfo = {
      title: "Gazebo & Unity Simulation",
      totalChapters: 6,
      currentChapterIndex: parseInt(chapterSlug.match(/^\d+/)?.[0] || '1')
    };
  } else if (moduleName === 'module-3-isaac') {
    moduleInfo = {
      title: "NVIDIA Isaac Platform",
      totalChapters: 6,
      currentChapterIndex: parseInt(chapterSlug.match(/^\d+/)?.[0] || '1')
    };
  } else if (moduleName === 'module-4-vla') {
    moduleInfo = {
      title: "Vision-Language-Action Models",
      totalChapters: 6,
      currentChapterIndex: parseInt(chapterSlug.match(/^\d+/)?.[0] || '1')
    };
  }
  
  // Determine difficulty based on module and chapter
  const getDifficulty = () => {
    if (moduleInfo.currentChapterIndex <= 2) return 'Beginner';
    if (moduleInfo.currentChapterIndex <= 4) return 'Intermediate';
    return 'Advanced';
  };
  
  // Get quiz for current chapter if available
  const quizQuestions = chapterQuizzes[chapterSlug] || [];
  
  // Generate navigation links
  const getNextChapterPath = () => {
    if (moduleInfo.currentChapterIndex < moduleInfo.totalChapters) {
      const nextIndex = moduleInfo.currentChapterIndex + 1;
      const nextSlug = `${String(nextIndex).padStart(2, '0')}-${chapterSlug.substring(3)}`;
      return `/docs/${moduleName}/${nextSlug}`;
    }
    return null;
  };
  
  const getPrevChapterPath = () => {
    if (moduleInfo.currentChapterIndex > 1) {
      const prevIndex = moduleInfo.currentChapterIndex - 1;
      const prevSlug = `${String(prevIndex).padStart(2, '0')}-${chapterSlug.substring(3)}`;
      return `/docs/${moduleName}/${prevSlug}`;
    }
    return null;
  };
  
  // Get chapter title from slug
  const chapterTitle = chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <OriginalDocItemLayout {...props}>
      {({ content: DocContent, children }) => (
        <>
          <div className="container margin-vert--lg">
            <div className="row">
              {/* Sidebar for larger screens, collapsible on mobile */}
              <div className="col col--3" style={{ display: 'none' }} id="sidebar-left">
                {/* Progress Tracker */}
                <ChapterProgress 
                  currentChapter={chapterTitle}
                  totalChapters={moduleInfo.totalChapters}
                  completedChapters={moduleInfo.currentChapterIndex - 1}
                  estimatedReadingTime="15-30 min"
                  difficulty={getDifficulty()}
                />
                
                {/* Table of Contents */}
                <div className="card margin-bottom--lg" style={{ border: '1px solid var(--ifm-color-emphasis-200)' }}>
                  <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                      Chapter Contents
                    </h3>
                  </div>
                  <div className="card__body" style={{ padding: '1rem' }}>
                    <ul style={{ paddingLeft: '1.25rem' }}>
                      <li>No table of contents available</li>
                    </ul>
                  </div>
                </div>
                
                {/* Related Resources */}
                <div className="card" style={{ border: '1px solid var(--ifm-color-emphasis-200)' }}>
                  <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                      Resources
                    </h3>
                  </div>
                  <div className="card__body" style={{ padding: '1rem' }}>
                    <ul style={{ paddingLeft: '1.25rem' }}>
                      <li><a href="/resources" style={{ color: 'var(--ifm-color-primary)' }}>Course Materials</a></li>
                      <li><a href="/resources" style={{ color: 'var(--ifm-color-primary)' }}>Code Examples</a></li>
                      <li><a href="/resources" style={{ color: 'var(--ifm-color-primary)' }}>Simulation Assets</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="col col--6 col--offset-3 col--offset-0" style={{ width: '100%' }} id="main-content">
                {/* Mobile TOC Button */}
                <div className="margin-bottom--lg" style={{ display: 'block', textAlign: 'center' }}>
                  <button 
                    className="button button--secondary button--sm"
                    style={{ display: 'inline-block', margin: '0.5rem' }}
                    onClick={() => {
                      const sidebar = document.getElementById('sidebar-left');
                      const mainContent = document.getElementById('main-content');
                      if (sidebar && mainContent) {
                        if (sidebar.style.display === 'none') {
                          sidebar.style.display = 'block';
                          mainContent.className = 'col col--6 col--offset-3';
                        } else {
                          sidebar.style.display = 'none';
                          mainContent.className = 'col col--6 col--offset-0';
                        }
                      }
                    }}
                  >
                    ☰ Table of Contents
                  </button>
                  <button 
                    className="button button--secondary button--sm"
                    style={{ display: 'inline-block', margin: '0.5rem' }}
                    onClick={() => {
                      const sidebar = document.getElementById('sidebar-right');
                      if (sidebar) {
                        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                  >
                    ≡ Chapter Tools
                  </button>
                </div>
                
                {/* Main content */}
                {children}
                
                {/* Quiz if available */}
                {quizQuestions.length > 0 && (
                  <QuizComponent questions={quizQuestions} />
                )}
              </div>
              
              {/* Right sidebar for larger screens, collapsible on mobile */}
              <div className="col col--3" style={{ display: 'none' }} id="sidebar-right">
                {/* Chapter Navigation */}
                <ChapterNavigation 
                  previousChapter={getPrevChapterPath() ? {
                    title: `Chapter ${moduleInfo.currentChapterIndex - 1}`,
                    path: getPrevChapterPath()
                  } : undefined}
                  nextChapter={getNextChapterPath() ? {
                    title: `Chapter ${moduleInfo.currentChapterIndex + 1}`,
                    path: getNextChapterPath()
                  } : undefined}
                />
                
                {/* Learning Objectives */}
                <div className="card margin-bottom--lg" style={{ border: '1px solid var(--ifm-color-emphasis-200)' }}>
                  <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                      Objectives
                    </h3>
                  </div>
                  <div className="card__body" style={{ padding: '1rem' }}>
                    <ul style={{ paddingLeft: '1.25rem' }}>
                      <li>Understand the key concepts</li>
                    </ul>
                  </div>
                </div>
                
                {/* Key Terms */}
                <div className="card" style={{ border: '1px solid var(--ifm-color-emphasis-200)' }}>
                  <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                      Key Terms
                    </h3>
                  </div>
                  <div className="card__body" style={{ padding: '1rem' }}>
                    <ul style={{ paddingLeft: '1.25rem' }}>
                      <li>No key terms defined</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </OriginalDocItemLayout>
  );
};

export default DocItemLayout;