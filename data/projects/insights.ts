import { Project } from '@/types';

export const insights: Project = {
  id: 'insights',
  name: 'TGHarker.Insights',
  description: 'A privacy-focused, self-hosted web analytics platform built on Microsoft Orleans for horizontal scalability.',
  longDescription: 'A complete web analytics solution that enables organizations to track visitor behavior across multiple applications without relying on third-party data sharing. Features real-time monitoring, funnel analysis, cohort retention tracking, and custom event recording—all while keeping data private and under your control.',
  technologies: [
    '.NET',
    'Microsoft Orleans',
    'PostgreSQL',
    'Azure Tables',
    '.NET Aspire',
    'Bootstrap',
    'Chart.js',
  ],
  features: [
    'Multi-application tracking from a unified dashboard',
    'Real-time visitor monitoring with sharded architecture',
    'Page analytics with views, bounce rates, and time tracking',
    'Traffic source identification with referrer and UTM tracking',
    'Custom event recording and conversion goal tracking',
    'Funnel analysis for multi-step user journeys',
    'Weekly cohort-based retention analysis',
    'User segmentation through custom attributes',
  ],
  githubUrl: 'https://github.com/Tyler-Harker/TGHarker.Insights',
  demoUrl: 'https://insights.harker.dev',
  blogLinks: [
    {
      url: '/blog/building-privacy-focused-analytics-with-orleans',
      title: 'Building a Privacy-Focused Analytics Platform with Microsoft Orleans',
    },
  ],
  featured: true,
  status: 'active',
};
