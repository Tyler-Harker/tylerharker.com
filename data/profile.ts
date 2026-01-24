import { Profile, NavLink } from '@/types';

export const profile: Profile = {
  name: 'Tyler Harker',
  title: 'Software Engineer',
  bio: 'Passionate software engineer with expertise in .NET, distributed systems, and cloud architecture. I enjoy building tools and libraries that help developers be more productive.',
  github: 'https://github.com/Tyler-Harker',
};

export const navLinks: NavLink[] = [
  { href: '/', label: 'About' },
  { href: '/work-experience', label: 'Work Experience' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Technical Blog' },
];
