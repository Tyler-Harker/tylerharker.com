import type { Metadata } from 'next';
import { experiences } from '@/data/experience';
import { ExperienceCard } from '@/components/experience/ExperienceCard';

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Professional work experience and career history of Tyler Harker.',
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Experience
      </h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        My professional journey and work history.
      </p>

      <div className="mt-12 space-y-8">
        {experiences.map((experience) => (
          <ExperienceCard key={experience.id} experience={experience} />
        ))}
      </div>
    </div>
  );
}
