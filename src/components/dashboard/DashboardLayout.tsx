import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  FileText,
  HelpCircle,
  Home,
  Leaf,
  LineChart,
  LogOut,
  MapPin,
  Menu,
  RefreshCw,
  Settings,
  ShieldAlert,
  Sprout,
  Sun,
  Tractor,
  X,
} from 'lucide-react';
import { AgroLensLogo } from '../illustrations/AgroVisuals';
import type { ClimateObservationRecord, DashboardTab, Farm, SoilProfile, User } from '../../types/agrolens';

interface DashboardLayoutProps {
  user: User;
  farms: Farm[];
  activeFarm: Farm;
  soil: SoilProfile | null;
  climate: ClimateObservationRecord | null;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onSelectFarm: (farmId: string) => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{ id: DashboardTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'my-farm', label: 'My Farm', icon: Tractor },
  { id: 'environmental', label: 'Environmental Intelligence', icon: LineChart },
  { id: 'crops', label: 'Crop Intelligence', icon: Sprout },
  { id: 'rotation-lab', label: 'Rotation Strategy Lab', icon: RefreshCw },
  { id: 'field-risk', label: 'Field Risk Explorer', icon: ShieldAlert },
  { id: 'reports', label: 'Decision Reports', icon: FileText },
];

export function DashboardLayout({
  user,
  farms,
  activeFarm,
  soil,
  climate,
  activeTab,
  onSelectTab,
  onSelectFarm,
  onSignOut,
  children,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications: Array<{ title: string; detail: string; actionTab: DashboardTab }> = [];
  if (!soil || soil.missingFields.length > 0) {
    notifications.push({
      title: 'Soil Lab Tests Incomplete',
      detail: `${soil ? soil.missingFields.length : 5} soil lab measurements are missing for ${activeFarm.name}.`,
      actionTab: 'my-farm',
    });
  }
  if (climate && climate.summary.heatStressDays > 0) {
    notifications.push({
      title: 'Heat Stress Days Detected',
      detail: `${climate.summary.heatStressDays} days exceeded 34°C in the ${climate.rangeDays}-day NASA POWER window.`,
      actionTab: 'environmental',
    });
  }
  if (notifications.length === 0) {
    notifications.push({
      title: 'NASA Data Synchronized',
      detail: `Latest environmental indicators loaded for ${activeFarm.name}.`,
      actionTab: 'reports',
    });
  }

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B4D1E] text-white select-none">
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <AgroLensLogo variant="light" />
        <p className="text-[11px] text-[#BBF7D0] mt-1.5">Turning Earth Observations into Decisions</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                isActive
                  ? 'bg-[#228B3B] text-white shadow-sm'
                  : 'text-[#DCFCE7] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="leading-snug">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-white/15 space-y-1">
          <button
            type="button"
            onClick={() => {
              onSelectTab('help');
              setMobileOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'help' ? 'bg-[#228B3B] text-white' : 'text-[#DCFCE7] hover:bg-white/10'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Help &amp; Methodology</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectTab('settings');
              setMobileOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#228B3B] text-white' : 'text-[#DCFCE7] hover:bg-white/10'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* Bottom User Profile */}
      <div className="p-4 border-t border-white/15 bg-[#083B17]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#228B3B] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-[11px] text-[#86EFAC] capitalize truncate">
                {user.role === 'extension_officer' ? 'Extension Officer' : user.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            className="p-1.5 rounded-lg text-[#DCFCE7] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F4F8F4] text-[#0F1F14]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen no-print">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-68 max-w-[82vw] h-full shadow-xl">
            <SidebarContent />
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Context Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#E2EBE2] px-4 sm:px-7 h-16 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#CFE2D0] text-[#0B4D1E] cursor-pointer"
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="relative flex items-center gap-2 bg-[#F4F8F4] border border-[#CFE2D0] rounded-lg px-3 py-1.5">
              <MapPin className="w-4 h-4 text-[#16A34A] shrink-0" />
              <select
                value={activeFarm.id}
                onChange={(e) => onSelectFarm(e.target.value)}
                aria-label="Select active farm"
                className="bg-transparent text-xs sm:text-sm font-semibold text-[#0F1F14] pr-4 focus:outline-none cursor-pointer"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} · {f.city ? `${f.city}, ` : ''}{f.lga}, {f.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-[#4B6352] pl-2 border-l border-[#E2EBE2]">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{todayFormatted}</span>
              {climate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums font-medium text-[#0B4D1E]">
                    {climate.summary.avgTempC}°C Avg
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg border border-[#E2EBE2] hover:bg-[#F4F8F4] text-[#2F4735] cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-[#CFE2D0] rounded-xl shadow-lg p-4 z-40 space-y-3">
                <div className="flex items-center justify-between border-b border-[#E6EFE6] pb-2">
                  <span className="text-xs font-bold text-[#0F1F14]">Farm &amp; Data Alerts</span>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-[#4B6352] hover:text-[#0F1F14] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                {notifications.map((n) => (
                  <button
                    key={n.title}
                    type="button"
                    onClick={() => {
                      onSelectTab(n.actionTab);
                      setNotifOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-[#F6FAF6] hover:bg-[#EAF6EB] transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-[#0B4D1E]">{n.title}</p>
                    <p className="text-xs text-[#4B6352] mt-0.5">{n.detail}</p>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => onSelectTab('settings')}
              className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg hover:bg-[#F4F8F4] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#0B4D1E] text-white text-xs font-bold flex items-center justify-center">
                {user.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-[#0F1F14] leading-tight">{user.fullName}</p>
                <p className="text-[11px] text-[#4B6352] capitalize leading-tight">
                  {user.role === 'extension_officer' ? 'Extension Officer' : 'Farmer'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#4B6352]" />
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-7 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
