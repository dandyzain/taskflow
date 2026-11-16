/**
 * Single source of truth for how domain values (priority, workflow status,
 * deadlines, people) map onto the visual language. Components should import
 * from here instead of hand-rolling colour classes.
 */
import { AlertTriangle, ArrowDown, ArrowRight, ArrowUp, Minus, type LucideIcon } from 'lucide-react';

// ─── Priority ───────────────────────────────────────────────────────────────
// Stored as Int on Card: 0 = none, 1 = low, 2 = medium, 3 = urgent

export type PriorityLevel = 0 | 1 | 2 | 3;

export interface PriorityMeta {
  level: PriorityLevel;
  /** i18n key */
  labelKey: string;
  icon: LucideIcon;
  /** soft chip (bg + text + border) */
  chip: string;
  /** solid accent used for card stripe / dots / bars */
  solid: string;
  text: string;
}

export const PRIORITY: Record<PriorityLevel, PriorityMeta> = {
  0: {
    level: 0,
    labelKey: 'kanban.priorityNone',
    icon: Minus,
    chip: 'bg-muted text-muted-foreground border-border',
    solid: 'bg-border-strong',
    text: 'text-muted-foreground',
  },
  1: {
    level: 1,
    labelKey: 'kanban.priorityLow',
    icon: ArrowDown,
    chip: 'bg-info-soft text-info border-info/20',
    solid: 'bg-info',
    text: 'text-info',
  },
  2: {
    level: 2,
    labelKey: 'kanban.priorityMedium',
    icon: ArrowRight,
    chip: 'bg-warning-soft text-warning border-warning/20',
    solid: 'bg-warning',
    text: 'text-warning',
  },
  3: {
    level: 3,
    labelKey: 'kanban.priorityUrgent',
    icon: ArrowUp,
    chip: 'bg-danger-soft text-danger border-danger/20',
    solid: 'bg-danger',
    text: 'text-danger',
  },
};

export function getPriority(level: number | null | undefined): PriorityMeta {
  const l = (level ?? 0) as PriorityLevel;
  return PRIORITY[l] ?? PRIORITY[0];
}

export const PRIORITY_ORDER: PriorityLevel[] = [3, 2, 1, 0];

// ─── Workflow status (derived from column title) ───────────────────────────

export type StatusKind = 'backlog' | 'todo' | 'progress' | 'review' | 'done' | 'other';

export interface StatusMeta {
  kind: StatusKind;
  /** marker dot */
  dot: string;
  /** soft background */
  soft: string;
  /** readable text on soft */
  text: string;
  /** raw css colour, for SVG / inline styles */
  hsl: string;
}

const STATUS: Record<StatusKind, StatusMeta> = {
  backlog: { kind: 'backlog', dot: 'bg-[hsl(268_70%_65%)]', soft: 'bg-pastel-lavender', text: 'text-pastel-lavender-text', hsl: 'hsl(268 70% 65%)' },
  todo: { kind: 'todo', dot: 'bg-[hsl(205_85%_55%)]', soft: 'bg-pastel-sky', text: 'text-pastel-sky-text', hsl: 'hsl(205 85% 55%)' },
  progress: { kind: 'progress', dot: 'bg-[hsl(32_95%_55%)]', soft: 'bg-pastel-peach', text: 'text-pastel-peach-text', hsl: 'hsl(32 95% 55%)' },
  review: { kind: 'review', dot: 'bg-[hsl(330_75%_60%)]', soft: 'bg-pastel-rose', text: 'text-pastel-rose-text', hsl: 'hsl(330 75% 60%)' },
  done: { kind: 'done', dot: 'bg-[hsl(152_60%_45%)]', soft: 'bg-pastel-mint', text: 'text-pastel-mint-text', hsl: 'hsl(152 60% 45%)' },
  other: { kind: 'other', dot: 'bg-primary', soft: 'bg-accent', text: 'text-accent-foreground', hsl: 'hsl(var(--primary))' },
};

export function getStatusKind(columnTitle: string): StatusKind {
  const lower = columnTitle.toLowerCase();
  if (/(done|complete|selesai|berhasil|shipped|released)/.test(lower)) return 'done';
  if (/(review|test|qa|verif)/.test(lower)) return 'review';
  if (/(progress|in dev|doing|sedang|develop)/.test(lower)) return 'progress';
  if (/(to ?do|planned|ready|next)/.test(lower)) return 'todo';
  if (/(backlog|idea|icebox)/.test(lower)) return 'backlog';
  return 'other';
}

export function getStatus(columnTitle: string): StatusMeta {
  return STATUS[getStatusKind(columnTitle)];
}

// ─── Deadlines ──────────────────────────────────────────────────────────────

export type DueState = 'overdue' | 'soon' | 'normal';

export function getDueState(dateStr: string, now: Date = new Date()): DueState {
  const due = new Date(dateStr);
  if (due < new Date(now.toDateString())) return 'overdue';
  const diffDays = (due.getTime() - now.getTime()) / 86_400_000;
  if (diffDays >= 0 && diffDays <= 2) return 'soon';
  // Today but the timestamp already passed counts as "soon", not overdue
  if (due.toDateString() === now.toDateString()) return 'soon';
  return 'normal';
}

export const DUE_STYLE: Record<DueState, string> = {
  overdue: 'bg-danger-soft text-danger border-danger/20',
  soon: 'bg-warning-soft text-warning border-warning/20',
  normal: 'bg-muted text-muted-foreground border-border',
};

export const DUE_ICON: Record<DueState, LucideIcon | null> = {
  overdue: AlertTriangle,
  soon: null,
  normal: null,
};

// ─── People ─────────────────────────────────────────────────────────────────

const AVATAR_TONES = [
  'bg-pastel-lavender text-pastel-lavender-text',
  'bg-pastel-mint text-pastel-mint-text',
  'bg-pastel-sky text-pastel-sky-text',
  'bg-pastel-peach text-pastel-peach-text',
  'bg-pastel-rose text-pastel-rose-text',
  'bg-pastel-butter text-pastel-butter-text',
];

/** Stable colour per person, derived from their id (not their position in a list). */
export function avatarTone(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
