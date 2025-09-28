import { useState, useEffect } from 'react';
import type { SvgFile } from '@/types';
import { translations, folderTranslations } from '@/translations';

const GITHUB_REPO = 'rolloutrf/logos';
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

const FeedPage = () => {
    const [allSvgFiles, setAllSvgFiles] = useState<SvgFile[]>([]);
    const [filteredSvgFiles, setFilteredSvgFiles] = useState<SvgFile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
    const [copyMessageVisible, setCopyMessageVisible] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('');

    useEffect(() => {
        const loadLogos = async () => {
            try {
                // Try to load manifest from public folder first
                let svgFiles: SvgFile[] = [];
                
                console.log('🚀 Starting to load logos...');
                
                try {
                    // Try to fetch logos manifest from public folder
                    console.log('📁 Trying to fetch manifest from /logos-manifest.json');
                    const manifestResponse = await fetch('/logos-manifest.json');
                    console.log('📁 Manifest response:', manifestResponse.status, manifestResponse.ok);
                    
                    if (manifestResponse.ok) {
                        const manifest = await manifestResponse.json();
                        console.log('📁 Manifest loaded:', manifest.length, 'items');
                        
                        svgFiles = manifest.map((item: any) => ({
                            name: item.name,
                            folder: item.folder,
                            download_url: `/logos/${item.folder}/${item.name}`,
                            content: undefined // Will be loaded when clicked
                        })).sort((a: SvgFile, b: SvgFile) => a.name.localeCompare(b.name));
                        
                        console.log('📁 Processed SVG files:', svgFiles.length);
                    }
                } catch (e) {
                    console.log('❌ No manifest found, trying GitHub API fallback:', e);
                }
                
                // Fallback to GitHub API if no local files or manifest
                if (svgFiles.length === 0) {
                    const token = (import.meta as any).env?.VITE_GITHUB_TOKEN as string | undefined;
                    const headers: HeadersInit = {
                        ...GITHUB_HEADERS_BASE,
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    };
                    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/git/trees/main?recursive=1`, { headers });
                    if (!response.ok) {
                        throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
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
                            const download_url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${f.path}`;
                            return { name, download_url, folder };
                        })
                        .sort((a, b) => a.name.localeCompare(b.name));
                }

                console.log('🎨 Setting all SVG files:', svgFiles.length);
                setAllSvgFiles(svgFiles);
                
                // Create categories
                const categoriesSet = new Set(svgFiles.map(file => file.folder));
                const categoriesList = Array.from(categoriesSet).map(folder => ({
                    id: folder.toLowerCase(),
                    name: folderTranslations[folder.toLowerCase()] || folder
                })).sort((a, b) => a.name.localeCompare(b.name));
                
                console.log('📊 Categories created:', categoriesList.length);
                setCategories(categoriesList);
                
                console.log('✅ Logo loading complete!');
            } catch (error) {
                console.error('❌ Error loading SVG files:', error);
            }
        };

        loadLogos();
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

    // Обработчик скролла для выделения активной категории
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('.category-section');
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.id;

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    setActiveCategory(sectionId);
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Вызываем сразу для установки начального состояния

        return () => window.removeEventListener('scroll', handleScroll);
    }, [filteredSvgFiles]);

    const handleIconClick = async (file: SvgFile) => {
        try {
            const response = await fetch(file.download_url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const svgContent = await response.text();
            await navigator.clipboard.writeText(svgContent);
            setCopyMessageVisible(true);
            setTimeout(() => setCopyMessageVisible(false), 2000);
        } catch (error) {
            console.error('Error copying SVG:', error);
        }
    };

    const scrollToCategory = (categoryId: string) => {
        setActiveCategory(categoryId);
        const element = document.getElementById(categoryId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const renderIconsByCategory = () => {
        console.log('🎨 Rendering icons by category. Categories:', categories.length, 'Filtered files:', filteredSvgFiles.length);
        
        return categories.map(category => {
            const categoryFiles = filteredSvgFiles.filter(file => 
                file.folder.toLowerCase() === category.id
            );
            
            console.log(`📁 Category ${category.name} (${category.id}):`, categoryFiles.length, 'files');
            
            if (categoryFiles.length === 0) return null;

            return (
                <div key={category.id} className="category-section" id={category.id}>
                    <h2 className="category-title">{category.name}</h2>
                    <div className="icons-grid">
                        {categoryFiles.map((file, index) => (
                            <div 
                                key={`${file.folder}-${file.name}-${index}`}
                                className="icon-card"
                                onClick={() => handleIconClick(file)}
                                title={`Click to copy ${file.name}`}
                            >
                                <div className="svg-container">
                                    <img src={file.download_url} alt={file.name} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    };

    return (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", background: '#EEEEEE', minHeight: '100vh', height: '100vh', overflow: 'auto' }}>
            <style>{`
                /* Reset */
                h1, h2, h3, h4, h5, h6, p, ul, li {
                    margin: 0;
                    padding: 0;
                }

                /* Layout */
                .container {
                    width: 900px;
                    margin: 0 auto;
                    padding: 32px 0 0;
                    box-sizing: border-box;
                    position: relative;
                    min-height: 100vh;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                /* Search Input */
                .search-input {
                    position: fixed;
                    left: 32px;
                    top: 32px;
                    width: 200px;
                    padding: 0;
                    border: none;
                    outline: none;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 16px;
                    line-height: 24px;
                    color: #bbbbbb;
                    background: transparent;
                }

                .search-input:focus {
                    color: #000000;
                }

                /* Categories */
                .category-section {
                    margin-bottom: 40px;
                }
                
                .category-section:last-child {
                    margin-bottom: 0;
                    padding-bottom: 20px;
                }

                .category-title {
                    font-weight: 400;
                    font-size: 24px;
                    line-height: 32px;
                    margin-bottom: 24px;
                    color: #000000;
                    font-family: 'JetBrains Mono', monospace;
                }

                /* Icons Grid */
                .icons-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 180px);
                    gap: 0;
                    width: 900px;
                    margin: 0 auto;
                    margin-bottom: 0;
                }

                .icon-card {
                    width: 180px;
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border-bottom: 1px solid #EEEEEE;
                    border-right: 1px solid #EEEEEE;
                    box-sizing: border-box;
                    background: #ffffff;
                }

                .icon-card:hover .svg-container svg,
                .icon-card:hover .svg-container img {
                    transform: translateY(-2px);
                }

                /* SVG Container */
                .svg-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .svg-container svg,
                .svg-container img {
                    max-width: 100%;
                    max-height: 100%;
                    transition: transform 0.2s ease;
                }

                /* Copy Message */
                .copy-message {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-family: 'JetBrains Mono', monospace;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .copy-message.visible {
                    opacity: 1;
                }

                .copy-message::before {
                    content: '';
                    display: inline-block;
                    width: 14px;
                    height: 14px;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E");
                    background-size: contain;
                    background-repeat: no-repeat;
                }

                /* GitHub Link */
                .github-link {
                    position: fixed;
                    left: 32px;
                    bottom: 32px;
                    z-index: 1000;
                    color: #bbbbbb;
                    transition: color 0.2s ease;
                    text-decoration: none;
                }

                .github-link:hover {
                    color: #000000;
                }

                /* Categories Navigation */
                .categories-nav {
                    position: fixed;
                    left: 32px;
                    top: 80px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-height: calc(100vh - 120px);
                    overflow-y: auto;
                    padding-right: 8px;
                }

                .categories-nav::-webkit-scrollbar {
                    width: 4px;
                }

                .categories-nav::-webkit-scrollbar-track {
                    background: #EEEEEE;
                }

                .categories-nav::-webkit-scrollbar-thumb {
                    background: #bbbbbb;
                    border-radius: 2px;
                }

                .categories-nav::-webkit-scrollbar-thumb:hover {
                    background: #999999;
                }

                .category-link {
                    color: #bbbbbb;
                    text-decoration: none;
                    font-size: 16px;
                    line-height: 24px;
                    transition: color 0.2s ease;
                    white-space: nowrap;
                    cursor: pointer;
                }

                .category-link:hover {
                    color: #000000;
                }

                .category-link.active {
                    color: #000000;
                }

                /* Media Queries */
                @media (max-width: 1024px) {
                    .container {
                        width: 100%;
                        padding: 0;
                    }
                    
                    .header {
                        width: 100%;
                        display: flex;
                        padding: 8px;
                        box-sizing: border-box;
                    }
                    
                    .search-input {
                        position: static;
                        width: 66.66%;
                        margin: 0;
                        padding: 8px;
                    }
                    
                    .github-link {
                        position: static;
                        width: 33.33%;
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                        padding: 8px;
                    }
                    
                    .content {
                        margin-top: 16px;
                    }
                    
                    .category-title {
                        padding: 0 16px;
                    }
                    
                    .icons-grid {
                        width: 100%;
                        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    }
                    
                    .icon-card {
                        width: 100%;
                        aspect-ratio: 3/2;
                    }
                    
                    .categories-nav {
                        position: static;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        gap: 16px;
                        padding: 16px;
                        max-height: none;
                        overflow-x: auto;
                        overflow-y: hidden;
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }

                    .categories-nav::-webkit-scrollbar {
                        display: none;
                    }
                    
                    .category-link {
                        padding: 0;
                        background: transparent;
                        border-radius: 4px;
                        flex-shrink: 0;
                    }
                }

                @media (max-width: 768px) {
                    .search-input {
                        position: static;
                        width: 66.66%;
                        margin: 0;
                        padding: 8px;
                    }
                    
                    .github-link {
                        position: static;
                        width: 33.33%;
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                        padding: 8px;
                    }
                    
                    .container {
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .content {
                        width: 100%;
                        order: 2;
                    }
                }

                @media (max-width: 480px) {
                    .icons-grid {
                        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    }
                    
                    .icon-card {
                        aspect-ratio: 1/1;
                    }
                }
            `}</style>
            
            <main className="container">
                <div className="header">
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Найти иконку..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <a 
                        href="https://github.com/rolloutrf/logos" 
                        className="github-link" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                    </a>
                </div>
                
                <nav className="categories-nav">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className={`category-link ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => scrollToCategory(category.id)}
                        >
                            {category.name}
                        </div>
                    ))}
                </nav>
                
                <div className="content">
                    {renderIconsByCategory()}
                </div>
                
                <div className={`copy-message ${copyMessageVisible ? 'visible' : ''}`}>
                    Скопировано
                </div>
            </main>
        </div>
    );
};

export default FeedPage;