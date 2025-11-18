
import React from 'react';
import { Mail } from 'lucide-react';
import { Phone } from 'lucide-react';
import { Instagram } from 'lucide-react';
import { MessageCircle } from 'lucide-react';

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
  {
    id: 1,
    name: 'Vhandika',
    role: '',
    avatarUrl: '/assets/rem.png',
    waLink: 'https://wa.me/62895322783560',
    igLink: 'https://instagram.com/vhandikanizar',
    lineLink: 'https://line.me/ti/p/andhika-nizar',
  },
  {
    id: 2,
    name: 'Raihan',
    role: 'Penimbun file',
    avatarUrl: '/assets/',
    waLink: 'https://wa.me/6282117506384',
    igLink: 'https://instagram.com/rai_hanjune',
    lineLink: 'https://line.me/ti/p/rai_han_june',
  },
  {
    id: 3,
    name: 'Lupa',
    role: 'Ketua Angkatan',
    avatarUrl: '/assets',
    waLink: 'https://wa.me/9999999',
    igLink: 'https://instagram.com/9999',
    lineLink: 'https://line.me/ti/p/9999',
  },
];

// Reusable Contact Card Component defined outside the main component
const ContactCard: React.FC<{ contact: Contact }> = ({ contact }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-lg p-6 text-center transition-all duration-300 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/10 hover:-translate-y-2">
      <img
        src={contact.avatarUrl}
        alt={contact.name}
        className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-yellow-400 object-cover"
      />
      <h3 className="text-xl font-bold text-white tracking-wider">{contact.name}</h3>
      <p className="text-yellow-400 text-sm mb-6">{contact.role}</p>
      <div className="flex justify-center items-center space-x-4">
        <a href={contact.waLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors">
          <Phone className="w-6 h-6" />
        </a>
        <a href={contact.igLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
          <Instagram className="w-6 h-6" />
        </a>
        <a href={contact.lineLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
};

const ContactUs: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
                 <div className="flex justify-center items-center gap-4 mb-4">
                     <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                        <span className="transform skew-x-12"><Mail size={32} /></span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">Contact Us</h1>
                </div>
                <div className="w-40 h-1 bg-yellow-400 mx-auto mt-8"></div>
             <div className="mx-auto mt-8 max-w-4xl space-y-8 text-gray-400 text-left"></div>
            </div>
            
            <div className="mx-auto mt-16 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {contacts.map((contact) => (
                        <ContactCard key={contact.id} contact={contact} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContactUs;