import React, { useState, useEffect, useMemo } from 'react';
import {
  Library as LibraryIcon, ArrowUpRight, ChevronDown, Instagram, Info, X
} from 'lucide-react';
import LibraryViewer from '../components/LibraryViewer';
import ParticleBackground from '../components/ParticleBackground';
import { useTheme } from '../contexts/ThemeContext';

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').reduce((result, value) => {
    const parts = value.split('=');
    return parts[0]?.trim() === name ? decodeURIComponent(parts[1] || '') : result;
  }, '');
};

const getLibraryPopupStorageKey = () => {
  const userNIM = getCookie('userNIM') || 'guest';
  return `library_popup_dismissed_${userNIM}`;
};

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  driveLink: string;
  semester: number;
  category: 'mikrobiologi' | 'biologi';
  type?: 'file' | 'folder';
  children?: LibraryItem[];
}

type LibraryCategory = LibraryItem['category'];

type SharedLibraryItem = Omit<LibraryItem, 'id' | 'category' | 'children'> & {
  key: string;
  children?: SharedLibraryItem[];
};

type SemesterLibraryConfig = {
  shared?: SharedLibraryItem[];
  mikrobiologi?: SharedLibraryItem[];
  biologi?: SharedLibraryItem[];
};

const withCategory = (
  items: SharedLibraryItem[],
  category: LibraryCategory,
  prefix: string,
  parentPath = ''
): LibraryItem[] => {
  return items.map((item) => {
    const { key, children, ...rest } = item;
    const currentPath = `${parentPath}${key}`;
    return {
      ...rest,
      id: `${prefix}-${currentPath}`,
      category,
      children: children ? withCategory(children, category, prefix, `${currentPath}-`) : undefined
    };
  });
};

const buildLibraryData = (configBySemester: Record<number, SemesterLibraryConfig>): LibraryItem[] => {
  const categoryPrefixes: Record<LibraryCategory, 'mikro' | 'bio'> = {
    mikrobiologi: 'mikro',
    biologi: 'bio'
  };

  return Object.entries(configBySemester).flatMap(([semesterKey, config]) => {
    const semester = Number(semesterKey);

    return (Object.keys(categoryPrefixes) as LibraryCategory[]).flatMap((category) => {
      const prefix = `${categoryPrefixes[category]}-s${semester}`;
      const sharedItems = config.shared ?? [];
      const categoryItems = config[category] ?? [];
      const mergedItems = [...sharedItems, ...categoryItems];

      return withCategory(mergedItems, category, prefix);
    });
  });
};

const semester1SharedData: SharedLibraryItem[] = [
  {
    key: '1-pith',
    title: 'Pengenalan Ilmu Teknologi Hayati',
    description: '',
    image: 'data:image/jpeg;base64,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',
    driveLink: 'https://drive.google.com/drive/folders/1uGqmgO7PRYnecP4Ynt7GsKx8qienEOXL',
    semester: 1,
    type: 'folder'
  },
  {
    key: '1-komputasional',
    title: 'Berpikir Komputasional',
    description: '',
    image: 'https://bebras.uc.ac.id/wp-content/uploads/2023/03/4555e65ca6dc17e33db2bdc37b4bf285.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BGu_hCEZclmuF4uMfCeKHTQMGUl80q',
    semester: 1,
    type: 'folder',
    children: [
      {
        key: '1-komputasional-ppt',
        title: 'Materi',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/19cAffdHkX18Nv6gKsnvihe5Sju33rnHQ',
        semester: 1,
        type: 'folder',
        children: [
          {
            key: '1-komputasional-materi-1',
            title: 'Materi: Konsep Dasar CompThink',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/16xo2RStrfjvSnuZGz2rn6LBWMv4cwlR2/view?usp=drivesdk',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-komputasional-materi-2',
            title: 'Materi: Algorithmic Thinking',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1JLH4w0xKgun8Ts8ZUOf-lSHVv75SazXO/view?usp=drivesdk',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-komputasional-materi-3',
            title: 'Materi: Struktur Dasar Program Prosedural',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1WVDU8TnvoEqjEvWP796gSFjSPnMitKfQ/view?usp=drivesdk',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-komputasional-materi-4',
            title: 'Materi: Array dan Pemrosesannya',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/177Dg6C6-Nb6CdFZTB_IeYlh6BUcNrM_9/view?usp=drivesdk',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-komputasional-materi-5',
            title: 'Materi: Analisis Kasus dan Pengulangan',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1OdSJuaPrOP2X2Ub9it90LtUtJH-7_U20/view?usp=drivesdk',
            semester: 1,
            type: 'file'
          }
        ]
      },
      {
        key: '1-komputasional-Proyek',
        title: 'Contoh Proyek',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/181BGu_hCEZclmuF4uMfCeKHTQMGUl80q',
        semester: 1,
        type: 'folder',
        children: [
          {
            key: '1-komputasional-projek-1',
            title: 'Projek 1',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1oYoXletwdYTLYdz4VR2cTMD_0nsVjcbI/view?usp=drivesdk',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-komputasional-projek-2',
            title: 'Projek 2',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1iETW1GJefn1fhjbY2-Niv6Yg6rUluvVT/view?usp=drivesdk',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-komputasional-ppt-projek',
            title: 'PPT Projek',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1viC1825ERlzBmm3rZssnJOOJ2DCNUGGc/view?usp=drivesdk',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-komputasional-video-projek',
            title: 'Video Presentasi Projek',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1143QjL2lfU4zTAg3pP7CWw04CzOh6J5U/view?usp=drivesdk',
            semester: 1,
            type: 'file'
          }
        ]
      }
    ]
  },
  {
    key: '1-matematika',
    title: 'Matematika 1A',
    description: '',
    image: 'https://rencanamu.id/assets/file_uploaded/blog/1572532392-shuttersto.jpg',
    driveLink: 'https://drive.google.com/drive/folders/17mAc-fHvjR-Ffj-H5ISX0Kuuo5rqnVQ2',
    semester: 1,
    type: 'folder',
    children: [
      {
        key: '1-mat-silabus',
        title: 'Silabus',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1b2jW2gpX9okCa5bRV3woeW8W9piWy-1K',
        semester: 1,
        type: 'folder',
        children: [
          {
            key: '1-mat-silabus-1',
            title: 'Silabus Matematika 1A 2025-2026',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1Aj38GKGJEd43h5dOSWCX5fkpLzVa-dPv/view?usp=drive_link',
            semester: 1,
            type: 'file'
          }
        ]
      },
      {
        key: '1-mat-materi',
        title: 'Materi Kuliah',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/18jA_DsgYbzaX12iRyZ6h8y33C0JW21ii',
        semester: 1,
        type: 'folder',
        children: [
          {
            key: '1-mat-materi-1',
            title: 'Materi 0.1: Bilangan Real',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1Zvrm9_juPgPEEe16Op-rgyUU0FT3iUVt/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-2',
            title: 'Materi 0.2: Pertidaksamaan dan Nilai Mutlak',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1FlOBnco19zVmaeB-fxy6zXZMMz3BN6h0/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-3',
            title: 'Materi 0.3 & 0.4: Sistem Koordinat Kartesius dan Grafik Persamaan',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/11U5-rauurk0tYtm8Dn3kNoY8_I8IYGvb/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-4',
            title: 'Materi 0.5: Fungsi dan Grafiknya',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1wFsLqpD6WVIw1yQMIOeoiLMuhbk2G_gk/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-5',
            title: 'Materi 0.6: Operasi pada Fungsi',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/16dpmIO94aUZczh3OH7_bfmvAzKn0hnT8/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-6',
            title: 'Materi 1.1: Pengantar Limit',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1C_eLB3n1E2u0wtmsTFHWq9bTUgJZaDCV/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-7',
            title: 'Materi 1.2: Limit Fungsi',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1kcl3nRdzH8oBJZITuxoAUQ_4QENvbbDp/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-8',
            title: 'Materi 1.3: Teorema Limit',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1gXg1x4Icj_Y335IRqkRcDVgQlve4x6gV/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-9',
            title: 'Materi 1.4: Limit Fungsi Trigonometri',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1dZLLlSmEGaD9XkLh5p_UVAcStFxkJf5B/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-10',
            title: 'Materi 1.5: Limit Tak Hingga dan Limit Bernilai Tangga',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1Nxu5ByXnlp8GHtcwsOZyJr8Ed9WKL4j-/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-11',
            title: 'Materi 1.6: Kekontinuan dan Teorema Nilai Antara',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1putrZ9nKh2nGhxJb3qCGdWsvIRddgwsr/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-12',
            title: 'Materi 2.1 & 2.2: Definisi Turunan',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1K8jKWcZTFq6Ft6zdXnABhJD-mf5ZyjMS/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-13',
            title: 'Materi 2.3 - 2.5: Aturan-aturan Penentuan Turunan',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1vIe5mmZnhq4k3tEA4dnynu0ztWpWJX7a/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-14',
            title: 'Materi 2.6: Turunan Tingkat Tinggi',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/17M9K1912IaRwzz5r4_xpZ3Al_LHeKSdt/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-15',
            title: 'Materi 2.7: Turunan Implisit',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1_DK_httul35PvOqZmgcMl9RztQslshKL/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-16',
            title: 'Materi 2.8: Laju yang Berkaitan',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1303mOvhRZ60HwswS2g1d1A8pcNoLg4jb/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-17',
            title: 'Materi 3.1: Maksimum dan Minimum',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/14eH65AksjncEmInCRYgiYh0M06QGpGG2/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-18',
            title: 'Materi 3.2: Kemonotonan dan Kecekungan',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1_8Qi1-NVFeZ5IzHkW3TscZkTIyAzWYs3/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-19',
            title: 'Materi 3.3: Ekstrem Lokal pada Interval Buka',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1sWv0E81WNYGKTRN9GNxwso7TRaK-gxcW/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-20',
            title: 'Materi 3.4 (Part 1): Pemodelan Matematika',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1ss9zinDDPQx5mu94xJ8o2DLXKnOpiAHm/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-21',
            title: 'Materi 3.4 (Part 2): Pemodelan Matematika',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/15qosE6nuIg_qCU8zHC1C7q_MUyS1qnGh/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-22',
            title: 'Materi 3.5: Grafik Fungsi dengan Kalkulus',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1BEqSjzazNGk0atmvv-sMHXoKnZ7WGyl8/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-23',
            title: 'Materi 4.1: Luas',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1S7Hh3-fMKDNMG2ifMpFgC14BpJXlByZN/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-24',
            title: 'Materi 4.2: Integral Tentu',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1gdZFZ_dX2NUbEmGTziXcug7XNqcPymOV/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-25',
            title: 'Materi 4.3: Teorema Dasar Kalkulus',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1z9EliCxxwsF1VJDuH2PSYg7zpBy5M1u5/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-26',
            title: 'Materi 4.4: Teorema Dasar Kalkulus 2',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/18yqpB8RAZGFhEXByJyY997mr2hWlhvMm/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-27',
            title: 'Materi 4.5: Teorema Nilai Rata-rata dan Sifat Simetri',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1D7b4XlzZiMKh2bHSfLl57-dW42Reg97R/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-28',
            title: 'Materi 4.6: Integrasi Numerik',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1Sm8sIs-0-sa_uKobxLssQlXkAnttJLor/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-29',
            title: 'Materi 5.1: Luas',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1r37qdaXPcy0RTdw3-HpIFPVUKR80U5P-/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-30',
            title: 'Materi 5.2 & 5.3: Volume',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1BKWdJrl1aKfNxFbfJonCFBdSlDumcvTt/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-31',
            title: 'Materi 5.5: Kerja Usaha',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1xqMkgQx_l1BQBbfeYLP8WTCKnmA9yL8l/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-32',
            title: 'Materi 6.1: Fungsi Logaritma Natural',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1ZYiyvk_Mxgd9hwK9kHffmxEqMHQ-OGeC/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-33',
            title: 'Materi 6.2: Fungsi Invers dan Turunannya',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/14OTaePinw_D4ap7gcQGUkxm07Z4JGpIs/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-34',
            title: 'Materi 6.3: Fungsi Eksponen Natural',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1XtYIPXJgfArUiOXlTalu83F2U_ljDLua/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-35',
            title: 'Materi 6.4: Fungsi Eksponen Umum dan Logaritma Umum',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/16UQU3Ob_wrTpqc37TGkxF1q4YAuUUoLC/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-36',
            title: 'Materi 6.5: Pertumbuhan dan Peluruhan Eksponensial',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1P1hSCUQICtYM3gsjLxLijeq5gepuXqNo/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-37',
            title: 'Materi 6.6: Persamaan Diferensial Orde Satu',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1g5s5NDd7xHfcUf0xUcznG4oM6GbHFnyq/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-38',
            title: 'Materi 6.8: Fungsi Invers Trigonometri',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1-MTA8ImBAr1rSi1yVDIKJxuNSZIpOrE3/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-materi-39',
            title: 'Materi 6.9: Fungsi Hiperbolik dan Inversnya',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1Tm61N3ut9-Z5WX-isPrW5FiN6NuFTBgA/view?usp=drive_link',
            semester: 1,
            type: 'file'
          }
        ]
      },
      {
        key: '1-mat-catatan',
        title: 'Catatan Kuliah',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1EuY-s8alS8nOy9lR3FAa9rJCTDx_3ZJu',
        semester: 1,
        type: 'folder',
        children: [
          {
            key: '1-mat-catatan-1',
            title: 'Catatan Kalkulus Bab Integral, Aplikasi Integral dan Fungsi TRansenden',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1AhbtiBtMnamPUFOyG2bywFjpz838ryfC/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-catatan-2',
            title: 'Matematika Dasar',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/17wCLQYQgI5DbHStwPtCE3JGVAY9vS6uk/view?usp=drive_link',
            semester: 1,
            type: 'file'
          }
        ]
      },
      {
        key: '1-mat-kuis',
        title: 'Kuis',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1pIezRaDhrZSyOoK1y3Ok6LhBTRKroBZG',
        semester: 1,
        type: 'folder',
        children: [
          {
            key: '1-mat-kuis-1',
            title: 'KBF 2',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1NDForiu5luev3_jTJVmvl4t2gitLh8co/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-kuis-2',
            title: 'KBF 3 (variasi 1)',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1gocip8QaZ1-GyhDCixN1xWxVRDMUPavN/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-kuis-3',
            title: 'KBF 3 (variasi 2)',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1GXwPDIhfqUZjVME0Llm_XwP4vpWunpKf/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-kuis-4',
            title: 'KBF 3 (variasi 3)',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1UBo5QFeoO1Dlz7dpDz372wJ0mJlGZRqJ/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-kuis-5',
            title: 'KBF 3 (variasi 4)',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1WxToa4xDFVrie5V3bVoLlKGZEw9a9O01/view?usp=drive_link',
            semester: 1,
            type: 'file'
          }
        ]
      },
      {
        key: '1-mat-uts',
        title: 'UTS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1fzPl9C1zYXJwyJeH93KuB5tqvudwjMVd',
        semester: 1,
        type: 'folder',
        children: [
          {
            key: '1-mat-uts-1',
            title: 'UTS MA1101 2024',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1rAPOmC2LH3-3CtOc7wGDQ1Gj7uHDGRBc/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-uts-2',
            title: 'UTS MA1101 2023',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1jG2K-rCRf_iAAb-v96NSxLNqDqkYRIm1/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-uts-3',
            title: 'UTS MA1101 2022',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1miTF-Q9JD1_biuudjFQRu5ddOpCP_Ja3/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-uts-4',
            title: 'UTS MA1101 2021',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1X5Nvbkab1UsGZufXtd05HJM2swYhMFaC/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-uts-5',
            title: 'UTS MA1101 2019',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1npHqDYZj3qURmuIDMM_Igw23f06-qZVo/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-uts-6',
            title: 'Latihan Soal UTS MA1101',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1Xk3D4BkchcIbIkyQRaccx9fXDhILpq6G/view?usp=drive_link',
            semester: 1,
            type: 'file'
          }
        ]
      },
      {
        key: '1-mat-uas',
        title: 'UAS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1QKeYawgI7r61NbUGViUX6PNbIzy_l38h',
        semester: 1,
        type: 'folder',
        children: [
          {
            key: '1-mat-uas-1',
            title: 'UAS MA1101 2025 Sesi 1',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/18EVxMMb0HHA5DfqLNKJw0_b7zkZyQO35/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-uas-2',
            title: 'UAS MA1101 2025 Sesi 2',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1HnVEhse_xKs24eicezT7F8dS5hh8jZJK/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-uas-3',
            title: 'UAS MA1101 2024 Sesi 1',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1h8WQQ9Moz04VyE1S8KqbxThHIHxgolAH/view?usp=drive_link',
            semester: 1,
            type: 'file'
          },
          {
            key: '1-mat-uas-4',
            title: 'UAS MA1101 2024 Sesi 2',
            description: '',
            image: '',
            driveLink: 'https://drive.google.com/file/d/1mN6hpMroMOariQlwOCpQE3gT3yuRnMHo/view?usp=drive_link',
            semester: 1,
            type: 'file'
          }
        ]
      }
    ]
  },
  {
    key: '1-fisika',
    title: 'Fisika Dasar 1A',
    description: '',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5U20lOxpY0zZ_gktSIAwHKpXNc36Vc2pdLg&s',
    driveLink: 'https://drive.google.com/drive/folders/17uRIaxFB33GZ20YXJDABBs-DdImj2_v7',
    semester: 1,
    type: 'folder',
    children: [
      { key: '1-fis-silabus', title: 'Silabus', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1glRRHwsNgihrk3VHO3OS11vKEvnt2Yr-', semester: 1, type: 'folder', children: [
        { key: '1-fis-silabus-1', title: 'Peraturan Perkuliahan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1njGFkm1rtP1uL1xiq29pPRfv8TqOF22S/view?usp=drive_link', semester: 1, type: 'file' }, 
        { key: '1-fis-silabus-2', title: 'Satuan Acara Perkuliahan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1bhZZkV1plertI7YORLOWTHLuz5Klwvar/view?usp=drive_link', semester: 1, type: 'file' }
      ] },
      { key: '1-fis-materi', title: 'Materi Kuliah', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1GcS7TCi2wdtURFuHLtS8RJjpaJtE_djM', semester: 1, type: 'folder', children: [
        { key: '1-fis-materi-1', title: 'Materi: Kinematika', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1EybDlIzTQLx0sKTIjGJNyRnRVJ-DATWr/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-materi-2', title: 'Materi: Dinamika (Part 1)', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1W_9YNHoZ6ENrcvtHJjkHUNCML0YJYynX/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-materi-3', title: 'Materi: Dinamika (Part 2)', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1fFjAvIx2IriyttKuxqVHsvlpULJt8wy5/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-materi-4', title: 'Materi: Usaha dan Energi', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1eJ6BPzCReiQlNN9lPaVdfZO0u5PStWEn/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-materi-5', title: 'Materi: Momentum Linear', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1mud89LSxkUkflW2-vhx5472rEzNOOmv1/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-materi-6', title: 'Materi: Gerak Rotasi (Part 1)', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1yA1GBsi2b4CS5gm2EHojZWlnOOhiBWmH/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-materi-7', title: 'Materi: Gerak Rotasi (Part 2)', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1Fk4elMPReE5Q89x1-oZpDJyZazWx3pGD/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-materi-8', title: 'Materi: Elastisitas', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1wTWx36dOPWanvTbOQaby9gTF5Fa1TP6m/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-materi-9', title: 'Materi: Osilasi', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1pEDsIrH-2np11lsns4P--yBTBut3ZDoE/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-materi-10', title: 'Materi: Gelombak Mekanik', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1EZMEofMRRClnFmGfQIKMwC43UgqcsAvl/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-materi-11', title: 'Materi: Fluida', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1ey1v4XqLH-xw7_1v4PYRPmoxEnVhvy3W/view?usp=drive_link', semester: 1, type: 'file' }
      ] },
      { key: '1-fis-catatan', title: 'Catatan Kuliah', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1SoDwvL0trAVg5EIyuS2V9nFH-x7539v5', semester: 1, type: 'folder', children: [
        { key: '1-fis-catatan-1', title: 'Fisika Dasar', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1dBjqr4gP8qCmiqgA6T787XajGwc-ZFh0/view?usp=drive_link', semester: 1, type: 'file' }
      ] },
      { key: '1-fis-kuis', title: 'Kuis', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1ZjFx67tOWYlQMNpB0LancU8nmLKaepCf', semester: 1, type: 'folder' },
      {
        key: '1-fis-ltm',
        title: 'LTM',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1FqidtUGyhmwwhX0_0_MM7tMGPCyZ6c8H',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-fis-ltm-file-1', title: 'LTM1 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1idhzVCBIHopU7xUNp2rjM0UFuzud63PZ/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-fis-ltm-file-2', title: 'LTM2 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/17B2IkGLrvhGpZwdefIzNt2cB2P2hHA52/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-fis-ltm-file-3', title: 'LTM3 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1bt54jr1KTCSJ-Y0Uc3Rw1ZDAY06f7G-z/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-fis-ltm-file-4', title: 'LTM4 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1fP9AoJw90Voes14wthHw0sjAMATDBKO1/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-fis-ltm-file-5', title: 'Solusi LTM Gerak Menggelinding 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1ppmpeXN0CAfd0ErVpvkcw5YIE_7oMKJa/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-fis-ltm-file-6', title: 'Solusi LTM Fluida 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1RiO7DpopZnKuKUQ7Y4ORqUOqEqkHIDAm/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-fis-ltm-file-7', title: 'Solusi LTM Gelombang Mekanik 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1UHytUCltUDgiHUdS39sDw36X3le9ejrM/view?usp=drivesdk', semester: 1, type: 'file' }
        ]
      },
      {
        key: '1-fis-uts',
        title: 'UTS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1YUPNhKFsi0LeJ5VzyFjg6sOeZpo3vSka',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-fis-uts-s1', title: 'Solusi UTS Sesi 1 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/15mNrsubg3WMMrHY0y1ugCW1nvFQCheAS/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-fis-uts-s2', title: 'Solusi UTS Sesi 2 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1RiVSbB6phP18MuybetdP7bL6SaB20CNY/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-fis-uts-s3', title: 'Solusi UTS Sesi 3 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1s2VyPhEKCzloyvph6Oo_UIlE2zcozyj8/view?usp=drivesdk', semester: 1, type: 'file' }
        ]
      },
      {
        key: '1-fis-uas',
        title: 'UAS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/17gwou3hhHOdYSfQh6Y5MX3HTSuQU8Po-',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-fis-uas-s1', title: 'Solusi UAS Sesi 1 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1_oiuCjhmHVe5q0r8gyThp91rlPQICLvZ/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-fis-uas-s2', title: 'Solusi UAS Sesi 2 2025-2026', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1X9PJnnx3UUF3F4pfBQCERca6Uhr_k9t4/view?usp=drivesdk', semester: 1, type: 'file' }
        ]
      },
      {
        key: '1-fis-up',
        title: 'Ujian Perbaikan/Pengganti (UP)',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1H8EGEPYRPHYYEzVdc0P6O4bBrlvSKjlw',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-fis-up-solusi', title: 'Solusi UP 2025', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1w_aZbVPDDhydfpadv2SNBPtCQ-4K1zwA/view?usp=drivesdk', semester: 1, type: 'file' }
        ]
      },
      { key: '1-fis-panduan-lce', title: 'Panduan LCE', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1rjNuvAYxzrXIAkciNZrxva4KDKyErkHs', semester: 1, type: 'folder', children: [
         { key: '1-fis-panduan-lce-1', title: 'Panduan LCE 2025', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1mMPaF8OOiOAJ7wvRsfdzShPrObywLrM3/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-fis-panduan-lce-2', title: 'Contoh LCE', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1r9gz5aMEdw_keBove3tpQQlTkP4q4LWn/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-fis-panduan-lce-3', title: 'Contoh LCE Dosen', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1IgewatXKr6KSKRTeivSYhv08PhSohjeu/view?usp=drive_link', semester: 1, type: 'file' }
      ] },
      { key: '1-fis-panduan-pbl', title: 'Panduan PBL', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1xQLrA44BgS9jXc91o34ql4oZU3yrFkah', semester: 1, type: 'folder', children: [
        { key: '1-fis-panduan-pbl-1', title: 'Modul PBL', description: '', image: '', driveLink: 'https://drive.google.com/file/d/18WU7qxaNZJ5uIxhAfEn4_AzR51z8noU6/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-fis-panduan-pbl-2', title: 'Contoh Laporan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/16GJOH7NkcQrgA7QWMTBQfsvyU8eDc2PF/view?usp=drive_link', semester: 1, type: 'file' },   
      ] }
    ]
  },
  {
    key: '1-kimia',
    title: 'Kimia Dasar 1A',
    description: '',
    image: 'https://www.meritstore.in/wp-content/uploads/2016/12/10-reasons-to-love-Chemistry.png',
    driveLink: 'https://drive.google.com/drive/folders/17wZPpaTlpktOX6KvTw-g5LSoGO2v0Dmy?usp=drive_link',
    semester: 1,
    type: 'folder',
    children: [
      { key: '1-kim-aturan', title: 'Aturan Perkuliahan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/18x2VLTIlYPSFS3nldFDvWiYpnUimcD7r/view?usp=drive_link', semester: 1, type: 'file' },
      { key: '1-kim-catatan', title: 'Catatan Kuliah', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1mOUKb2IMbGqsi1SpEdkkf2l5keyQ7W9x?usp=drive_link', semester: 1, type: 'folder' },
      {
        key: '1-kim-materi',
        title: 'Materi Kuliah',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/17wZPpaTlpktOX6KvTw-g5LSoGO2v0Dmy?usp=drive_link',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-kim-materi-atom', title: 'Materi: Atom, Unsur, dan Sistem Periodik', description: '', image: '', driveLink: 'https://drive.google.com/file/d/148mIhUdNIag43bKDpyME3EBpCNfD6jzO/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-materi-mol', title: 'Materi: Konsep Mol', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1wR-fddpn3X26U5eaX4BqRPNudLBaO44b/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-materi-stoikiometri', title: 'Materi: Stoikiometri Larutan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1EPPfszpRZmsvc89JWE3fVHqrCLyRcN7r/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-materi-redoks', title: 'Materi: Reaksi Redoks', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1h87XSNiPAcTL_fE0GgpnX4qs9cmC9BDK/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-materi-gas', title: 'Materi: Sifat-sifat Gas', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1yMLAXf0sgq2dtP5oqEiVO92UxMQr4V5O/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-materi-termokimia', title: 'Materi: Termokimia', description: '', image: '', driveLink: 'https://drive.google.com/file/d/17mcBr3PJlimOTN0gKLWP81wKTU6Qv30u/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-materi-ikatan', title: 'Materi: Ikatan Kimia', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1A33JFeJzXbLGoEgj5GyG9M_XyF9o806o/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-materi-struktur-molekul', title: 'Materi: Struktur Molekul', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1mnYgG3dQQF7QmJ6IzOmWmOO_R2OVEh-O/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-materi-gaya-antarmolekul', title: 'Materi: Gaya Antarmolekul, Sifat Cairan, dan Padatan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1ewV7Y_kLHBw_JjON6Ggt57W4nijaWF4G/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-materi-kompleks', title: 'Materi: Senyawa Kompleks', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1Nq9YztdLI9rylS5YoQ0zQK0yCMl28qZP/view?usp=drive_link', semester: 1, type: 'file' }
        ]
      },
      {
        key: '1-kim-tugas',
        title: 'Tugas',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1W-DWx6D6g9CzxZOOXmwYlpz0KnPFwCwZ?usp=drive_link',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-kim-tugas-cairan-dan-padatan', title: 'Tugas Cairan dan Padatan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1Rqx3aVn3N3CooavkYxpRd5AZTqhKR7wc/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-tugas-solusi-cairan-dan-padatan', title: 'Solusi Tugas Cairan dan Padatan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/185Tl6XWft832jLVconB1GXxaT2_pGjIG/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-tugas-struktur-atom', title: 'Tugas Struktur Atom, Ikatan Kimia, Geometri Molekul', description: '', image: '', driveLink: 'https://drive.google.com/file/d/12RjMVHwXwz7hS9EoxZxseM62EVIslj6o/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-tugas-solusi-struktur-atom', title: 'Solusi Tugas Struktur Atom, Ikatan Kimia, Geometri Molekul', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1G_wU8kacrQLTBow1kYkLEke9fQPJWHLn/view?usp=drive_link', semester: 1, type: 'file' }
        ]
      },
      {
        key: '1-kim-kuis',
        title: 'Kuis',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1DR3H-05fMBiDvKH6wfkMh2s2YhPtOpge?usp=drive_link',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-kim-kuis-latihan-kbf-1', title: 'Latihan Soal KBF 1 2025 + Solusi', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1oxfWsLaDP3XYYIyJFXNqdVxEy8wQO-wK/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-kuis-soal-kbf-2', title: 'Soal KBF 2 2025', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1WnY2WfgikIBU00hPyQDzxpWpzCWXpZBD/view?usp=drive_link', semester: 1, type: 'file' }
        ]
      },
      {
        key: '1-kim-uts',
        title: 'UTS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1E0SzCA4g38_mA_EI9pzJVAct8N0wppJh?usp=drive_link',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-kim-uts-2024-s1', title: 'Soal UTS 2024 Sesi 1', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1U26eq8yQ62qfi1rtQ1lnjO99r8bsCu9w/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-uts-2024-s2', title: 'Soal UTS 2024 Sesi 2', description: '', image: '', driveLink: 'https://drive.google.com/file/d/18XZf9MAcy_Q5ERVr-ZlmbJncNpvKsTMJ/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-uts-2025-s1', title: 'Soal UTS 2025 Sesi 1', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1ZTGH6dmZ0wrZbTAavkswb0NkPm7s_QYU/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-uts-2025-s2', title: 'Soal UTS 2025 Sesi 2', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1DoRt7BhnarwnvL2m_fvLDo64oMdimjoR/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-uts-catatan-pembahasan', title: 'Catatan + Pembahasan Soal UTS', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1W1OiWKEITgTGUEvfHe_rKhvvP18fXXcZ/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-uts-latihan-pembahasan', title: 'Latihan Soal UTS + Pembahasan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1EKZ4ZeM8CBnYe52_ek6vHWDJtgAIif9j/view?usp=drive_link', semester: 1, type: 'file' }
        ]
      },
      {
        key: '1-kim-uas',
        title: 'UAS',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1bnV5SjOb9nfnSmXdy9HlA3nx7a1cgsdG?usp=drive_link',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-kim-uas-2024-s1', title: 'Soal UAS 2024 Sesi 1', description: '', image: '', driveLink: 'https://drive.google.com/file/d/15zLy6KK1YDnulUmRV7x_beG6zlVOsGhP/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-uas-2024-s2', title: 'Soal UAS 2024 Sesi 2', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1yWPzQW5BZeVWdFQ9hYP0Ba_vweyPxm_8/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-uas-latihan-pembahasan', title: 'Latihan Soal UAS + Pembahasan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1VBCr3EpeiFSnwLZl1eXJlPAICDOgCsl5/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-uas-2025-s1', title: 'Soal UAS 2025 Sesi 1', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1ZDqyOqcLJWVS9FlYVeg2vgLkfGYsBgXK/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-kim-uas-2025-s2', title: 'Soal UAS 2025 Sesi 2', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1qyhFR3Q_tnrRC-O7SP0_8RJi04AQc1iD/view?usp=drive_link', semester: 1, type: 'file' }
        ]
      },
    ]
  },
  {
    key: '1-prinsip',
    title: 'Pengantar Prinsip Keberlanjutan',
    description: '',
    image: 'https://www.shutterstock.com/shutterstock/videos/3524171411/thumb/12.jpg?ip=x480',
    driveLink: 'https://drive.google.com/drive/folders/1UXK6BdA_G9cnK8h5yFkLtreH2NusL32O?usp=drive_link',
    semester: 1,
    type: 'folder',
    children: [
      { key: '1-prinsip-minggu-1', title: 'Minggu 1', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1VGAnhImqGg_ZjMrG_vMu8w_6r_sgfQde/view?usp=drivesdk', semester: 1, type: 'file' },
      { key: '1-prinsip-minggu-2', title: 'Minggu 2', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1kDoYZlFubiUeKabrF0vuHkgDa_wBykD5/view?usp=drivesdk', semester: 1, type: 'file' },
      { key: '1-prinsip-minggu-3', title: 'Minggu 3', description: '', image: '', driveLink: 'https://docs.google.com/presentation/d/1FjsaMYBAT19DfUrxhH-mxgusNqGFGzZU/edit?usp=drivesdk', semester: 1, type: 'file' },
      { key: '1-prinsip-minggu-4', title: 'Minggu 4', description: '', image: '', driveLink: 'https://docs.google.com/presentation/d/1Kko8rqpWnVolVLFd1jkGyNhP1on3BLFo/edit?usp=drivesdk', semester: 1, type: 'file' },
      { key: '1-prinsip-minggu-5', title: 'Minggu 5', description: '', image: '', driveLink: 'https://docs.google.com/presentation/d/1ccEd8e0p1OyjF78yorBptqSf7o_OZHI2/edit?usp=drivesdk', semester: 1, type: 'file' },
      {
        key: '1-prinsip-bahan-baca',
        title: 'Bahan Baca',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1UXK6BdA_G9cnK8h5yFkLtreH2NusL32O?usp=drive_link',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-prinsip-bahan-ethics', title: 'Environmental Ethics', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1t9rRIP5d2-cb50lo437BQJwkB2MIW57D/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-prinsip-bahan-science', title: 'Sustainability Science', description: '', image: '', driveLink: 'https://drive.google.com/file/d/11A_fa91F8TWvCHsfqjCiirWv3mGdr0YZ/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-prinsip-bahan-humanities', title: 'Sustainability and Humanities', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1IuVAVM9JYLzJjWzhwL9oJ4Ok_VSiKEPW/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-prinsip-bahan-sustainability-ethics', title: 'Sustainability Ethics', description: '', image: '', driveLink: 'https://drive.google.com/file/d/11h1QxUv7_kxxhv8455Uf_CrgRozoAHK1/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-prinsip-bahan-earth-beyond-six', title: 'Earth Beyond Six', description: '', image: '', driveLink: 'https://drive.google.com/file/d/11jx5jvCBRhktfuRalfWgn-MA1t6105KJ/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-prinsip-bahan-boundaries', title: 'Planetary Boundaries', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1f9tMgom1OCXX7VT2nv0CL1zG2TuRVGI9/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-prinsip-bahan-resource-economics', title: 'Environmental and Resource Economics', description: '', image: '', driveLink: 'https://drive.google.com/file/d/19-TWRhDpwUZN8Tap-AYpu9efzOJJWT8X/view?usp=drivesdk', semester: 1, type: 'file' }
        ]
      },
      { key: '1-prinsip-proyek-uas', title: 'Proyek UAS', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1Xia8kePW0us9XaySsmcOztOENzVEvTNt', semester: 1, type: 'folder', children: [
        { key: '1-prinsip-proyek-uas-1', title: 'Contok Booklet', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1jVl9kYdkzWXyWyl3yb-di4_eFksbZumz/view?usp=drive_link', semester: 1, type: 'file' },
      ] }
    ]
  },
  {
    key: '1-bahasa',
    title: 'Bahasa Indonesia',
    description: '',
    image: 'https://img.tempo.co/indonesiana/images/all/2022/04/27/f202204271847093.jpg',
    driveLink: 'https://drive.google.com/drive/folders/181BaH0ZtwQwAzgO--YLpeMxR1s2-wnNU',
    semester: 1,
    type: 'folder',
    children: [
      { key: '1-bhs-materi', title: 'Materi Kuliah', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1skxgvbjz5SWzTL6sfw1qUmS8CTYNuwvi', semester: 1, type: 'folder', children: [
        { key: '1-bhs-ptm-2', title: 'Pertemuan 2: Ejaan 1', description: '', image: '', driveLink: 'https://docs.google.com/presentation/d/1kTDkAZsQHm13JJ4trKRoFOncAPLzjTzB/edit?usp=drivesdk', semester: 1, type: 'file' },
        { key: '1-bhs-ptm-3', title: 'Pertemuan 3: Ejaan 2', description: '', image: '', driveLink: 'https://docs.google.com/presentation/d/1CEaH7LgTVaSrtxL7T52vXEpKW8jWfZfN/edit?usp=drivesdk', semester: 1, type: 'file' },
        { key: '1-bhs-ptm-4', title: 'Pertemuan 4: Tata Kata', description: '', image: '', driveLink: 'https://docs.google.com/presentation/d/1TpDfR2iCPHdHcxXO7Bw9b4DsT8o2HxYL/edit?usp=drivesdk', semester: 1, type: 'file' },
        { key: '1-bhs-ptm-5', title: 'Pertemuan 5: Tata Kalimat', description: '', image: '', driveLink: 'https://docs.google.com/presentation/d/1FWG4ZL6zDNxxW6sHuHwQDjQH5S6wWKPO/edit?usp=drivesdk', semester: 1, type: 'file' },
        { key: '1-bhs-ptm-6', title: 'Pertemuan 6: Tata Kalimat II', description: '', image: '', driveLink: 'https://docs.google.com/presentation/d/1h79mcmdN3EGfws6W9982dRQyVxmkx4YZ/edit?usp=drivesdk', semester: 1, type: 'file' },
      ] },
      { key: '1-bhs-uts', title: 'UTS', description: '', image: '', driveLink: 'https://docs.google.com/document/d/1mcrwOPccLY-TjtCy4ZIEGlXzYjhPhFd4/edit?usp=drivesdk', semester: 1, type: 'file' },
      { key: '1-bhs-kti', title: 'KTI', description: '', image: '', driveLink: 'https://docs.google.com/document/d/1_AfV_s80yPnz8ippgqsOifoEFDwF2tyA/edit?usp=drivesdk', semester: 1, type: 'file' }
    ]
  },
  {
    key: '1-labkim',
    title: 'Laboratorium Kimia Dasar',
    description: '',
    image: 'https://www.acrossinternational.com.au/web/image/28268-29c10fb8/Chemistry%20Lab%20Equipment%20.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1PIs9eUDa-klzzagF5cne2Bd9IXns-rq2',
    semester: 1,
    type: 'folder',
    children: [
      { key: '1-labkim-modul-praktikum', title: 'Modul Praktikum', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1pKWa2m1aHLcCEugoSNZaJCWcciRmv-VM/view?usp=drivesdk', semester: 1, type: 'file' },
      { key: '1-labkim-contoh-laporan-1', title: 'Contoh Laporan', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1lOxq_YyNNI7rUPSPLId0zS7y0Z15qv_B?usp=drive_link', semester: 1, type: 'folder', children: [
        { key: '1-labkim-contoh-laporan-1', title: 'Contoh Laporan Modul 1', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1bReiWeFzGD6czuPQtya8my3nesYh2tOS/view?usp=drivesdk', semester: 1, type: 'file' },
        { key: '1-labkim-contoh-laporan-2', title: 'Contoh Laporan Modul 2', description: '', image: '', driveLink: 'https://drive.google.com/file/d/12QTxsfb8dUH6o4DnwswxUZ_uEj4ZgcvD/view?usp=drivesdk', semester: 1, type: 'file' },
        { key: '1-labkim-contoh-laporan-3', title: 'Contoh Laporan Modul 3', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1MqPlaqzvoDYxCg_VjxLjnCRcZGnCMtBt/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-labkim-contoh-laporan-4', title: 'Contoh Laporan Modul 4', description: '', image: '', driveLink: 'https://drive.google.com/file/d/148If2aayFvYnHo7vcFyua8KDCS_ESudr/view?usp=drive_link', semester: 1, type: 'file' },
        { key: '1-labkim-contoh-laporan-5', title: 'Contoh Laporan Modul 5', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1hwDTA8Y9Adrbj9CEyMEFDz7LrNtdGNLT/view?usp=drive_link', semester: 1, type: 'file' },
      ] }
    ]
  },
  {
    key: '1-labfis',
    title: 'Laboratorium Fisika Dasar',
    description: '',
    image: 'https://physics.ipb.ac.id/wp-content/uploads/2022/11/IMG20221101093144-scaled.jpg',
    driveLink: 'https://drive.google.com/drive/folders/1mTZKJckkdk3YeF5x-eZDeEerspTCkaiB',
    semester: 1,
    type: 'folder',
    children: [
      { key: '1-labfis-informasi-umum', title: 'Informasi Umum', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1113qwt1AeMWGnEgxM9cY-X_PMuQZSkz5/view?usp=drivesdk', semester: 1, type: 'file' },
      { key: '1-labfis-pengenalan', title: 'Pengenalan', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1IiPRv3VQZK5hMiLK_VWOUnbrmVWesHp2/view?usp=drivesdk', semester: 1, type: 'file' },
      { key: '1-labfis-tp-folder', title: 'Tugas Pendahuluan', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1QhmR4FjE7rRzyxrCtoriu82vxhsHow1A', semester: 1, type: 'folder', children: [
        { key: '1-labfis-tp-1', title: 'Contoh Pengerjaan TP (Format 2025)', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1gb8KFyn0YYq1FNkBxxz4GGgW4PmJ8LxR?usp=drive_link', semester: 1, type: 'folder', children: [
          { key: '1-labfis-tp-1-2025', title: 'TP Fisika Modul 1', description: '', image: '', driveLink: 'https://drive.google.com/file/d/16q02rvCn1SvcD2VthoezFpqyS9Yz4pzo/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-1-2024', title: 'TP Fisika Modul 5', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1JGQSJpjKuO47cljzMpT-7B8LbgZSc4Sw/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-1-2023', title: 'TP Fisika Modul 9', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1L_POXzYnlqFcIO0hFgq6HTQ65IZMx7Ly/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-1-2022', title: 'TP Fisika Modul 11', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1WmwQ4PCRr7TLbjnJN0G2BsOxNT7y5mzS/view?usp=drive_link', semester: 1, type: 'file' },
        ] },
        { key: '1-labfis-tp-2', title: 'Praktikum ke-1', description: '', image: '', driveLink: 'https://drive.google.com/drive/folders/1gEUUGoun0rR0oUVxosAwKdb1pnOMU8SQ?usp=drive_link', semester: 1, type: 'folder', children: [
          { key: '1-labfis-tp-2-2025', title: 'TP01A', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1ovqeceZ8fK9TAYJPDR64K6AzMqEoHsdD/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-2-2024', title: 'TP01B', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1BtCmHGnPFeashW43wqnH6Utr8tvMLuBJ/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-3', title: 'TP01C', description: '', image: '', driveLink: 'https://drive.google.com/file/d/16O-R99FDPgxD8nfdFxh1MYFXoKd_yKzO/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-4', title: 'TP01D', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1iJrzpGeyuW9Ecg_DWHCUoCKfhL4nYeE7/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-5', title: 'TP01E', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1Cex9IUckYwZiVeWzw0DuinKvdad_h-Gw/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-6', title: 'TP01F', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1WCf0NvJvXvWv3lPKwnL90gfzPLjkMSZ5/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-7', title: 'TP01G', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1VTrQLPJN61-oeQz9_QlwonKoGyQLApnu/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-8', title: 'TP01H', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1NKX5fPnI3qaXuzkcCd15y5SxsBaA-gZ5/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-9', title: 'TP01I', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1EsVQPVIldvuquWlvr_sDnc0ukpEAfOsc/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-10', title: 'TP01J', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1nYw5iOAME8vXRYQ4ol2ZIUGSnTzFIOwI/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-11', title: 'TP01K', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1MmoFBX2hVpyP5Z9b5RktHTt5WJ-_ord0/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-12', title: 'TP01L', description: '', image: '', driveLink: 'https://drive.google.com/file/d/18_1ypv-ZBnv2rvI8vOUt27UdGS5bCv9I/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-13', title: 'TP01M', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1hFnDZL9woG8jEOwG4gSVPXu4q4_OfvYn/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-14', title: 'TP01N', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1b0gZMzEpt3lrzctHbOTsmawrKOawnxkB/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-15', title: 'TP01O', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1sl8eATlCRYNyn-cn9W2HmxqSOeeoCPMJ/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-16', title: 'TP01P', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1Mwc-pg1aTbBu1N1Tv5aI1aNJ7E2Qfs4G/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-17', title: 'TP01Q', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1x7slM_T2BlxevQpg4J0-yeNof7KUUoSO/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-18', title: 'TP01R', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1xwiV5s54eOUrY469It3tPlKFaZ6-TZBe/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-19', title: 'TP01S', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1tlos70PAEBLp-_h04SroHMB8vWD0Y2zO/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-20', title: 'TP01T', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1RDbnDDV5QLHAfbJ_R3JuNQecJHgPQKGz/view?usp=drive_link', semester: 1, type: 'file' },
          { key: '1-labfis-tp-21', title: 'TP01U', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1qx5xlAsycKNe6AF4OD2LvrjNqyM16BML/view?usp=drive_link', semester: 1, type: 'file' },
        ] },
      ] },
      {
        key: '1-labfis-handout',
        title: 'Handout',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/1743XI_MbokC897o3YJwQ5PJiNGNtmaRh',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-labfis-handout-modul-1', title: 'Handout Modul 1', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1UV-_BdPL5jHcIZpqiENbJ-7tmJUXRAOh/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-2', title: 'Handout Modul 2', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1ITIJh352HxTIvl-PhUpSJxXRaEheX7Hj/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-3', title: 'Handout Modul 3', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1MwfoClvfhfzBOdiaM_YmHciIqhR4mBmP/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-5', title: 'Handout Modul 5', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1hC3VEExEv91ybvfgy5gNzBe5VlDPKNpb/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-7', title: 'Handout Modul 7', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1dMQcSp4pmpQcBGrAzyoAa9ujkEH5ZE87/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-8', title: 'Handout Modul 8', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1XHk25Zy8wRmH8GjTHjKKTq-DKKPE71HJ/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-9', title: 'Handout Modul 9', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1NOdbDw81ZCO069HWnfZiKkpLhD8bzfIc/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-10', title: 'Handout Modul 10', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1FB0GhQ09fjEU1LumuGYVegS0b52IMWil/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-11', title: 'Handout Modul 11', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1W1e8OJSWbUhxw7beM4nXKzWkjEouChFY/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-12', title: 'Handout Modul 12', description: '', image: '', driveLink: 'https://drive.google.com/file/d/18fZ1KqN74P59l7v_tRwlavpg8E_4eKwF/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-14', title: 'Handout Modul 14', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1iuR3ADdkeZ_iA3yg9i3VKFL46NThIR-0/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-15', title: 'Handout Modul 15', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1uoR1tnTB2STHwWjuujV4ywkpq3nkAeaX/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-16', title: 'Handout Modul 16', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1vLVoaHSAn6RCkJfm52kdqHEUfb1YKBsc/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-handout-modul-17', title: 'Handout Modul 17', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1s2krsW6Cl0udyEQKPI2XkwhrHQ187JQI/view?usp=drivesdk', semester: 1, type: 'file' }
        ]
      },
      {
        key: '1-labfis-modul',
        title: 'Modul',
        description: '',
        image: '',
        driveLink: 'https://drive.google.com/drive/folders/11jipptsT1d-6fFwztDYht4SmNl2mErvq',
        semester: 1,
        type: 'folder',
        children: [
          { key: '1-labfis-modul-1', title: 'Modul 1', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1jLFwB6tm_gPAteWualV_JfV9cLQaCjx4/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-2', title: 'Modul 2', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1qDtZ6kaIbIGhmVzijGJaianYf-zuHZLx/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-3', title: 'Modul 3', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1-HfEIv5tM5SlyxX5uR6Tgztl3RIjtSJb/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-4', title: 'Modul 4', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1UAjUZ4N9Q8DclMmX5SFPHRifiuwfW8Dq/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-5', title: 'Modul 5', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1UAjUZ4N9Q8DclMmX5SFPHRifiuwfW8Dq/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-6', title: 'Modul 6', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1Wv-Tr7Y7txpKhkyI8YQbwtodM53ZsXBU/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-7', title: 'Modul 7', description: '', image: '', driveLink: 'https://drive.google.com/file/d/11qMAgFd0pRvfpxIXBdozhqqqqWCxLxUk/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-8', title: 'Modul 8', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1GIhNE1z4KClFBlgOZawocTEXqlgzTqgk/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-9', title: 'Modul 9', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1iwjAoCKJEw9ZZS3dJdqlk5exNNNcIZ4s/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-10', title: 'Modul 10', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1qHhkXBLAm0nv0jU7U4DAukesKgTjKSUT/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-11', title: 'Modul 11', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1BAT9o1lh_UVyiKFPg5Op0uU-ppPpNVfH/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-12', title: 'Modul 12', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1yJIYADxG-94eA-jYq6FEDgaPVHqRLtmG/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-13', title: 'Modul 13', description: '', image: '', driveLink: 'https://drive.google.com/file/d/13BSjQ3B3VkHIzizNDDaLK14tCDyl2FZD/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-14', title: 'Modul 14', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1A6fMOEHlEOVnLlX0uzS1jkoqgYurpfou/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-15', title: 'Modul 15', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1U4zPqLVDJ09sJdIWPKTSvw2OgVxq06gf/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-16', title: 'Modul 16', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1wCJZpw3DEfIi8waaoPKFRqdPtlDr7iVi/view?usp=drivesdk', semester: 1, type: 'file' },
          { key: '1-labfis-modul-17', title: 'Modul 17', description: '', image: '', driveLink: 'https://drive.google.com/file/d/1_2fcelAtZKeL022l7QbO2fpART0k_sWT/view?usp=drivesdk', semester: 1, type: 'file' }
        ]
      }
    ]
  }
];

const semesterLibraryConfig: Record<number, SemesterLibraryConfig> = {
  1: {
    shared: semester1SharedData
  },
  // Add future data here, e.g.:
  // 2: {
  //   mikrobiologi: semester2MikroData,
  //   biologi: semester2BioData
  // }
  2: {},
  3: {},
  4: {},
  5: {},
  6: {},
  7: {}
};

const libraryData: LibraryItem[] = buildLibraryData(semesterLibraryConfig);

const Library: React.FC = () => {
  const { theme } = useTheme();
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<'mikrobiologi' | 'biologi'>('mikrobiologi');
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  
  const [showPopup, setShowPopup] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(getLibraryPopupStorageKey()) !== 'true';
  });
  const [dontShowPopupAgain, setDontShowPopupAgain] = useState(false);

  const handleClosePopup = () => {
    const storageKey = getLibraryPopupStorageKey();

    if (dontShowPopupAgain) {
      localStorage.setItem(storageKey, 'true');
    } else {
      localStorage.removeItem(storageKey);
    }

    setShowPopup(false);
  };

  const handleOpenViewer = (item: LibraryItem) => {
    setSelectedItem(item);
    setIsViewerOpen(true);
  };

  const filteredItems = useMemo(() => {
    return libraryData.filter(item =>
      item.semester === selectedSemester && item.category === selectedCategory
    );
  }, [selectedSemester, selectedCategory]);

  const semesters = useMemo(
    () => Object.keys(semesterLibraryConfig).map(Number).sort((a, b) => a - b),
    []
  );

  return (
    <div className={`relative min-h-screen w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0 font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
      
      <ParticleBackground />

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm transition-opacity">
          <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'} border rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_0_30px_rgba(250,204,21,0.15)] relative animate-in fade-in zoom-in duration-300`}>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <Info className="text-yellow-400" size={24} />
                </div>
                <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'} tracking-wider`}>Pemberitahuan</h3>
              </div>
              <button 
                onClick={handleClosePopup}
                className={`${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-white'} transition-colors p-1`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} leading-relaxed text-sm`}>
                Halo! File yang ditampilkan di library web ini mungkin belum sepenuhnya lengkap. 
                <br /><br />
                Untuk melihat materi, tugas, atau <i>resource</i> yang lebih lengkap, sangat disarankan untuk langsung membuka <strong>link Google Drive</strong> pada masing-masing mata kuliah ya...
              </p>
            </div>

            <label className="mb-6 flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowPopupAgain}
                onChange={(event) => setDontShowPopupAgain(event.target.checked)}
                className={`h-4 w-4 rounded ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-800'} text-yellow-400 focus:ring-yellow-400 focus:ring-2`}
              />
              <span className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Jangan tampilkan lagi</span>
            </label>

            <button
              onClick={handleClosePopup}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold uppercase tracking-widest text-sm rounded-xl transition-colors duration-300"
            >
              Oke, Mengerti!
            </button>
          </div>
        </div>
      )}

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

            <div className={`flex items-center gap-4 ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-gray-900/50 border-gray-800'} p-1 rounded-full border relative w-64 h-12`}>
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-yellow-400 rounded-full transition-all duration-500 ease-in-out z-0 ${selectedCategory === 'biologi' ? 'left-[calc(50%+2px)]' : 'left-1'
                  }`}
              />

              <button
                onClick={() => setSelectedCategory('mikrobiologi')}
                className={`flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-300 ${selectedCategory === 'mikrobiologi' ? 'text-black' : theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                <span className="text-[10px] font-black uppercase tracking-tighter">Mikrobiologi</span>
              </button>

              <button
                onClick={() => setSelectedCategory('biologi')}
                className={`flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-300 ${selectedCategory === 'biologi' ? 'text-black' : theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-500 hover:text-gray-300'
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
                    className={`group relative block w-full text-left ${theme === 'light' ? 'bg-white' : 'bg-black'} rounded-xl overflow-hidden shadow-lg hover:shadow-yellow-500/40 transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-yellow-400`}
                  >
                    <img src={item.image} alt={item.title} className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    {theme !== 'light' && <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>}
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                      <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>{item.title}</h3>
                      <p className={`mt-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} text-sm`}>{item.description}</p>
                    </div>
                    <ArrowUpRight className={`absolute top-4 right-4 w-6 h-6 ${theme === 'light' ? 'text-gray-500 group-hover:text-yellow-500' : 'text-gray-400 group-hover:text-yellow-400'} transition-colors duration-300 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100`} />
                  </button>
                ))}
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center h-64 ${theme === 'light' ? 'text-gray-400 bg-gray-100' : 'text-gray-500 bg-black/40'} animate-pulse backdrop-blur-sm rounded-2xl ${theme === 'light' ? 'border border-gray-300' : 'border border-gray-800'} mx-4 md:mx-0`}>
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

      <footer className="mt-12 border-t border-gray-800 pt-12 pb-8 text-center text-gray-500 bg-black/60 backdrop-blur-md">
        <span className="text-4xl font-bold tracking-[.2em] text-gray-700 block mb-4">SITH-S 25</span>
        <p className="text-xs mb-6">Copyright © SITES Angkatan 2025.</p>
        <div className="flex justify-center">
          <a
            href="https://www.instagram.com/sithsitb25?igsh=Mmg2Nm43aW4zYW91"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 transition-colors duration-300 hover:text-white"
            title="Visit our Instagram"
          >
            <Instagram size={20} />
          </a>
        </div>
      </footer>

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
//j