import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Camera, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

export const AdminLoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      setErrorMsg(error.message === 'Invalid login credentials'
        ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
        : error.message);
      showToast('เข้าสู่ระบบไม่สำเร็จ', 'error');
    } else {
      showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับครับ', 'success');
      navigate(from, { replace: true });
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('admin@24pphoto.com');
    setPassword('Admin@24pPhoto!');
    setLoading(true);
    const { error } = await signIn('admin@24pphoto.com', 'Admin@24pPhoto!');
    setLoading(false);
    if (!error) {
      showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับครับ', 'success');
      navigate(from, { replace: true });
    } else {
      showToast('เข้าสู่ระบบไม่สำเร็จ: ' + error.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-light dark:bg-bg-dark">
      <div className="max-w-md w-full">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted hover:text-accent mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังหน้าหลัก</span>
        </Link>

        {/* Login Box */}
        <div className="rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark flex items-center justify-center text-accent mx-auto mb-4 shadow-sm">
              <Camera className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-heading font-light text-fg-light dark:text-fg-dark uppercase tracking-tight">
              เข้าสู่ระบบหลังบ้าน
            </h1>
            <p className="text-xs text-fg-light-muted dark:text-fg-dark-muted mt-1.5 font-light">
              เฉพาะช่างภาพผู้ดูแลระบบ (Admin)
            </p>
          </div>

          {/* Quick Fill Info */}
          <div className="mb-6 p-4 rounded-2xl bg-accent/10 border border-accent/20 text-fg-light dark:text-fg-dark text-xs space-y-2">
            <div className="flex items-center gap-2 font-medium text-accent">
              <Camera className="w-4 h-4 shrink-0" />
              <span>ระบบหลังบ้าน Cloudflare D1 & R2</span>
            </div>
            <p className="text-[11px] leading-relaxed text-fg-light-muted dark:text-fg-dark-muted">
              อีเมล: <code className="bg-card-light-subtle dark:bg-card-dark-subtle px-1.5 py-0.5 rounded text-accent font-mono">admin@24pphoto.com</code><br/>
              รหัสผ่าน: <code className="bg-card-light-subtle dark:bg-card-dark-subtle px-1.5 py-0.5 rounded text-accent font-mono">Admin@24pPhoto!</code>
            </p>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 px-3 rounded-xl bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-colors text-xs shadow-sm"
            >
              ⚡ กรอกข้อมูลและเข้าสู่ระบบทันที
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-fg-light-muted dark:text-fg-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-fg-light dark:text-fg-dark text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-light-muted dark:text-fg-dark-muted mb-1.5 font-heading">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-fg-light-muted dark:text-fg-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-card-light-subtle dark:bg-card-dark-subtle border border-border-light dark:border-border-dark text-fg-light dark:text-fg-dark text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-light-muted dark:text-fg-dark-muted hover:text-fg-light dark:hover:text-fg-dark"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-accent text-accent-fg font-medium hover:bg-accent-hover transition-colors shadow-lg flex items-center justify-center gap-2 text-sm mt-6 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังตรวจสอบ...</span>
                </>
              ) : (
                <span>เข้าสู่ระบบ</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
