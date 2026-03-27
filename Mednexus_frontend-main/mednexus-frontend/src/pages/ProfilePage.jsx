import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { getThemeColors } = useTheme();
  const { success, error } = useToast();
  const colors = getThemeColors();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = String(name).trim();
    const em = String(email).trim();
    if (!n) {
      error('Please enter your name.');
      return;
    }
    if (!emailOk(em)) {
      error('Enter a valid email address.');
      return;
    }
    updateProfile({ name: n, email: em });
    success('Profile saved.');
  };

  return (
    <div className="min-h-screen bg-transparent">
      <header className="glass-strong border-b border-slate-200/90 dark:border-slate-700/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="container-app py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Profile</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">How you appear in MedNexus</p>
          </div>
        </div>
      </header>

      <main className="container-app py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xl p-6 sm:p-8 max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" aria-hidden />
                </span>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/85 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/45"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" aria-hidden />
                </span>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/85 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/45"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Signed in with{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {user.provider === 'google' ? 'Google' : 'Email'}
              </span>
              . Changing email updates your account id when using email sign-in.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${colors.gradient} shadow-lg shadow-sky-500/20`}
              >
                Save changes
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
