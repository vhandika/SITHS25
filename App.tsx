import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MusicProvider } from './contexts/MusicContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ToastContainer from './components/Toast';
import { ProtectedRoute, RoleRoute } from './components/RouteGuards';
import { getAuthState } from './src/utils/auth';
import { useMusicPlayer } from './contexts/MusicContext';

const maintenanceModeRaw = (import.meta.env.VITE_MAINTENANCE_MODE ?? '').toString().trim().toLowerCase();
const MAINTENANCE_MODE = ['1', 'true', 'yes', 'on'].includes(maintenanceModeRaw);

const UnknownRouteRedirect: React.FC = () => {
    const { isLoggedIn } = getAuthState();

    return <Navigate to={isLoggedIn ? '/' : '/login'} replace />;
};

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
const ParticleBackground = lazy(() => import('./components/ParticleBackground'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const ActivityTracker = lazy(() => import('./components/ActivityTracker'));
const Analytics = lazy(() => import('@vercel/analytics/react').then((module) => ({ default: module.Analytics })));
const SpeedInsights = lazy(() => import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights })));

const useDeferredMount = (delayMs: number) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setMounted(true), delayMs);
        return () => window.clearTimeout(timer);
    }, [delayMs]);

    return mounted;
};

const LoadingFallback: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className={`flex items-center justify-center h-screen w-full ${theme === 'light' ? 'bg-white text-emerald-600' : 'bg-black text-yellow-400'}`}>
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'light' ? 'border-emerald-600' : 'border-yellow-400'}`}></div>
        </div>
    );
};

const MaintenanceScreen: React.FC = () => {
    const { setTheme } = useTheme();

    useEffect(() => {
        setTheme('dark');
    }, [setTheme]);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-yellow-300">
            <ParticleBackground
                particleColor="250, 204, 21"
                particleOpacity={0.88}
                connectionOpacity={0.45}
                lineWidth={1.2}
                maxParticles={130}
                connectionDistance={150}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.08)_0%,rgba(0,0,0,0.9)_60%,#000_100%)]" />

            <main className="relative z-10 flex flex-col items-center text-center">
                <div className="rounded-2xl border border-yellow-300/30 bg-black/55 p-3 shadow-[0_0_60px_rgba(250,204,21,0.2)] backdrop-blur-[6px]">
                    <img
                        src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdG0ya3gwajVlZXNmazV0Nnd6OGRsaGQ3Y20ycm9wZDBnNzEyNTl6NSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QtZSl6mcqfmvCBI2cb/giphy.gif"
                        alt="Maintenance"
                        className="h-64 w-64 max-h-[65vw] max-w-[65vw] rounded-xl object-cover"
                    />
                </div>
                <p className="mt-4 text-[clamp(22px,4vw,32px)] font-bold uppercase tracking-[0.2em] text-yellow-300">
                    sedang maintenance
                </p>
            </main>
        </div>
    );
};

const AppContent: React.FC = () => {
    const { theme } = useTheme();
    const { queue, isPlaying } = useMusicPlayer();
    const location = useLocation();
    const showSidebar = location.pathname !== '/reset-password';
    const renderDeferredShell = useDeferredMount(400);

    if (MAINTENANCE_MODE) {
        return <MaintenanceScreen />;
    }

    const shouldRenderMusicPlayer = queue.length > 0 || isPlaying || location.pathname === '/music';

    return (
        <div className={`flex min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
            {showSidebar && renderDeferredShell ? (
                <Suspense fallback={null}>
                    <Sidebar />
                </Suspense>
            ) : null}
            <main className={`flex-1 ${showSidebar ? 'lg:ml-20' : ''}`}>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/news" element={<News />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/PDFTools" element={<PDFTools />} />
                        <Route element={<ProtectedRoute />}>
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="/find-nim" element={<FindNim />} />
                            <Route path="/attendance" element={<Attendance />} />
                            <Route path="/gallery" element={<Gallery />} />
                            <Route path="/finance" element={<Finance />} />
                        </Route>
                        <Route path="/music" element={<Music />} />
                        <Route element={<RoleRoute allowedRoles={['dev']} />}>
                            <Route path="/dev" element={<DevDashboard />} />
                        </Route>
                        <Route path="/Calc" element={<Calc />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="*" element={<UnknownRouteRedirect />} />
                    </Routes>
                </Suspense>
            </main>
            {shouldRenderMusicPlayer ? (
                <Suspense fallback={null}>
                    <MusicPlayer />
                </Suspense>
            ) : null}
        </div>
    );
};

const App: React.FC = () => {
    const renderDeferredTelemetry = useDeferredMount(1200);

    return (
        <BrowserRouter>
            <ThemeProvider>
                <ToastProvider>
                    <MusicProvider>
                        <Suspense fallback={null}>
                            <ActivityTracker />
                        </Suspense>
                        <ToastContainer />
                        <AppContent />
                        {renderDeferredTelemetry ? (
                            <Suspense fallback={null}>
                                <Analytics />
                                <SpeedInsights />
                            </Suspense>
                        ) : null}
                    </MusicProvider>
                </ToastProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;