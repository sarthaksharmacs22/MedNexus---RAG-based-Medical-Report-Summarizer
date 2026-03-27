import { motion, AnimatePresence } from 'framer-motion';
import { Menu, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import Logo from './Logo';

const Header = ({ onToggleSidebar, onOpenAuth }) => {
  const navigate = useNavigate();
  const { getThemeColors } = useTheme();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);
  const { t } = useLanguage();
  const colors = getThemeColors();

  const getUserInitials = (name) => {
    if (!name || !name.trim()) return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header id="mednexus-header" className="glass-strong border-b border-slate-200/60 dark:border-slate-700/60 backdrop-blur-2xl sticky top-0 z-[60] shadow-sm shadow-sky-900/5">
      <div className="container-app py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0"
            >
              <Logo compact />
            </motion.div>
          </div>
          <div className="relative flex items-center gap-1.5 sm:gap-2 shrink-0" ref={menuRef}>
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-white text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500/70 bg-gradient-to-br ${colors.gradient} shadow-lg shadow-sky-500/25`}
                  aria-expanded={showProfileMenu}
                  aria-haspopup="menu"
                >
                  {getUserInitials(user.name)}
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl py-1 z-50 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800/80"
                      >
                        <User className="mr-2 h-4 w-4 shrink-0" />
                        {t('header.profile')}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="mr-2 h-4 w-4 shrink-0" />
                        {t('header.signOut')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
                aria-label={t('header.signIn')}
                title={t('header.signIn')}
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
