import { useState, useEffect, useMemo } from 'react';
import AllIconsSection from '../components/AllIconsSection';
import CopyMessage from '../components/CopyMessage';
import Sidebar from '../components/Sidebar';
import { translations, folderTranslations } from '../translations';
import type { Category } from '../components/CategoriesNav';

const GITHUB_REPO = 'rolloutrf/logos';
const isDev = (import.meta as any).env?.DEV;
const API_BASE = (import.meta as any).env?.VITE_API_BASE || (isDev ? '/github' : 'https://api.github.com');
const GITHUB_HEADERS_BASE: HeadersInit = {
    'Accept': 'application/vnd.github+json',
};

export interface SvgFile {
    name: string;
    download_url: string;
    folder: string;
    content?: string;
}

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
        const loadLocalOrRemote = async () => {
            try {
                const localModules = import.meta.glob('../logos/**/*.svg', { as: 'raw', eager: true }) as Record<string, string>;
                let svgFiles: SvgFile[] = [];
                if (localModules && Object.keys(localModules).length > 0) {
                    svgFiles = Object.entries(localModules).map(([path, content]) => {
                        const parts = path.split('/');
                        const name = parts[parts.length - 1];
                        const folder = parts.length > 3 ? parts[2] : 'root';
                        return {
                            name,
                            folder,
                            download_url: path, // Not used for local, but kept for type compatibility
                            content,
                        };
                    });
                } else {
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
                    svgFiles = files
                        .filter((f) => f.type === 'blob' && f.path.endsWith('.svg'))
                        .map((f) => {
                            const parts = f.path.split('/');
                            const folder = parts.length > 1 ? parts[0] : 'root';
                            const name = parts[parts.length - 1];
                            const download_url = `https://raw.githubusercontent.com/${GITHUB_REPO}/${branch}/${f.path}`;
                            return { name, download_url, folder };
                        });
                }

                setAllSvgFiles(svgFiles.sort((a, b) => a.name.localeCompare(b.name)));
                setLoadError(null);
            } catch (error) {
                console.error('Error fetching SVG files:', error);
                setLoadError('Не удалось загрузить логотипы. Проверьте соединение или лимит GitHub API.');
            }
        };

        loadLocalOrRemote();
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
            <div className="pl-64">
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
