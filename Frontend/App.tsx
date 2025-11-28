import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import Sidebar from './components/Sidebar';
import Home from './views/Home';
import Library from './views/Library';
import AboutUs from './views/AboutUs';
import ContactUs from './views/ContactUs';
import Login from './views/Login';
import News from './views/News';
import ChangePassword from './views/ChangePassword';
import FindNim from './views/FindNim';
import Attendance from './views/Attendance';
import Gallery from './views/Gallery';

const App: React.FC = () => {
    return (
        <BrowserRouter>
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
                        <Route path="/change-password" element={<ChangePassword />} />
                        <Route path="/find-nim" element={<FindNim />} />
                        <Route path="/attendance" element={<Attendance />} /> 
                        <Route path="/gallery" element={<Gallery />} />
                    </Routes>
                </main>
            </div>
            <Analytics />
            
        </BrowserRouter>
    );
};

export default App;