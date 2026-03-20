import React from 'react';
import { Mail } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

interface Contact {
    id: number;
    name: string;
    role: string;
    avatarUrl: string;
    waLink: string;
    igLink: string;
    lineLink: string;
}

const contacts: Contact[] = [

];

const ContactCard: React.FC<{ contact: Contact }> = ({ contact }) => {
    return (
        <div className="bg-gray-900/60 backdrop-blur-md border border-yellow-400/20 rounded-lg p-6 text-center transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:-translate-y-2 relative overflow-hidden group">
            <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-yellow-400 object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
            <h3 className="text-xl font-bold text-white tracking-wider drop-shadow-md">{contact.name}</h3>
            <p className="text-yellow-400 text-sm mb-6">{contact.role}</p>
            <div className="flex justify-center items-center space-x-4">
                <a href={contact.waLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 hover:scale-110 transition-all duration-300">
                    <i className="fa-brands fa-whatsapp text-2xl drop-shadow-md"></i>
                </a>
                <a href={contact.igLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 hover:scale-110 transition-all duration-300">
                    <i className="fa-brands fa-instagram text-2xl drop-shadow-md"></i>
                </a>
                <a href={contact.lineLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 hover:scale-110 transition-all duration-300">
                    <i className="fa-brands fa-line text-2xl drop-shadow-md"></i>
                </a>
            </div>
        </div>
    );
};

const ContactUs: React.FC = () => {
    return (
        <div className="relative min-h-screen w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-y-scroll selection:bg-yellow-400 selection:text-black">
            
            <ParticleBackground />

            <div className="relative z-10 mx-auto max-w-7xl text-center">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12 shadow-lg">
                            <span className="transform skew-x-12"><Mail size={32} /></span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl drop-shadow-lg">Contact Us</h1>
                    </div>
                </div>

                <div className="w-40 h-1 bg-yellow-400 mx-auto mt-8 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>

                <div className="mx-auto mt-16 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {contacts.map((contact) => (
                            <ContactCard key={contact.id} contact={contact} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;