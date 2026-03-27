import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Settings,
  LogOut,
  Trash2,
  Repeat,
  Clock,
  PanelLeftOpen,
  MessageSquare,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * ChatGPT-style sidebar:
 * - Collapsed shows icons only.
 * - Hover (desktop) expands to show labels + search box.
 * - On smaller screens it behaves like an overlay.
 */
const ChatGPTSidebar = ({
  isDesktop,
  pinned,
  onPinnedChange,
  topOffset = 0,
  conversations,
  activeId,
  onSelect,
  onNewChat,
  search,
  onSearchChange,
  onOpenAuth,
  onDeleteConversation,
  onExpandedChange,
  onOpenSettings,
  chatHistoryVisible = true,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getThemeColors } = useTheme();
  const { t } = useLanguage();
  const colors = getThemeColors();

  const [isHovering, setIsHovering] = useState(false);
  const hoverLocked = useRef(false);

  const expanded = isDesktop ? pinned || isHovering : pinned;
  const showSidebar = isDesktop || pinned;

  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) =>
      conv.title?.toLowerCase().includes(q) ||
      conv.messages?.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  const handleSelectConversation = (id) => {
    onSelect?.(id);
    if (!isDesktop) onPinnedChange?.(false);
  };

  const handleDelete = (id) => {
    const confirmed = globalThis.confirm(t('sidebar.deleteChat'));
    if (confirmed) onDeleteConversation?.(id);
    if (!isDesktop) onPinnedChange?.(false);
  };

  const sidebarWidth = expanded
    ? '18rem'
    : isDesktop
      ? '4rem'
      : '0rem';

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {!isDesktop && pinned && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed left-0 right-0 z-[40] bg-slate-950/45 backdrop-blur-[3px]"
            onClick={() => onPinnedChange?.(false)}
            aria-label="Close sidebar"
            style={{
              top: topOffset,
              height: `calc(100vh - ${topOffset}px)`,
            }}
          />
        )}
      </AnimatePresence>

      {showSidebar && (
        <motion.aside
          onMouseEnter={() => isDesktop && !hoverLocked.current && setIsHovering(true)}
          onMouseLeave={() => {
            if (isDesktop) {
              setIsHovering(false);
              hoverLocked.current = false;
            }
          }}
          initial={false}
        animate={{ width: sidebarWidth }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className={`fixed left-0 z-[40] overflow-hidden border-r shadow-xl ${
          expanded
            ? 'bg-white/60 dark:bg-slate-900/60 border-slate-200/50 dark:border-slate-700/40 backdrop-blur-2xl'
            : 'bg-white/50 dark:bg-slate-900/50 border-slate-200/40 dark:border-slate-700/30 backdrop-blur-2xl'
        }`}
        style={{
          top: topOffset,
          height: `calc(100vh - ${topOffset}px)`,
        }}
        >
        <div className="h-full flex flex-col">
          {/* Header / toggle */}
          <div className="p-2 border-b border-slate-200/40 dark:border-slate-700/40">
            <button
              type="button"
              onClick={() => {
                if (isDesktop) {
                  if (expanded) {
                    onPinnedChange?.(false);
                    setIsHovering(false);
                    hoverLocked.current = true;
                  } else {
                    onPinnedChange?.(true);
                  }
                } else {
                  onPinnedChange?.(!pinned);
                }
              }}
              className={`w-full rounded-xl flex items-center justify-center py-1.5 ${
                expanded
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-md hover:shadow-sky-500/20'
              } transition-all duration-200`}
              aria-label={expanded ? t('sidebar.collapse') : t('sidebar.expand')}
              title={expanded ? t('sidebar.collapse') : t('sidebar.expand')}
            >
              <span className="sr-only">MedNexus sidebar</span>
              {expanded ? (
                <PanelLeftOpen className="w-3.5 h-3.5 shrink-0" aria-hidden />
              ) : (
                <MessageSquare className="w-3.5 h-3.5 shrink-0" aria-hidden />
              )}
            </button>
          </div>

          {/* Quick actions */}
          <div className="p-1.5 space-y-1.5">
            <button
              type="button"
              onClick={() => {
                onNewChat?.();
                if (!isDesktop) onPinnedChange?.(false);
              }}
              className={`w-full rounded-xl flex items-center ${
                expanded ? 'justify-start gap-2 px-2.5 py-1.5' : 'justify-center py-2'
              } text-[11px] font-semibold transition-all duration-200 ${
                expanded
                  ? 'bg-gradient-to-r from-sky-500 to-violet-600 text-white shadow-sm shadow-sky-500/15 hover:shadow-md hover:shadow-violet-500/25'
                  : 'bg-gradient-to-r from-sky-500 to-violet-600 text-white hover:shadow-sm hover:shadow-sky-500/15'
              }`}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden />
              {expanded && <span>{t('sidebar.newChat')}</span>}
            </button>

            {/* Search */}
            <div className={expanded ? 'px-1' : 'flex justify-center'}>
              {expanded ? (
                <div className="relative w-full px-1">
                  <span className="absolute left-2.5 top-2 text-slate-400 pointer-events-none">
                    <Search className="w-3.5 h-3.5" aria-hidden />
                  </span>
                  <input
                    value={search}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    placeholder={t('sidebar.searchChats')}
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 text-[11px] text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/40 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400/40 placeholder:text-slate-400"
                    aria-label={t('sidebar.searchChats')}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-md hover:shadow-sky-500/20 transition-all duration-200"
                  aria-label={t('sidebar.searchChats')}
                  title={t('common.search')}
                  onClick={() => {
                    if (isDesktop) setIsHovering(true);
                  }}
                >
                  <Search className="w-3.5 h-3.5" aria-hidden />
                </button>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-1 py-2 scrollbar-hide">
            {!chatHistoryVisible ? (
              <p className={`text-xs text-slate-400 px-3 ${expanded ? 'py-6 text-center' : 'text-center py-2'}`}>
                {expanded ? t('sidebar.chatHistoryHidden') : ''}
              </p>
            ) : filtered.length === 0 ? (
              <p
                className={`text-xs text-slate-400 px-3 ${
                  expanded ? 'py-3' : 'text-center py-2'
                }`}
              >
                {t('sidebar.noChatsMatch')}
              </p>
            ) : (
              <div className="space-y-1">
              {filtered.map((conv) => {
                const isActive = conv.id === activeId;
                return (
                  <div
                    key={conv.id}
                    className={`relative rounded-xl transition-all duration-200 ${
                      isActive
                      ? 'bg-gradient-to-r from-sky-100/80 to-violet-100/60 dark:from-sky-500/15 dark:to-violet-500/10 ring-1 ring-sky-300/50 dark:ring-sky-400/30'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full flex items-start ${
                        expanded ? 'gap-3 px-3 py-2.5' : 'flex-col items-center gap-0.5 py-2.5'
                      }`}
                      aria-label={`Open chat ${conv.title || 'New chat'}`}
                    >
                      <Clock className={`w-4 h-4 mt-0.5 ${isActive ? 'text-sky-500' : 'text-slate-400'}`} aria-hidden />
                      {expanded ? (
                        <div className="min-w-0 text-left flex-1">
                          <div className={`truncate text-xs font-semibold ${isActive ? 'text-sky-700 dark:text-sky-300' : 'text-slate-700 dark:text-slate-200'}`}>
                            {conv.title || 'New chat'}
                          </div>
                          {conv.messages?.length > 0 ? (
                            <div className="truncate text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {conv.messages[conv.messages.length - 1].content}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </button>

                    {expanded && (
                      <button
                        type="button"
                        onClick={() => handleDelete(conv.id)}
                        className="absolute ml-[0.5rem] mt-[-0.25rem] right-2.5 top-2.5 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        aria-label={`Delete chat ${conv.title || 'New chat'}`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>

          {/* Settings */}
          <div className="p-2 border-t border-slate-200/40 dark:border-slate-700/40">
            <div className={`space-y-1 ${expanded ? '' : 'flex justify-center'}`}>
              <button
                type="button"
                className={`w-full rounded-2xl flex items-center ${
                  expanded ? 'gap-3 px-3 py-2' : 'justify-center py-3'
                } bg-slate-100/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/40 hover:text-slate-800 dark:hover:text-white transition-all duration-200`}
                onClick={() => onOpenSettings?.()}
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="w-4 h-4" aria-hidden />
                {expanded && <span className="text-xs font-semibold">{t('sidebar.account')}</span>}
              </button>

              {/* Actions shown when expanded */}
              {expanded && (
                <div className="space-y-1 pt-1">
                  {user ? (
                    <>
                      <button
                        type="button"
                        className="w-full rounded-xl flex items-center justify-between px-3 py-2 text-xs font-medium bg-slate-100/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/40 hover:text-slate-800 dark:hover:text-white transition-all duration-200"
                        onClick={() => {
                          navigate('/profile');
                          if (!isDesktop) onPinnedChange?.(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" aria-hidden />
                          {t('sidebar.profile')}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="w-full rounded-xl flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-100/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/40 hover:text-slate-800 dark:hover:text-white transition-all duration-200"
                        onClick={() => {
                          logout();
                          onOpenAuth?.();
                          if (!isDesktop) onPinnedChange?.(false);
                        }}
                      >
                        <Repeat className="w-4 h-4" aria-hidden />
                        <span>{t('sidebar.switchAccount')}</span>
                      </button>
                      <button
                        type="button"
                        className="w-full rounded-xl flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-100/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                        onClick={() => {
                          logout();
                          if (!isDesktop) onPinnedChange?.(false);
                        }}
                      >
                        <LogOut className="w-4 h-4" aria-hidden />
                        <span>{t('sidebar.logOut')}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-xs font-medium bg-gradient-to-r from-sky-500 to-violet-600 text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-200"
                      onClick={() => {
                        onOpenAuth?.();
                        if (!isDesktop) onPinnedChange?.(false);
                      }}
                    >
                      {t('sidebar.logIn')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </motion.aside>
      )}
    </>
  );
};

export default ChatGPTSidebar;
