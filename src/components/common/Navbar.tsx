import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Sun, Moon, Menu, X, Shield, PhoneCall } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#contact');
    }
  };

  // ตรวจจับการเลื่อนหน้าจอเพื่อเพิ่มมิติของ glass nav
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ปิดเมนูมือถือเมื่อเปลี่ยนหน้า
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'หน้าแรก', path: '/' },
    { label: 'ผลงาน', path: '/portfolio' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/portfolio') {
      return (
        location.pathname.startsWith('/portfolio') ||
        location.pathname.startsWith('/wedding') ||
        location.pathname.startsWith('/ordination') ||
        location.pathname.startsWith('/events')
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 pt-safe ${
        scrolled ? 'glass-nav shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand Name */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl p-1 shrink-0 select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-card-dark text-accent flex items-center justify-center border border-border-dark group-hover:border-accent transition-colors shadow-sm shrink-0">
              <Camera className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-heading font-light tracking-wider text-base sm:text-lg lg:text-xl text-fg-light dark:text-fg-dark uppercase whitespace-nowrap leading-tight">
                {settings.name || '24p PHOTO'}
              </span>
              <span className="text-[10px] tracking-widest text-fg-light-muted dark:text-fg-dark-muted uppercase font-heading whitespace-nowrap">
                Visual Storyteller
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (Visible on md and larger screens) */}
          <nav className="hidden md:flex items-center gap-1 bg-card-light-subtle/80 dark:bg-card-dark/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap shrink-0 ${
                  isActive(link.path)
                    ? 'bg-accent text-accent-fg shadow-sm'
                    : 'text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="#contact"
              onClick={handleContactClick}
              className="px-5 py-2 text-xs sm:text-sm font-medium rounded-full text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              ติดต่อ
            </a>
          </nav>

          {/* Desktop Actions (Visible on md and larger screens) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-fg-light-muted dark:text-fg-dark-muted hover:text-accent transition-colors shrink-0"
              aria-label={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Admin Link */}
            <Link
              to="/admin"
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-fg-light-muted dark:text-fg-dark-muted hover:text-accent transition-colors relative shrink-0"
              title="เข้าสู่ระบบหลังบ้าน"
            >
              <Shield className="w-4 h-4" />
              {user && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-card-dark" />
              )}
            </Link>

            {/* Contact CTA Button */}
            <a
              href="#contact"
              onClick={handleContactClick}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium rounded-full bg-accent text-accent-fg hover:bg-accent-hover transition-colors shadow-sm ml-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">ติดต่อจ้างงาน</span>
            </a>
          </div>

          {/* Mobile / Tablet Menu & Theme Toggle Buttons (Visible below md) */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-fg-light-muted dark:text-fg-dark-muted"
              aria-label="เปลี่ยนธีม"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-fg-light dark:text-fg-dark"
              aria-label="เปิดเมนูนำทาง"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-t border-border-light dark:border-border-dark px-4 pt-4 pb-8 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 rounded-2xl text-base font-medium transition-colors whitespace-nowrap ${
                  isActive(link.path)
                    ? 'bg-accent text-accent-fg'
                    : 'text-fg-light dark:text-fg-dark hover:bg-card-light-subtle dark:hover:bg-card-dark'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="#contact"
              onClick={handleContactClick}
              className="px-4 py-3 rounded-2xl text-base font-medium text-fg-light dark:text-fg-dark hover:bg-card-light-subtle dark:hover:bg-card-dark transition-colors whitespace-nowrap cursor-pointer"
            >
              ติดต่อจ้างงาน
            </a>
            <div className="pt-2 border-t border-border-light dark:border-border-dark mt-2 flex items-center justify-between">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-sm text-fg-light-muted dark:text-fg-dark-muted hover:text-accent py-2 whitespace-nowrap"
              >
                <Shield className="w-4 h-4" />
                <span>ระบบหลังบ้านช่างภาพ {user && '(ล็อกอินแล้ว)'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
