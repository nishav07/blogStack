export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isContentEmpty(content: string): boolean {
  if (!content?.trim()) return true;
  return stripHtml(content).length === 0;
}

export function toEditorContent(content: string): string {
  if (!content) return '';
  if (content.trim().startsWith('<')) return content;
  return content
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
