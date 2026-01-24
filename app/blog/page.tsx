import type { Metadata } from 'next';
import { blogPosts } from '@/data/blog';
import { BlogPostCard } from '@/components/blog/BlogPostCard';

export const metadata: Metadata = {
  title: 'Technical Blog',
  description: 'Technical articles and insights from Tyler Harker on software engineering, .NET, and distributed systems.',
};

export default function BlogPage() {
  const sortedPosts = [...blogPosts].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );

  const featuredPosts = sortedPosts.filter(post => post.featured);
  const regularPosts = sortedPosts.filter(post => !post.featured);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl md:text-4xl">
        Technical Blog
      </h1>
      <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 sm:mt-4 sm:text-lg">
        Articles and insights on software engineering, architecture, and technology.
      </p>

      {featuredPosts.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <h2 className="mb-6 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Featured
          </h2>
          <div className="space-y-4">
            {featuredPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {regularPosts.length > 0 && (
        <section className="mt-10 sm:mt-14">
          <h2 className="mb-6 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            All Articles
          </h2>
          <div className="space-y-4">
            {regularPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {blogPosts.length === 0 && (
        <div className="mt-8 sm:mt-12">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Coming Soon
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Technical articles are in the works. Check back soon!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
