import type React from 'react';
import { folderTranslations } from '@/translations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { SvgFile } from '../App';

interface CategoriesNavProps {
    groupedFiles: Record<string, SvgFile[]>;
}

const CategoriesNav: React.FC<CategoriesNavProps> = ({ groupedFiles }) => {
    return (
        <ScrollArea className="h-[calc(100vh-120px)] pr-2 mt-2">
            <nav className="flex flex-col gap-1 text-sm">
            {Object.keys(groupedFiles).map(folder => {
                const folderName = folderTranslations[folder.toLowerCase() as keyof typeof folderTranslations] || folder.charAt(0).toUpperCase() + folder.slice(1);
                const iconCount = groupedFiles[folder].length;
                return (
                    <a
                        key={folder}
                        href={`#${folder.toLowerCase()}`}
                        className="no-underline text-muted-foreground hover:text-foreground flex items-center justify-between rounded-md px-2 py-1 hover:bg-accent"
                    >
                        <span className="truncate">{folderName}</span>
                        <Badge variant="secondary" className="ml-2 shrink-0">{iconCount}</Badge>
                    </a>
                );
            })}
            </nav>
        </ScrollArea>
    );
};

export default CategoriesNav;
