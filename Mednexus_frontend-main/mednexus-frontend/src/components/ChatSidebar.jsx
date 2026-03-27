import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Clock,
  Settings,
  LogOut,
  Trash2,
  Repeat,
  ChevronRight,
  User,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const ChatSidebar = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelect,
  onNewChat,
  search,
  onSearchChange,
  onOpenAuth,
  onDeleteConversation,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleSwitchAccount = () => {
    logout();
    onClose();
    onOpenAuth();
  };

  const filtered = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      conv.title?.toLowerCase().includes(q) ||
      conv.messages?.some((m) => m.content.toLowerCase().includes(q))
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed inset-y-0 left-0 w-[min(18rem,92vw)] z-[45] glass-strong border-r border-slate-200/80 dark:border-slate-700/80 flex flex-col shadow-2xl shadow-slate-900/10"
        >
          <div className="px-3 py-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onNewChat}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white bg-gradient-to-r ${colors.gradient} shadow-md hover:opacity-95 transition-opacity`}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span>New chat</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
            >
              Close
            </button>
          </div>

          <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" aria-hidden />
              </span>
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search chats"
                className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-hide">
            {filtered.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-500 px-2 py-3 leading-relaxed">
                No chats match your search. Start a new conversation.
              </p>
            )}
            {filtered.map((conv) => (
              <div
                key={conv.id}
                className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-start gap-2 transition-colors ${
                  conv.id === activeId
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-slate-900 dark:text-slate-50 ring-1 ring-teal-200/80 dark:ring-teal-800/50'
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(conv.id)}
                  className="flex items-start gap-2 flex-1 min-w-0 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                >
                  <div className="mt-0.5 text-slate-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{conv.title || 'New chat'}</p>
                    {conv.messages && conv.messages.length > 0 && (
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {conv.messages[conv.messages.length - 1].content}
                      </p>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const confirmed = globalThis.confirm('Delete this chat permanently?');
                    if (confirmed) onDeleteConversation(conv.id);
                  }}
                  className="mt-0.5 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition-colors shrink-0"
                  aria-label={`Delete chat ${conv.title || 'New chat'}`}
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-2 pb-3">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
              aria-expanded={showSettings}
            >
              <Settings className="w-4 h-4 shrink-0" aria-hidden />
              <span>Settings</span>
            </button>

            {showSettings && (
              <div className="px-2 pb-3 space-y-3">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/profile');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" aria-hidden />
                        Profile
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={handleSwitchAccount}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-colors"
                    >
                      <Repeat className="w-4 h-4" aria-hidden />
                      <span>Switch account</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" aria-hidden />
                      <span>Log out</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Log in
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default ChatSidebar;
