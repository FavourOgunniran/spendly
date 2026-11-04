import React from 'react';
import {
  UtensilsCrossed,
  Home,
  Car,
  Film,
  ShoppingBag,
  Zap,
  HeartPulse,
  GraduationCap,
  Package,
  Banknote,
  Briefcase,
  TrendingUp,
  Coins,
  Coffee,
  Plane,
  Book,
  Shield,
  Music,
  Gift,
  Smartphone,
  Wifi,
  Wrench,
  Dumbbell,
  Sparkles,
  Camera,
  Layers,
  LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Home,
  Car,
  Film,
  ShoppingBag,
  Zap,
  HeartPulse,
  GraduationCap,
  Package,
  Banknote,
  Briefcase,
  TrendingUp,
  Coins,
  Coffee,
  Plane,
  Book,
  Shield,
  Music,
  Gift,
  Smartphone,
  Wifi,
  Wrench,
  Dumbbell,
  Sparkles,
  Camera,
  Layers,
};

export const AVAILABLE_CATEGORY_ICONS = Object.keys(ICON_MAP);

export const AVAILABLE_CATEGORY_COLORS = [
  '#f87171', // Red
  '#fb923c', // Orange
  '#facc15', // Yellow
  '#22c55e', // Emerald Green
  '#10b981', // Teal
  '#38bdf8', // Sky Blue
  '#6366f1', // Indigo
  '#8e8bf5', // Lavender Purple
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#64748b', // Slate
  '#94a3b8', // Gray
  '#d97706', // Amber
  '#06b6d4', // Cyan
  '#14b8a6', // Dark Teal
];

export const renderCategoryIcon = (
  iconName?: string,
  className = 'w-4 h-4',
  fallback: LucideIcon = Package
): React.ReactNode => {
  const Icon = (iconName && ICON_MAP[iconName]) || fallback;
  return <Icon className={className} />;
};

export const getCategoryIconComponent = (iconName?: string): LucideIcon => {
  return (iconName && ICON_MAP[iconName]) || Package;
};
