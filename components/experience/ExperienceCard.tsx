import { Experience, Position } from '@/types';
import { ProjectTimeline } from './ProjectTimeline';

interface ExperienceCardProps {
  experience: Experience;
}

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function PositionItem({ position, isFirst }: { position: Position; isFirst: boolean }) {
  const isCurrent = !position.endDate;

  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full border-2 ${
            isCurrent
              ? 'border-blue-500 bg-blue-500'
              : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800'
          }`}
        />
        <div className="flex-1 w-0.5 bg-zinc-200 dark:bg-zinc-700" />
      </div>

      {/* Position content */}
      <div className="flex-1 pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
              {position.role}
            </span>
            {isCurrent && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                Current
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-500 sm:text-sm whitespace-nowrap">
            {formatDate(position.startDate)} — {position.endDate ? formatDate(position.endDate) : 'Present'}
          </span>
        </div>
        {position.description && (
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {position.description}
          </p>
        )}
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
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {experience.company}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              experience.company
            )}
          </h3>
          <p className="text-xs text-zinc-500 sm:text-sm">
            {formatDate(experience.startDate)} — {experience.endDate ? formatDate(experience.endDate) : 'Present'}
          </p>
        </div>

        {experience.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {experience.description}
          </p>
        )}

        {experience.positions && experience.positions.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Career Progression
            </h4>
            <div>
              {experience.positions.map((position, index) => (
                <PositionItem key={index} position={position} isFirst={index === 0} />
              ))}
            </div>
          </div>
        )}

        {!experience.positions && (
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {experience.role}
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
          <div className="mt-4 sm:mt-6">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:text-sm">
              Client Projects
            </h4>
            <ProjectTimeline projects={experience.projects} />
          </div>
        )}
      </div>
    </article>
  );
}
