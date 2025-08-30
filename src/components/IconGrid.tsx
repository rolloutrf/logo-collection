import type React from 'react';
import type { SvgFile } from '../App';
import IconCard from './IconCard';
import { folderTranslations } from '@/translations';
import { Separator } from '@/components/ui/separator';

interface IconGridProps {
    groupedFiles: Record<string, SvgFile[]>;
    onCopy: () => void;
}

const IconGrid: React.FC<IconGridProps> = ({ groupedFiles, onCopy }) => {
    return (
        <div className="space-y-8">
            {Object.keys(groupedFiles).map(folder => {
                const folderName = folderTranslations[folder.toLowerCase() as keyof typeof folderTranslations] || folder.charAt(0).toUpperCase() + folder.slice(1);
                const iconCount = groupedFiles[folder].length;
                return (
                    <section key={folder} id={folder.toLowerCase()} className="scroll-mt-24">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-xl font-semibold">{folderName}</h2>
                          <span className="text-sm text-muted-foreground">{iconCount}</span>
                        </div>
                        <Separator className="mb-3" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {groupedFiles[folder].map(file => (
                                <IconCard key={file.name} file={file} onCopy={onCopy} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

export default IconGrid;
