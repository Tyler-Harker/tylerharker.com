import { Experience } from '@/types';

export const experiences: Experience[] = [
  {
    id: 'placeholder-1',
    company: 'Company Name',
    role: 'Senior Software Engineer',
    startDate: '2022-01',
    description: 'Led development of distributed systems and microservices architecture. Worked on high-scale applications serving millions of users.',
    achievements: [
      'Designed and implemented new microservices architecture',
      'Improved system performance by 40%',
      'Mentored junior developers',
    ],
    technologies: ['C#', '.NET', 'Azure', 'Kubernetes', 'PostgreSQL'],
  },
  {
    id: 'placeholder-2',
    company: 'Previous Company',
    role: 'Software Engineer',
    startDate: '2019-06',
    endDate: '2022-01',
    description: 'Full-stack development on enterprise applications. Collaborated with cross-functional teams to deliver features on schedule.',
    achievements: [
      'Built new customer-facing features',
      'Reduced deployment time by implementing CI/CD pipelines',
      'Contributed to open-source projects',
    ],
    technologies: ['C#', '.NET Core', 'React', 'SQL Server', 'Docker'],
  },
];
