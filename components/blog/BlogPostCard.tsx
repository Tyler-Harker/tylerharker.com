import Link from 'next/link';
import { BlogPost } from '@/types';

interface BlogPostCardProps {
  post: BlogPost;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article className="group relative rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-blue-600">
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {post.featured && (
            <>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                Featured
              </span>
            </>
          )}
        </div>

        <h2 className="text-xl font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h2>

        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {post.description}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="pt-2">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
            Read article
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}
