'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

const lightTheme = {
  primaryColor: '#eff6ff',
  primaryTextColor: '#1e40af',
  primaryBorderColor: '#3b82f6',
  secondaryColor: '#f0fdfa',
  secondaryTextColor: '#0f766e',
  secondaryBorderColor: '#14b8a6',
  tertiaryColor: '#faf5ff',
  tertiaryTextColor: '#7c3aed',
  tertiaryBorderColor: '#a78bfa',
  lineColor: '#71717a',
  arrowheadColor: '#71717a',
  textColor: '#3f3f46',
  background: '#ffffff',
  mainBkg: '#ffffff',
  nodeBorder: '#3b82f6',
  nodeTextColor: '#18181b',
  clusterBkg: '#fafafa',
  clusterBorder: '#e4e4e7',
  titleColor: '#52525b',
  edgeLabelBackground: '#ffffff',
  noteBkgColor: '#fef3c7',
  noteTextColor: '#92400e',
  noteBorderColor: '#f59e0b',
  actorBkg: '#eff6ff',
  actorBorder: '#3b82f6',
  actorTextColor: '#1e40af',
  actorLineColor: '#71717a',
  signalColor: '#3f3f46',
  signalTextColor: '#3f3f46',
  labelBackground: '#ffffff',
  labelTextColor: '#52525b',
};

const darkTheme = {
  primaryColor: '#1e3a5f',
  primaryTextColor: '#93c5fd',
  primaryBorderColor: '#3b82f6',
  secondaryColor: '#134e4a',
  secondaryTextColor: '#5eead4',
  secondaryBorderColor: '#14b8a6',
  tertiaryColor: '#3b0764',
  tertiaryTextColor: '#c4b5fd',
  tertiaryBorderColor: '#a78bfa',
  lineColor: '#a1a1aa',
  arrowheadColor: '#a1a1aa',
  textColor: '#d4d4d8',
  background: '#18181b',
  mainBkg: '#18181b',
  nodeBorder: '#3b82f6',
  nodeTextColor: '#f4f4f5',
  clusterBkg: '#27272a',
  clusterBorder: '#3f3f46',
  titleColor: '#a1a1aa',
  edgeLabelBackground: '#27272a',
  noteBkgColor: '#422006',
  noteTextColor: '#fcd34d',
  noteBorderColor: '#f59e0b',
  actorBkg: '#1e3a5f',
  actorBorder: '#3b82f6',
  actorTextColor: '#93c5fd',
  actorLineColor: '#a1a1aa',
  signalColor: '#d4d4d8',
  signalTextColor: '#d4d4d8',
  labelBackground: '#27272a',
  labelTextColor: '#a1a1aa',
};

function initializeMermaid(isDark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 13,
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
      padding: 16,
      nodeSpacing: 40,
      rankSpacing: 50,
      useMaxWidth: true,
      defaultRenderer: 'dagre-wrapper',
    },
    themeVariables: isDark ? darkTheme : lightTheme,
    sequence: {
      useMaxWidth: true,
      boxMargin: 8,
      boxTextMargin: 4,
      noteMargin: 8,
      messageMargin: 30,
      mirrorActors: true,
      actorFontSize: 13,
      noteFontSize: 12,
      messageFontSize: 13,
    },
  });
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Render diagram when chart or theme changes
  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        // Re-initialize with current theme
        initializeMermaid(isDark);

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);

        // Post-process SVG for better styling
        const styledSvg = svg
          .replace(/style="max-width:[^"]*"/, 'style="max-width: 100%"')
          .replace(/<style>/, `<style>
            .node rect, .node polygon { rx: 6; ry: 6; }
            .cluster rect { rx: 8; ry: 8; }
            .edgeLabel { font-size: 12px; }
            .label { font-weight: 500; }
          `);

        setSvg(styledSvg);
        setError(null);
      } catch (err) {
        setError('Failed to render diagram');
        console.error('Mermaid rendering error:', err);
      }
    };

    renderDiagram();
  }, [chart, isDark]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-8 flex justify-center overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
