import React, { useState, useEffect, useRef } from 'react';
import {
  Library as LibraryIcon, ArrowUpRight, ChevronDown
} from 'lucide-react';
import LibraryViewer from '../components/LibraryViewer';

export interface LibraryItem {
  id: number;
  title: string;
  description: string;
  image: string;
  driveLink: string;
  semester: number;
  category: 'mikrobiologi' | 'biologi';
  type?: 'file' | 'folder';
  children?: LibraryItem[];
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
    type: 'folder',
    children: [
      {
        id: 101,
        title: 'Soal UTS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1fzPl9C1zYXJwyJeH93KuB5tqvudwjMVd?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'folder',
        children: [
         {
        id: 1,
        title: 'Soal UTS 2024',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1rAPOmC2LH3-3CtOc7wGDQ1Gj7uHDGRBc/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'file'
      },
      {
        id: 2,
        title: 'Soal UTS 2023',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1jG2K-rCRf_iAAb-v96NSxLNqDqkYRIm1/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'file'
      },
      {
        id: 3,
        title: 'Soal UTS 2022',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1miTF-Q9JD1_biuudjFQRu5ddOpCP_Ja3/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'file'
      },
      {
        id: 4,
        title: 'Soal UTS 2021',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1X5Nvbkab1UsGZufXtd05HJM2swYhMFaC/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'file'
      },
      {
        id: 5,
        title: 'Soal UTS 2019',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1npHqDYZj3qURmuIDMM_Igw23f06-qZVo/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'file'
      },
      {
        id: 6,
        title: 'Latihan UTS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1Xk3D4BkchcIbIkyQRaccx9fXDhILpq6G/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'file'
      }
        ]
      },
      {
        id: 102,
        title: 'Soal UAS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/17mAc-fHvjR-Ffj-H5ISX0Kuuo5rqnVQ2',
        semester: 1,
        category: 'mikrobiologi',
        type: 'folder',
        children: [
        
        ]
      },
      {
        id: 103,
        title: 'Silabus MA1101 Matematika I.pdf',
        description: 'File Silabus resmi.',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1xsGqZZq7r58F2xIyjsvkukXCUP7VMjOE/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'file'
      }
    ]
  },
  {
    id: 2,
    title: 'Fisika Dasar I',
    description: '',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5U20lOxpY0zZ_gktSIAwHKpXNc36Vc2pdLg&s',
    driveLink: 'https://drive.google.com/drive/folders/17uRIaxFB33GZ20YXJDABBs-DdImj2_v7',
    semester: 1,
    category: 'mikrobiologi',
    type: 'folder',
    children: [
      {
        id: 104,
        title: 'Soal UTS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1X5Nvbkab1UsGZufXtd05HJM2swYhMFaC/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'folder',
        children: [
          {
            id: 1,
            title: 'Solusi UTS sesi 1 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/15mNrsubg3WMMrHY0y1ugCW1nvFQCheAS/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          },
          {
            id: 2,
            title: 'Solusi UTS sesi 2 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1RiVSbB6phP18MuybetdP7bL6SaB20CNY/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          },
          {
            id: 3,
            title: 'Solusi UTS sesi 3 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1s2VyPhEKCzloyvph6Oo_UIlE2zcozyj8/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          }
        ]
      },
      {
        id: 205,
        title: 'Soal UAS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1X5Nvbkab1UsGZufXtd05HJM2swYhMFaC/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'folder',
        children: [
          {
            id: 1,
            title: 'Solusi UAS sesi 1 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1_oiuCjhmHVe5q0r8gyThp91rlPQICLvZ/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          },
          {
            id: 2,
            title: 'Solusi UAS sesi 2 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1X9PJnnx3UUF3F4pfBQCERca6Uhr_k9t4/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          }
        ]
      },
      {
        id: 206,
        title: 'Soal UP',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1xsGqZZq7r58F2xIyjsvkukXCUP7VMjOE/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'folder',
        children: [
          {
            id: 1,
            title: 'Solusi UP 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1w_aZbVPDDhydfpadv2SNBPtCQ-4K1zwA/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          }
        ]
      },
      {
        id: 207,
        title: 'Soal LTM',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1xsGqZZq7r58F2xIyjsvkukXCUP7VMjOE/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'folder',
        children: [
          {
            id: 1,
            title: 'Soal LTM 1 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1idhzVCBIHopU7xUNp2rjM0UFuzud63PZ/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          },
          {
            id: 2,
            title: 'Soal LTM 2 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/17B2IkGLrvhGpZwdefIzNt2cB2P2hHA52/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          },
          {
            id: 3,
            title: 'Soal LTM 3 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1bt54jr1KTCSJ-Y0Uc3Rw1ZDAY06f7G-z/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          },
          {
            id: 4,
            title: 'Soal LTM 4 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1fP9AoJw90Voes14wthHw0sjAMATDBKO1/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          },
          {
            id: 5,
            title: 'Solusi LTM 5 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1ppmpeXN0CAfd0ErVpvkcw5YIE_7oMKJa/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          },
          {
            id: 6,
            title: 'Solusi LTM 6 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1RiO7DpopZnKuKUQ7Y4ORqUOqEqkHIDAm/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          },
          {
            id: 7,
            title: 'Solusi LTM 7 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1UHytUCltUDgiHUdS39sDw36X3le9ejrM/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          }
        ]
      },
      {
        id: 208,
        title: 'Silabus Perkuliahan',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1UHytUCltUDgiHUdS39sDw36X3le9ejrM/view?usp=drive_link',
        semester: 1,
        category: 'mikrobiologi',
        type: 'folder',
        children: [
          {
            id: 1,
            title: 'Satuan Acara Perkuliahan Fisika Dasar I 2025/2026',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1bhZZkV1plertI7YORLOWTHLuz5Klwvar/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          },
          {
            id: 2,
            title: 'Peraturan Perkuliahan Fisika Dasar I 2025/2026',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1njGFkm1rtP1uL1xiq29pPRfv8TqOF22S/view?usp=drive_link',
            semester: 1,
            category: 'mikrobiologi',
            type: 'file'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Kimia Dasar I',
    description: '',
    image: 'https://www.meritstore.in/wp-content/uploads/2016/12/10-reasons-to-love-Chemistry.png',
    driveLink: 'https://drive.google.com/drive/folders/17wZPpaTlpktOX6KvTw-g5LSoGO2v0Dmy',
    semester: 1,
    category: 'mikrobiologi',
    type: 'folder'
  },
  {
    id: 4,
    title: 'Berpikir Komputasional',
    description: '',
    image: 'https://bebras.uc.ac.id/wp-content/uploads/2023/03/4555e65ca6dc17e33db2bdc37b4bf285.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BGu_hCEZclmuF4uMfCeKHTQMGUl80q',
    semester: 1,
    category: 'mikrobiologi',
    type: 'folder'
  },
  {
    id: 5,
    title: 'Bahasa Indonesia',
    description: '',
    image: 'https://img.tempo.co/indonesiana/images/all/2022/04/27/f202204271847093.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BaH0ZtwQwAzgO--YLpeMxR1s2-wnNU',
    semester: 1,
    category: 'mikrobiologi',
    type: 'folder'
  },
  {
    id: 6,
    title: 'Pengantar Prinsip Keberlanjutan',
    description: '',
    image: 'https://www.shutterstock.com/shutterstock/videos/3524171411/thumb/12.jpg?ip=x480',
    driveLink: 'https://drive.google.com/drive/folders/1UXK6BdA_G9cnK8h5yFkLtreH2NusL32O?usp=drive_link',
    semester: 1,
    category: 'mikrobiologi',
    type: 'folder'
  },
  {
    id: 7,
    title: 'Laboratorium Fisika Dasar',
    description: '',
    image: 'https://physics.ipb.ac.id/wp-content/uploads/2022/11/IMG20221101093144-scaled.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1mTZKJckkdk3YeF5x-eZDeEerspTCkaiB',
    semester: 1,
    category: 'mikrobiologi',
    type: 'folder'
  },
  {
    id: 8,
    title: 'Laboratorium Kimia Dasar',
    description: '',
    image: 'https://www.acrossinternational.com.au/web/image/28268-29c10fb8/Chemistry%20Lab%20Equipment%20.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1PIs9eUDa-klzzagF5cne2Bd9IXns-rq2',
    semester: 1,
    category: 'mikrobiologi',
    type: 'folder'
  },
  {
    id: 1,
    title: 'Matematika I',
    description: '',
    image: 'https://rencanamu.id/assets/file_uploaded/blog/1572532392-shuttersto.jpg',
    driveLink: 'https://drive.google.com/drive/folders/17mAc-fHvjR-Ffj-H5ISX0Kuuo5rqnVQ2',
    semester: 1,
    category: 'biologi',
    type: 'folder',
    children: [
      {
        id: 101,
        title: 'Soal UTS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1fzPl9C1zYXJwyJeH93KuB5tqvudwjMVd?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'folder',
        children: [
         {
        id: 1,
        title: 'Soal UTS 2024',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1rAPOmC2LH3-3CtOc7wGDQ1Gj7uHDGRBc/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'file'
      },
      {
        id: 2,
        title: 'Soal UTS 2023',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1jG2K-rCRf_iAAb-v96NSxLNqDqkYRIm1/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'file'
      },
      {
        id: 3,
        title: 'Soal UTS 2022',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1miTF-Q9JD1_biuudjFQRu5ddOpCP_Ja3/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'file'
      },
      {
        id: 4,
        title: 'Soal UTS 2021',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1X5Nvbkab1UsGZufXtd05HJM2swYhMFaC/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'file'
      },
      {
        id: 5,
        title: 'Soal UTS 2019',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1npHqDYZj3qURmuIDMM_Igw23f06-qZVo/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'file'
      },
      {
        id: 6,
        title: 'Latihan UTS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1Xk3D4BkchcIbIkyQRaccx9fXDhILpq6G/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'file'
      }
        ]
      },
      {
        id: 102,
        title: 'Soal UAS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/17mAc-fHvjR-Ffj-H5ISX0Kuuo5rqnVQ2',
        semester: 1,
        category: 'biologi',
        type: 'folder',
        children: [
        
        ]
      },
      {
        id: 103,
        title: 'Silabus MA1101 Matematika I.pdf',
        description: 'File Silabus resmi.',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1xsGqZZq7r58F2xIyjsvkukXCUP7VMjOE/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'file'
      }
    ]
  },
  {
    id: 2,
    title: 'Fisika Dasar I',
    description: '',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5U20lOxpY0zZ_gktSIAwHKpXNc36Vc2pdLg&s',
    driveLink: 'https://drive.google.com/drive/folders/17uRIaxFB33GZ20YXJDABBs-DdImj2_v7',
    semester: 1,
    category: 'biologi',
    type: 'folder',
    children: [
      {
        id: 104,
        title: 'Soal UTS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1X5Nvbkab1UsGZufXtd05HJM2swYhMFaC/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'folder',
        children: [
          {
            id: 1,
            title: 'Solusi UTS sesi 1 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/15mNrsubg3WMMrHY0y1ugCW1nvFQCheAS/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          },
          {
            id: 2,
            title: 'Solusi UTS sesi 2 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1RiVSbB6phP18MuybetdP7bL6SaB20CNY/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          },
          {
            id: 3,
            title: 'Solusi UTS sesi 3 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1s2VyPhEKCzloyvph6Oo_UIlE2zcozyj8/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          }
        ]
      },
      {
        id: 205,
        title: 'Soal UAS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1X5Nvbkab1UsGZufXtd05HJM2swYhMFaC/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'folder',
        children: [
          {
            id: 1,
            title: 'Solusi UAS sesi 1 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1_oiuCjhmHVe5q0r8gyThp91rlPQICLvZ/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          },
          {
            id: 2,
            title: 'Solusi UAS sesi 2 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1X9PJnnx3UUF3F4pfBQCERca6Uhr_k9t4/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          }
        ]
      },
      {
        id: 206,
        title: 'Soal UP',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1xsGqZZq7r58F2xIyjsvkukXCUP7VMjOE/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'folder',
        children: [
          {
            id: 1,
            title: 'Solusi UP 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1w_aZbVPDDhydfpadv2SNBPtCQ-4K1zwA/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          }
        ]
      },
      {
        id: 207,
        title: 'Soal LTM',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1xsGqZZq7r58F2xIyjsvkukXCUP7VMjOE/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'folder',
        children: [
          {
            id: 1,
            title: 'Soal LTM 1 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1idhzVCBIHopU7xUNp2rjM0UFuzud63PZ/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          },
          {
            id: 2,
            title: 'Soal LTM 2 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/17B2IkGLrvhGpZwdefIzNt2cB2P2hHA52/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          },
          {
            id: 3,
            title: 'Soal LTM 3 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1bt54jr1KTCSJ-Y0Uc3Rw1ZDAY06f7G-z/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          },
          {
            id: 4,
            title: 'Soal LTM 4 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1fP9AoJw90Voes14wthHw0sjAMATDBKO1/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          },
          {
            id: 5,
            title: 'Solusi LTM 5 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1ppmpeXN0CAfd0ErVpvkcw5YIE_7oMKJa/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          },
          {
            id: 6,
            title: 'Solusi LTM 6 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1RiO7DpopZnKuKUQ7Y4ORqUOqEqkHIDAm/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          },
          {
            id: 7,
            title: 'Solusi LTM 7 2025',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1UHytUCltUDgiHUdS39sDw36X3le9ejrM/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          }
        ]
      },
      {
        id: 208,
        title: 'Silabus Perkuliahan',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/file/d/1UHytUCltUDgiHUdS39sDw36X3le9ejrM/view?usp=drive_link',
        semester: 1,
        category: 'biologi',
        type: 'folder',
        children: [
          {
            id: 1,
            title: 'Satuan Acara Perkuliahan Fisika Dasar I 2025/2026',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1bhZZkV1plertI7YORLOWTHLuz5Klwvar/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          },
          {
            id: 2,
            title: 'Peraturan Perkuliahan Fisika Dasar I 2025/2026',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1njGFkm1rtP1uL1xiq29pPRfv8TqOF22S/view?usp=drive_link',
            semester: 1,
            category: 'biologi',
            type: 'file'
          }
        ]
      }
    ]
  },
  {
    id: 11,
    title: 'Kimia Dasar I',
    description: '',
    image: 'https://www.meritstore.in/wp-content/uploads/2016/12/10-reasons-to-love-Chemistry.png',
    driveLink: 'https://drive.google.com/drive/folders/17wZPpaTlpktOX6KvTw-g5LSoGO2v0Dmy',
    semester: 1,
    category: 'biologi',
    type: 'folder'
  },
  {
    id: 12,
    title: 'Berpikir Komputasional',
    description: '',
    image: 'https://bebras.uc.ac.id/wp-content/uploads/2023/03/4555e65ca6dc17e33db2bdc37b4bf285.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BGu_hCEZclmuF4uMfCeKHTQMGUl80q',
    semester: 1,
    category: 'biologi',
    type: 'folder'
  },
  {
    id: 13,
    title: 'Bahasa Indonesia',
    description: '',
    image: 'https://img.tempo.co/indonesiana/images/all/2022/04/27/f202204271847093.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BaH0ZtwQwAzgO--YLpeMxR1s2-wnNU',
    semester: 1,
    category: 'biologi',
    type: 'folder'
  },
  {
    id: 14,
    title: 'Pengantar Prinsip Keberlanjutan',
    description: '',
    image: 'https://www.shutterstock.com/shutterstock/videos/3524171411/thumb/12.jpg?ip=x480',
    driveLink: 'https://drive.google.com/drive/folders/1UXK6BdA_G9cnK8h5yFkLtreH2NusL32O?usp=drive_link',
    semester: 1,
    category: 'biologi',
    type: 'folder'
  },
  {
    id: 15,
    title: 'Laboratorium Fisika Dasar',
    description: '',
    image: 'https://physics.ipb.ac.id/wp-content/uploads/2022/11/IMG20221101093144-scaled.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1mTZKJckkdk3YeF5x-eZDeEerspTCkaiB',
    semester: 1,
    category: 'biologi',
    type: 'folder'
  },
  {
    id: 16,
    title: 'Laboratorium Kimia Dasar',
    description: '',
    image: 'https://www.acrossinternational.com.au/web/image/28268-29c10fb8/Chemistry%20Lab%20Equipment%20.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1PIs9eUDa-klzzagF5cne2Bd9IXns-rq2',
    semester: 1,
    category: 'biologi',
    type: 'folder'
  },

];

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let particles: any[] = [];

      const resize = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          initParticles();
      };

      const initParticles = () => {
          particles = [];
          const particleCount = Math.min(Math.floor(window.innerWidth / 12), 100);
          for (let i = 0; i < particleCount; i++) {
              particles.push({
                  x: Math.random() * canvas.width,
                  y: Math.random() * canvas.height,
                  vx: (Math.random() - 0.5) * 0.8,
                  vy: (Math.random() - 0.5) * 0.8,
                  radius: Math.random() * 2 + 1
              });
          }
      };

      const draw = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (let i = 0; i < particles.length; i++) {
              let p = particles[i];
              p.x += p.vx;
              p.y += p.vy;
              if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
              if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
              ctx.fill();

              for (let j = i + 1; j < particles.length; j++) {
                  let p2 = particles[j];
                  let dx = p.x - p2.x;
                  let dy = p.y - p2.y;
                  let dist = Math.sqrt(dx * dx + dy * dy);

                  if (dist < 140) {
                      ctx.beginPath();
                      const opacity = 0.35 - (dist / 140) * 0.35; 
                      ctx.strokeStyle = `rgba(250, 204, 21, ${opacity})`;
                      ctx.lineWidth = 1.2;
                      ctx.moveTo(p.x, p.y);
                      ctx.lineTo(p2.x, p2.y);
                      ctx.stroke();
                  }
              }
          }
          animationFrameId = requestAnimationFrame(draw);
      };

      window.addEventListener('resize', resize);
      resize();
      draw();

      return () => {
          window.removeEventListener('resize', resize);
          cancelAnimationFrame(animationFrameId);
      };
  }, []);

  return (
      <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />
  );
};

const Library: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<'mikrobiologi' | 'biologi'>('mikrobiologi');
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const handleOpenViewer = (item: LibraryItem) => {
    setSelectedItem(item);
    setIsViewerOpen(true);
  };

  const filteredItems = libraryData.filter(item =>
    item.semester === selectedSemester && item.category === selectedCategory
  );

  const semesters = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="relative min-h-screen w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      
      <ParticleBackground />

      <div className="relative z-10">
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
                  <button
                    key={item.id}
                    onClick={() => handleOpenViewer(item)}
                    className="group relative block w-full text-left bg-black rounded-xl overflow-hidden shadow-lg hover:shadow-yellow-500/40 transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-yellow-400"
                  >
                    <img src={item.image} alt={item.title} className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-gray-300 text-sm">{item.description}</p>
                    </div>
                    <ArrowUpRight className="absolute top-4 right-4 w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-colors duration-300 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-pulse bg-black/40 backdrop-blur-sm rounded-2xl border border-gray-800 mx-4 md:mx-0">
                <div className="w-16 h-16 mb-4 border-2 border-gray-800 rounded-full flex items-center justify-center">
                  <LibraryIcon size={32} className="text-gray-700" />
                </div>
                <p className="font-bold uppercase tracking-widest text-sm text-center px-4">Belum ada data untuk semester {selectedSemester} - {selectedCategory}. </p>
                <p className="font-bold uppercase tracking-widest text-sm mt-2 text-center">antara aku males atau akademiknya belum update drive :v</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <LibraryViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        currentItem={selectedItem}
        relatedItems={filteredItems}
        onSelectItem={(item) => setSelectedItem(item)}
      />
    </div>
  );
};

export default Library;