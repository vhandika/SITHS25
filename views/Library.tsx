import React, { useState } from 'react';
import {
  Library as LibraryIcon, ArrowUpRight, ChevronDown
} from 'lucide-react';

export interface LibraryItem {
  id: number;
  title: string;
  description: string;
  image: string;
  driveLink: string;
  semester: number;
  category: 'mikrobiologi' | 'biologi';
}

const libraryData: LibraryItem[] = [
  {
    id: 1,
    title: 'Matematika I',
    description: '',
    image: 'https://rencanamu.id/assets/file_uploaded/blog/1572532392-shuttersto.jpg',
    driveLink: 'https://drive.google.com/drive/folders/17mAc-fHvjR-Ffj-H5ISX0Kuuo5rqnVQ2',
    semester: 1,
    category: 'mikrobiologi',
  },
  {
    id: 2,
    title: 'Fisika Dasar I',
    description: '',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5U20lOxpY0zZ_gktSIAwHKpXNc36Vc2pdLg&s',
    driveLink: 'https://drive.google.com/drive/folders/17uRIaxFB33GZ20YXJDABBs-DdImj2_v7',
    semester: 1,
    category: 'mikrobiologi',
  },
  {
    id: 3,
    title: 'Kimia Dasar I',
    description: '',
    image: 'https://www.meritstore.in/wp-content/uploads/2016/12/10-reasons-to-love-Chemistry.png',
    driveLink: 'https://drive.google.com/drive/folders/17wZPpaTlpktOX6KvTw-g5LSoGO2v0Dmy',
    semester: 1,
    category: 'mikrobiologi',
  },
  {
    id: 4,
    title: 'Berpikir Komputasional',
    description: '',
    image: 'https://bebras.uc.ac.id/wp-content/uploads/2023/03/4555e65ca6dc17e33db2bdc37b4bf285.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BGu_hCEZclmuF4uMfCeKHTQMGUl80q',
    semester: 1,
    category: 'mikrobiologi',
  },
  {
    id: 5,
    title: 'Bahasa Indonesia',
    description: '',
    image: 'https://img.tempo.co/indonesiana/images/all/2022/04/27/f202204271847093.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BaH0ZtwQwAzgO--YLpeMxR1s2-wnNU',
    semester: 1,
    category: 'mikrobiologi',
  },
  {
    id: 6,
    title: 'Pengantar Prinsip Keberlanjutan',
    description: '',
    image: 'https://www.shutterstock.com/shutterstock/videos/3524171411/thumb/12.jpg?ip=x480',
    driveLink: 'https://drive.google.com/drive/folders/1UXK6BdA_G9cnK8h5yFkLtreH2NusL32O?usp=drive_link',
    semester: 1,
    category: 'mikrobiologi',
  },
  {
    id: 7,
    title: 'Laboratorium Fisika Dasar',
    description: '',
    image: 'https://physics.ipb.ac.id/wp-content/uploads/2022/11/IMG20221101093144-scaled.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1mTZKJckkdk3YeF5x-eZDeEerspTCkaiB',
    semester: 1,
    category: 'mikrobiologi',
  },
  {
    id: 8,
    title: 'Laboratorium Kimia Dasar',
    description: '',
    image: 'https://www.acrossinternational.com.au/web/image/28268-29c10fb8/Chemistry%20Lab%20Equipment%20.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1PIs9eUDa-klzzagF5cne2Bd9IXns-rq2',
    semester: 1,
    category: 'mikrobiologi',
  },
  {
    id: 1,
    title: 'Matematika I',
    description: '',
    image: 'https://rencanamu.id/assets/file_uploaded/blog/1572532392-shuttersto.jpg',
    driveLink: 'https://drive.google.com/drive/folders/17mAc-fHvjR-Ffj-H5ISX0Kuuo5rqnVQ2',
    semester: 1,
    category: 'biologi',
  },
  {
    id: 2,
    title: 'Fisika Dasar I',
    description: '',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5U20lOxpY0zZ_gktSIAwHKpXNc36Vc2pdLg&s',
    driveLink: 'https://drive.google.com/drive/folders/17uRIaxFB33GZ20YXJDABBs-DdImj2_v7',
    semester: 1,
    category: 'biologi',
  },
  {
    id: 3,
    title: 'Kimia Dasar I',
    description: '',
    image: 'https://www.meritstore.in/wp-content/uploads/2016/12/10-reasons-to-love-Chemistry.png',
    driveLink: 'https://drive.google.com/drive/folders/17wZPpaTlpktOX6KvTw-g5LSoGO2v0Dmy',
    semester: 1,
    category: 'biologi',
  },
  {
    id: 4,
    title: 'Berpikir Komputasional',
    description: '',
    image: 'https://bebras.uc.ac.id/wp-content/uploads/2023/03/4555e65ca6dc17e33db2bdc37b4bf285.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BGu_hCEZclmuF4uMfCeKHTQMGUl80q',
    semester: 1,
    category: 'biologi',
  },
  {
    id: 5,
    title: 'Bahasa Indonesia',
    description: '',
    image: 'https://img.tempo.co/indonesiana/images/all/2022/04/27/f202204271847093.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BaH0ZtwQwAzgO--YLpeMxR1s2-wnNU',
    semester: 1,
    category: 'biologi',
  },
  {
    id: 6,
    title: 'Pengantar Prinsip Keberlanjutan',
    description: '',
    image: 'https://www.shutterstock.com/shutterstock/videos/3524171411/thumb/12.jpg?ip=x480',
    driveLink: 'https://drive.google.com/drive/folders/1UXK6BdA_G9cnK8h5yFkLtreH2NusL32O?usp=drive_link',
    semester: 1,
    category: 'biologi',
  },
  {
    id: 7,
    title: 'Laboratorium Fisika Dasar',
    description: '',
    image: 'https://physics.ipb.ac.id/wp-content/uploads/2022/11/IMG20221101093144-scaled.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1mTZKJckkdk3YeF5x-eZDeEerspTCkaiB',
    semester: 1,
    category: 'biologi',
  },
  {
    id: 8,
    title: 'Laboratorium Kimia Dasar',
    description: '',
    image: 'https://www.acrossinternational.com.au/web/image/28268-29c10fb8/Chemistry%20Lab%20Equipment%20.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1PIs9eUDa-klzzagF5cne2Bd9IXns-rq2',
    semester: 1,
    category: 'biologi',
  },

];

const Library: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<'mikrobiologi' | 'biologi'>('mikrobiologi');
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);

  const filteredItems = libraryData.filter(item =>
    item.semester === selectedSemester && item.category === selectedCategory
  );

  const semesters = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="relative min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">

      <div className="mx-auto max-w-7xl text-center transition-all duration-300">
        <div className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
              <span className="transform skew-x-12"><LibraryIcon size={32} /></span>
            </div>
            <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">Library</h1>
          </div>
        </div>

        <div className="w-40 h-1 bg-yellow-400 mx-auto mt-8"></div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 my-12">
          <div className="relative w-48 z-20">
            <button
              onClick={() => setIsSemesterOpen(!isSemesterOpen)}
              className={`w-full flex items-center justify-between px-6 py-3 bg-black border-2 transition-all duration-300 transform -skew-x-12 ${isSemesterOpen ? 'border-gray-700 text-yellow-400' : 'border-gray-800 text-white hover:border-gray-700'
                }`}
            >
              <span className="transform skew-x-12 font-bold uppercase tracking-widest text-sm">
                Semester {selectedSemester}
              </span>
              <ChevronDown className={`transform skew-x-12 transition-transform duration-300 ${isSemesterOpen ? 'rotate-180 text-yellow-400' : 'text-gray-500'}`} size={20} />
            </button>

            <div className={`absolute top-full left-0 right-0 mt-2 bg-black border-2 border-gray-800 transition-all duration-300 transform origin-top overflow-hidden ${isSemesterOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
              }`}>
              <div className="flex flex-col">
                {semesters.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedSemester(s);
                      setIsSemesterOpen(false);
                    }}
                    className={`px-6 py-2 text-sm font-bold uppercase tracking-widest transition-colors duration-200 text-left ${selectedSemester === s ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'
                      }`}
                  >
                    Semester {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-900/50 p-1 rounded-full border border-gray-800 relative w-64 h-12">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-yellow-400 rounded-full transition-all duration-500 ease-in-out z-0 ${selectedCategory === 'biologi' ? 'left-[calc(50%+2px)]' : 'left-1'
                }`}
            />

            <button
              onClick={() => setSelectedCategory('mikrobiologi')}
              className={`flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-300 ${selectedCategory === 'mikrobiologi' ? 'text-black' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">Mikrobiologi</span>
            </button>

            <button
              onClick={() => setSelectedCategory('biologi')}
              className={`flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-300 ${selectedCategory === 'biologi' ? 'text-black' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter">Biologi</span>
            </button>
          </div>
        </div>

        <div className="min-h-[50vh] w-full">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <a key={item.id} href={item.driveLink} target="_blank" rel="noopener noreferrer" className="group relative block bg-black rounded-xl overflow-hidden shadow-lg hover:shadow-yellow-500/40 transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-yellow-400">
                  <img src={item.image} alt={item.title} className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-gray-300 text-sm">{item.description}</p>
                  </div>
                  <ArrowUpRight className="absolute top-4 right-4 w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-colors duration-300 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100" />
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-pulse">
              <div className="w-16 h-16 mb-4 border-2 border-gray-800 rounded-full flex items-center justify-center">
                <LibraryIcon size={32} className="text-gray-700" />
              </div>
              <p className="font-bold uppercase tracking-widest text-sm">Belum ada data untuk semester {selectedSemester} - {selectedCategory}. </p>
              <p className="font-bold uppercase tracking-widest text-sm">antara aku males atau akademiknya belum update drive :v</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
