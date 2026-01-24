import { profile } from '@/data/profile';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            {profile.name}
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            {profile.title}
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {profile.bio}
          </p>
        </div>

        <div className="flex gap-4">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            GitHub
          </a>
          {profile.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              LinkedIn
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
