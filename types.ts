
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
    path: string;
    name: string;
    icon: LucideIcon;
}

export interface NewsArticle {
    id: number;
    title: string;
    date: string;
    imageUrl: string;
    category: string;
}
