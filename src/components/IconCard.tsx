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
        const loadSVG = async () => {
            try {
                const response = await fetch(file.download_url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const svg = await response.text();
                setSvgContent(svg);
            } catch (error: any) {
                setError(error.message);
            }
        };

        loadSVG();
    }, [file.download_url]);

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
                        <CardContent className="flex items-center justify-center p-3 h-24">
                            {svgContent ? (
                                <div className="svg-wrapper" dangerouslySetInnerHTML={{ __html: svgContent }} />
                            ) : error ? (
                                <div className="text-red-500">{error}</div>
                            ) : (
                                <Skeleton className="w-8 h-8 rounded-full" />
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
