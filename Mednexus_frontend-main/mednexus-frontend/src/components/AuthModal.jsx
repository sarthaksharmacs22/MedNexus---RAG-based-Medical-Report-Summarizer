import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Globe, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const AuthModal = ({ isOpen, onClose }) => {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const { getThemeColors } = useTheme();
  const { error: toastError } = useToast();
  const colors = getThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  const emailInvalid = emailTouched && email.length > 0 && !emailOk(email);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setEmailTouched(true);
    if (!email.trim()) {
      toastError('Please enter your work email.');
      return;
    }
    if (!emailOk(email.trim())) {
      toastError('Enter a valid email address.');
      return;
    }
    loginWithEmail(email.trim());
    onClose?.();
    setEmail('');
    setPassword('');
    setEmailTouched(false);
  };

  const handleGoogle = () => {
    loginWithGoogle();
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="glass-strong w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 id="auth-modal-title" className="text-xl font-semibold text-slate-900 dark:text-white">
                  Sign in to MedNexus
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Save conversations and sync preferences across devices.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3" noValidate>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" aria-hidden />
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="you@clinic.org"
                  aria-invalid={emailInvalid}
                  aria-describedby={emailInvalid ? 'auth-email-error' : undefined}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white/80 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    emailInvalid
                      ? 'border-red-400 focus:ring-red-500/40'
                      : 'border-slate-300 dark:border-slate-600 focus:ring-sky-500/45'
                  }`}
                />
                {emailInvalid && (
                  <p id="auth-email-error" className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    Enter a valid email address.
                  </p>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" aria-hidden />
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (demo only — not sent)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/45 focus:ring-offset-0"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${colors.gradient} shadow-lg shadow-sky-500/25 hover:shadow-xl transition-shadow flex items-center justify-center gap-2`}
              >
                <span>Continue with email</span>
                <ArrowRight className="w-4 h-4" aria-hidden />
              </motion.button>
            </form>

            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="px-3 text-[10px] text-slate-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
            >
              <Globe className="w-4 h-4" aria-hidden />
              <span>Continue with Google (demo)</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
