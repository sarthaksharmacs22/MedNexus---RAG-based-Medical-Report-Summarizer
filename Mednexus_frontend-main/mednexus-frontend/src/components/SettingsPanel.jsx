import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Sparkles,
  Settings,
  Shield,
  ChevronRight,
  Save,
  Globe,
  Stethoscope,
  MessageSquare,
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePersonalization } from '../contexts/PersonalizationContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsPanel = ({ isOpen, onClose, conversations, onClearChats }) => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setMode, getThemeColors } = useTheme();
  const { settings: pSettings, update: pUpdate, reset: pReset } = usePersonalization();
  const toast = useToast();
  const { t } = useLanguage();
  const colors = getThemeColors();
  const [activeTab, setActiveTab] = useState('general');

  // Local profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Local language state for "Apply" button pattern
  const [pendingLang, setPendingLang] = useState(pSettings.language);
  const langDirty = pendingLang !== pSettings.language;

  // Sync when panel opens / user changes
  const syncProfile = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPendingLang(pSettings.language);
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast?.error?.(t('settings.nameRequired'));
      return;
    }
    updateProfile?.({ name: name.trim(), email: email.trim() });
    toast?.success?.(t('settings.profileSaved'));
  };

  const handleApplyLanguage = () => {
    pUpdate({ language: pendingLang });
    // Small delay so LanguageContext re-renders with the new lang before the toast reads t()
    setTimeout(() => toast?.success?.(t('settings.languageChanged')), 50);
  };

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: user ? { name: user.name, email: user.email, provider: user.provider } : null,
      personalization: pSettings,
      conversations: conversations || [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mednexus-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast?.success?.(t('settings.dataExported'));
  };

  const handleClearChats = () => {
    if (!globalThis.confirm(t('settings.confirmDeleteChats'))) return;
    onClearChats?.();
    toast?.success?.(t('settings.allChatsDeleted'));
  };

  const handleDeleteAccount = () => {
    if (!globalThis.confirm(t('settings.confirmDeleteAccount'))) return;
    onClearChats?.();
    localStorage.removeItem('mednexus-personalization');
    logout?.();
    onClose?.();
    toast?.success?.(t('settings.accountDeleted'));
  };

  const handleResetPersonalization = () => {
    if (!globalThis.confirm(t('settings.confirmResetPersonalization'))) return;
    pReset?.();
    toast?.success?.(t('settings.personalizationReset'));
  };

  const TABS = [
    { id: 'general', label: t('settings.general'), icon: Settings },
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'personalization', label: t('settings.personalization'), icon: Sparkles },
    { id: 'data', label: t('settings.dataControls'), icon: Shield },
  ];

  const themeModes = [
    { value: 'light', label: t('settings.light'), icon: Sun },
    { value: 'dark', label: t('settings.dark'), icon: Moon },
    { value: 'system', label: t('settings.system'), icon: Monitor },
  ];

  const renderGeneral = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{t('settings.theme')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('settings.themeDesc')}</p>
        <div className="flex gap-2">
          {themeModes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                theme.mode === value
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{t('settings.language')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('settings.languageDesc')}</p>
        <div className="flex items-center gap-2">
          <select
            value={pendingLang}
            onChange={(e) => setPendingLang(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="hi">हिन्दी</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleApplyLanguage}
            disabled={!langDirty}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              langDirty
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20 hover:shadow-lg cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            {t('settings.apply')}
          </motion.button>
        </div>
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('settings.chatHistory')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('settings.chatHistoryDesc')}</p>
          </div>
          <button
            onClick={() => pUpdate({ chatHistoryVisible: !pSettings.chatHistoryVisible })}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 ${
              pSettings.chatHistoryVisible ? 'bg-gradient-to-r from-sky-500 to-blue-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              pSettings.chatHistoryVisible ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-sky-500/20`}>
          {name ? name[0]?.toUpperCase() : 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{name || t('settings.user')}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email || t('settings.notSignedIn')}</p>
          {user?.provider && (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-[10px] font-medium text-sky-700 dark:text-sky-300">
              <Globe className="w-3 h-3" />
              {user.provider === 'google' ? 'Google' : t('settings.email')}
            </span>
          )}
        </div>
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">{t('settings.name')}</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"><User className="w-3.5 h-3.5" /></span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder={t('settings.namePlaceholder')} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">{t('settings.email')}</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"><Globe className="w-3.5 h-3.5" /></span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              placeholder={t('settings.emailPlaceholder')} />
          </div>
        </div>
      </div>
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSaveProfile}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${colors.gradient} shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2`}>
        <Save className="w-4 h-4" /> {t('settings.saveProfile')}
      </motion.button>
    </div>
  );

  const renderPersonalization = () => (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('settings.customInstructions')}</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t('settings.customInstructionsDesc')}</p>
        <textarea value={pSettings.customInstructions} onChange={(e) => pUpdate({ customInstructions: e.target.value })}
          placeholder={t('settings.customInstructionsPlaceholder')}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none placeholder:text-slate-400"
          rows={3} />
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4">
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope className="w-3.5 h-3.5 text-sky-500" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('settings.whatToKnow')}</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t('settings.whatToKnowDesc')}</p>
        <textarea value={pSettings.whatToKnow} onChange={(e) => pUpdate({ whatToKnow: e.target.value })}
          placeholder={t('settings.whatToKnowPlaceholder')}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40 resize-none placeholder:text-slate-400"
          rows={3} />
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">{t('settings.specialty')}</label>
        <select value={pSettings.specialty} onChange={(e) => pUpdate({ specialty: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40">
          <option value="">{t('settings.selectSpecialty')}</option>
          <option value="general">{t('settings.generalPractice')}</option>
          <option value="cardiology">{t('settings.cardiology')}</option>
          <option value="neurology">{t('settings.neurology')}</option>
          <option value="oncology">{t('settings.oncology')}</option>
          <option value="pediatrics">{t('settings.pediatrics')}</option>
          <option value="radiology">{t('settings.radiology')}</option>
          <option value="surgery">{t('settings.surgery')}</option>
          <option value="pathology">{t('settings.pathology')}</option>
          <option value="psychiatry">{t('settings.psychiatry')}</option>
          <option value="other">{t('settings.other')}</option>
        </select>
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">{t('settings.responseStyle')}</label>
        <div className="flex gap-2">
          {[
            { value: 'concise', label: t('settings.concise') },
            { value: 'balanced', label: t('settings.balanced') },
            { value: 'detailed', label: t('settings.detailed') },
          ].map((s) => (
            <button key={s.value} onClick={() => pUpdate({ responseStyle: s.value })}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                pSettings.responseStyle === s.value
                  ? 'bg-gradient-to-r from-sky-500 to-violet-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('settings.memory')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('settings.memoryDesc')}</p>
          </div>
          <button onClick={() => pUpdate({ memoryEnabled: !pSettings.memoryEnabled })}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 ${
              pSettings.memoryEnabled ? 'bg-gradient-to-r from-sky-500 to-blue-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              pSettings.memoryEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4">
        <button onClick={handleResetPersonalization}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <RotateCcw className="w-4 h-4" /> {t('settings.resetPersonalization')}
        </button>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">{t('settings.resetPersonalizationDesc')}</p>
      </div>
    </div>
  );

  const renderDataControls = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{t('settings.exportData')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('settings.exportDataDesc')}</p>
        <button onClick={handleExportData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <Download className="w-4 h-4" /> {t('settings.exportAll')}
        </button>
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{t('settings.deleteAllChats')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('settings.deleteAllChatsDesc')}</p>
        <button onClick={handleClearChats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
          <Trash2 className="w-4 h-4" /> {t('settings.deleteAllChatsBtn')}
        </button>
      </div>
      <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">{t('settings.deleteAccount')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('settings.deleteAccountDesc')}</p>
        <button onClick={handleDeleteAccount}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950/60 transition-colors border border-red-200 dark:border-red-800/40">
          <Trash2 className="w-4 h-4" /> {t('settings.deleteAccountBtn')}
        </button>
      </div>
    </div>
  );

  const content = {
    general: renderGeneral,
    profile: renderProfile,
    personalization: renderPersonalization,
    data: renderDataControls,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }} transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="glass-strong w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden flex flex-col sm:flex-row"
            onClick={(e) => e.stopPropagation()}
            onAnimationStart={syncProfile}>
            {/* Left tabs */}
            <div className="w-full sm:w-52 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200/60 dark:border-slate-700/40 bg-slate-50/80 dark:bg-slate-900/40 p-3">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">{t('settings.title')}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 sm:hidden" aria-label={t('common.close')}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible scrollbar-hide">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                        isActive
                          ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm ring-1 ring-sky-200/50 dark:ring-sky-700/30'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/40'
                      }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                      {!isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-40 hidden sm:block" />}
                    </button>
                  );
                })}
              </nav>
            </div>
            {/* Right content */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/60 dark:border-slate-700/40">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {TABS.find((t_tab) => t_tab.id === activeTab)?.label}
                </h3>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hidden sm:block" aria-label={t('common.close')}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {content[activeTab]?.()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
