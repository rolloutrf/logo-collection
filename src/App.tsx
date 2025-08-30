import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import IconGrid from './components/IconGrid';
import AllIconsSection from './components/AllIconsSection';
// import GithubLink from './components/GithubLink';
import CopyMessage from './components/CopyMessage';
import { translations } from './translations';

const GITHUB_REPO = 'rolloutrf/logos';
const GITHUB_BRANCH = 'main';
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'https://api.github.com';
const GITHUB_TREE_URL = `${API_BASE}/repos/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
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
                const response = await fetch(GITHUB_TREE_URL, { headers });
                if (!response.ok) {
                    const text = await response.text().catch(() => '')
                    throw new Error(`GitHub API ${response.status}: ${text || response.statusText}`);
                }
                const data = await response.json();
                if (!data || !data.tree || !Array.isArray(data.tree)) {
                    throw new Error('Invalid data from GitHub API (tree)');
                }

                const files = data.tree as Array<{ path: string; type: string }>;
                const svgFiles = files
                  .filter((f) => f.type === 'blob' && f.path.endsWith('.svg'))
                  .map((f) => {
                    const parts = f.path.split('/')
                    const folder = parts.length > 1 ? parts[0] : 'root'
                    const name = parts[parts.length - 1]
                    const download_url = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${f.path}`
                    return { name, download_url, folder }
                  })
                  .sort((a, b) => a.name.localeCompare(b.name))

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
            <Sidebar groupedFiles={groupedFiles} totalCount={filteredSvgFiles.length} onSearch={handleSearch} />
            <div className="ml-72 mt-4">
                {loadError ? (
                  <div className="text-sm text-red-500">{loadError}</div>
                ) : (
                  <AllIconsSection files={filteredSvgFiles} onCopy={handleCopy} />
                )}
            </div>
            </div>
            {/* <GithubLink /> */}
            {copyMessageVisible && <CopyMessage />}
        </>
    );
}

export default App;
