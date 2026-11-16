import type { AssigneeItem, LabelItem } from '@/types/kanban';

const PRIORITY_WORDS: Record<string, number> = {
  urgent: 3,
  high: 3,
  tinggi: 3,
  medium: 2,
  med: 2,
  sedang: 2,
  low: 1,
  rendah: 1,
  none: 0,
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

export interface QuickAddResult {
  title: string;
  priority: number | null;
  assignees: AssigneeItem[];
  labels: LabelItem[];
}

/**
 * Parses inline shortcuts in a new-task title:
 *   "Fix login !urgent @sarah #bug" → title "Fix login", priority 3, …
 * Unknown @mentions / #tags are left in the title untouched.
 */
export function parseQuickAdd(raw: string, members: AssigneeItem[], labels: LabelItem[]): QuickAddResult {
  let priority: number | null = null;
  const assignees: AssigneeItem[] = [];
  const foundLabels: LabelItem[] = [];

  const title = raw
    .replace(/(^|\s)!([a-z]+)\b/gi, (match, lead: string, word: string) => {
      const p = PRIORITY_WORDS[word.toLowerCase()];
      if (p === undefined) return match;
      priority = p;
      return lead;
    })
    .replace(/(^|\s)@([\p{L}\d._-]+)/giu, (match, lead: string, word: string) => {
      const w = norm(word);
      const member =
        members.find((m) => norm(m.name) === w) ??
        members.find((m) => norm(m.name.split(' ')[0]) === w) ??
        members.find((m) => norm(m.name).startsWith(w));
      if (!member) return match;
      if (!assignees.some((a) => a.id === member.id)) assignees.push(member);
      return lead;
    })
    .replace(/(^|\s)#([\p{L}\d._-]+)/giu, (match, lead: string, word: string) => {
      const w = norm(word);
      const label = labels.find((l) => norm(l.name) === w) ?? labels.find((l) => norm(l.name).startsWith(w));
      if (!label) return match;
      if (!foundLabels.some((l) => l.id === label.id)) foundLabels.push(label);
      return lead;
    })
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { title, priority, assignees, labels: foundLabels };
}
