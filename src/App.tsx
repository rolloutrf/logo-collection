import { useState, useEffect } from 'react';
import AllIconsSection from './components/AllIconsSection';
import { ThemeToggle } from './components/ThemeToggle';
// import GithubLink from './components/GithubLink';
import CopyMessage from './components/CopyMessage';

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

function App() {
    const [allSvgFiles, setAllSvgFiles] = useState<SvgFile[]>([]);
    const [filteredSvgFiles, setFilteredSvgFiles] = useState<SvgFile[]>([]);
    const [copyMessageVisible, setCopyMessageVisible] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const loadLocalOrRemote = async () => {
            try {
                // Try local bundle first (uses Vite import.meta.glob); falls back to GitHub if empty
                const localModules = import.meta.glob('./logos/**/*.svg', { as: 'raw', eager: true }) as Record<string, string>
                let svgFiles: SvgFile[] = []
                if (localModules && Object.keys(localModules).length > 0) {
                  svgFiles = Object.entries(localModules).map(([path, content]) => {
                    // path like './logos/<folder>/file.svg'
                    const parts = path.split('/')
                    const name = parts[parts.length - 1]
                    const folder = parts.length > 3 ? parts[2] : 'root'
                    return {
                      name,
                      folder,
                      download_url: path, // not used for local, but kept for type compatibility
                      content,
                    }
                  })
                  .sort((a, b) => a.name.localeCompare(b.name))
                } else {
                  const token = (import.meta as any).env?.VITE_GITHUB_TOKEN as string | undefined
                  const headers: HeadersInit = {
                    ...GITHUB_HEADERS_BASE,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  }
                  const repoRes = await fetch(`${API_BASE}/repos/${GITHUB_REPO}`, { headers })
                  if (!repoRes.ok) {
                    const text = await repoRes.text().catch(() => '')
                    throw new Error(`Repo meta ${repoRes.status}: ${text || repoRes.statusText}`)
                  }
                  const repoMeta = await repoRes.json()
                  const branch = (repoMeta && repoMeta.default_branch) ? String(repoMeta.default_branch) : 'main'
                  const response = await fetch(`${API_BASE}/repos/${GITHUB_REPO}/git/trees/${branch}?recursive=1`, { headers });
                  if (!response.ok) {
                      const text = await response.text().catch(() => '')
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
                      const parts = f.path.split('/')
                      const folder = parts.length > 1 ? parts[0] : 'root'
                      const name = parts[parts.length - 1]
                      const download_url = `https://raw.githubusercontent.com/${GITHUB_REPO}/${branch}/${f.path}`
                      return { name, download_url, folder }
                    })
                    .sort((a, b) => a.name.localeCompare(b.name))
                }

                setAllSvgFiles(svgFiles);
                setFilteredSvgFiles(svgFiles);
                setLoadError(null);
            } catch (error) {
                console.error('Error fetching SVG files:', error);
                setLoadError('Не удалось загрузить логотипы. Проверьте соединение или лимит GitHub API.');
            }
        };

        loadLocalOrRemote();
    }, []);

    // When source changes, show everything (no search UI now)
    useEffect(() => {
        setFilteredSvgFiles(allSvgFiles)
    }, [allSvgFiles])

    const handleCopy = () => {
        setCopyMessageVisible(true);
        setTimeout(() => {
            setCopyMessageVisible(false);
        }, 2000);
    };

    return (
        <>
            <div className="container mx-auto px-6 py-6">
              {loadError ? (
                <div className="text-sm text-red-500">{loadError}</div>
              ) : (
                <AllIconsSection files={filteredSvgFiles} onCopy={handleCopy} />
              )}
            </div>
            <div className="fixed bottom-4 right-4 z-50">
              <ThemeToggle />
            </div>
            {copyMessageVisible && <CopyMessage />}
        </>
    );
}

export default App;
