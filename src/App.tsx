import { useState, useEffect } from 'react';
import SearchInput from './components/SearchInput';
import CategoriesNav from './components/CategoriesNav';
import IconGrid from './components/IconGrid';
import GithubLink from './components/GithubLink';
import CopyMessage from './components/CopyMessage';
import { translations } from './translations';

const GITHUB_REPO = 'rolloutrf/logos';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents`;
const GITHUB_HEADERS = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Rollout-Icon-Browser'
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

    useEffect(() => {
        const fetchSVGFiles = async () => {
            try {
                const response = await fetch(GITHUB_API_URL, { headers: GITHUB_HEADERS });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received from GitHub API');
                }

                const folders = data.filter((item: any) => item.type === 'dir');
                const svgFilesPromises = folders.map(async (folder: any) => {
                    const folderResponse = await fetch(folder.url, { headers: GITHUB_HEADERS });
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
            } catch (error) {
                console.error('Error fetching SVG files:', error);
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
        <div className="container mx-auto p-8">
            <div className="fixed top-8 left-8">
                <SearchInput onSearch={handleSearch} />
                <CategoriesNav groupedFiles={groupedFiles} />
            </div>
            <div className="ml-64">
                <IconGrid groupedFiles={groupedFiles} onCopy={handleCopy} />
            </div>
            <GithubLink />
            {copyMessageVisible && <CopyMessage />}
        </div>
    );
}

export default App;
