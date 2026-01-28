import { Project } from '@/types';

export const orleansSearch: Project = {
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
  docsUrl: 'https://orleans-search.tylerharker.com',
  blogLinks: [
    {
      url: '/blog/building-orleans-search-library',
      title: 'Building a Search Library for Microsoft Orleans',
    },
  ],
  featured: true,
  status: 'active',
};
