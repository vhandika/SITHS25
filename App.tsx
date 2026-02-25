import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { MusicProvider } from './contexts/MusicContext';
import { ToastProvider } from './contexts/ToastContext';
import Sidebar from './components/Sidebar';
import ActivityTracker from './components/ActivityTracker';
import ToastContainer from './components/Toast';

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
const MusicPlayer = lazy(() => import('./components/MusicPlayer'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen w-full bg-black text-yellow-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
    </div>
);

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <ToastProvider>
                <MusicProvider>
                    <ActivityTracker />
                    <ToastContainer />
                    <div className="flex min-h-screen bg-black">
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
                                </Routes>
                            </Suspense>
                        </main>
                        <Suspense fallback={null}>
                            <MusicPlayer />
                        </Suspense>
                    </div>
                    <Analytics />
                    <SpeedInsights />
                </MusicProvider>
            </ToastProvider>
        </BrowserRouter>
    );
};

export default App;
