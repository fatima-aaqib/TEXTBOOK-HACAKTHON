import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function Contact(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status after 5 seconds
      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <Layout
      title={`Contact - ${siteConfig.title}`}
      description="Get in touch with our team for support and inquiries">
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
                  Get in Touch
                </Heading>
                <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
                  Have questions? Our team is here to help you with your robotics education journey
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
                    Contact Information
                  </Heading>
                  <p style={{ fontSize: '1.25rem', color: 'var(--ifm-font-color-secondary)' }}>
                    Reach out to us for support, partnerships, or general inquiries
                  </p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col col--12 col--md-4 margin-bottom--lg">
                <div className="card text--center" style={{ padding: '2rem', height: '100%' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                  <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Location</h3>
                  <p style={{ color: 'var(--ifm-font-color-secondary)' }}>
                    San Francisco Bay Area<br />
                    California, USA
                  </p>
                </div>
              </div>

              <div className="col col--12 col--md-4 margin-bottom--lg">
                <div className="card text--center" style={{ padding: '2rem', height: '100%' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                  <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Email</h3>
                  <p style={{ color: 'var(--ifm-font-color-secondary)' }}>
                    <Link to="mailto:info@physicalai.edu" style={{ color: 'var(--ifm-color-primary)' }}>
                      info@physicalai.edu
                    </Link><br />
                    <Link to="mailto:support@physicalai.edu" style={{ color: 'var(--ifm-color-primary)' }}>
                      support@physicalai.edu
                    </Link>
                  </p>
                </div>
              </div>

              <div className="col col--12 col--md-4 margin-bottom--lg">
                <div className="card text--center" style={{ padding: '2rem', height: '100%' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                  <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Support</h3>
                  <p style={{ color: 'var(--ifm-font-color-secondary)' }}>
                    Monday - Friday<br />
                    9:00 AM - 5:00 PM PST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="margin-vert--xl contact-form-section" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)' }}>
          <div className="container padding-vert--xl">
            <div className="row">
              <div className="col col--6">
                <Heading as="h2" style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                  Send us a Message
                </Heading>
                <p style={{ color: 'var(--ifm-font-color-secondary)', marginBottom: '2rem' }}>
                  Have questions about our curriculum, need technical support, or interested in partnerships?
                  Fill out the form and our team will get back to you as soon as possible.
                </p>

                <div className="margin-bottom--lg">
                  <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Common Questions</h3>
                  <ul style={{ paddingLeft: '1.5rem', color: 'var(--ifm-font-color-secondary)' }}>
                    <li>How do I access the course materials?</li>
                    <li>What prerequisites are needed for each module?</li>
                    <li>Can I get academic credit for completing the courses?</li>
                    <li>Do you offer corporate training programs?</li>
                    <li>How can I contribute to the curriculum?</li>
                  </ul>
                </div>
              </div>

              <div className="col col--6">
                <form onSubmit={handleSubmit}>
                  <div className="margin-bottom--lg">
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div className="margin-bottom--lg">
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div className="margin-bottom--lg">
                    <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div className="margin-bottom--lg">
                    <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: formStatus === 'submitting' ? 'var(--ifm-color-gray-500)' : 'var(--ifm-color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: formStatus === 'submitting' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                  
                  {formStatus === 'success' && (
                    <div 
                      className="alert alert--success margin-top--md"
                      style={{ padding: '1rem', borderRadius: '4px' }}
                    >
                      Thank you for your message! Our team will get back to you soon.
                    </div>
                  )}
                  
                  {formStatus === 'error' && (
                    <div 
                      className="alert alert--danger margin-top--md"
                      style={{ padding: '1rem', borderRadius: '4px' }}
                    >
                      There was an error sending your message. Please try again.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="margin-vert--xl padding-vert--lg">
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <div className="text--center margin-bottom--xl">
                  <Heading as="h2" style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
                    Frequently Asked Questions
                  </Heading>
                </div>

                <div className="row">
                  <div className="col col--12 col--md-4 margin-bottom--lg">
                    <div className="card">
                      <div className="card__header">
                        <h3 style={{ margin: 0, fontWeight: '600' }}>What are the prerequisites for this course?</h3>
                      </div>
                      <div className="card__body">
                        <p>
                          Our curriculum is designed to be accessible to learners with varying backgrounds.
                          For the ROS 2 module, basic programming knowledge in Python or C++ is recommended.
                          For advanced modules, familiarity with machine learning concepts is helpful but not required.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col col--12 col--md-4 margin-bottom--lg">
                    <div className="card">
                      <div className="card__header">
                        <h3 style={{ margin: 0, fontWeight: '600' }}>How long does it take to complete the curriculum?</h3>
                      </div>
                      <div className="card__body">
                        <p>
                          The complete curriculum spans approximately 21 weeks of study, with 6-8 hours per week.
                          However, you can progress at your own pace and revisit materials as needed.
                          Each module can be completed independently based on your interests and needs.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col col--12 col--md-4 margin-bottom--lg">
                    <div className="card">
                      <div className="card__header">
                        <h3 style={{ margin: 0, fontWeight: '600' }}>Do you offer certificates upon completion?</h3>
                      </div>
                      <div className="card__body">
                        <p>
                          Yes, we offer verified certificates for each module and for the complete curriculum.
                          Certificates are issued through our partnership with recognized educational institutions
                          and can be shared on LinkedIn or included in your professional portfolio.
                        </p>
                      </div>
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
                  Ready to Get Started?
                </Heading>
                <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem' }}>
                  Join thousands of learners advancing their robotics careers
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