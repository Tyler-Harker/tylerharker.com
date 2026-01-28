'use client';

import { useEffect, useState, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MermaidDiagram } from './MermaidDiagram';
import { TOCItem, generateId, extractTOC, calculateReadingTime } from '@/lib/blog-utils';

interface BlogContentProps {
  content: string;
}

interface ContentBlock {
  type: 'text' | 'mermaid' | 'code';
  content: string;
  language?: string;
}

function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = content.split('\n');
  let currentBlock: ContentBlock | null = null;
  let inCodeBlock = false;
  let codeLanguage = '';

  for (const line of lines) {
    if (line.trim() === '```mermaid') {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = { type: 'mermaid', content: '' };
      inCodeBlock = true;
      continue;
    }

    if (line.trim().startsWith('```') && !inCodeBlock) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      codeLanguage = line.trim().slice(3);
      currentBlock = { type: 'code', content: '', language: codeLanguage };
      inCodeBlock = true;
      continue;
    }

    if (line.trim() === '```' && inCodeBlock) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = null;
      inCodeBlock = false;
      codeLanguage = '';
      continue;
    }

    if (inCodeBlock && currentBlock) {
      currentBlock.content += (currentBlock.content ? '\n' : '') + line;
    } else {
      if (!currentBlock || currentBlock.type !== 'text') {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: 'text', content: '' };
      }
      currentBlock.content += (currentBlock.content ? '\n' : '') + line;
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
}

function renderMarkdown(text: string): string {
  let html = text
    // Headers with IDs for anchor links
    .replace(/^### (.*$)/gm, (_, title) => {
      const id = generateId(title);
      return `<h3 id="${id}" class="group mt-12 mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100 scroll-mt-24">
        <a href="#${id}" class="no-underline hover:no-underline">
          ${title}
          <span class="ml-2 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">#</span>
        </a>
      </h3>`;
    })
    .replace(/^## (.*$)/gm, (_, title) => {
      const id = generateId(title);
      return `<h2 id="${id}" class="group mt-16 mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100 scroll-mt-24 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <a href="#${id}" class="no-underline hover:no-underline">
          ${title}
          <span class="ml-2 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">#</span>
        </a>
      </h2>`;
    })
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-100">$1</strong>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="rounded-md bg-blue-50 px-1.5 py-0.5 text-sm font-mono text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-100 dark:border-blue-900">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-700 underline-offset-2 hover:decoration-blue-500 transition-colors">$1</a>')
    // Bullet points
    .replace(/^- (.*$)/gm, '<li class="text-zinc-700 dark:text-zinc-300 pl-2">$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.*$)/gm, '<li class="text-zinc-700 dark:text-zinc-300 pl-2">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-6 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">');

  // Wrap list items
  html = html.replace(/(<li[^>]*>.*<\/li>)\n?(<li)/g, '$1$2');
  html = html.replace(/(<li class="text-zinc-700[^"]*"[^>]*>.*?<\/li>)+/g, '<ul class="mb-6 ml-6 list-disc space-y-2 text-lg marker:text-blue-500">$&</ul>');

  return `<p class="mb-6 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">${html}</p>`;
}

// Map common language aliases
function normalizeLanguage(lang?: string): string {
  if (!lang) return 'text';
  const aliases: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'cs': 'csharp',
    'py': 'python',
    'rb': 'ruby',
    'yml': 'yaml',
    'sh': 'bash',
    'shell': 'bash',
  };
  return aliases[lang.toLowerCase()] || lang.toLowerCase();
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const normalizedLang = normalizeLanguage(language);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group my-8 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {language || 'code'}
        </span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={normalizedLang}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.625',
          background: '#18181b',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// Floating sidebar TOC
export function FloatingTOC({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>('');
  const activeRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Target point is 35% from the top of the viewport
      const targetPoint = window.innerHeight * 0.35;

      let closestId = '';
      let closestDistance = Infinity;

      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(rect.top - targetPoint);

          // Only consider headings that are above or at the target point
          if (rect.top <= targetPoint + 100 && distance < closestDistance) {
            closestDistance = distance;
            closestId = item.id;
          }
        }
      });

      // If no heading is above target, use the first one if we're near the top
      if (!closestId && items.length > 0) {
        const firstElement = document.getElementById(items[0].id);
        if (firstElement && firstElement.getBoundingClientRect().top < window.innerHeight) {
          closestId = items[0].id;
        }
      }

      if (closestId) {
        setActiveId(closestId);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  // Scroll active item into view within the TOC
  useEffect(() => {
    if (activeRef.current && navRef.current) {
      const nav = navRef.current;
      const active = activeRef.current;
      const navRect = nav.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();

      // Check if active item is outside the visible area of the nav
      if (activeRect.top < navRect.top || activeRect.bottom > navRect.bottom) {
        active.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeId]);

  if (items.length === 0) return null;

  return (
    <nav ref={navRef} className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        On this page
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'ml-3' : ''}>
            <a
              ref={activeId === item.id ? activeRef : null}
              href={`#${item.id}`}
              className={`block text-sm leading-relaxed transition-all duration-200 ${
                activeId === item.id
                  ? 'font-medium text-blue-600 dark:text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(progress);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-200 dark:bg-zinc-800">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function BlogContent({ content }: BlogContentProps) {
  const blocks = parseContent(content);
  const readingTime = calculateReadingTime(content);

  return (
    <>
      <ReadingProgress />

      {/* Reading time badge */}
      <div className="mb-8 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{readingTime} min read</span>
      </div>

      <div className="prose-custom">
        {blocks.map((block, index) => {
          if (block.type === 'mermaid') {
            return <MermaidDiagram key={index} chart={block.content} />;
          }

          if (block.type === 'code') {
            return <CodeBlock key={index} code={block.content} language={block.language} />;
          }

          return (
            <div
              key={index}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
            />
          );
        })}
      </div>

      {/* End of article marker */}
      <div className="mt-16 flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />
        <span className="text-2xl">✦</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />
      </div>
    </>
  );
}
