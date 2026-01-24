import type { Metadata } from 'next';
import { projects } from '@/data/projects';
import { ProjectCard } from '@/components/projects/ProjectCard';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Personal and open source projects by Tyler Harker.',
};

export default function ProjectsPage() {
  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Projects
      </h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        Open source projects and personal work.
      </p>

      {featuredProjects.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Featured Projects
          </h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {otherProjects.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Other Projects
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
