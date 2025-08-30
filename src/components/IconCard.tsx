import React, { useState, useEffect } from 'react';
import { SvgFile } from '../App';
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
        <Card onClick={handleCopy} className="cursor-pointer">
            <CardContent className="flex items-center justify-center p-6">
                {svgContent ? (
                    <div dangerouslySetInnerHTML={{ __html: svgContent }} />
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                )}
            </CardContent>
        </Card>
    );
};

export default IconCard;
