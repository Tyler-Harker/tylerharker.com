import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'orleans-search',
    name: 'TGHarker.Orleans.Search',
    description: 'A .NET library for full-text and indexed search capabilities for Microsoft Orleans grains.',
    longDescription: 'TGHarker.Orleans.Search provides seamless integration between Microsoft Orleans and PostgreSQL full-text search. It enables developers to add search functionality to their Orleans applications with minimal configuration using attribute-based indexing and LINQ query support.',
    technologies: [
      '.NET 10+',
      'Microsoft Orleans 10+',
      'PostgreSQL 12+',
      'C#',
      'Entity Framework Core',
    ],
    features: [
      'Automatic state-to-index synchronization when grains are persisted',
      'Attribute-based opt-in indexing using [Queryable] and [FullTextSearchable] decorators',
      'LINQ query support with familiar methods like Where(), FirstOrDefaultAsync(), and CountAsync()',
      'Zero-boilerplate implementation through compile-time code generation',
      'Support for multiple data types (strings, numbers, dates, booleans, GUIDs)',
      'PostgreSQL full-text search with relevance weighting',
    ],
    githubUrl: 'https://github.com/Tyler-Harker/TGHarker.Orleans.Search',
    featured: true,
  },
];
