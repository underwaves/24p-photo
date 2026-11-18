import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Phone, Mail, MessageCircle, Shield } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from './SocialIcons';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear() + 543; // พ.ศ.

  return (
    <footer className="border-t border-border-light dark:border-border-dark bg-card-light-subtle/40 dark:bg-card-dark/40 mt-24 pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-card-dark text-accent flex items-center justify-center border border-border-dark">
                <Camera className="w-5 h-5" />
              </div>
              <span className="font-heading font-light tracking-widest text-xl text-fg-light dark:text-fg-dark uppercase">
                {settings.name || '24p PHOTO'}
              </span>
            </Link>
            <p className="text-sm text-fg-light-muted dark:text-fg-dark-muted leading-relaxed max-w-md">
              {settings.bio || 'บันทึกทุกเรื่องราวและความรู้สึกอันล้ำค่าของคุณในทุกมิติ ด้วยแสงธรรมชาติและมุมมองที่จริงใจ เพื่อให้ความทรงจำยังคงมีชีวิตอยู่ในทุกครั้งที่มองย้อนกลับมา'}
            </p>
          </div>

          {/* Categories Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-fg-light dark:text-fg-dark uppercase font-heading">
              ผลงานแยกตามหมวด
            </h4>
            <ul className="space-y-2 text-sm text-fg-light-muted dark:text-fg-dark-muted">
              <li>
                <Link to="/portfolio" className="hover:text-accent transition-colors">
                  ผลงานทั้งหมด (All Works)
                </Link>
              </li>
              <li>
                <Link to="/portfolio?category=wedding" className="hover:text-accent transition-colors">
                  งานแต่งงาน (Wedding)
                </Link>
              </li>
              <li>
                <Link to="/portfolio?category=ordination" className="hover:text-accent transition-colors">
                  งานบวช (Ordination)
                </Link>
              </li>
              <li>
                <Link to="/portfolio?category=events" className="hover:text-accent transition-colors">
                  งานอื่นๆ (Events & Ceremonies)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Contact & Socials */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-fg-light dark:text-fg-dark uppercase font-heading">
              ติดต่อสอบถามคิวงาน
            </h4>
            <ul className="space-y-2.5 text-sm text-fg-light-muted dark:text-fg-dark-muted">
              {settings.contact.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <a href={`tel:${settings.contact.phone.replace(/[^0-9]/g, '')}`} className="hover:text-accent transition-colors">
                    {settings.contact.phone}
                  </a>
                </li>
              )}
              {settings.contact.line && (
                <li className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-accent shrink-0" />
                  <span>LINE: {settings.contact.line}</span>
                </li>
              )}
              {settings.contact.facebook && (
                <li className="flex items-center gap-2.5">
                  <FacebookIcon className="w-4 h-4 text-accent shrink-0" />
                  <span>{settings.contact.facebook}</span>
                </li>
              )}
              {settings.contact.instagram && (
                <li className="flex items-center gap-2.5">
                  <InstagramIcon className="w-4 h-4 text-accent shrink-0" />
                  <span>{settings.contact.instagram}</span>
                </li>
              )}
              {settings.contact.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-accent shrink-0" />
                  <a href={`mailto:${settings.contact.email}`} className="hover:text-accent transition-colors">
                    {settings.contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-light dark:border-border-dark mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-fg-light-muted dark:text-fg-dark-muted">
          <p>© {currentYear} {settings.name || '24p PHOTO'}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>ภาพถ่ายทุกภาพมีลิขสิทธิ์</span>
            <Link to="/admin" className="flex items-center gap-1 hover:text-accent transition-colors">
              <Shield className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบหลังบ้าน</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
