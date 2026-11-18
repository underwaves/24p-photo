import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, Check, Copy, Send } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '../common/SocialIcons';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useToast } from '../common/Toast';

export const ContactSection: React.FC = () => {
  const { settings } = useSiteSettings();
  const { showToast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`คัดลอก "${text}" เรียบร้อยแล้ว`, 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const contactList = [
    {
      key: 'phone',
      label: 'เบอร์โทรศัพท์ติดต่อ',
      value: settings.contact.phone,
      icon: Phone,
      actionText: 'โทรออก',
      actionUrl: settings.contact.phone ? `tel:${settings.contact.phone.replace(/[^0-9]/g, '')}` : undefined,
    },
    {
      key: 'line',
      label: 'LINE Official / ID',
      value: settings.contact.line,
      icon: MessageCircle,
      actionText: 'แอดไลน์',
      actionUrl: settings.contact.line?.startsWith('@')
        ? `https://line.me/R/ti/p/${settings.contact.line}`
        : undefined,
    },
    {
      key: 'facebook',
      label: 'Facebook Fanpage',
      value: settings.contact.facebook,
      icon: FacebookIcon,
      actionText: 'เปิดเพจ',
      actionUrl: settings.contact.facebook?.startsWith('http')
        ? settings.contact.facebook
        : undefined,
    },
    {
      key: 'instagram',
      label: 'Instagram Gallery',
      value: settings.contact.instagram,
      icon: InstagramIcon,
      actionText: 'ติดตาม IG',
      actionUrl: settings.contact.instagram
        ? `https://instagram.com/${settings.contact.instagram.replace('@', '')}`
        : undefined,
    },
    {
      key: 'email',
      label: 'อีเมลสอบถามรายละเอียด',
      value: settings.contact.email,
      icon: Mail,
      actionText: 'ส่งอีเมล',
      actionUrl: settings.contact.email ? `mailto:${settings.contact.email}` : undefined,
    },
  ].filter((item) => Boolean(item.value));

  return (
    <section id="contact" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-8 sm:p-14 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Note */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-accent uppercase tracking-widest text-xs font-semibold font-heading">
                Booking & Inquiries
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-light text-fg-light dark:text-fg-dark uppercase tracking-tight mt-2">
                ติดต่อจ้างงาน
              </h2>
            </div>

            <p className="text-sm sm:text-base text-fg-light-muted dark:text-fg-dark-muted font-light leading-relaxed">
              ยินดีให้คำปรึกษา แนะนำสถานที่ และลำดับขั้นตอนในพิธีการต่างๆ 
              สามารถสอบถามคิวงาน ประเมินราคา หรือดูผลงานเพิ่มเติมได้ทุกช่องทางครับ
            </p>

            <div className="p-4 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-xs text-fg-light-muted dark:text-fg-dark-muted space-y-1.5">
              <p className="font-semibold text-fg-light dark:text-fg-dark">💡 ข้อแนะนำสำหรับการจองคิว:</p>
              <p>• แจ้งประเภทงาน (แต่งงาน/บวช/งานอื่นๆ), วันที่จัดงาน และสถานที่</p>
              <p>• สอบถามล่วงหน้าอย่างน้อย 1-3 เดือนเพื่อล็อกคิวงานที่แน่นอน</p>
            </div>
          </div>

          {/* Right Column: Contact Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactList.map((item) => {
              const Icon = item.icon;
              const isCopied = copiedKey === item.key;

              return (
                <div
                  key={item.key}
                  className="rounded-2xl p-5 bg-card-light-subtle/50 dark:bg-card-dark-subtle/50 border border-border-light dark:border-border-dark flex flex-col justify-between hover:border-accent/40 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-card-light dark:bg-card-dark flex items-center justify-center text-accent border border-border-light dark:border-border-dark">
                      <Icon className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.value, item.key)}
                      className="p-2 rounded-lg text-fg-light-muted dark:text-fg-dark-muted hover:text-accent hover:bg-card-light dark:hover:bg-card-dark transition-colors"
                      title="คัดลอกข้อมูล"
                      aria-label={`คัดลอก ${item.label}`}
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div>
                    <span className="text-[11px] text-fg-light-muted dark:text-fg-dark-muted font-heading uppercase tracking-wider block">
                      {item.label}
                    </span>
                    <p className="text-base font-medium text-fg-light dark:text-fg-dark mt-0.5 truncate font-heading">
                      {item.value}
                    </p>
                  </div>

                  {item.actionUrl && (
                    <div className="mt-4 pt-3 border-t border-border-light/60 dark:border-border-dark/60">
                      <a
                        href={item.actionUrl}
                        target={item.actionUrl.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-accent font-medium hover:underline"
                      >
                        <Send className="w-3 h-3" />
                        <span>{item.actionText}</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
