import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
    Home, Library, Newspaper, Users, Mail, X, Menu, 
    LogIn, LogOut, KeyRound, UserCircle, CameraIcon, Search,  CalendarCheck
} from 'lucide-react'

const staticNavItems = [
    { path: '/', name: 'Home', icon: Home },
    { path: '/library', name: 'Library', icon: Library },
    { path: '/news', name: 'News', icon: Newspaper },
    { path: '/about', name: 'About Us', icon: Users },
    { path: '/contact', name: 'Contact Us', icon: Mail },
];

interface NavLinksProps {
    isExpanded: boolean;
    isLoggedIn: boolean;
    userRole: string | null;
}

const DesktopNavLinks: React.FC<NavLinksProps> = ({ isExpanded, isLoggedIn, userRole }) => {
    const navItems = [...staticNavItems];

    if (isLoggedIn) {
        navItems.push({ path: '/find-nim', name: 'Cari', icon: Search });
        navItems.push({ path: '/attendance', name: 'Absensi', icon: CalendarCheck }); 
        navItems.push({ path: '/gallery', name: 'Gallery', icon: CameraIcon });
        navItems.push({ path: '/change-password', name: 'Ganti Password', icon: KeyRound });
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
                        `group relative flex w-full items-center rounded-lg p-3 transition-colors duration-200 ${
                            isActive ? 'bg-yellow-400/10 text-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <item.icon className="h-6 w-6 flex-shrink-0" />
                            <span
                                className={`absolute left-12 whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                                    isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
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
        </nav>
    );
};

const Sidebar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [userNIM, setUserNIM] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const storedNIM = localStorage.getItem('userNIM');
        const storedRole = localStorage.getItem('userRole');
        setUserNIM(storedNIM);
        setUserRole(storedRole);
    }, [location]);

    const handleLogout = () => {
        if (window.confirm("Yakin ingin logout?")) {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userNIM');
            localStorage.removeItem('userRole');
            setUserNIM(null);
            setUserRole(null);
            navigate('/login');
        }
    };

    const isLoggedIn = !!userNIM;

    const getMobileNavItems = () => {
        const items = [...staticNavItems];
        if (isLoggedIn) {
           items.push({ path: '/find-nim', name: 'Cari NIM', icon: Search });
           items.push({ path: '/attendance', name: 'Absensi', icon: CalendarCheck });
           items.push({ path: '/gallery', name: 'Gallery', icon: CameraIcon });
           items.push({ path: '/change-password', name: 'Ganti Password', icon: KeyRound });
        } else {
           items.push({ path: '/login', name: 'Login', icon: LogIn });
        }
        return items;
    };

    return (
        <>
            <aside
                className={`fixed left-0 top-0 z-50 hidden h-full flex-col justify-between border-r border-gray-800 bg-black/80 pt-6 pb-0 backdrop-blur-sm transition-all duration-300 ease-in-out lg:flex ${
                    isExpanded ? 'w-64 items-start px-4' : 'w-20 items-center'
                }`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <div className="flex w-full flex-1 flex-col items-center gap-8">
                    <DesktopNavLinks 
                        isExpanded={isExpanded} 
                        isLoggedIn={isLoggedIn} 
                        userRole={userRole}
                    />
                </div>

                {isLoggedIn && (
                    <div className="mt-auto w-full h-20 border-t border-gray-800 relative overflow-hidden">
                        <div 
                            className={`absolute top-0 left-0 h-full flex items-center px-2 w-[80%] transition-all duration-300 ease-in-out ${
                                isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0 pointer-events-none'
                            }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                                <div className="bg-yellow-400/20 p-2 rounded-full flex-shrink-0">
                                    <UserCircle size={24} className="text-yellow-400" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-400">Logged in as</p>
                                    <p className="text-sm font-bold truncate text-white" title={userNIM || ''}>{userNIM}</p>
                                </div>
                            </div>
                        </div>

                        <div 
                            className={`absolute top-0 h-full flex items-center justify-center transition-all duration-300 ease-in-out ${
                                isExpanded ? 'right-2 translate-x-0' : 'left-1/2 -translate-x-1/2'
                            }`}
                        >
                            <button 
                                onClick={handleLogout}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={isExpanded ? 20 : 24} />
                            </button>
                        </div>

                    </div>
                )}
            </aside>

            <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between bg-black/80 px-4 backdrop-blur-sm lg:hidden">
                 <div className="text-white font-bold"></div>
                 <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                    className="z-50 text-white transition-transform duration-300 ease-in-out"
                    style={{ transform: isMobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                 >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </header>
            <div
                className={`fixed inset-0 z-30 bg-black/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
                    isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
            />
            <div
                className={`fixed top-0 left-0 z-40 h-full w-64 bg-black border-r border-gray-800 pt-20 pb-6 px-4 transition-transform duration-300 ease-in-out lg:hidden ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-full flex-col justify-between">
                    <nav className="flex flex-col gap-2">
                         {getMobileNavItems().map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors ${
                                        isActive ? 'bg-yellow-400/10 text-yellow-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {isLoggedIn && (
                         <div className="border-t border-gray-800 pt-4 mt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-yellow-400/20 p-2 rounded-full flex-shrink-0">
                                        <UserCircle size={20} className="text-yellow-400" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-gray-400">Logged in as</p>
                                        <p className="text-sm font-bold text-white truncate w-24">{userNIM}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="p-2 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;