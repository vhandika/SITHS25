import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Library, Newspaper, Users, Mail, X, Menu} from 'lucide-react';
import type { NavItem } from '../types';

const navItems: NavItem[] = [
    { path: '/', name: 'Home', icon: Home },
    { path: '/library', name: 'Library', icon: Library },
    { path: '/news', name: 'News', icon: Newspaper },
    { path: '/about', name: 'About Us', icon: Users },
    { path: '/contact', name: 'Contact Us', icon: Mail },
];

interface NavLinksProps {
    isExpanded: boolean;
    onLinkClick?: () => void;
}

const DesktopNavLinks: React.FC<NavLinksProps> = ({ isExpanded }) => (
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


const Sidebar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 hidden h-full flex-col justify-between border-r border-gray-800 bg-black/80 py-6 backdrop-blur-sm transition-all duration-300 ease-in-out lg:flex ${
                    isExpanded ? 'w-64 items-start px-4' : 'w-20 items-center'
                }`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <div className="flex w-full flex-col items-center gap-8">
                    <DesktopNavLinks isExpanded={isExpanded} />
                </div>
            </aside>
            
            {/* Mobile Header and Menu */}
            <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between bg-black/80 px-4 backdrop-blur-sm lg:hidden">
                 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="z-50 text-white">
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-30 bg-black/90 pt-20 transition-opacity duration-300 lg:hidden ${
                    isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="flex h-full flex-col items-center justify-center">
                    <nav className="flex flex-col gap-6 text-center">
                         {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `text-2xl font-bold transition-colors ${
                                        isActive ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'
                                    }`
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Sidebar;