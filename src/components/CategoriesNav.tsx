import type React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface CategoriesNavProps {
    totalCount?: number;
}

const CategoriesNav: React.FC<CategoriesNavProps> = ({ totalCount }) => {
  return (
    <ScrollArea className="h-[calc(100vh-120px)] pr-2 mt-2">
      <nav className="flex flex-col gap-1 text-sm">
        {typeof totalCount === 'number' && (
          <a
            href="#all"
            className="no-underline text-foreground flex items-center justify-between rounded-md px-2 py-1 bg-accent hover:bg-accent"
          >
            <span className="truncate">Все логотипы</span>
            <Badge variant="secondary" className="ml-2 shrink-0">{totalCount}</Badge>
          </a>
        )}
      </nav>
    </ScrollArea>
  );
};

export default CategoriesNav;
