import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'orleans-search',
    name: 'TGHarker.Orleans.Search',
    description: 'A .NET library that brings automatic indexing and LINQ-based querying to Microsoft Orleans grains using PostgreSQL.',
    longDescription: 'Built with Claude Opus 4.5 in just a few hours, this library solves a problem I had been trying to tackle for over 3 years. It uses source generators to provide zero-boilerplate integration between Orleans grain state and PostgreSQL full-text search.',
    technologies: [
      '.NET',
      'Microsoft Orleans',
      'PostgreSQL',
      'C#',
      'Source Generators',
      'EF Core',
    ],
    features: [
      'Automatic state-to-index sync via storage decorator pattern',
      'Attribute-based indexing with [Searchable] and [Queryable]',
      'LINQ queries: .Search<IGrain>().Where(...).ToListAsync()',
      'Compile-time code generation for zero runtime overhead',
      'PostgreSQL full-text search with relevance ranking',
    ],
    githubUrl: 'https://github.com/Tyler-Harker/TGHarker.Orleans.Search',
    nugetUrl: 'https://www.nuget.org/packages/TGHarker.Orleans.Search',
    blogLinks: [
      {
        url: '/blog/building-orleans-search-library',
        title: 'Building a Search Library for Microsoft Orleans',
      },
    ],
    featured: true,
    status: 'active',
  },
  {
    id: 'orleans-indexing',
    name: 'TGHarker.Orleans.Indexing',
    description: 'An earlier attempt at Orleans grain indexing using Azure Cognitive Search.',
    longDescription: 'My first attempt at solving grain search in Orleans from 3+ years ago. While functional, I shelved this project due to source generator tooling pain and the complexity of requiring Azure Cognitive Search as a dependency.',
    technologies: [
      '.NET',
      'Microsoft Orleans',
      'Azure Cognitive Search',
      'C#',
    ],
    features: [
      'Attribute-based indexing configuration',
      'Azure Cognitive Search integration',
      'Support for faceted and searchable properties',
    ],
    githubUrl: 'https://github.com/Tyler-Harker/TGHarker.Orleans.Indexing',
    featured: false,
    status: 'archived',
  },
];
