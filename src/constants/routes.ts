import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  FolderOpen, 
  Clock, 
  Wallet, 
  Bell, 
  Settings, 
  User, 
  HelpCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface RouteDefinition {
  path: string;
  label: string;
  icon: LucideIcon;
  isAction?: boolean; // Used for Command Palette actions rather than pure navigation
}

export const ROUTES: Record<string, RouteDefinition> = {
  DASHBOARD: { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  DISCOVERY: { path: '/discovery', label: 'Scholarship Discovery', icon: Search },
  WORKSPACE: { path: '/workspace', label: 'Applications', icon: FileText },
  VAULT: { path: '/vault', label: 'Smart Vault', icon: FolderOpen },
  TRACKER: { path: '/tracker', label: 'Verification Tracker', icon: Clock },
  PAYMENTS: { path: '/payments', label: 'Payment Tracker', icon: Wallet },
  PROFILE: { path: '/profile', label: 'Scholarship DNA', icon: User },
  NOTIFICATIONS: { path: '/notifications', label: 'Notifications', icon: Bell },
  SETTINGS: { path: '/settings', label: 'Settings', icon: Settings },
  HELP: { path: '/help', label: 'Help Center', icon: HelpCircle },
};

export const SIDEBAR_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.DISCOVERY,
  ROUTES.WORKSPACE,
  ROUTES.VAULT,
  ROUTES.TRACKER,
  ROUTES.PAYMENTS,
];

export const BOTTOM_SIDEBAR_ROUTES = [
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
  ROUTES.HELP,
];

// For the Command Palette search
export const ALL_ROUTES = Object.values(ROUTES);
