
import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './views/Home';
import Library from './views/Library';
import AboutUs from './views/AboutUs';
import ContactUs from './views/ContactUs';
import Login from './views/Login';
import News from './views/News';

const App: React.FC = () => {
    return (
        <HashRouter>
            <div className="flex min-h-screen bg-black">
                <Sidebar />
                <main className="flex-1 lg:ml-20">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/news" element={<News />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
};

export default App;