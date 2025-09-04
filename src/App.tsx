import { Routes, Route } from 'react-router-dom';
import FeedPage from './pages/FeedPage';

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<FeedPage />} />
            </Routes>
        </>
    );
}

export default App;