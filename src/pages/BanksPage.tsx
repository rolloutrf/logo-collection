import { useState, useEffect } from 'react';

interface Bank {
    bankName: string;
    logoURL: string;
    schema: string;
    package_name?: string;
    webClientUrl?: string;
    isWebClientActive?: string;
}

const BanksPage = () => {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [copyMessageVisible, setCopyMessageVisible] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const loadBanks = async () => {
            try {
                // Пробуем загрузить через прокси для обхода CORS
                let response;
                try {
                    response = await fetch('https://cdn.роллаут.рф/banks.json');
                } catch (corsError) {
                    // Если CORS не работает, используем прокси
                    response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://cdn.роллаут.рф/banks.json')}`);
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Исправляем название Тинькофф на Т-Банк
                const correctedBanks = data.dictionary.map((bank: Bank) => {
                    if (bank.bankName === 'Тинькофф Банк') {
                        return { ...bank, bankName: 'Т-Банк' };
                    }
                    return bank;
                });
                
                setBanks(correctedBanks);
                setFilteredBanks(correctedBanks);
                setLoadError(null);
            } catch (error) {
                console.error('Error loading banks:', error);
                setLoadError('Не удалось загрузить данные о банках. Проверьте соединение.');
            }
        };

        loadBanks();
    }, []);

    useEffect(() => {
        const searchLower = searchTerm.toLowerCase();
        const filtered = banks.filter(bank => 
            bank.bankName.toLowerCase().includes(searchLower)
        );
        setFilteredBanks(filtered);
        document.title = searchTerm 
            ? `Банки (${filtered.length}/${banks.length})`
            : `Витрина банков (${banks.length})`;
    }, [searchTerm, banks]);

    const handleLogoClick = async (bank: Bank) => {
        try {
            const logoUrl = `https://cdn.роллаут.рф${bank.logoURL}`;
            
            // Пробуем загрузить через прокси или напрямую
            let response;
            try {
                response = await fetch(logoUrl, {
                    mode: 'cors',
                    headers: {
                        'Accept': 'image/svg+xml,image/*,*/*'
                    }
                });
            } catch (corsError) {
                // Если CORS не работает, пробуем через прокси
                response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(logoUrl)}`);
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const svgContent = await response.text();
            await navigator.clipboard.writeText(svgContent);
            setCopyMessageVisible(true);
            setTimeout(() => setCopyMessageVisible(false), 2000);
        } catch (error) {
            console.error('Error copying SVG:', error);
            // Показываем уведомление об ошибке
            alert('Не удалось скопировать логотип. Попробуйте еще раз.');
        }
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

                .nav-links {
                    display: flex;
                    gap: 24px;
                }

                .nav-link {
                    color: #bbbbbb;
                    text-decoration: none;
                    font-size: 16px;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }

                .nav-link:hover {
                    color: #000000;
                }

                .nav-link.active {
                    color: #000000;
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

                /* Banks Grid */
                .banks-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 180px);
                    gap: 0;
                    width: 900px;
                    margin: 0 auto;
                    margin-bottom: 0;
                }

                .bank-card {
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

                .bank-card:hover .bank-logo img {
                    transform: translateY(-2px);
                }

                .bank-logo {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bank-logo img {
                    width: 40px;
                    height: 40px;
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

                /* Media Queries */
                @media (max-width: 1024px) {
                    .container {
                        width: 100%;
                        padding: 0;
                    }
                    
                    .header {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        padding: 16px;
                        padding-bottom: 0;
                        box-sizing: border-box;
                        gap: 12px;
                        align-items: flex-start;
                        margin-bottom: 0;
                    }
                    
                    .nav-links {
                        width: auto;
                        display: flex;
                        justify-content: flex-start;
                        gap: 24px;
                    }
                    
                    .search-input {
                        position: static;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        text-align: left;
                    }
                    
                    .github-link {
                        position: static;
                        width: auto;
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        padding: 0;
                    }
                    
                    .banks-grid {
                        width: 100%;
                        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    }
                    
                    .bank-card {
                        width: 100%;
                        aspect-ratio: 3/2;
                    }
                }

                @media (max-width: 768px) {
                    .header {
                        flex-direction: column;
                        gap: 12px;
                        padding: 16px;
                        padding-bottom: 0;
                        margin-bottom: 0;
                    }
                    
                    .nav-links {
                        gap: 16px;
                    }
                    
                    .search-input {
                        width: 100%;
                        padding: 0;
                        font-size: 16px;
                    }
                    
                    .github-link {
                        width: 100%;
                        justify-content: center;
                    }
                    
                    .container {
                        display: flex;
                        flex-direction: column;
                    }
                }

                @media (max-width: 480px) {
                    .header {
                        padding: 16px;
                        padding-bottom: 0;
                        margin-bottom: 0;
                    }
                    
                    .banks-grid {
                        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    }
                    
                    .bank-card {
                        aspect-ratio: 1/1;
                    }
                }
            `}</style>
            
            <main className="container">
                <div className="header">
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
                    <div className="nav-links">
                        <a href="/" className="nav-link">Логотипы</a>
                        <a href="/банки" className="nav-link active">Банки</a>
                    </div>
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Найти банк..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {loadError ? (
                    <div className="text-sm text-red-500 pt-6">{loadError}</div>
                ) : (
                    <div className="banks-grid">
                        {filteredBanks.map((bank, index) => (
                            <div 
                                key={`${bank.schema}-${index}`}
                                className="bank-card"
                                onClick={() => handleLogoClick(bank)}
                                title={`Кликните для копирования SVG логотипа ${bank.bankName}`}
                            >
                                <div className="bank-logo">
                                    <img 
                                        src={`https://cdn.роллаут.рф${bank.logoURL}`} 
                                        alt={`Логотип ${bank.bankName}`}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            // Пробуем загрузить через прокси
                                            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(target.src)}`;
                                            target.src = proxyUrl;
                                            target.onerror = () => {
                                                // Если и прокси не работает, просто скрываем
                                                target.style.display = 'none';
                                            };
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className={`copy-message ${copyMessageVisible ? 'visible' : ''}`}>
                    Скопировано
                </div>
            </main>
        </div>
    );
};

export default BanksPage;
