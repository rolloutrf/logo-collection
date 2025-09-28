import { Routes, Route } from 'react-router-dom';
import FeedPage from './pages/FeedPage';
import BanksPage from './pages/BanksPage';

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<FeedPage />} />
                <Route path="/банки" element={<BanksPage />} />
                <Route path="/banks" element={<BanksPage />} />
            </Routes>
        </>
    );
}

export default App;