'use client';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useLanguage } from '@/lib/i18n/language-context';

interface FiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearFilters: () => void;
  children: React.ReactNode;
}

/** Phone / tablet filter sheet — code-split so vaul only loads when opened. */
export function FiltersDrawer({ open, onOpenChange, onClearFilters, children }: FiltersDrawerProps) {
  const { t } = useLanguage();
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('ui.filters')}</DrawerTitle>
          <DrawerDescription className="sr-only">{t('ui.filters')}</DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-3 px-4 [&>button]:h-11">{children}</div>
        <DrawerFooter className="flex-row">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onClearFilters();
              onOpenChange(false);
            }}
          >
            {t('kanban.clearFilters')}
          </Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
