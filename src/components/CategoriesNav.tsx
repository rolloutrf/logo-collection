import React from 'react';
import { folderTranslations } from '@/translations';
import { SvgFile } from '../App';

interface CategoriesNavProps {
    groupedFiles: Record<string, SvgFile[]>;
}

const CategoriesNav: React.FC<CategoriesNavProps> = ({ groupedFiles }) => {
    return (
        <nav className="flex flex-col gap-2 mt-4">
            {Object.keys(groupedFiles).map(folder => {
                const folderName = folderTranslations[folder.toLowerCase() as keyof typeof folderTranslations] || folder.charAt(0).toUpperCase() + folder.slice(1);
                const iconCount = groupedFiles[folder].length;
                return (
                    <a
                        key={folder}
                        href={`#${folder.toLowerCase()}`}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {folderName} ({iconCount})
                    </a>
                );
            })}
        </nav>
    );
};

export default CategoriesNav;
