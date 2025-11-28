import React, { useState } from 'react';
import { Library as LibraryIcon, ArrowUpRight } from 'lucide-react';
import SkewedButton from '../components/SkewedButton'; // Pastikan path import ini benar

export interface LibraryItem {
  id: number;
  title: string;
  description: string;
  image: string;
  driveLink: string;
  semester: 1 | 2;
}

const libraryData: LibraryItem[] = [
  {
    id: 1,
    title: 'Matematika I',
    description: '',
    image: 'https://rencanamu.id/assets/file_uploaded/blog/1572532392-shuttersto.jpg',
    driveLink: 'https://drive.google.com/drive/folders/17mAc-fHvjR-Ffj-H5ISX0Kuuo5rqnVQ2',
    semester: 1,
  },
  {
    id: 2,
    title: 'Fisika Dasar I',
    description: '',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5U20lOxpY0zZ_gktSIAwHKpXNc36Vc2pdLg&s',
    driveLink: 'https://drive.google.com/drive/folders/17uRIaxFB33GZ20YXJDABBs-DdImj2_v7',
    semester: 1,
  },
  {
    id: 3,
    title: 'Kimia Dasar I',
    description: '',
    image: 'https://www.meritstore.in/wp-content/uploads/2016/12/10-reasons-to-love-Chemistry.png',
    driveLink: 'https://drive.google.com/drive/folders/17wZPpaTlpktOX6KvTw-g5LSoGO2v0Dmy',
    semester: 1,
  },
  {
    id: 4,
    title: 'Berpikir Komputasional',
    description: '',
    image: 'https://bebras.uc.ac.id/wp-content/uploads/2023/03/4555e65ca6dc17e33db2bdc37b4bf285.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BGu_hCEZclmuF4uMfCeKHTQMGUl80q',
    semester: 1,
  },
  {
    id: 9,
    title: 'Bahasa Indonesia',
    description: '',
    image: 'https://img.tempo.co/indonesiana/images/all/2022/04/27/f202204271847093.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BaH0ZtwQwAzgO--YLpeMxR1s2-wnNU',
    semester: 1,
  },
  {
    id: 5,
    title: 'Pengantar Prinsip Keberlanjutan',
    description: '',
    image: 'https://www.shutterstock.com/shutterstock/videos/3524171411/thumb/12.jpg?ip=x480',
    driveLink: 'https://drive.google.com/drive/folders/1UXK6BdA_G9cnK8h5yFkLtreH2NusL32O?usp=drive_link',
    semester: 1,
  },
  {
    id: 6,
    title: 'Laboratorium Fisika Dasar',
    description: '',
    image: 'https://physics.ipb.ac.id/wp-content/uploads/2022/11/IMG20221101093144-scaled.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1mTZKJckkdk3YeF5x-eZDeEerspTCkaiB',
    semester: 1,
  },
  {
    id: 7,
    title: 'Laboratorium Kimia Dasar',
    description: '',
    image: 'https://www.acrossinternational.com.au/web/image/28268-29c10fb8/Chemistry%20Lab%20Equipment%20.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1PIs9eUDa-klzzagF5cne2Bd9IXns-rq2',
    semester: 1,
  },
];

const Library: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const filteredItems = libraryData.filter(item => item.semester === selectedSemester);

  return (
    <div className="min-h-screen w-full bg-black py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans">
      <div className="mx-auto max-w-7xl text-center">
        <div className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 text-black transform -skew-x-12">
              <span className="transform skew-x-12"><LibraryIcon size={32} /></span>
            </div>
            <h1 className="text-4xl font-bold tracking-wider uppercase text-white sm:text-5xl">Library</h1>
          </div>
        </div>
        
        <div className="w-40 h-1 bg-yellow-400 mx-auto mt-8"></div>

        <div className="flex justify-center items-center gap-6 my-12">
          <SkewedButton
            onClick={() => setSelectedSemester(1)}
            variant={selectedSemester === 1 ? 'primary' : 'secondary'}
          >
            Semester 1
          </SkewedButton>
          
          <SkewedButton
            onClick={() => setSelectedSemester(2)}
            variant={selectedSemester === 2 ? 'primary' : 'secondary'}
          >
            Semester 2
          </SkewedButton>
        </div>

        <div className="min-h-[50vh] w-full">
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block bg-black rounded-xl overflow-hidden shadow-lg hover:shadow-yellow-500/40 transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-yellow-400"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
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
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Library;