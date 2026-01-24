export interface Project {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  features: string[];
  githubUrl: string;
  demoUrl?: string;
  image?: string;
  featured: boolean;
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
