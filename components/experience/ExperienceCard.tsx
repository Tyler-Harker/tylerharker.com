import { Experience } from '@/types';

interface ExperienceCardProps {
  experience: Experience;
}

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <article className="relative border-l-2 border-zinc-200 pl-6 dark:border-zinc-800">
      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900" />
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {experience.role}
          </h3>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {experience.company}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            {formatDate(experience.startDate)} — {experience.endDate ? formatDate(experience.endDate) : 'Present'}
          </p>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {experience.description}
        </p>
        {experience.achievements.length > 0 && (
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {experience.achievements.map((achievement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                {achievement}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          {experience.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
