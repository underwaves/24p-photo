import React, { useState } from 'react';
import { Save, Camera, Phone, Mail, MessageCircle, Image } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '../../components/common/SocialIcons';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useToast } from '../../components/common/Toast';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSiteSettings();
  const { showToast } = useToast();

  const [name, setName] = useState(settings.name || '');
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [bio, setBio] = useState(settings.bio || '');
  const [phone, setPhone] = useState(settings.contact.phone || '');
  const [line, setLine] = useState(settings.contact.line || '');
  const [facebook, setFacebook] = useState(settings.contact.facebook || '');
  const [instagram, setInstagram] = useState(settings.contact.instagram || '');
  const [email, setEmail] = useState(settings.contact.email || '');

  // Hero images array
  const [heroImages, setHeroImages] = useState<string[]>(
    settings.hero_image_paths?.length ? settings.hero_image_paths : ['', '', '']
  );
  const [saving, setSaving] = useState(false);

  const handleHeroImageChange = (index: number, val: string) => {
    const updated = [...heroImages];
    updated[index] = val;
    setHeroImages(updated);
  };

  const addHeroSlot = () => {
    if (heroImages.length < 5) {
      setHeroImages([...heroImages, '']);
    } else {
      showToast('กำหนดรูปภาพ Hero ได้สูงสุด 5 ภาพ', 'info');
    }
  };

  const removeHeroSlot = (index: number) => {
    if (heroImages.length <= 1) return;
    const updated = heroImages.filter((_, i) => i !== index);
    setHeroImages(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const filteredHeroImages = heroImages.filter((url) => url.trim().length > 0);

    const res = await updateSettings({
      name: name.trim(),
      tagline: tagline.trim(),
      bio: bio.trim(),
      contact: {
        phone: phone.trim(),
        line: line.trim(),
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        email: email.trim(),
      },
      hero_image_paths: filteredHeroImages.length > 0 ? filteredHeroImages : settings.hero_image_paths,
    });

    setSaving(false);

    if (res.success) {
      showToast('บันทึกการตั้งค่าเว็บไซต์สำเร็จแล้ว', 'success');
    } else {
      showToast(res.error || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-heading font-light text-fg-light dark:text-fg-dark uppercase tracking-tight">
          ตั้งค่าเว็บไซต์
        </h1>
        <p className="text-xs sm:text-sm text-fg-light-muted dark:text-fg-dark-muted font-light mt-1">
          ปรับแต่งชื่อแบรนด์ ข้อความโปรย ข้อมูลติดต่อ และภาพสไลด์หน้าแรก
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Card 1: Brand & Tagline */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light/60 dark:border-border-dark/60">
            <Camera className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-heading font-medium text-fg-light dark:text-fg-dark">
              ข้อมูลช่างภาพและแบรนด์
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
                ชื่อช่างภาพ / สตูดิโอ *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="24p PHOTO"
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
                คำโปรยสั้นๆ (Tagline บน Hero) *
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="บันทึกทุกช่วงเวลาสำคัญ ด้วยอารมณ์และแสงที่จริงใจ"
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
                คำแนะนำตัว / สไตล์การถ่ายภาพ (Bio ท้ายเว็บ)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="ช่างภาพอิสระผู้หลงใหลในความทรงจำ รับถ่ายภาพงานแต่งงาน งานบวช และงานพิธีทั่วประเทศ..."
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Contact Info */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-light/60 dark:border-border-dark/60">
            <Phone className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-heading font-medium text-fg-light dark:text-fg-dark">
              ช่องทางการติดต่อและโซเชียลมีเดีย
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-accent" />
                <span>เบอร์โทรศัพท์</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="089-123-4567"
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-accent" />
                <span>LINE ID หรือ @line</span>
              </label>
              <input
                type="text"
                value={line}
                onChange={(e) => setLine(e.target.value)}
                placeholder="@24pphoto"
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading flex items-center gap-1.5">
                <FacebookIcon className="w-3.5 h-3.5 text-accent" />
                <span>Facebook Fanpage</span>
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="24p PHOTO Studio"
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading flex items-center gap-1.5">
                <InstagramIcon className="w-3.5 h-3.5 text-accent" />
                <span>Instagram Profile</span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@24p.photo"
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>อีเมลสำหรับติดต่องาน</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@24pphoto.com"
                className="w-full px-4 py-2.5 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Hero Slider Image URLs */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border-light/60 dark:border-border-dark/60">
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-accent" />
              <div>
                <h2 className="text-lg font-heading font-medium text-fg-light dark:text-fg-dark">
                  ภาพสไลด์ส่วน Hero หน้าแรก (สลับทุก 5 วินาที)
                </h2>
                <p className="text-xs text-fg-light-muted dark:text-fg-dark-muted font-light mt-0.5">
                  ระบุ URL ภาพความละเอียดสูง (อัตราส่วน 16:9 หรือ 3:2 แนวนอน)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addHeroSlot}
              className="text-xs text-accent font-medium hover:underline"
            >
              + เพิ่มภาพสไลด์
            </button>
          </div>

          <div className="space-y-4">
            {heroImages.map((url, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-7 text-xs font-bold text-fg-light-muted dark:text-fg-dark-muted shrink-0 text-center">
                  #{index + 1}
                </span>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleHeroImageChange(index, e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-4 py-2 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-xs sm:text-sm text-fg-light dark:text-fg-dark focus:outline-none focus:border-accent"
                />
                {url && (
                  <div className="w-12 h-9 rounded-xl overflow-hidden shrink-0 border border-border-light dark:border-border-dark">
                    <img src={url} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                )}
                {heroImages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHeroSlot(index)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                    title="ลบช่องนี้"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-colors shadow-lg text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการเปลี่ยนแปลงทั้งหมด'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
