import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function About(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`About - ${siteConfig.title}`}
      description="Learn about our mission to advance robotics education">
      <main>
        <section 
          style={{
            backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            padding: '6rem 0',
          }}
        >
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2 text--center">
                <Heading as="h1" style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
                  About Our Mission
                </Heading>
                <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
                  Advancing robotics education for the next generation of engineers
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="margin-vert--xl padding-vert--lg">
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2">
                <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
                  Our Story
                </Heading>
                <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'var(--ifm-font-color-secondary)', textAlign: 'center' }}>
                  Founded with the vision of democratizing access to cutting-edge robotics education, our platform brings together 
                  industry experts, academic researchers, and passionate educators to create the most comprehensive learning 
                  resource for Physical AI and Humanoid Robotics.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="margin-vert--xl" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)' }}>
          <div className="container padding-vert--xl">
            <div className="row">
              <div className="col col--4 margin-bottom--lg">
                <div className="text--center padding-horiz--md">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                  <Heading as="h3" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    Our Mission
                  </Heading>
                  <p style={{ lineHeight: '1.6', color: 'var(--ifm-font-color-secondary)' }}>
                    To empower engineers and researchers worldwide with the knowledge and skills needed to develop the next generation of intelligent, autonomous robotic systems.
                  </p>
                </div>
              </div>
              <div className="col col--4 margin-bottom--lg">
                <div className="text--center padding-horiz--md">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔭</div>
                  <Heading as="h3" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    Our Vision
                  </Heading>
                  <p style={{ lineHeight: '1.6', color: 'var(--ifm-font-color-secondary)' }}>
                    A world where advanced robotics technology is accessible to everyone, enabling breakthrough innovations that benefit humanity.
                  </p>
                </div>
              </div>
              <div className="col col--4 margin-bottom--lg">
                <div className="text--center padding-horiz--md">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
                  <Heading as="h3" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    Our Values
                  </Heading>
                  <p style={{ lineHeight: '1.6', color: 'var(--ifm-font-color-secondary)' }}>
                    Excellence, accessibility, collaboration, and ethical development of AI-powered robotic systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="margin-vert--xl padding-vert--lg">
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2">
                <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
                  Meet Our Team
                </Heading>
                
                <div className="row">
                  <div className="col col--4 margin-bottom--lg">
                    <div className="card text--center" style={{ padding: '2rem' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍💻</div>
                      <Heading as="h3" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                        Dr. Sarah Mitchell
                      </Heading>
                      <div style={{ color: 'var(--ifm-color-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Chief Technology Officer
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)' }}>
                        Former lead researcher at Boston Dynamics, specializing in humanoid locomotion.
                      </p>
                    </div>
                  </div>
                  
                  <div className="col col--4 margin-bottom--lg">
                    <div className="card text--center" style={{ padding: '2rem' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👩‍🔬</div>
                      <Heading as="h3" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                        Prof. James Chen
                      </Heading>
                      <div style={{ color: 'var(--ifm-color-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Academic Director
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)' }}>
                        Professor of Robotics at Stanford, pioneer in embodied AI research.
                      </p>
                    </div>
                  </div>
                  
                  <div className="col col--4 margin-bottom--lg">
                    <div className="card text--center" style={{ padding: '2rem' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍💼</div>
                      <Heading as="h3" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                        Maria Rodriguez
                      </Heading>
                      <div style={{ color: 'var(--ifm-color-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Education Director
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)' }}>
                        Former curriculum designer at Carnegie Mellon, expert in STEM education.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="margin-vert--xl" style={{ backgroundColor: 'var(--ifm-color-primary)', color: 'white' }}>
          <div className="container padding-vert--xl">
            <div className="row">
              <div className="col col--8 col--offset-2 text--center">
                <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Join Our Community
                </Heading>
                <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem' }}>
                  Become part of a global network of robotics enthusiasts and professionals
                </p>
                <Link
                  className="button button--secondary button--lg"
                  to="/docs/intro"
                  style={{
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: 'var(--ifm-color-primary)',
                  }}
                >
                  Start Learning Today
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}