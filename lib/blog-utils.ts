export interface TOCItem {
  id: string;
  title: string;
  level: number;
}

export function generateId(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function extractTOC(content: string): TOCItem[] {
  const items: TOCItem[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);

    if (h2Match) {
      items.push({ id: generateId(h2Match[1]), title: h2Match[1], level: 2 });
    } else if (h3Match) {
      items.push({ id: generateId(h3Match[1]), title: h3Match[1], level: 3 });
    }
  }

  return items;
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/```[\s\S]*?```/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
