import React from 'react';
import { Users } from 'lucide-react';

const About: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-y-scroll">     
            <div className="mx-auto max-w-7xl text-center">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                            <span className="transform skew-x-12"><Users size={32} /></span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">About Us</h1>
                    </div>
                </div>

                <div className="w-40 h-1 bg-yellow-400 mx-auto mt-8"></div>

                <div className="mx-auto mt-8 max-w-4xl space-y-8 text-gray-400 text-center">
                    <p>
                    </p>
                </div>
            </div>

            <footer className="mt-24 border-t border-gray-800 pt-12 pb-8 text-center text-gray-500">
                <span className="text-4xl font-bold tracking-[.2em] text-gray-700 block mb-8">SITH-S 25</span>
                <p className="text-xs">Copyright © SITES Angkatan 25.</p>
            </footer>
        </div>
    );
};

export default About;