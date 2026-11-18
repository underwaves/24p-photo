import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, LayoutGrid, Settings, ExternalLink, LogOut, Sun, Moon, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut, isDemoMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'จัดการงานและรูปภาพ', path: '/admin', icon: LayoutGrid },
    { label: 'ตั้งค่าเว็บไซต์', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-border-light dark:border-border-dark pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent text-accent-fg flex items-center justify-center shadow-md">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-light tracking-wider text-base text-fg-light dark:text-fg-dark uppercase">
                  ADMIN PORTAL
                </span>
                <span className="text-[10px] text-accent tracking-widest uppercase font-heading">
                  ช่างภาพผู้ดูแล
                </span>
              </div>
            </Link>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                      active
                        ? 'bg-card-light-subtle dark:bg-card-dark text-accent border border-border-light dark:border-border-dark'
                        : 'text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-fg-light-muted dark:text-fg-dark-muted hover:text-accent transition-colors"
                aria-label="เปลี่ยนธีม"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>

              {/* View Public Site */}
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-xs text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>ดูหน้าเว็บจริง</span>
              </Link>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors text-xs font-medium ml-1"
                title={`ล็อกอินด้วย: ${user?.email}`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center border-t border-border-light dark:border-border-dark px-4 py-2 gap-2 bg-card-light-subtle/40 dark:bg-card-dark/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? 'bg-accent text-accent-fg'
                    : 'text-fg-light-muted dark:text-fg-dark-muted hover:bg-card-light dark:hover:bg-card-dark'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Demo Mode Alert Banner */}
      {isDemoMode && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-600 dark:text-amber-400 py-2.5 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>โหมดจำลอง (Demo Mode):</strong> ระบบกำลังจำลองการทำงาน ข้อมูลจะถูกจัดเก็บในหน่วยความจำเครื่อง และแสดงผลไปยังหน้าบ้านได้ทันที
              </span>
            </div>
            <span className="text-[11px] opacity-80 underline underline-offset-2">
              เชื่อมต่อ Cloudflare D1 Database และ R2 Storage
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
