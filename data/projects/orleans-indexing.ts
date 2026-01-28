import { Project } from '@/types';

export const orleansIndexing: Project = {
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
};
