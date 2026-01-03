import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, Library, Newspaper, Users, Mail, X, Menu,
    LogIn, LogOut, KeyRound, UserCircle, CameraIcon, Search,
    CalendarCheck, FileText, Flag, Music, Monitor
} from 'lucide-react'
import ProfileModal from '../components/ProfileModal';
import ReportModal from '../components/ReportModal';

const API_BASE_URL = 'https://api.sith-s25.my.id/api';

const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const staticNavItems = [
    { path: '/', name: 'Home', icon: Home },
    { path: '/library', name: 'Library', icon: Library },
    { path: '/news', name: 'News', icon: Newspaper },
    { path: '/about', name: 'About Us', icon: Users },
    { path: '/contact', name: 'Contact Us', icon: Mail },
    { path: '/PDFTools', name: 'PDF Tools', icon: FileText },
    { path: '/music', name: 'Music', icon: Music }
];

interface NavLinksProps {
    isExpanded: boolean;
    isLoggedIn: boolean;
    userRole: string | null;
    onReportClick: () => void;
}

const DesktopNavLinks: React.FC<NavLinksProps> = ({ isExpanded, isLoggedIn, userRole, onReportClick }) => {
    const navItems = [...staticNavItems];

    if (isLoggedIn) {
        navItems.push({ path: '/find-nim', name: 'Find', icon: Search });
        navItems.push({ path: '/attendance', name: 'Absensi', icon: CalendarCheck });
        navItems.push({ path: '/gallery', name: 'Gallery', icon: CameraIcon });
        navItems.push({ path: '/change-password', name: 'Ganti Password', icon: KeyRound });
        if (userRole === 'dev') {
            navItems.push({ path: '/dev', name: 'Dev Dashboard', icon: Monitor });
        }
    } else {
        navItems.push({ path: '/login', name: 'Login', icon: LogIn });
    }

    return (
        <nav className="flex w-full flex-col items-start gap-2">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `group relative flex w-full items-center rounded-lg p-3 transition-colors duration-200 ${isActive ? 'bg-yellow-400/10 text-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <item.icon className="h-6 w-6 flex-shrink-0" />
                            <span
                                className={`absolute left-12 whitespace-nowrap text-sm font-medium transition-all duration-300 ${isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                                    }`}
                            >
                                {item.name}
                            </span>
                            {isActive && (
                                <div className="absolute -left-1 top-1/2 h-8 w-1 -translate-y-1/2 transform rounded-r-full bg-yellow-400" />
                            )}
                        </>
                    )}
                </NavLink>
            ))}

            <button
                onClick={onReportClick}
                className="group relative flex w-full items-center rounded-lg p-3 transition-colors duration-200 text-gray-400 hover:bg-gray-800 hover:text-red-400"
            >
                <Flag className="h-6 w-6 flex-shrink-0" />
                <span
                    className={`absolute left-12 whitespace-nowrap text-sm font-medium transition-all duration-300 ${isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                        }`}
                >
                    Laporkan
                </span>
            </button>
        </nav>
    );
};

const Sidebar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [userNIM, setUserNIM] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [showMyProfile, setShowMyProfile] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const storedNIM = getCookie('userNIM');
        const storedRole = getCookie('userRole');
        setUserNIM(storedNIM || null);
        setUserRole(storedRole || null);

        if (storedNIM) {
            fetchUserAvatar(storedNIM);
        }
    }, [location]);

    const fetchUserAvatar = async (nim: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/user/${nim}`, {
                headers: {}, credentials: 'include'
            });
            const json = await res.json();
            if (res.ok && json.data) {
                setUserAvatar(json.data.avatar_url);
            }
        } catch (e) { }
    };

    const handleLogout = async () => {
        if (window.confirm("Yakin ingin logout?")) {
            try {
                await fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });
            } catch (e) { }

            deleteCookie('userToken');
            deleteCookie('userNIM');
            deleteCookie('userRole');

            setUserNIM(null);
            setUserRole(null);
            setUserAvatar(null);
            navigate('/login');
        }
    };

    const isLoggedIn = !!userNIM;

    const renderAvatar = (sizeClass: string = "w-6 h-6", iconSize: number = 24) => {
        if (userAvatar) {
            return <img src={userAvatar} alt="Profile" className={`${sizeClass} rounded-full object-cover border border-gray-700`} />;
        }
        return <UserCircle size={iconSize} className="text-yellow-400" />;
    };

    const getMobileNavItems = () => {
        const items = [...staticNavItems];
        if (isLoggedIn) {
            items.push({ path: '/find-nim', name: 'Find', icon: Search });
            items.push({ path: '/attendance', name: 'Absensi', icon: CalendarCheck });
            items.push({ path: '/gallery', name: 'Gallery', icon: CameraIcon });
            items.push({ path: '/change-password', name: 'Ganti Password', icon: KeyRound });
            if (userRole === 'dev') {
                items.push({ path: '/dev', name: 'Dev Dashboard', icon: Monitor });
            }
        } else {
            items.push({ path: '/login', name: 'Login', icon: LogIn });
        }
        return items;
    };

    return (
        <>
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <aside
                className={`fixed left-0 top-0 z-50 hidden h-full flex-col justify-between border-r border-gray-800 bg-black/80 pt-6 pb-0 backdrop-blur-sm transition-all duration-300 ease-in-out lg:flex selection:bg-yellow-400 selection:text-black ${isExpanded ? 'w-64 items-start px-4' : 'w-20 items-center'
                    }`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <div className="flex w-full flex-1 flex-col items-center gap-8 overflow-y-auto no-scrollbar pb-4">
                    <DesktopNavLinks
                        isExpanded={isExpanded}
                        isLoggedIn={isLoggedIn}
                        userRole={userRole}
                        onReportClick={() => setShowReport(true)}
                    />
                </div>

                {isLoggedIn && (
                    <div className="mt-auto w-full h-20 border-t border-gray-800 relative overflow-hidden flex-shrink-0 bg-black/80">
                        <div
                            onClick={() => setShowMyProfile(true)}
                            className={`absolute top-0 left-0 h-full flex items-center px-2 w-[80%] transition-all duration-300 ease-in-out cursor-pointer hover:bg-white/5 rounded-l-lg ${isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0 pointer-events-none'
                                }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                                <div className={`rounded-full flex-shrink-0 flex items-center justify-center ${userAvatar ? 'overflow-hidden' : 'bg-yellow-400/20 p-2'}`}>
                                    {renderAvatar(userAvatar ? "w-10 h-10" : "w-6 h-6", 24)}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-400">Logged in as</p>
                                    <p className="text-sm font-bold truncate text-white" title={userNIM || ''}>{userNIM}</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`absolute top-0 h-full flex items-center justify-center transition-all duration-300 ease-in-out ${isExpanded ? 'right-2 translate-x-0' : 'left-1/2 -translate-x-1/2'
                                }`}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={isExpanded ? 20 : 24} />
                            </button>
                        </div>
                    </div>
                )}
            </aside>

            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="fixed top-4 right-4 z-50 p-2 text-white transition-all duration-300 ease-in-out lg:hidden hover:bg-white/10 rounded-full"
                style={{ transform: isMobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <div
                className={`fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsMobileMenuOpen(false)}
            />
            <div
                className={`fixed top-0 left-0 z-[60] h-full w-64 bg-black border-r border-gray-800 pt-20 pb-6 px-4 transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-full flex-col justify-between">
                    <nav className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar pb-4">
                        {getMobileNavItems().map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors flex-shrink-0 ${isActive ? 'bg-yellow-400/10 text-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </NavLink>
                        ))}
                        <button
                            onClick={() => { setShowReport(true); setIsMobileMenuOpen(false); }}
                            className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors text-gray-400 hover:bg-gray-800 hover:text-red-400 flex-shrink-0"
                        >
                            <Flag size={20} /> Laporkan
                        </button>
                    </nav>

                    {isLoggedIn && (
                        <div className="border-t border-gray-800 pt-4 mt-4 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div
                                    className="flex items-center gap-3 overflow-hidden cursor-pointer"
                                    onClick={() => { setShowMyProfile(true); setIsMobileMenuOpen(false); }}
                                >
                                    <div className={`rounded-full flex-shrink-0 flex items-center justify-center ${userAvatar ? 'overflow-hidden' : 'bg-yellow-400/20 p-2'}`}>
                                        {renderAvatar(userAvatar ? "w-9 h-9" : "w-5 h-5", 20)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-gray-400">Logged in as</p>
                                        <p className="text-sm font-bold text-white truncate w-24">{userNIM}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="p-2 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showMyProfile && userNIM && (
                <ProfileModal
                    targetNim={userNIM}
                    currentUserNim={userNIM}
                    onClose={() => setShowMyProfile(false)}
                />
            )}

            {showReport && (
                <ReportModal onClose={() => setShowReport(false)} />
            )}
        </>
    );
};

export default Sidebar;
