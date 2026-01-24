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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl md:text-4xl">
        Projects
      </h1>
      <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 sm:mt-4 sm:text-lg">
        Open source projects and personal work.
      </p>

      {featuredProjects.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 sm:text-xl">
            Featured Projects
          </h2>
          <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 md:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {otherProjects.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 sm:text-xl">
            Other Projects
          </h2>
          <div className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {otherProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
