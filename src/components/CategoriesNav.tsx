import type React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import type { Category } from '@/types';

interface CategoriesNavProps {
    categories: Category[];
    totalCount: number;
    activeCategoryId?: string;
}

const CategoriesNav: React.FC<CategoriesNavProps> = ({ categories, totalCount, activeCategoryId }) => {
  const allId = 'all';
  return (
    <ScrollArea className="h-[calc(100vh-120px)] pr-2 mt-2">
      <nav className="flex flex-col gap-1 text-sm">
        <a
          href={`#${allId}`}
          className={`no-underline flex items-center justify-between rounded-md px-2 py-1 ${
            activeCategoryId === allId ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="truncate">Все логотипы</span>
          <Badge variant={activeCategoryId === allId ? 'default' : 'secondary'} className="ml-2 shrink-0">{totalCount}</Badge>
        </a>
        {categories.map((category) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className={`no-underline flex items-center justify-between rounded-md px-2 py-1 ${
              activeCategoryId === category.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="truncate">{category.name}</span>
            <Badge variant={activeCategoryId === category.id ? 'default' : 'secondary'} className="ml-2 shrink-0">{category.count}</Badge>
          </a>
        ))}
      </nav>
    </ScrollArea>
  );
};

export default CategoriesNav;
