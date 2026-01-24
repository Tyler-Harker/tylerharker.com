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

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements: string[];
  technologies: string[];
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
