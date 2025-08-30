import React from 'react';
import { SvgFile } from '../App';
import IconCard from './IconCard';
import { folderTranslations } from '@/translations';

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
                    <section key={folder} id={folder.toLowerCase()}>
                        <h2 className="text-2xl font-bold mb-4">{folderName} ({iconCount})</h2>
                        <div className="grid grid-cols-5 gap-4">
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
