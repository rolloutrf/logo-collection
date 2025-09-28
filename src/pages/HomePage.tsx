import { useState, useEffect, useMemo } from 'react';
import AllIconsSection from '../components/AllIconsSection';
import CopyMessage from '../components/CopyMessage';
import Sidebar from '../components/Sidebar';
import { translations, folderTranslations } from '../translations';
import type { Category, SvgFile } from '@/types';

const GITHUB_REPO = 'rolloutrf/logos';
const isDev = (import.meta as any).env?.DEV;
const API_BASE = (import.meta as any).env?.VITE_API_BASE || (isDev ? '/github' : 'https://api.github.com');
const GITHUB_HEADERS_BASE: HeadersInit = {
    'Accept': 'application/vnd.github+json',
};

// Helper for searching Russian translations
function matchesRussianName(fileName: string, searchTerm: string): boolean {
    const baseName = fileName.replace('.svg', '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const names = translations[baseName];
    if (!names) return false;
    if (Array.isArray(names)) {
        return names.some(translation => 
            translation.toLowerCase().includes(searchLower)
        );
    }
    return names.toLowerCase().includes(searchLower);
}

const HomePage = () => {
    const [allSvgFiles, setAllSvgFiles] = useState<SvgFile[]>([]);
    const [filteredSvgFiles, setFilteredSvgFiles] = useState<SvgFile[]>([]);
    const [copyMessageVisible, setCopyMessageVisible] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState('all');

    useEffect(() => {
        const loadLogosFromGitHub = async () => {
            try {
                const token = (import.meta as any).env?.VITE_GITHUB_TOKEN as string | undefined;
                const headers: HeadersInit = {
                    ...GITHUB_HEADERS_BASE,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                };
                
                const repoRes = await fetch(`${API_BASE}/repos/${GITHUB_REPO}`, { headers });
                if (!repoRes.ok) {
                    const text = await repoRes.text().catch(() => '');
                    throw new Error(`Repo meta ${repoRes.status}: ${text || repoRes.statusText}`);
                }
                
                const repoMeta = await repoRes.json();
                const branch = (repoMeta && repoMeta.default_branch) ? String(repoMeta.default_branch) : 'main';
                const response = await fetch(`${API_BASE}/repos/${GITHUB_REPO}/git/trees/${branch}?recursive=1`, { headers });
                if (!response.ok) {
                    const text = await response.text().catch(() => '');
                    throw new Error(`Tree ${branch} ${response.status}: ${text || response.statusText}`);
                }
                
                const data = await response.json();
                if (!data || !data.tree || !Array.isArray(data.tree)) {
                    throw new Error('Invalid data from GitHub API (tree)');
                }
                
                const files = data.tree as Array<{ path: string; type: string }>;
                const svgFiles = files
                    .filter((f) => f.type === 'blob' && f.path.endsWith('.svg'))
                    .map((f) => {
                        const parts = f.path.split('/');
                        const folder = parts.length > 1 ? parts[0] : 'root';
                        const name = parts[parts.length - 1];
                        const download_url = `https://raw.githubusercontent.com/${GITHUB_REPO}/${branch}/${f.path}`;
                        return { name, download_url, folder };
                    })
                    .sort((a, b) => a.name.localeCompare(b.name));

                setAllSvgFiles(svgFiles);
                setLoadError(null);
            } catch (error) {
                console.error('Error fetching SVG files:', error);
                setLoadError('Не удалось загрузить логотипы. Проверьте соединение или лимит GitHub API.');
            }
        };

        loadLogosFromGitHub();
    }, []);

    useEffect(() => {
        const searchLower = searchTerm.toLowerCase();
        const filtered = allSvgFiles.filter(file => {
            const fileName = file.name.toLowerCase();
            const folderName = file.folder.toLowerCase();
            return fileName.includes(searchLower) ||
                   folderName.includes(searchLower) ||
                   matchesRussianName(file.name, searchTerm);
        });
        setFilteredSvgFiles(filtered);
        document.title = searchTerm 
            ? `Логотипы (${filtered.length}/${allSvgFiles.length})`
            : `Векторная база логотипов (${allSvgFiles.length})`;

    }, [searchTerm, allSvgFiles]);

    const categories: Category[] = useMemo(() => {
        const grouped = allSvgFiles.reduce((acc, file) => {
            const folderId = file.folder.toLowerCase();
            if (!acc[folderId]) {
                acc[folderId] = { 
                    id: folderId, 
                    name: folderTranslations[folderId] || file.folder,
                    count: 0
                };
            }
            acc[folderId].count++;
            return acc;
        }, {} as Record<string, Category>);

        return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
    }, [allSvgFiles]);

    useEffect(() => {
        const sections = categories.map(c => document.getElementById(c.id));
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveCategoryId(entry.target.id);
                }
            });
        }, { rootMargin: '-100px 0px -80% 0px' });

        sections.forEach(section => {
            if (section) observer.observe(section);
        });

        return () => {
            sections.forEach(section => {
                if (section) observer.unobserve(section);
            });
        };
    }, [categories]);

    const handleCopy = () => {
        setCopyMessageVisible(true);
        setTimeout(() => {
            setCopyMessageVisible(false);
        }, 2000);
    };

    return (
        <>
            <Sidebar 
                onSearch={setSearchTerm} 
                categories={categories} 
                totalCount={allSvgFiles.length}
                activeCategoryId={activeCategoryId}
            />
            
            {/* Mobile Navigation */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
                <div className="flex flex-col gap-3 p-4">
                    <a 
                        href="https://github.com/rolloutrf/logos" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground w-fit"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                    </a>
                    <div className="flex gap-4">
                        <a href="/" className="text-foreground font-medium">Логотипы</a>
                        <a href="/банки" className="text-muted-foreground hover:text-foreground">Банки</a>
                    </div>
                    <SearchInput onSearch={setSearchTerm} />
                </div>
            </div>
            
            <div className="pl-64 lg:pl-64 pt-32 lg:pt-16">
                <main className="container mx-auto px-6 py-6">
                    {loadError ? (
                        <div className="text-sm text-red-500 pt-6">{loadError}</div>
                    ) : (
                        <AllIconsSection files={filteredSvgFiles} onCopy={handleCopy} />
                    )}
                </main>
            </div>
            {copyMessageVisible && <CopyMessage />}
        </>
    );
}

export default HomePage;
