import { Experience, ClientProject } from '@/types';

interface ExperienceCardProps {
  experience: Experience;
}

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function ClientProjectCard({ project }: { project: ClientProject }) {
  return (
    <div className="border-l-2 border-zinc-200 pl-3 dark:border-zinc-700 sm:pl-4">
      <div className="space-y-2 sm:space-y-3">
        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {project.clientUrl ? (
              <a
                href={project.clientUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {project.client}
              </a>
            ) : (
              project.client
            )}
          </h4>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {project.role}
          </p>
          <p className="text-xs text-zinc-500">
            {formatDate(project.startDate)} — {project.endDate ? formatDate(project.endDate) : 'Present'}
          </p>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {project.description}
        </p>
        {project.achievements.length > 0 && (
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {project.achievements.map((achievement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <article className="relative border-l-2 border-zinc-200 pl-4 dark:border-zinc-800 sm:pl-6">
      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900" />
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 sm:text-lg">
            {experience.companyUrl ? (
              <a
                href={experience.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {experience.company}
              </a>
            ) : (
              experience.company
            )}
          </h3>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {experience.role}
          </p>
          <p className="text-xs text-zinc-500 sm:text-sm">
            {formatDate(experience.startDate)} — {experience.endDate ? formatDate(experience.endDate) : 'Present'}
          </p>
        </div>
        {experience.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {experience.description}
          </p>
        )}
        {experience.achievements.length > 0 && (
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {experience.achievements.map((achievement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        )}
        {experience.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {experience.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 sm:px-3 sm:py-1"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        {experience.projects && experience.projects.length > 0 && (
          <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:text-sm">
              Client Projects
            </h4>
            {experience.projects.map((project) => (
              <ClientProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
