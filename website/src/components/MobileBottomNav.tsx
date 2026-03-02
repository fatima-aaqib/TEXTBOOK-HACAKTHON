import React from 'react';
import Link from '@docusaurus/Link';

const MobileBottomNav = () => {
  return (
    <div 
      className="navbar navbar--fixed-bottom"
      style={{
        display: 'block',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'var(--ifm-navbar-background-color)',
        borderTop: '1px solid var(--ifm-color-emphasis-200)',
        padding: '0.5rem 0',
        minHeight: '60px',
        alignItems: 'center',
        justifyContent: 'space-around',
        display: 'none' // Will be shown on mobile via CSS
      }}
      id="mobile-bottom-nav"
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <Link 
          to="/" 
          className="navbar__item navbar__link"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            minWidth: '60px',
            minHeight: '50px',
            textDecoration: 'none'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>🏠</span>
          <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Home</span>
        </Link>
        
        <Link 
          to="/docs/intro" 
          className="navbar__item navbar__link"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            minWidth: '60px',
            minHeight: '50px',
            textDecoration: 'none'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>📚</span>
          <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Modules</span>
        </Link>
        
        <Link 
          to="/search" 
          className="navbar__item navbar__link"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            minWidth: '60px',
            minHeight: '50px',
            textDecoration: 'none'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Search</span>
        </Link>
        
        <div 
          className="navbar__item navbar__link"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            minWidth: '60px',
            minHeight: '50px',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
          onClick={() => {
            // Toggle sidebar menu
            const sidebar = document.querySelector('.navbar-sidebar');
            if (sidebar) {
              sidebar.classList.toggle('navbar-sidebar--show');
            }
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>☰</span>
          <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Menu</span>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;