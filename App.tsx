import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { MusicProvider } from './contexts/MusicContext';
import { ToastProvider } from './contexts/ToastContext';
import Sidebar from './components/Sidebar';
import ActivityTracker from './components/ActivityTracker';
import ToastContainer from './components/Toast';
import NimPopup from './components/NimPopup';
import axios from 'axios';
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            document.cookie = "userNIM=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const Home = lazy(() => import('./views/Home'));
const Library = lazy(() => import('./views/Library'));
const AboutUs = lazy(() => import('./views/AboutUs'));
const ContactUs = lazy(() => import('./views/ContactUs'));
const Login = lazy(() => import('./views/Login'));
const News = lazy(() => import('./views/News'));
const ChangePassword = lazy(() => import('./views/ChangePassword'));
const FindNim = lazy(() => import('./views/FindNim'));
const Attendance = lazy(() => import('./views/Attendance'));
const Gallery = lazy(() => import('./views/Gallery'));
const PDFTools = lazy(() => import('./views/PDFTools'));
const Music = lazy(() => import('./views/Music'));
const DevDashboard = lazy(() => import('./views/DevDashboard'));
const Finance = lazy(() => import('./views/Finance'));
const Calc = lazy(() => import('./views/IndexCalculator'));
const MusicPlayer = lazy(() => import('./components/MusicPlayer'));
const ResetPassword = lazy(() => import('./views/ResetPassword'));

const API_BASE_URL = 'https://api.sith-s25.my.id/api';

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen w-full bg-black text-yellow-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
    </div>
);

const AppContent: React.FC = () => {
    const [showNimPopup, setShowNimPopup] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            const cookies = document.cookie.split('; ');
            const userNIM = cookies.find(row => row.trim().startsWith('userNIM='));

            if (!userNIM) {
                setHasChecked(false);
                setShowNimPopup(false);
                return;
            }

            if (hasChecked && !showNimPopup) return;

            try {
                const response = await fetch(`${API_BASE_URL}/validate-token`, {
                    credentials: 'include',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });
                const data = await response.json();

                if (response.ok) {
                    if (data.user?.needsNimUpdate) {
                        setShowNimPopup(true);
                    } else {
                        setShowNimPopup(false);
                    }
                    setHasChecked(true);
                }
                else if (response.status === 401) {
                    document.cookie = "userNIM=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }
            } catch (e) { }
        };
        checkAuth();
    }, [location.pathname, hasChecked]);

    return (
        <div className="flex min-h-screen bg-black">
            {showNimPopup && <NimPopup onSuccess={() => setShowNimPopup(false)} />}
            <Sidebar />
            <main className="flex-1 lg:ml-20">
                <Suspense fallback={<LoadingFallback />}>
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
                        <Route path="/PDFTools" element={<PDFTools />} />
                        <Route path="/music" element={<Music />} />
                        <Route path="/dev" element={<DevDashboard />} />
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/Calc" element={<Calc />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                    </Routes>
                </Suspense>
            </main>
            <Suspense fallback={null}>
                <MusicPlayer />
            </Suspense>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <ToastProvider>
                <MusicProvider>
                    <ActivityTracker />
                    <ToastContainer />
                    <AppContent />
                    <Analytics />
                    <SpeedInsights />
                </MusicProvider>
            </ToastProvider>
        </BrowserRouter>
    );
};

export default App;