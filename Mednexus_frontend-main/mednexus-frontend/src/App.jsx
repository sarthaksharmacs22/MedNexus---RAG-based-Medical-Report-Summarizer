import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import ChatInterface from './components/ChatInterface';
import FloatingAssistant from './components/FloatingAssistant';
import WorkflowCards from './components/WorkflowCards';
import Header from './components/Header';
import ChatGPTSidebar from './components/ChatGPTSidebar';
import AuthModal from './components/AuthModal';
import SettingsPanel from './components/SettingsPanel';
import { usePersonalization } from './contexts/PersonalizationContext';
import { useLanguage } from './contexts/LanguageContext';
import { getOCRText } from './services/api';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const PageLoader = () => {
  // Can't call useLanguage() here since it's outside the provider tree in lazy routes
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
    </div>
  );
};

const AppContent = () => {
  const [conversations, setConversations] = useState(() => {
    const storedKey = 'mednexus-conversations-guest';
    try {
      const raw = localStorage.getItem(storedKey);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [
      {
        id: 'default',
        title: 'Welcome to MedNexus',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: newId(),
            role: 'assistant',
            content:
              "Hello! I'm MedNexus, your medical AI assistant. Upload a medical document or ask me a question to get started.",
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ];
  });
  const [activeConversationId, setActiveConversationId] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [ocrText, setOcrText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [ragSources, setRagSources] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [headerHeight, setHeaderHeight] = useState(64);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();
  const { user } = useAuth();
  const { settings: pSettings, getSystemPrompt } = usePersonalization();
  const { t } = useLanguage();

  useEffect(() => {
    const mq = window.matchMedia?.('(min-width: 1024px)');
    if (!mq) return;

    const apply = () => setIsDesktop(!!mq.matches);
    apply();

    // Support older browsers
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else mq.addListener?.(apply);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply);
      else mq.removeListener?.(apply);
    };
  }, []);

  useEffect(() => {
    // Keep sidebar below the sticky navbar.
    // (Header height can change after fonts load / responsive layout changes, so we retry finding it.)
    let ro = null;
    let headerEl = null;
    let attempts = 0;

    const compute = () => {
      if (!headerEl) return;
      const h = headerEl.getBoundingClientRect().height;
      setHeaderHeight(Math.round(h));
    };

    const tryFind = () => {
      const el = document.getElementById('mednexus-header');
      if (!el) {
        attempts += 1;
        if (attempts < 20) requestAnimationFrame(tryFind);
        return;
      }

      headerEl = el;
      compute();

      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => compute());
        ro.observe(headerEl);
      } else {
        window.addEventListener('resize', compute);
      }
    };

    tryFind();

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  useEffect(() => {
    const key = `mednexus-conversations-${user?.id || 'guest'}`;
    try {
      localStorage.setItem(key, JSON.stringify(conversations));
    } catch {
      // ignore
    }
  }, [conversations, user]);

  useEffect(() => {
    const key = `mednexus-conversations-${user?.id || 'guest'}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const loaded = JSON.parse(raw);
        setConversations(loaded);
        if (loaded.length > 0) {
          setActiveConversationId(loaded[0].id);
        }
      }
    } catch {
      // ignore
    }
  }, [user]);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const messages = activeConversation?.messages || [];

  const handleSendMessage = async (message) => {
    const userMessage = {
      id: newId(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              updatedAt: new Date().toISOString(),
              title: conv.title === 'Welcome to MedNexus' ? message : conv.title,
              messages: [...conv.messages, userMessage],
            }
          : conv
      )
    );
    setIsLoading(true);

    try {
      const systemPrompt = getSystemPrompt();
      const assistantMessage = {
        id: newId(),
        role: 'assistant',
        content: systemPrompt
          ? `[System: ${systemPrompt}]\n\nI understand your question. Processing with your personalization settings applied... (connect backend to customize this answer).`
          : 'I understand your question. Processing... (connect backend to customize this answer).',
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                updatedAt: new Date().toISOString(),
                messages: [...conv.messages, assistantMessage],
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: newId(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploaded = async (fileData) => {
    setIsProcessing(true);

    try {
      setTimeout(async () => {
        try {
          const ocrResponse = await getOCRText(fileData.id);
          setOcrText(ocrResponse.data?.text || 'Sample extracted text from medical document...');
          setExplanation(
            'This document contains medical information that has been processed and simplified for better understanding...'
          );
          setRagSources(
            'Sources:\n1. Medical Journal Article (2023)\n2. Clinical Guidelines (2022)\n3. Research Paper (2021)'
          );
        } catch (error) {
          console.error('Error processing file:', error);
        } finally {
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsProcessing(false);
    }
  };

  const handleVoiceTranscript = () => {
    // Transcript is inserted into input via ChatInterface
  };

  const handleDeleteConversation = (conversationId) => {
    setConversations((prev) => {
      const remaining = prev.filter((conv) => conv.id !== conversationId);

      if (remaining.length === 0) {
        const fallbackId = `conv-${Date.now()}`;
        const fallbackConversation = {
          id: fallbackId,
          title: 'New chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: newId(),
              role: 'assistant',
              content: 'New MedNexus session. Upload a document or start describing the case.',
              timestamp: new Date().toISOString(),
            },
          ],
        };
        setActiveConversationId(fallbackId);
        return [fallbackConversation];
      }

      if (activeConversationId === conversationId) {
        setActiveConversationId(remaining[0].id);
      }

      return remaining;
    });
  };

  const handleClearChats = () => {
    const defaultConv = {
      id: 'default',
      title: 'Welcome to MedNexus',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: newId(),
          role: 'assistant',
          content: "Hello! I'm MedNexus, your medical AI assistant. Upload a medical document or ask me a question to get started.",
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setConversations([defaultConv]);
    setActiveConversationId('default');
  };

  return (
    <Routes>
      <Route
        path="/profile"
        element={
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        }
      />
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-transparent">
            <Header
              onToggleSidebar={() => setSidebarPinned((p) => !p)}
              onOpenAuth={() => setIsAuthOpen(true)}
            />

            <ChatGPTSidebar
              isDesktop={isDesktop}
              pinned={sidebarPinned}
              onPinnedChange={setSidebarPinned}
              topOffset={headerHeight}
              onExpandedChange={setSidebarExpanded}
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={(id) => {
                setActiveConversationId(id);
                if (!isDesktop) setSidebarPinned(false);
              }}
              onNewChat={() => {
                const id = `conv-${Date.now()}`;
                const newConv = {
                  id,
                  title: 'New chat',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  messages: [
                    {
                      id: newId(),
                      role: 'assistant',
                      content: 'New MedNexus session. Upload a document or start describing the case.',
                      timestamp: new Date().toISOString(),
                    },
                  ],
                };
                setConversations((prev) => [newConv, ...prev]);
                setActiveConversationId(id);
              }}
              search={sidebarSearch}
              onSearchChange={setSidebarSearch}
              onOpenAuth={() => setIsAuthOpen(true)}
              onDeleteConversation={handleDeleteConversation}
              onOpenSettings={() => setIsSettingsOpen(true)}
              chatHistoryVisible={pSettings.chatHistoryVisible}
            />

            <main
              className="py-8 sm:py-10 lg:py-12 space-y-10 lg:space-y-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full"
              style={{
                paddingLeft: !isDesktop ? undefined : sidebarExpanded ? 'calc(288px + 2rem)' : 'calc(64px + 2rem)',
                transition: 'padding-left 200ms ease',
              }}
            >
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="text-center space-y-4 max-w-4xl mx-auto"
              >
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-gradient-to-r ${colors.gradient} text-white shadow-lg shadow-sky-500/25`}
                >
                  {t('chat.badge')}
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-[2.35rem] font-bold tracking-tight text-slate-900 dark:text-white">
                  {t('chat.heroTitle')}
                </h2>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('chat.heroDesc')}
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <div className="glass-strong rounded-2xl sm:rounded-3xl w-full min-h-[420px] sm:min-h-[520px] lg:h-[min(75vh,720px)] shadow-xl shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/90 dark:border-slate-700/60 flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white/50 dark:bg-slate-900/40">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                        {t('chat.workspaceLabel')}
                      </p>
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                        {t('chat.consoleTitle')}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {t('chat.dragHint')}
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ChatInterface
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading}
                      onVoiceTranscript={handleVoiceTranscript}
                      onFileUploaded={handleFileUploaded}
                      enableUploads={true}
                    />
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                      {t('chat.insightLabel')}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {t('chat.insightTitle')}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t('chat.insightRefresh')}
                  </span>
                </div>
                <WorkflowCards
                  ocrText={ocrText}
                  explanation={explanation}
                  ragSources={ragSources}
                  isLoading={isProcessing}
                />
              </motion.section>
            </main>

            <FloatingAssistant isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)}>
              <div className="h-full flex flex-col min-h-0">
                <div
                  className={`p-4 border-b border-white/10 shrink-0 bg-gradient-to-r ${colors.gradient} text-white`}
                >
                  <h3 className="font-semibold text-lg">{t('chat.assistantTitle')}</h3>
                  <p className="text-sm text-white/85">
                    {t('chat.assistantDesc')}
                  </p>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    onVoiceTranscript={handleVoiceTranscript}
                    onFileUploaded={handleFileUploaded}
                    enableUploads={false}
                  />
                </div>
              </div>
            </FloatingAssistant>
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            <SettingsPanel
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              conversations={conversations}
              onClearChats={handleClearChats}
            />
          </div>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
