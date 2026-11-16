'use client';

import { useEffect, useRef, useState } from 'react';
import { LayoutGroup, useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type PreviewCard = { id: string; title: string; tag: string; tone: string; stripe: string; who: string[] };

const CARDS: PreviewCard[] = [
  { id: 'a', title: 'Design onboarding flow', tag: 'Design', tone: 'bg-pastel-lavender text-pastel-lavender-text', stripe: 'bg-warning', who: ['S'] },
  { id: 'b', title: 'Ship billing webhooks', tag: 'Backend', tone: 'bg-pastel-sky text-pastel-sky-text', stripe: 'bg-danger', who: ['A', 'D'] },
  { id: 'c', title: 'Write release notes', tag: 'Docs', tone: 'bg-pastel-mint text-pastel-mint-text', stripe: 'bg-info', who: ['D'] },
  { id: 'd', title: 'Fix mobile drawer', tag: 'Bug', tone: 'bg-pastel-rose text-pastel-rose-text', stripe: 'bg-danger', who: ['A'] },
  { id: 'e', title: 'Usability interviews', tag: 'Research', tone: 'bg-pastel-butter text-pastel-butter-text', stripe: 'bg-warning', who: ['S', 'A'] },
];

const COLUMNS = [
  { id: 'todo', title: 'To Do', dot: 'bg-[hsl(205_85%_55%)]' },
  { id: 'doing', title: 'In Progress', dot: 'bg-[hsl(32_95%_55%)]' },
  { id: 'done', title: 'Done', dot: 'bg-[hsl(152_60%_45%)]' },
];

const INITIAL: Record<string, string[]> = { todo: ['a', 'b', 'e'], doing: ['c'], done: ['d'] };

/**
 * A miniature, self-playing Kanban board used on the landing and auth pages.
 * Every few seconds one card hops to the next column with a shared-layout
 * spring. Static when the user prefers reduced motion.
 */
export function BoardPreview({ className, compact }: { className?: string; compact?: boolean }) {
  const reduce = useReducedMotion();
  const [cols, setCols] = useState(INITIAL);
  const [justDone, setJustDone] = useState<string | null>(null);

  const colsRef = useRef(INITIAL);
  useEffect(() => {
    if (reduce) return;
    let step = 0;
    const id = window.setInterval(() => {
      const prev = colsRef.current;
      const next = { todo: [...prev.todo], doing: [...prev.doing], done: [...prev.done] };
      const phase = step++ % 3;
      // todo → doing, doing → done (celebrate), then recycle done → todo
      if (phase === 0 && next.todo.length) next.doing.push(next.todo.shift()!);
      else if (phase === 1 && next.doing.length) {
        const c = next.doing.shift()!;
        next.done.unshift(c);
        setJustDone(c);
      } else if (next.done.length > 2) next.todo.push(next.done.pop()!);
      colsRef.current = next;
      setCols(next);
    }, 2200);
    return () => window.clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    if (!justDone) return;
    const t = window.setTimeout(() => setJustDone(null), 1400);
    return () => window.clearTimeout(t);
  }, [justDone]);

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none select-none rounded-2xl border bg-card/80 p-3 shadow-e3 backdrop-blur-xl',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-1.5 px-1">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 h-2 w-24 rounded-full bg-border" />
      </div>
      <LayoutGroup>
        <div className={cn('grid grid-cols-3 gap-2.5', compact && 'gap-2')}>
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex min-h-[15rem] flex-col gap-2 rounded-xl bg-surface-sunken p-2">
              <div className="flex items-center gap-1.5 px-1 pb-0.5">
                <span className={cn('size-2 rounded-full', col.dot)} />
                <span className="truncate text-xs font-semibold text-foreground">{col.title}</span>
                <span className="ml-auto text-2xs tabular-nums text-muted-foreground">{cols[col.id].length}</span>
              </div>
              {cols[col.id].map((cid) => {
                const card = CARDS.find((c) => c.id === cid)!;
                const celebrating = justDone === cid;
                return (
                  <m.div
                    key={cid}
                    layoutId={`preview-${cid}`}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                    className={cn(
                      'relative overflow-hidden rounded-lg border bg-card p-2 shadow-e1',
                      celebrating && 'ring-2 ring-success/50'
                    )}
                  >
                    <span className={cn('absolute inset-y-1.5 left-0 w-[3px] rounded-r-full', card.stripe)} />
                    <span className={cn('inline-flex h-4 items-center rounded px-1 text-[9px] font-medium', card.tone)}>
                      {card.tag}
                    </span>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-foreground">{card.title}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="h-1.5 w-8 rounded-full bg-border" />
                      <span className="flex -space-x-1">
                        {card.who.map((w, i) => (
                          <span
                            key={i}
                            className={cn(
                              'flex size-4 items-center justify-center rounded-full text-[8px] font-semibold ring-2 ring-card',
                              ['bg-pastel-lavender text-pastel-lavender-text', 'bg-pastel-mint text-pastel-mint-text', 'bg-pastel-sky text-pastel-sky-text'][i % 3]
                            )}
                          >
                            {w}
                          </span>
                        ))}
                      </span>
                    </div>
                    {celebrating && (
                      <m.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-success text-white"
                      >
                        <Check className="size-2.5" />
                      </m.span>
                    )}
                  </m.div>
                );
              })}
            </div>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}
