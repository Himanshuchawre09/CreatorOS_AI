import {
  LayoutDashboard,
  Megaphone,
  Compass,
  GitPullRequest,
  FileCheck2,
  CheckSquare,
  Eye,
  Receipt,
  MessageSquare,
  Calendar,
  BarChart3,
  Star,
  Sparkles,
  Settings,
  ShieldAlert,
  User,
  type LucideIcon,
} from 'lucide-react';

export type UserRole = 'creator' | 'brand' | 'freelancer' | 'talentManager' | 'admin';

export interface NavItemConfig {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  isSoon?: boolean;
}

export const ROLE_LABELS: Record<string, string> = {
  creator: 'Creator',
  brand: 'Brand',
  freelancer: 'Freelancer',
  talentManager: 'Talent Manager',
  talent_manager: 'Talent Manager',
  admin: 'Admin',
};

const talentManagerNav: NavItemConfig[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Discover', path: '/discover', icon: Compass },
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Campaigns', path: '/campaigns', icon: Megaphone },
  { label: 'Collaboration Requests', path: '/coming-soon?feature=Collaboration+Requests', icon: GitPullRequest, badge: 'Soon', isSoon: true },
  { label: 'Contracts', path: '/coming-soon?feature=Contracts', icon: FileCheck2, badge: 'Soon', isSoon: true },
  { label: 'Tasks', path: '/coming-soon?feature=Tasks', icon: CheckSquare, badge: 'Soon', isSoon: true },
  { label: 'Content Review', path: '/coming-soon?feature=Content+Review', icon: Eye, badge: 'Soon', isSoon: true },
  { label: 'Invoices & Payments', path: '/coming-soon?feature=Invoices+%26+Payments', icon: Receipt, badge: 'Soon', isSoon: true },
  { label: 'Messages', path: '/coming-soon?feature=Messages', icon: MessageSquare, badge: 'Soon', isSoon: true },
  { label: 'Calendar', path: '/coming-soon?feature=Calendar', icon: Calendar, badge: 'Soon', isSoon: true },
  { label: 'Analytics', path: '/coming-soon?feature=Analytics', icon: BarChart3, badge: 'Soon', isSoon: true },
  { label: 'Reviews', path: '/coming-soon?feature=Reviews', icon: Star, badge: 'Soon', isSoon: true },
  { label: 'AI Assistant', path: '/coming-soon?feature=AI+Assistant', icon: Sparkles, badge: 'Soon', isSoon: true },
  { label: 'Settings', path: '/coming-soon?feature=Settings', icon: Settings, badge: 'Soon', isSoon: true },
];

export const ROLE_NAVIGATION: Record<string, NavItemConfig[]> = {
  creator: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Discover Brands', path: '/discover', icon: Compass },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Campaigns', path: '/campaigns', icon: Megaphone },
    { label: 'Collaboration Requests', path: '/coming-soon?feature=Collaboration+Requests', icon: GitPullRequest, badge: 'Soon', isSoon: true },
    { label: 'Contracts', path: '/coming-soon?feature=Contracts', icon: FileCheck2, badge: 'Soon', isSoon: true },
    { label: 'Tasks', path: '/coming-soon?feature=Tasks', icon: CheckSquare, badge: 'Soon', isSoon: true },
    { label: 'Content Review', path: '/coming-soon?feature=Content+Review', icon: Eye, badge: 'Soon', isSoon: true },
    { label: 'Invoices & Payments', path: '/coming-soon?feature=Invoices+%26+Payments', icon: Receipt, badge: 'Soon', isSoon: true },
    { label: 'Messages', path: '/coming-soon?feature=Messages', icon: MessageSquare, badge: 'Soon', isSoon: true },
    { label: 'Calendar', path: '/coming-soon?feature=Calendar', icon: Calendar, badge: 'Soon', isSoon: true },
    { label: 'Analytics', path: '/coming-soon?feature=Analytics', icon: BarChart3, badge: 'Soon', isSoon: true },
    { label: 'Reviews', path: '/coming-soon?feature=Reviews', icon: Star, badge: 'Soon', isSoon: true },
    { label: 'AI Assistant', path: '/coming-soon?feature=AI+Assistant', icon: Sparkles, badge: 'Soon', isSoon: true },
    { label: 'Settings', path: '/coming-soon?feature=Settings', icon: Settings, badge: 'Soon', isSoon: true },
  ],
  brand: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Discover Creators', path: '/discover', icon: Compass },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Campaigns', path: '/campaigns', icon: Megaphone },
    { label: 'Collaboration Requests', path: '/coming-soon?feature=Collaboration+Requests', icon: GitPullRequest, badge: 'Soon', isSoon: true },
    { label: 'Contracts', path: '/coming-soon?feature=Contracts', icon: FileCheck2, badge: 'Soon', isSoon: true },
    { label: 'Tasks', path: '/coming-soon?feature=Tasks', icon: CheckSquare, badge: 'Soon', isSoon: true },
    { label: 'Content Review', path: '/coming-soon?feature=Content+Review', icon: Eye, badge: 'Soon', isSoon: true },
    { label: 'Invoices & Payments', path: '/coming-soon?feature=Invoices+%26+Payments', icon: Receipt, badge: 'Soon', isSoon: true },
    { label: 'Messages', path: '/coming-soon?feature=Messages', icon: MessageSquare, badge: 'Soon', isSoon: true },
    { label: 'Calendar', path: '/coming-soon?feature=Calendar', icon: Calendar, badge: 'Soon', isSoon: true },
    { label: 'Analytics', path: '/coming-soon?feature=Analytics', icon: BarChart3, badge: 'Soon', isSoon: true },
    { label: 'Reviews', path: '/coming-soon?feature=Reviews', icon: Star, badge: 'Soon', isSoon: true },
    { label: 'AI Assistant', path: '/coming-soon?feature=AI+Assistant', icon: Sparkles, badge: 'Soon', isSoon: true },
    { label: 'Settings', path: '/coming-soon?feature=Settings', icon: Settings, badge: 'Soon', isSoon: true },
  ],
  freelancer: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Tasks', path: '/coming-soon?feature=Tasks', icon: CheckSquare, badge: 'Soon', isSoon: true },
    { label: 'Content Review', path: '/coming-soon?feature=Content+Review', icon: Eye, badge: 'Soon', isSoon: true },
    { label: 'Contracts', path: '/coming-soon?feature=Contracts', icon: FileCheck2, badge: 'Soon', isSoon: true },
    { label: 'Invoices & Payments', path: '/coming-soon?feature=Invoices+%26+Payments', icon: Receipt, badge: 'Soon', isSoon: true },
    { label: 'Messages', path: '/coming-soon?feature=Messages', icon: MessageSquare, badge: 'Soon', isSoon: true },
    { label: 'Calendar', path: '/coming-soon?feature=Calendar', icon: Calendar, badge: 'Soon', isSoon: true },
    { label: 'AI Assistant', path: '/coming-soon?feature=AI+Assistant', icon: Sparkles, badge: 'Soon', isSoon: true },
    { label: 'Settings', path: '/coming-soon?feature=Settings', icon: Settings, badge: 'Soon', isSoon: true },
  ],
  talentManager: talentManagerNav,
  talent_manager: talentManagerNav,
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Campaigns', path: '/campaigns', icon: Megaphone },
    { label: 'Contracts', path: '/coming-soon?feature=Contracts', icon: FileCheck2, badge: 'Soon', isSoon: true },
    { label: 'Invoices & Payments', path: '/coming-soon?feature=Invoices+%26+Payments', icon: Receipt, badge: 'Soon', isSoon: true },
    { label: 'Analytics', path: '/coming-soon?feature=Analytics', icon: BarChart3, badge: 'Soon', isSoon: true },
    { label: 'Settings', path: '/coming-soon?feature=Settings', icon: Settings, badge: 'Soon', isSoon: true },
    { label: 'Admin', path: '/coming-soon?feature=Admin+Console', icon: ShieldAlert, badge: 'Admin', isSoon: true },
  ],
};
