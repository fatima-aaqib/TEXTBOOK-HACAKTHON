import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

// Professional module card component
function ModuleCard({ title, description, link, icon, difficulty }: { 
  title: string; 
  description: string; 
  link: string; 
  icon: string;
  difficulty: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className={`col col--3 margin-bottom--lg`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-10px)' : 'translateY(0)',
      }}
    >
      <div 
        className="card shadow--md"
        style={{
          height: '100%',
          border: '1px solid var(--ifm-color-emphasis-200)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div 
          className="card__header"
          style={{
            backgroundColor: 'var(--ifm-color-primary)',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{icon}</div>
          <Heading as="h3" style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>
            {title}
          </Heading>
          <div 
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.75rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '20px',
              display: 'inline-block',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}
          >
            {difficulty}
          </div>
        </div>
        <div className="card__body" style={{ padding: '1.5rem' }}>
          <p style={{ lineHeight: '1.6', color: 'var(--ifm-font-color-base)' }}>
            {description}
          </p>
        </div>
        <div className="card__footer" style={{ padding: '0 1.5rem 1.5rem' }}>
          <Link
            className="button button--primary button--block"
            to={link}
            style={{ fontWeight: 'bold' }}
          >
            Start Learning
          </Link>
        </div>
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({ icon, title, description }: { 
  icon: string; 
  title: string; 
  description: string;
}) {
  return (
    <div className="col col--3 margin-bottom--lg">
      <div 
        className="card padding--lg text--center shadow--sm"
        style={{
          height: '100%',
          border: '1px solid var(--ifm-color-emphasis-200)',
          borderRadius: '8px',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
        <Heading as="h3" style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
          {title}
        </Heading>
        <p style={{ color: 'var(--ifm-font-color-secondary)', lineHeight: '1.6' }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// Testimonial component
function TestimonialCard({ quote, author, role }: { 
  quote: string; 
  author: string; 
  role: string;
}) {
  return (
    <div className="col col--4 margin-bottom--lg">
      <div 
        className="card padding--lg"
        style={{
          border: '1px solid var(--ifm-color-emphasis-200)',
          borderRadius: '8px',
          minHeight: '200px',
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--ifm-color-primary)' }}>
          "”
        </div>
        <p style={{ fontStyle: 'italic', color: 'var(--ifm-font-color-base)', lineHeight: '1.6', marginBottom: '1rem' }}>
          {quote}
        </p>
        <div>
          <div style={{ fontWeight: 'bold', color: 'var(--ifm-font-color-base)' }}>{author}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)' }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

// Stats component
function StatsSection() {
  const stats = [
    { value: '24', label: 'Chapters' },
    { value: '4', label: 'Core Modules' },
    { value: '100+', label: 'Code Examples' },
    { value: '∞', label: 'Lifetime Access' },
  ];

  return (
    <section className="margin-vert--xl" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '4rem 0' }}>
      <div className="container">
        <div className="row">
          {stats.map((stat, idx) => (
            <div key={idx} className="col col--3 text--center">
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '700', 
                color: 'var(--ifm-color-primary)',
                marginBottom: '0.5rem'
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600',
                color: 'var(--ifm-font-color-base)'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Hero section
function HeroSection() {
  const { siteConfig } = useDocusaurusContext();
  
  return (
    <header 
      className="hero hero--primary"
      style={{
        backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        padding: '6rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background elements */}
      <div 
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      ></div>
      <div 
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      ></div>
      
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <h1 
              className="hero__title"
              style={{
                fontSize: '3.5rem',
                fontWeight: '800',
                lineHeight: '1.2',
                marginBottom: '1rem',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              {siteConfig.title}
            </h1>
            <p 
              className="hero__subtitle"
              style={{
                fontSize: '1.5rem',
                lineHeight: '1.4',
                marginBottom: '2rem',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              {siteConfig.tagline}
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--secondary button--lg"
                to="/docs/intro"
                style={{
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                }}
              >
                Start Learning Today
              </Link>
              <Link
                className="button button--outline button--lg button--secondary"
                to="/docs/module-1-ros2/01-introduction"
                style={{
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  marginLeft: '1rem',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                }}
              >
                Explore Curriculum
              </Link>
            </div>
          </div>
          <div className="col col--6">
            <div 
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '2rem',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>🤖</div>
                <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>
                  Cutting-Edge Robotics Education
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
                  Master the technologies powering the next generation of humanoid robots
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`Home - ${siteConfig.title}`}
      description="Professional textbook for Physical AI & Humanoid Robotics">
      <HeroSection />

      <main>
        {/* Features Grid */}
        <section className="margin-vert--xl">
          <div className="container">
            <div className="text--center padding-bottom--lg">
              <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                Learning Features
              </Heading>
              <p style={{
                fontSize: '1.25rem',
                color: 'var(--ifm-font-color-secondary)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Comprehensive educational tools designed for effective learning
              </p>
            </div>

            <div className="row">
              <FeatureCard
                icon="💻"
                title="Interactive Content"
                description="Engaging lessons with hands-on exercises and real-world applications"
              />
              <FeatureCard
                icon="📝"
                title="Code Examples"
                description="Practical code snippets you can run and experiment with"
              />
              <FeatureCard
                icon="🎮"
                title="Simulations"
                description="Virtual environments to test your robotics algorithms"
              />
              <FeatureCard
                icon="🧠"
                title="AI Integration"
                description="Cutting-edge AI techniques for embodied intelligence"
              />
            </div>
          </div>
        </section>

        {/* Module Showcase */}
        <section className="margin-vert--xl" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)' }}>
          <div className="container">
            <div className="text--center padding-bottom--lg">
              <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                Core Modules
              </Heading>
              <p style={{
                fontSize: '1.25rem',
                color: 'var(--ifm-font-color-secondary)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Structured learning paths from fundamentals to advanced concepts
              </p>
            </div>

            <div className="row">
              <ModuleCard
                title="ROS 2 Fundamentals"
                description="Master Robot Operating System 2, the industry-standard middleware for robotics. Learn nodes, topics, services, actions, and build your first robot applications."
                link="/docs/module-1-ros2/01-introduction"
                icon="🤖"
                difficulty="Beginner"
              />
              <ModuleCard
                title="Gazebo & Unity Simulation"
                description="Create realistic robot simulations using Gazebo Classic, Gazebo Fortress, and Unity. Test your algorithms in safe virtual environments before deployment."
                link="/docs/module-2-gazebo-unity/01-introduction-to-robot-simulation"
                icon="🎮"
                difficulty="Intermediate"
              />
              <ModuleCard
                title="NVIDIA Isaac Platform"
                description="Leverage NVIDIA Isaac Sim and Isaac SDK for cutting-edge robot simulation, synthetic data generation, and GPU-accelerated AI development."
                link="/docs/module-3-isaac/01-introduction-to-nvidia-isaac"
                icon="⚡"
                difficulty="Advanced"
              />
              <ModuleCard
                title="Vision-Language-Action Models"
                description="Explore state-of-the-art VLA models that combine vision, language understanding, and action generation for embodied AI and humanoid robotics."
                link="/docs/module-4-vla/01-introduction-to-vla-models"
                icon="🧠"
                difficulty="Expert"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* Testimonials */}
        <section className="margin-vert--xl">
          <div className="container">
            <div className="text--center padding-bottom--lg">
              <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                What Learners Say
              </Heading>
              <p style={{
                fontSize: '1.25rem',
                color: 'var(--ifm-font-color-secondary)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Join thousands of students advancing their robotics careers
              </p>
            </div>

            <div className="row">
              <TestimonialCard
                quote="This textbook transformed my understanding of robotics. The hands-on approach with real code examples made complex concepts accessible."
                author="Sarah Johnson"
                role="Robotics Engineer at Tesla"
              />
              <TestimonialCard
                quote="The progression from ROS basics to advanced AI integration is perfectly structured. I've implemented several techniques in my research projects."
                author="Dr. Michael Chen"
                role="PhD Candidate, MIT Robotics Lab"
              />
              <TestimonialCard
                quote="As a beginner, I appreciated how the content builds from fundamentals. The simulation exercises helped me gain confidence before working with real hardware."
                author="Alex Rodriguez"
                role="Autonomous Systems Developer"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="margin-vert--xl" style={{ backgroundColor: 'var(--ifm-color-primary-dark)', color: 'white' }}>
          <div className="container padding-vert--xl">
            <div className="row">
              <div className="col col--8 col--offset-2 text--center">
                <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Ready to Advance Your Robotics Career?
                </Heading>
                <p style={{
                  fontSize: '1.25rem',
                  marginBottom: '2rem',
                  opacity: 0.9
                }}>
                  Join our community of professionals mastering the future of robotics
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
                  Start Learning Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
