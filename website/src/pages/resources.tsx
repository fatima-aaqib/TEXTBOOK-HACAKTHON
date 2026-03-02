import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function Resources(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();

  // Educational resources
  const educationalResources = [
    {
      title: "Documentation",
      description: "Comprehensive guides and API references for all modules",
      items: [
        { name: "Getting Started Guide", link: "/docs/intro", icon: "📖" },
        { name: "ROS 2 Tutorials", link: "/docs/category/ros-2-fundamentals", icon: "🤖" },
        { name: "Simulation Guide", link: "/docs/category/gazebo--unity-simulation", icon: "🎮" },
        { name: "Isaac Platform", link: "/docs/category/nvidia-isaac-platform", icon: "⚡" },
        { name: "VLA Models", link: "/docs/category/vision-language-action-models", icon: "🧠" },
      ]
    },
    {
      title: "Code Examples",
      description: "Sample projects and code snippets for hands-on learning",
      items: [
        { name: "ROS 2 Examples", link: "/docs/module-1-ros2/examples", icon: "💻" },
        { name: "Simulation Projects", link: "/docs/module-2-gazebo-unity/projects", icon: "🏗️" },
        { name: "Isaac Demos", link: "/docs/module-3-isaac/demos", icon: "🎯" },
        { name: "VLA Implementations", link: "/docs/module-4-vla/implementations", icon: "🔬" },
      ]
    },
    {
      title: "Research Papers",
      description: "Academic papers and publications referenced in the curriculum",
      items: [
        { name: "Humanoid Robotics", link: "#", icon: "📚" },
        { name: "Embodied AI", link: "#", icon: "🧠" },
        { name: "ROS 2 Framework", link: "#", icon: "🔗" },
        { name: "Simulation Methods", link: "#", icon: "🧪" },
      ]
    }
  ];

  // Community resources
  const communityResources = [
    {
      title: "Community",
      description: "Connect with fellow learners and experts",
      items: [
        { name: "Discord Community", link: "https://discord.gg/physical-ai", icon: "💬" },
        { name: "GitHub Discussions", link: "https://github.com/your-org/sp.Physical-AI-Book/discussions", icon: "🐙" },
        { name: "Stack Overflow", link: "https://stackoverflow.com/questions/tagged/physical-ai", icon: "❓" },
        { name: "Weekly Meetups", link: "#", icon: "👥" },
      ]
    },
    {
      title: "Support",
      description: "Get help when you need it",
      items: [
        { name: "FAQ", link: "/contact", icon: "❓" },
        { name: "Troubleshooting", link: "/docs/troubleshooting", icon: "🔧" },
        { name: "Office Hours", link: "/contact", icon: "⏰" },
        { name: "Technical Support", link: "/contact", icon: "🛠️" },
      ]
    },
    {
      title: "Events",
      description: "Upcoming workshops, webinars, and conferences",
      items: [
        { name: "Webinar Series", link: "#", icon: "📺" },
        { name: "Hackathons", link: "#", icon: "💻" },
        { name: "Conference Talks", link: "#", icon: "🎤" },
        { name: "Workshops", link: "#", icon: "🎓" },
      ]
    }
  ];

  // Tools and utilities
  const toolsResources = [
    {
      title: "Development Tools",
      description: "Essential tools for robotics development",
      items: [
        { name: "ROS 2 Installation", link: "/docs/module-1-ros2/installation", icon: "⚙️" },
        { name: "Simulation Environment", link: "/docs/module-2-gazebo-unity/setup", icon: "🎮" },
        { name: "Isaac Setup", link: "/docs/module-3-isaac/setup", icon: "⚡" },
        { name: "IDE Recommendations", link: "/docs/tools/ide-setup", icon: "💻" },
      ]
    },
    {
      title: "Hardware Resources",
      description: "Information about compatible hardware platforms",
      items: [
        { name: "Recommended Robots", link: "/docs/hardware/recommended", icon: "🤖" },
        { name: "Sensor Integration", link: "/docs/hardware/sensors", icon: "📡" },
        { name: "Actuator Control", link: "/docs/hardware/actuators", icon: "⚙️" },
        { name: "Embedded Systems", link: "/docs/hardware/embedded", icon: "🔌" },
      ]
    },
    {
      title: "Datasets",
      description: "Public datasets for training and testing",
      items: [
        { name: "Robotics Datasets", link: "#", icon: "📊" },
        { name: "Simulation Assets", link: "#", icon: "🏗️" },
        { name: "Benchmark Suites", link: "#", icon: "⚖️" },
        { name: "Evaluation Metrics", link: "#", icon: "📈" },
      ]
    }
  ];

  return (
    <Layout
      title={`Resources - ${siteConfig.title}`}
      description="Additional resources for Physical AI & Humanoid Robotics learning">
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
                  Learning Resources
                </Heading>
                <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
                  Additional materials, tools, and community resources to enhance your learning
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
                    Educational Materials
                  </Heading>
                  <p style={{ fontSize: '1.25rem', color: 'var(--ifm-font-color-secondary)' }}>
                    Supplementary content to deepen your understanding of Physical AI concepts
                  </p>
                </div>
              </div>
            </div>

            <div className="row resources-grid">
              {educationalResources.map((resource, index) => (
                <div key={index} className="col col--12 col--md-4 margin-bottom--lg">
                  <div className="card" style={{ height: '100%', border: '1px solid var(--ifm-color-emphasis-200)' }}>
                    <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1.5rem' }}>
                      <Heading as="h3" style={{ margin: 0, fontSize: '1.5rem', color: 'var(--ifm-color-primary)' }}>
                        {resource.title}
                      </Heading>
                      <p style={{ margin: '0.5rem 0 0', color: 'var(--ifm-font-color-secondary)' }}>
                        {resource.description}
                      </p>
                    </div>
                    <div className="card__body" style={{ padding: '1.5rem' }}>
                      <div className="row">
                        {resource.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="col col--12 margin-bottom--sm">
                            <Link
                              to={item.link}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                textDecoration: 'none',
                                border: '1px solid var(--ifm-color-emphasis-200)',
                                borderRadius: '8px',
                                transition: 'border-color 0.2s ease',
                              }}
                              className="hover:border--primary"
                            >
                              <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>{item.icon}</span>
                              <div>
                                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="margin-vert--xl padding-vert--lg" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)' }}>
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2">
                <div className="text--center margin-bottom--xl">
                  <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                    Community & Support
                  </Heading>
                  <p style={{ fontSize: '1.25rem', color: 'var(--ifm-font-color-secondary)' }}>
                    Connect with peers, get support, and stay updated on events
                  </p>
                </div>
              </div>
            </div>

            <div className="row resources-grid">
              {communityResources.map((resource, index) => (
                <div key={index} className="col col--12 col--md-4 margin-bottom--lg">
                  <div className="card" style={{ height: '100%', border: '1px solid var(--ifm-color-emphasis-200)' }}>
                    <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1.5rem' }}>
                      <Heading as="h3" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--ifm-color-primary)' }}>
                        {resource.title}
                      </Heading>
                      <p style={{ margin: '0.5rem 0 0', color: 'var(--ifm-font-color-secondary)' }}>
                        {resource.description}
                      </p>
                    </div>
                    <div className="card__body" style={{ padding: '1.5rem' }}>
                      <ul style={{ paddingLeft: '1.25rem' }}>
                        {resource.items.map((item, itemIndex) => (
                          <li key={itemIndex} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                            <Link to={item.link} style={{ fontWeight: '500' }}>
                              <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                              {item.name}
                            </Link>
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
              <div className="col col--8 col--offset-2">
                <div className="text--center margin-bottom--xl">
                  <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                    Tools & Utilities
                  </Heading>
                  <p style={{ fontSize: '1.25rem', color: 'var(--ifm-font-color-secondary)' }}>
                    Essential tools and resources for your robotics development workflow
                  </p>
                </div>
              </div>
            </div>

            <div className="row resources-grid">
              {toolsResources.map((resource, index) => (
                <div key={index} className="col col--12 col--md-4 margin-bottom--lg">
                  <div className="card" style={{ height: '100%', border: '1px solid var(--ifm-color-emphasis-200)' }}>
                    <div className="card__header" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', padding: '1.5rem' }}>
                      <Heading as="h3" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--ifm-color-primary)' }}>
                        {resource.title}
                      </Heading>
                      <p style={{ margin: '0.5rem 0 0', color: 'var(--ifm-font-color-secondary)' }}>
                        {resource.description}
                      </p>
                    </div>
                    <div className="card__body" style={{ padding: '1.5rem' }}>
                      <ul style={{ paddingLeft: '1.25rem' }}>
                        {resource.items.map((item, itemIndex) => (
                          <li key={itemIndex} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                            <Link to={item.link} style={{ fontWeight: '500' }}>
                              <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                              {item.name}
                            </Link>
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

        <section className="margin-vert--xl padding-vert--lg" style={{ backgroundColor: 'var(--ifm-color-primary)', color: 'white' }}>
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2 text--center">
                <Heading as="h2" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Need More Resources?
                </Heading>
                <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem' }}>
                  Explore our extensive library of materials or suggest new resources
                </p>
                <Link
                  className="button button--secondary button--lg"
                  to="/contact"
                  style={{
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: 'var(--ifm-color-primary)',
                  }}
                >
                  Suggest Resources
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}