import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { MusicProvider } from './contexts/MusicContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import ActivityTracker from './components/ActivityTracker';
import ToastContainer from './components/Toast';
import { ProtectedRoute, RoleRoute } from './components/RouteGuards';
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

const LoadingFallback: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className={`flex items-center justify-center h-screen w-full ${theme === 'light' ? 'bg-white text-emerald-600' : 'bg-black text-yellow-400'}`}>
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'light' ? 'border-emerald-600' : 'border-yellow-400'}`}></div>
        </div>
    );
};

const AppContent: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className={`flex min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
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
                        <Route element={<ProtectedRoute />}>
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="/find-nim" element={<FindNim />} />
                            <Route path="/attendance" element={<Attendance />} />
                            <Route path="/gallery" element={<Gallery />} />
                            <Route path="/PDFTools" element={<PDFTools />} />
                            <Route path="/finance" element={<Finance />} />
                        </Route>
                        <Route path="/music" element={<Music />} />
                        <Route element={<RoleRoute allowedRoles={['dev']} />}>
                            <Route path="/dev" element={<DevDashboard />} />
                        </Route>
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
            <ThemeProvider>
                <ToastProvider>
                    <MusicProvider>
                        <ActivityTracker />
                        <ToastContainer />
                        <AppContent />
                        <Analytics />
                        <SpeedInsights />
                    </MusicProvider>
                </ToastProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;