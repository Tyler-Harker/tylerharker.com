import { Project } from '@/types';

export const identity: Project = {
  id: 'identity',
  name: 'TGHarker.Identity',
  description: 'A multi-tenant OAuth2/OpenID Connect identity provider built with .NET 10, Microsoft Orleans, and .NET Aspire.',
  longDescription: 'A scalable identity platform using Orleans virtual actors for distributed state management. Supports complete tenant isolation, organization hierarchies, and role-based access control.',
  technologies: [
    '.NET',
    'Microsoft Orleans',
    '.NET Aspire',
    'C#',
    'PostgreSQL',
    'Azure Storage',
    'OpenTelemetry',
  ],
  features: [
    'Multi-tenant architecture with complete isolation',
    'OAuth2/OIDC with authorization code, client credentials, and refresh tokens',
    'PKCE support for public clients',
    'Organization support with role-based access control',
    'RSA256-signed JWT tokens',
  ],
  githubUrl: 'https://github.com/Tyler-Harker/TGHarker.Identity',
  demoUrl: 'https://identity.harker.dev',
  blogLinks: [
    {
      url: '/blog/building-identity-provider-with-orleans',
      title: 'What I Learned Building My Own Identity Provider',
    },
  ],
  featured: true,
  status: 'active',
};
