import type { Metadata } from 'next';
import { experiences } from '@/data/experience';
import { ExperienceCard } from '@/components/experience/ExperienceCard';

export const metadata: Metadata = {
  title: 'Work Experience',
  description: 'Professional work experience and career history of Tyler Harker.',
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl md:text-4xl">
        Work Experience
      </h1>
      <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 sm:mt-4 sm:text-lg">
        My professional journey and work history.
      </p>

      <div className="mt-8 space-y-6 sm:mt-12 sm:space-y-8">
        {experiences.map((experience) => (
          <ExperienceCard key={experience.id} experience={experience} />
        ))}
      </div>
    </div>
  );
}
