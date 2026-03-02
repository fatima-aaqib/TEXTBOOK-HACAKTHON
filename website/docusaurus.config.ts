import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'A Comprehensive Textbook for Embodied AI and Robotics',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-username.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For local development, use '/' for simpler local serving
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'your-org', // Usually your GitHub org/user name.
  projectName: 'sp.Physical-AI-Book', // Usually your repo name.

  onBrokenLinks: 'ignore',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          path: 'blog',
          routeBasePath: 'blog',
          showReadingTime: true,
          feedOptions: {
            type: 'all',
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'ignore',
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI & Robotics',
      items: [
        { to: '/', label: 'Home', position: 'left' },
        {
          type: 'docSidebar',
          sidebarId: 'textbookSidebar',
          position: 'left',
          label: 'Textbook',
        },
        {
          type: 'dropdown',
          label: 'Modules',
          position: 'left',
          items: [
            {
              label: 'ROS 2 Fundamentals',
              to: '/docs/module-1-ros2/01-introduction',
            },
            {
              label: 'Gazebo & Unity Simulation',
              to: '/docs/module-2-gazebo-unity/01-introduction-to-robot-simulation',
            },
            {
              label: 'NVIDIA Isaac Platform',
              to: '/docs/module-3-isaac/01-introduction-to-nvidia-isaac',
            },
            {
              label: 'Vision-Language-Action Models',
              to: '/docs/module-4-vla/01-introduction-to-vla-models',
            },
          ],
        },
        { to: '/about', label: 'About', position: 'left' },
        { to: '/curriculum', label: 'Curriculum', position: 'left' },
        { to: '/resources', label: 'Resources', position: 'left' },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/contact', label: 'Contact', position: 'left' },
        {
          href: 'https://github.com/your-org/sp.Physical-AI-Book',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learning',
          items: [
            {
              label: 'Get Started',
              to: '/docs/intro',
            },
            {
              label: 'ROS 2 Fundamentals',
              to: '/docs/module-1-ros2/01-introduction',
            },
            {
              label: 'Simulation',
              to: '/docs/module-2-gazebo-unity/01-introduction-to-robot-simulation',
            },
            {
              label: 'NVIDIA Isaac',
              to: '/docs/module-3-isaac/01-introduction-to-nvidia-isaac',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'VLA Models',
              to: '/docs/module-4-vla/01-introduction-to-vla-models',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/your-org/sp.Physical-AI-Book',
            },
            {
              label: 'Contribute',
              href: 'https://github.com/your-org/sp.Physical-AI-Book/blob/main/CONTRIBUTING.md',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/physical-ai',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/physical_ai',
            },
            {
              label: 'LinkedIn',
              href: 'https://linkedin.com/company/physical-ai',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Textbook. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'cpp', 'bash', 'yaml', 'json', 'cmake'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
