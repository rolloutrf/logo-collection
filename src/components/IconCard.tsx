import type React from 'react';
import { useState, useEffect } from 'react';
import './icon-card.css';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import type { SvgFile } from '../App';
import { Card, CardContent } from '@/components/ui/card';

interface IconCardProps {
    file: SvgFile;
    onCopy: () => void;
}

const IconCard: React.FC<IconCardProps> = ({ file, onCopy }) => {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                if (file.content) {
                    if (!cancelled) setSvgContent(file.content)
                    return
                }
                const response = await fetch(file.download_url)
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
                const svg = await response.text()
                if (!cancelled) setSvgContent(svg)
            } catch (e: any) {
                if (!cancelled) setError(e?.message || 'Failed to load SVG')
            }
        }
        load()
        return () => { cancelled = true }
    }, [file.download_url, file.content]);

    const handleCopy = async () => {
        if (svgContent) {
            try {
                await navigator.clipboard.writeText(svgContent);
                onCopy();
            } catch (error) {
                console.error('Error copying SVG content:', error);
            }
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card onClick={handleCopy} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center justify-center p-5 aspect-square">
                            {svgContent ? (
                                <div className="flex items-center justify-center rounded-md p-2 border border-border bg-card dark:bg-white">
                                  <div className="svg-wrapper" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                </div>
                            ) : error ? (
                                <div className="text-red-500">{error}</div>
                            ) : (
                                <Skeleton className="w-14 h-14 rounded-md" />
                            )}
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent>Нажмите, чтобы скопировать SVG</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default IconCard;
