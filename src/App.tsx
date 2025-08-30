import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import IconGrid from './components/IconGrid';
// import GithubLink from './components/GithubLink';
import CopyMessage from './components/CopyMessage';
import { translations } from './translations';

const GITHUB_REPO = 'rolloutrf/logos';
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'https://api.github.com';
const GITHUB_API_URL = `${API_BASE}/repos/${GITHUB_REPO}/contents`;
const GITHUB_HEADERS_BASE: HeadersInit = {
    'Accept': 'application/vnd.github+json',
};

export interface SvgFile {
    name: string;
    download_url: string;
    folder: string;
}

function App() {
    const [allSvgFiles, setAllSvgFiles] = useState<SvgFile[]>([]);
    const [filteredSvgFiles, setFilteredSvgFiles] = useState<SvgFile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [copyMessageVisible, setCopyMessageVisible] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSVGFiles = async () => {
            try {
                const token = (import.meta as any).env?.VITE_GITHUB_TOKEN as string | undefined
                const headers: HeadersInit = {
                  ...GITHUB_HEADERS_BASE,
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                }
                const response = await fetch(GITHUB_API_URL, { headers });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received from GitHub API');
                }

                const folders = data.filter((item: any) => item.type === 'dir');
                const svgFilesPromises = folders.map(async (folder: any) => {
                    const folderUrl = folder.url.replace('https://api.github.com', API_BASE);
                    const folderResponse = await fetch(folderUrl, { headers });
                    if (!folderResponse.ok) {
                        console.error(`Error fetching folder ${folder.name}: ${folderResponse.status}`);
                        return [];
                    }
                    const folderData = await folderResponse.json();
                    if (!Array.isArray(folderData)) {
                        console.error(`Invalid data format for folder ${folder.name}`);
                        return [];
                    }
                    return folderData
                        .filter((file: any) => file.type === 'file' && file.name.endsWith('.svg'))
                        .map((file: any) => ({
                            name: file.name,
                            download_url: file.download_url,
                            folder: folder.name
                        }));
                });

                const svgFiles = (await Promise.all(svgFilesPromises)).flat();
                setAllSvgFiles(svgFiles);
                setFilteredSvgFiles(svgFiles);
                setLoadError(null);
            } catch (error) {
                console.error('Error fetching SVG files:', error);
                setLoadError('Не удалось загрузить логотипы. Проверьте соединение или лимит GitHub API.');
            }
        };

        fetchSVGFiles();
    }, []);

    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filtered = allSvgFiles.filter(file => {
            const fileName = file.name.toLowerCase();
            const folderName = file.folder.toLowerCase();
            const baseName = file.name.replace('.svg', '').toLowerCase();
            const russianNames = translations[baseName as keyof typeof translations] as string[];
            return fileName.includes(lowercasedSearchTerm) ||
                   folderName.includes(lowercasedSearchTerm) ||
                   (russianNames && russianNames.some(name => name.toLowerCase().includes(lowercasedSearchTerm)));
        });
        setFilteredSvgFiles(filtered);
    }, [searchTerm, allSvgFiles]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const handleCopy = () => {
        setCopyMessageVisible(true);
        setTimeout(() => {
            setCopyMessageVisible(false);
        }, 2000);
    };

    const groupedFiles = filteredSvgFiles.reduce((acc, file) => {
        const folder = file.folder;
        if (!acc[folder]) {
            acc[folder] = [];
        }
        acc[folder].push(file);
        return acc;
    }, {} as Record<string, SvgFile[]>);


    return (
        <>
            <Header />
            <div className="container mx-auto px-6 pt-4">
            <Sidebar groupedFiles={groupedFiles} onSearch={handleSearch} />
            <div className="ml-72 mt-4">
                {loadError ? (
                  <div className="text-sm text-red-500">{loadError}</div>
                ) : (
                  <IconGrid groupedFiles={groupedFiles} onCopy={handleCopy} />
                )}
            </div>
            </div>
            {/* <GithubLink /> */}
            {copyMessageVisible && <CopyMessage />}
        </>
    );
}

export default App;
