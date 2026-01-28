import { Project } from '@/types';

export const tgharkerEmail: Project = {
  id: 'tgharker-email',
  name: 'TGHarker.Email',
  description: 'A self-hosted email management platform that avoids expensive per-email costs from commercial services.',
  longDescription: 'A cloud-native email service built on Microsoft Orleans and ASP.NET Core. Runs your own SMTP server without per-email fees. Supports multiple mailboxes, shared folders with granular permissions, full-text search, and JWT authentication. Deploy to Azure Container Apps for horizontal scaling.',
  technologies: [
    '.NET 10',
    'ASP.NET Core',
    'Microsoft Orleans',
    '.NET Aspire',
    'PostgreSQL',
    'Azure Container Apps',
    'Azure Storage',
    'TypeScript',
  ],
  features: [
    'RESTful API for full email management',
    'Multi-mailbox support with folder organization (Inbox, Sent, Drafts, Trash, Spam)',
    'Shared mailboxes with granular permissions (Read/Write/Admin)',
    'Full-text search for emails by content, recipient, or status',
    'Secure authentication with JWT tokens and Argon2id password hashing',
    'Horizontally scalable architecture built on Microsoft Orleans',
    'Cloud-native with .NET Aspire orchestration',
    'Local development with Docker Compose setup',
  ],
  githubUrl: 'https://github.com/Tyler-Harker/TGHarker.Email',
  featured: true,
  status: 'active',
};
