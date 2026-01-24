'use client';

import { useState, useEffect } from 'react';
import { ClientProject } from '@/types';

interface ProjectTimelineProps {
  projects: ClientProject[];
}

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function parseDate(dateStr: string): Date {
  const [year, month] = dateStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1);
}

function getMonthsDuration(startDate: string, endDate?: string): number {
  const start = parseDate(startDate);
  const end = endDate ? parseDate(endDate) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months);
}

function ProjectCard({
  project,
  isExpanded,
  isPinned,
  onHover,
  onPin,
  index,
  isAnimated,
}: {
  project: ClientProject;
  isExpanded: boolean;
  isPinned: boolean;
  onHover: (hovering: boolean) => void;
  onPin: () => void;
  index: number;
  isAnimated: boolean;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all duration-300 sm:p-5 cursor-pointer ${
        isExpanded
          ? isPinned
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg shadow-blue-200/50 dark:border-blue-400 dark:from-blue-900/40 dark:to-zinc-800/50 dark:shadow-blue-900/30'
            : 'border-blue-400 bg-gradient-to-br from-blue-50 to-white shadow-lg shadow-blue-100/50 dark:border-blue-500 dark:from-blue-900/30 dark:to-zinc-800/50 dark:shadow-blue-900/20'
          : 'border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50'
      }`}
      style={{
        opacity: isAnimated ? 1 : 0,
        transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease-out ${index * 100}ms, transform 0.5s ease-out ${index * 100}ms`,
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onPin}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPin(); }}
      aria-expanded={isExpanded}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {project.client}
              </h4>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {project.role}
              </p>
            </div>
            {/* Expand/Pin indicator */}
            <div
              className={`flex-shrink-0 rounded-full p-1 transition-all duration-300 ${
                isPinned
                  ? 'bg-blue-500 text-white dark:bg-blue-500'
                  : isExpanded
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500'
              }`}
              title={isPinned ? 'Click to unpin' : 'Click to pin open'}
            >
              {isPinned ? (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                </svg>
              ) : (
                <svg
                  className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
            {formatDate(project.startDate)} — {project.endDate ? formatDate(project.endDate) : 'Present'}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
            {getMonthsDuration(project.startDate, project.endDate)} months
          </span>
        </div>
      </div>

        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {project.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, isExpanded ? undefined : 6).map((tech) => (
            <span
              key={tech}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                isExpanded
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
              }`}
            >
              {tech}
            </span>
          ))}
          {!isExpanded && project.technologies.length > 6 && (
            <span className="px-2 py-1 text-xs text-zinc-400">
              +{project.technologies.length - 6} more
            </span>
          )}
        </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
          {project.clientUrl && (
            <a
              href={project.clientUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 mb-4"
              onClick={(e) => e.stopPropagation()}
            >
              Visit website
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {project.achievements.length > 0 && (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                Key Achievements
              </h5>
              <ul className="space-y-2">
                {project.achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectTimeline({ projects }: ProjectTimelineProps) {
  // Sort projects by start date (most recent first)
  const sortedProjects = [...projects].sort((a, b) => {
    return b.startDate.localeCompare(a.startDate);
  });

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(sortedProjects[0]?.id ?? null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePin = (projectId: string) => {
    setPinnedId(pinnedId === projectId ? null : projectId);
  };

  return (
    <div className="space-y-4">
      {sortedProjects.map((project, index) => {
        const isPinned = pinnedId === project.id;
        const isExpanded = isPinned || hoveredId === project.id;

        return (
          <ProjectCard
            key={project.id}
            project={project}
            isExpanded={isExpanded}
            isPinned={isPinned}
            onHover={(hovering) => setHoveredId(hovering ? project.id : null)}
            onPin={() => handlePin(project.id)}
            index={index}
            isAnimated={isAnimated}
          />
        );
      })}
    </div>
  );
}
