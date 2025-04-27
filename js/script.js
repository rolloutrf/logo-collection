const GITHUB_REPO = 'rolloutrf/logos';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents`;
const GITHUB_HEADERS = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Rollout-Icon-Browser'
};

let allSvgFiles = [];

// Функция для проверки совпадения с русскими названиями
function matchesRussianName(fileName, searchTerm) {
    const baseName = fileName.replace('.svg', '').toLowerCase();
    return translations[baseName]?.some(translation => 
        translation.toLowerCase().includes(searchTerm)
    ) || false;
}

async function fetchFolderContent(folder) {
    try {
        const response = await fetch(folder.url, { headers: GITHUB_HEADERS });
        
        if (!response.ok) {
            console.error(`Error fetching folder ${folder.name}: ${response.status}`);
            return [];
        }

        const folderData = await response.json();
        if (!Array.isArray(folderData)) {
            console.error(`Invalid data format for folder ${folder.name}`);
            return [];
        }

        const svgFiles = folderData
            .filter(file => file.type === 'file' && file.name.endsWith('.svg'))
            .map(file => ({
                ...file,
                folder: folder.name
            }));

        console.log(`Found ${svgFiles.length} SVG files in folder ${folder.name}`);
        return svgFiles;
    } catch (error) {
        console.error(`Error fetching files from folder ${folder.name}:`, error);
        return [];
    }
}

async function fetchSVGFiles() {
    try {
        const response = await fetch(GITHUB_API_URL, { headers: GITHUB_HEADERS });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format received from GitHub API');
        }

        const folders = data.filter(item => item.type === 'dir');
        allSvgFiles = (await Promise.all(folders.map(fetchFolderContent))).flat();

        if (allSvgFiles.length === 0) {
            throw new Error('No SVG files found');
        }

        updateTitle();
        await displaySVGFiles(allSvgFiles);
        setupSearch();
    } catch (error) {
        console.error('Error fetching SVG files:', error);
        showError(error.message);
    }
}

function updateTitle(filteredCount = null) {
    document.title = filteredCount !== null
        ? `Векторная база логотипов (${filteredCount}/${allSvgFiles.length})`
        : `Векторная база логотипов (${allSvgFiles.length})`;
}

function showError(message) {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `<div class="error-message">Error loading SVG files: ${message}</div>`;
    }
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredFiles = allSvgFiles.filter(file => {
            const fileName = file.name.toLowerCase();
            const folderName = file.folder.toLowerCase();
            return fileName.includes(searchTerm) ||
                   folderName.includes(searchTerm) ||
                   matchesRussianName(file.name, searchTerm);
        });

        updateTitle(filteredFiles.length);
        displaySVGFiles(filteredFiles);
    });
}

async function displaySVGFiles(files) {
    const content = document.querySelector('.content');
    content.innerHTML = '';

    // Группируем файлы по папкам
    const groupedFiles = files.reduce((acc, file) => {
        const folder = file.folder;
        if (!acc[folder]) {
            acc[folder] = [];
        }
        acc[folder].push(file);
        return acc;
    }, {});

    // Создаем секции для каждой папки
    Object.keys(groupedFiles).forEach(folder => {
        const section = document.createElement('section');
        section.className = 'category-section';

        const title = document.createElement('h2');
        title.className = 'category-title';
        const folderLower = folder.toLowerCase();
        const folderName = folderTranslations[folderLower] || folder.charAt(0).toUpperCase() + folder.slice(1);
        const iconCount = groupedFiles[folder].length;
        title.textContent = `${folderName} (${iconCount})`;
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'icons-grid';

        // Сортируем файлы в папке по алфавиту
        const sortedFiles = groupedFiles[folder].sort((a, b) => a.name.localeCompare(b.name));
        sortedFiles.forEach(file => createIconCard(file, grid));

        section.appendChild(grid);
        content.appendChild(section);
    });
}

function createIconCard(file, grid) {
    const card = document.createElement('div');
    card.className = 'icon-card';
    
    const svgContainer = document.createElement('div');
    svgContainer.className = 'svg-container';
    
    const placeholder = document.createElement('div');
    placeholder.className = 'svg-placeholder';
    svgContainer.appendChild(placeholder);
    
    card.appendChild(svgContainer);
    grid.appendChild(card);
    
    loadSVG(file, svgContainer, card);
}

async function loadSVG(file, container, card) {
    try {
        const response = await fetch(file.download_url);
        const svgContent = await response.text();
        
        if (container.isConnected) {
            container.innerHTML = svgContent;
            card.dataset.content = svgContent;
            card.addEventListener('click', () => copySVGContent(file.download_url));
        }
    } catch (error) {
        console.error(`Error loading SVG file ${file.name}:`, error);
        if (container.isConnected) {
            container.innerHTML = `
                <div class="error-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 7V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    </svg>
                </div>
            `;
        }
    }
}

async function copySVGContent(url) {
    try {
        const response = await fetch(url);
        const svgContent = await response.text();
        await navigator.clipboard.writeText(svgContent);
        showCopyMessage();
    } catch (error) {
        console.error('Error copying SVG content:', error);
    }
}

function showCopyMessage() {
    const message = document.createElement('div');
    message.className = 'copy-message';
    message.textContent = 'Скопировано!';
    document.body.appendChild(message);
    
    requestAnimationFrame(() => message.classList.add('visible'));
    
    setTimeout(() => {
        message.classList.remove('visible');
        setTimeout(() => message.remove(), 200);
    }, 2000);
}

document.addEventListener('DOMContentLoaded', fetchSVGFiles);