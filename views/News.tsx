import React, { useState } from 'react';
import { Newspaper } from 'lucide-react';

// SVG Icons to replace lucide-react for self-containment
const ChevronLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
);
  
const ChevronRight: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
);
  
const X: React.FC<React.SVGProps<SVGSVGElement> & { size?: number }> = ({ size = 24, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
);

// Types and Components defined here for self-containment.
interface NewsArticle {
    id: number;
    title: string;
    date: string;
    imageUrl: string;
    category: string;
    content: string;
}

const mockNews: NewsArticle[] = [
    { id: 1, title: 'Alpha test 0.35', date: '18-11-2025', imageUrl: 'https://c4.wallpaperflare.com/wallpaper/875/771/688/anime-no-game-no-life-izuna-hatsuse-shiro-no-game-no-life-wallpaper-preview.jpg', category: 'Website', content: 'Hai haii... aku jadi penasaran. apa ada ya orang yang baca ini? entahlah. Di sini aku mau yapping gak jelas, jadi skip aja.\n\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa \n\nbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
    { id: 2, title: 'Alpha test 0.3', date: '09-11-2025', imageUrl: 'https://wallpaper.forfun.com/fetch/2e/2ef2fd0962ff2f23118af38f00ded39b.jpeg', category: 'Website', content: 'Hai haii... Di sini aku bikin menu-menu yang lain, termasuk menu News ini  XD (Fun fact: semua konten News dibikinnya hari ini)' },
    { id: 3, title: 'Alpha test 0.15', date: '26-10-2025', imageUrl: 'https://images3.alphacoders.com/830/thumb-1920-830011.png', category: 'Website', content: 'Hai hai.... Di sini aku cuman mau bikin + ngetes versi mobile doang sih XD' },
    { id: 4, title: 'Alpha test 0.1', date: '12-10-2025', imageUrl: 'https://c4.wallpaperflare.com/wallpaper/555/335/744/sora-no-game-no-life-jibril-anime-shiro-no-game-no-life-wallpaper-preview.jpg', category: 'Website', content: 'Hai, haii... progres pertama aku bikin homepage ama side menu-nya. Sebenrarnya awal-awal aku pengen kayak acads FTI gitu, tapi kalau mirip malah dibilang plagiat :v Makanya websitenya kayak gini' },
];

const NewsCard: React.FC<{ article: NewsArticle; isFeatured: boolean; onClick: () => void; }> = ({ article, isFeatured, onClick }) => (
    <div 
        onClick={onClick}
        className={`group relative w-full shrink-0 transform cursor-pointer overflow-hidden transition-all duration-500 ease-in-out ${isFeatured ? 'lg:w-[60%]' : 'lg:w-[18%]'}`}
    >
        <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className={`absolute bottom-0 left-0 w-full p-4 transition-all duration-500 ${isFeatured ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'}`}>
            <div className="mb-2 bg-yellow-400 px-3 py-1 text-sm font-bold text-black transform -skew-x-12 inline-block">
                <span className="inline-block transform skew-x-12">{article.category}</span>
            </div>
            <h3 className="text-xl font-bold text-white truncate">{article.title}</h3>
        </div>
    </div>
);


const App: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? mockNews.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === mockNews.length - 1 ? 0 : prevIndex + 1));
    };
    
    const handleCardClick = (article: NewsArticle) => {
        setSelectedArticle(article);
    }
    
    const closeArticle = () => {
        setSelectedArticle(null);
    }

    return (
        <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col items-center gap-8 lg:flex-row">
                    <div className="relative flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
                    </div>

                    <div className="w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
                                            <span className="transform skew-x-12"><Newspaper size={32} /></span>
                            </div>
                            <h2 className="text-3xl font-bold uppercase tracking-wider text-white sm:text-4xl">News</h2>
                        </div>
                        <div className="mt-4 border-l-4 border-yellow-400 pl-4">
                            <p className="text-sm text-gray-400">{mockNews[currentIndex].date}</p>
                            <h3 className="text-2xl font-semibold text-white">{mockNews[currentIndex].title}</h3>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <div className="relative h-[400px] w-full overflow-hidden">
                        {/* Mobile view slider */}
                        <div className="lg:hidden flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                           {mockNews.map((article) => (
                                <div key={article.id} className="relative w-full h-full flex-shrink-0 cursor-pointer" onClick={() => handleCardClick(article)}>
                                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="mb-2 bg-yellow-400 px-3 py-1 text-sm font-bold text-black transform -skew-x-12 inline-block">
                                            <span className="inline-block transform skew-x-12">{article.category}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">{article.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                         {/* Desktop view */}
                        <div className="hidden lg:flex absolute inset-0 gap-2">
                           {mockNews.map((article, index) => (
                               <NewsCard key={article.id} article={article} isFeatured={index === currentIndex} onClick={() => handleCardClick(article)} />
                           ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                    <button onClick={handlePrev} className="p-2 border-2 border-gray-600 text-gray-400 hover:border-white hover:text-white transition-colors">
                        <ChevronLeft />
                    </button>
                    <button onClick={handleNext} className="p-2 border-2 border-gray-600 text-gray-400 hover:border-white hover:text-white transition-colors">
                        <ChevronRight />
                    </button>
                </div>
            </div>
            
            <footer className="mt-24 border-t border-gray-800 pt-12 pb-8 text-center text-gray-500">
                <div className="flex justify-center mb-8">
                     <span className="text-4xl font-bold tracking-[.2em] text-gray-700">SITH-S 25</span>
                </div>
                <p className="text-xs">Copyright © SITES Angkatan 25.</p>
            </footer>

            {/* Article Detail Modal */}
            <div 
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${selectedArticle ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeArticle}
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
                <div
                    className={`relative w-full max-w-3xl h-[90vh] max-h-[800px] bg-gray-900 shadow-2xl shadow-yellow-500/10 text-white rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out ${selectedArticle ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {selectedArticle && (
                        <div className="h-full overflow-y-auto">
                            <div className="relative h-1/2 md:h-3/5">
                                <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                                <button
                                    onClick={closeArticle}
                                    className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-yellow-400 hover:text-black transition-colors z-10"
                                    aria-label="Close article"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="mb-4 bg-yellow-400 px-3 py-1 text-sm font-bold text-black transform -skew-x-12 inline-block">
                                    <span className="inline-block transform skew-x-12">{selectedArticle.category}</span>
                                </div>
                                <h2 className="text-3xl font-bold text-yellow-400 mb-2">{selectedArticle.title}</h2>
                                <p className="text-sm text-gray-400 mb-6">{selectedArticle.date}</p>
                                <div className="space-y-4 text-gray-300 leading-relaxed">
                                    {selectedArticle.content.split('\n').map((paragraph, i) => (
                                        <p key={i} className="break-words">{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
