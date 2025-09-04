import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import FeedPage from './pages/FeedPage';

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<FeedPage />} />
            </Routes>
        </>
    );
}

export default App;