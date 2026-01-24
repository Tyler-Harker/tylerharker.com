export interface BlogLink {
  url: string;
  title: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  features: string[];
  githubUrl: string;
  demoUrl?: string;
  docsUrl?: string;
  blogLinks?: BlogLink[];
  nugetUrl?: string;
  image?: string;
  featured: boolean;
  status?: 'active' | 'archived' | 'experimental';
}

export interface ClientProject {
  id: string;
  client: string;
  clientUrl?: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Position {
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  companyUrl?: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements: string[];
  technologies: string[];
  positions?: Position[];
  projects?: ClientProject[];
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  location?: string;
  email?: string;
  github: string;
  linkedin?: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  tags: string[];
  featured: boolean;
}
