import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function Curriculum(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();

  // Curriculum data
  const modules = [
    {
      id: 1,
      title: "ROS 2 Fundamentals",
      description: "Master Robot Operating System 2, the industry-standard middleware for robotics.",
      duration: "4 weeks",
      difficulty: "Beginner",
      chapters: [
        { number: "01", title: "Introduction to ROS 2", duration: "2 hours" },
        { number: "02", title: "Installation and Setup", duration: "3 hours" },
        { number: "03", title: "ROS 2 Architecture", duration: "4 hours" },
        { number: "04", title: "URDF for Humanoids", duration: "5 hours" },
        { number: "05", title: "ROS 2 Python API", duration: "6 hours" },
        { number: "06", title: "Advanced ROS 2", duration: "5 hours" },
      ],
      color: "bg-blue-500",
      icon: "🤖"
    },
    {
      id: 2,
      title: "Gazebo & Unity Simulation",
      description: "Create realistic robot simulations using Gazebo Classic, Gazebo Fortress, and Unity.",
      duration: "5 weeks",
      difficulty: "Intermediate",
      chapters: [
        { number: "01", title: "Introduction to Robot Simulation", duration: "2 hours" },
        { number: "02", title: "Physics Simulation in Gazebo", duration: "3 hours" },
        { number: "03", title: "High-Fidelity Simulation with Unity", duration: "4 hours" },
        { number: "04", title: "Practical Project", duration: "5 hours" },
        { number: "05", title: "Unity Integration", duration: "6 hours" },
        { number: "06", title: "Digital Twin Projects", duration: "7 hours" },
      ],
      color: "bg-purple-500",
      icon: "🎮"
    },
    {
      id: 3,
      title: "NVIDIA Isaac Platform",
      description: "Leverage NVIDIA Isaac Sim and Isaac SDK for cutting-edge robot simulation.",
      duration: "6 weeks",
      difficulty: "Advanced",
      chapters: [
        { number: "01", title: "Introduction to NVIDIA Isaac", duration: "2 hours" },
        { number: "02", title: "Isaac ROS Perception", duration: "4 hours" },
        { number: "03", title: "Navigation with Nav2", duration: "5 hours" },
        { number: "04", title: "Training in Simulation", duration: "6 hours" },
        { number: "05", title: "Reinforcement Learning", duration: "7 hours" },
        { number: "06", title: "Sim-to-Real", duration: "8 hours" },
      ],
      color: "bg-indigo-500",
      icon: "⚡"
    },
    {
      id: 4,
      title: "Vision-Language-Action Models",
      description: "Explore state-of-the-art VLA models for embodied AI and humanoid robotics.",
      duration: "6 weeks",
      difficulty: "Expert",
      chapters: [
        { number: "01", title: "Introduction to VLA Models", duration: "3 hours" },
        { number: "02", title: "Voice Interface with Whisper", duration: "4 hours" },
        { number: "03", title: "LLM Planning & Reasoning", duration: "5 hours" },
        { number: "04", title: "ROS2 Actions", duration: "5 hours" },
        { number: "05", title: "Multimodal AI", duration: "6 hours" },
        { number: "06", title: "Capstone Project", duration: "10 hours" },
      ],
      color: "bg-pink-500",
      icon: "🧠"
    }
  ];

  // Learning outcomes
  const outcomes = [
    {
      category: "Technical Skills",
      items: [
        "Proficiency in ROS 2 development",
        "Robot simulation and testing",
        "AI/ML integration in robotics",
        "Hardware integration techniques"
      ]
    },
    {
      category: "AI Knowledge",
      items: [
        "Computer vision for robotics",
        "Natural language processing",
        "Reinforcement learning",
        "Embodied AI concepts"
      ]
    },
    {
      category: "Industry Readiness",
      items: [
        "Real-world project experience",
        "Simulation-to-reality transfer",
        "Professional development practices",
        "Team collaboration skills"
      ]
    }
  ];

  return (
    <Layout
      title={`Curriculum - ${siteConfig.title}`}
      description="Detailed course outline for Physical AI & Humanoid Robotics">
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
                  Complete Curriculum
                </Heading>
                <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
                  Structured learning paths from fundamentals to advanced concepts
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="margin-vert--xl padding-vert--lg">
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2">
                <div className="text--center margin-bottom--xl">
                  <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                    Learning Path Overview
                  </Heading>
                  <p style={{ fontSize: '1.25rem', color: 'var(--ifm-font-color-secondary)' }}>
                    Our comprehensive curriculum spans 24 chapters across 4 core modules, 
                    designed to take you from beginner to expert in Physical AI and Humanoid Robotics.
                  </p>
                </div>
              </div>
            </div>

            <div className="row">
              {modules.map((module) => (
                <div key={module.id} className="col col--12 col--md-6 margin-bottom--lg curriculum-module-card">
                  <div className="card" style={{ height: '100%', border: '1px solid var(--ifm-color-emphasis-200)' }}>
                    <div
                      className="card__header"
                      style={{
                        backgroundColor: 'var(--ifm-color-primary)',
                        color: 'white',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginRight: '1rem' }}>{module.icon}</div>
                      <div>
                        <Heading as="h3" style={{ margin: 0, fontSize: '1.5rem' }}>
                          Module {module.id}: {module.title}
                        </Heading>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                          <span>{module.duration}</span>
                          <span>•</span>
                          <span>{module.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card__body" style={{ padding: '1.5rem' }}>
                      <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', color: 'var(--ifm-font-color-base)' }}>
                        {module.description}
                      </p>

                      <div>
                        <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>Chapters:</h4>
                        <ul style={{ paddingLeft: '1.25rem' }}>
                          {module.chapters.map((chapter, idx) => (
                            <li key={idx} style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>
                              <strong>{chapter.number}.</strong> {chapter.title}
                              <span style={{ float: 'right', color: 'var(--ifm-color-primary)' }}>
                                {chapter.duration}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="card__footer" style={{ padding: '0 1.5rem 1.5rem' }}>
                      <Link
                        className="button button--primary button--block"
                        to={`/docs/module-${module.id}-ros2/${module.id === 1 ? '01-introduction' : module.id === 2 ? '01-introduction-to-robot-simulation' : module.id === 3 ? '01-introduction-to-nvidia-isaac' : '01-introduction-to-vla-models'}`}
                      >
                        Start Module
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="margin-vert--xl padding-vert--lg" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)' }}>
          <div className="container">
            <div className="text--center margin-bottom--xl">
              <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                Learning Outcomes
              </Heading>
              <p style={{ fontSize: '1.25rem', color: 'var(--ifm-font-color-secondary)' }}>
                What you'll achieve by completing this curriculum
              </p>
            </div>

            <div className="row">
              {outcomes.map((outcome, idx) => (
                <div key={idx} className="col col--12 col--md-4 margin-bottom--lg">
                  <div className="card" style={{ height: '100%', border: '1px solid var(--ifm-color-emphasis-200)' }}>
                    <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1.5rem' }}>
                      <Heading as="h3" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--ifm-color-primary)' }}>
                        {outcome.category}
                      </Heading>
                    </div>
                    <div className="card__body" style={{ padding: '1.5rem' }}>
                      <ul style={{ paddingLeft: '1.25rem' }}>
                        {outcome.items.map((item, itemIdx) => (
                          <li key={itemIdx} style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="margin-vert--xl padding-vert--lg">
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <div className="text--center margin-bottom--xl">
                  <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                    Course Structure
                  </Heading>
                  <p style={{ fontSize: '1.25rem', color: 'var(--ifm-font-color-secondary)' }}>
                    Flexible learning paths designed for different backgrounds and goals
                  </p>
                </div>

                <div className="row">
                  <div className="col col--12 col--md-6 margin-bottom--lg">
                    <div className="card" style={{ height: '100%', border: '1px solid var(--ifm-color-emphasis-200)' }}>
                      <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1.5rem' }}>
                        <Heading as="h3" style={{ margin: 0, fontSize: '1.5rem' }}>
                          Full Program Track
                        </Heading>
                      </div>
                      <div className="card__body" style={{ padding: '1.5rem' }}>
                        <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                          Complete all 4 modules over 21 weeks for comprehensive mastery of Physical AI and Humanoid Robotics.
                        </p>
                        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                          <li style={{ marginBottom: '0.5rem' }}>Estimated time commitment: 6-8 hours per week</li>
                          <li style={{ marginBottom: '0.5rem' }}>Access to all course materials and projects</li>
                          <li style={{ marginBottom: '0.5rem' }}>Certificate of completion</li>
                          <li>Personalized feedback on projects</li>
                        </ul>
                        <Link
                          className="button button--primary button--lg button--block"
                          to="/docs/intro"
                          style={{ fontWeight: 'bold' }}
                        >
                          Enroll in Full Program
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col col--12 col--md-6">
                    <div className="card" style={{ height: '100%', border: '1px solid var(--ifm-color-emphasis-200)' }}>
                      <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1.5rem' }}>
                        <Heading as="h3" style={{ margin: 0, fontSize: '1.5rem' }}>
                          Module-Based Learning
                        </Heading>
                      </div>
                      <div className="card__body" style={{ padding: '1.5rem' }}>
                        <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                          Take individual modules based on your specific interests and career goals.
                        </p>
                        <ul style={{ paddingLeft: '1.5rem' }}>
                          <li style={{ marginBottom: '0.5rem' }}>Focus on specific areas of robotics</li>
                          <li style={{ marginBottom: '0.5rem' }}>Flexible scheduling</li>
                          <li style={{ marginBottom: '0.5rem' }}>Modular certificates available</li>
                          <li>Build on your existing knowledge</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="margin-vert--xl padding-vert--lg" style={{ backgroundColor: 'var(--ifm-color-primary)', color: 'white' }}>
          <div className="container">
            <div className="row">
              <div className="col col--12 text--center">
                <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Ready to Start Learning?
                </Heading>
                <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem' }}>
                  Join thousands of students advancing their robotics careers
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
                  Begin Your Journey
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}