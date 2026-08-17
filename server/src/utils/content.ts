export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isContentEmpty(content: string): boolean {
  if (!content?.trim()) return true;
  const stripped = stripHtml(content);
  return stripped.length === 0;
}
