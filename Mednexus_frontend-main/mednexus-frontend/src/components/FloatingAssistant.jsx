import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FloatingAssistant = ({ children, isOpen, onToggle }) => {
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();

  return (
    <>
      <motion.button
        type="button"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onToggle}
        className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} text-white shadow-xl shadow-sky-500/30 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2`}
        style={{
          boxShadow: `0 12px 40px -8px rgba(14,165,233,0.45), 0 4px 20px -4px rgba(124,58,237,0.3)`,
        }}
        aria-expanded={isOpen}
        aria-controls="floating-assistant-panel"
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      >
        <motion.span
          animate={
            isOpen
              ? {}
              : {
                  scale: [1, 1.12, 1],
                  opacity: [0.7, 1, 0.7],
                }
          }
          transition={{ duration: 2.2, repeat: isOpen ? 0 : Infinity }}
          className="absolute inset-0 rounded-2xl border border-white/30 pointer-events-none"
        />
        {isOpen ? (
          <X className="w-6 h-6 relative z-10" aria-hidden />
        ) : (
          <MessageCircle className="w-6 h-6 relative z-10" aria-hidden />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-assistant-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed bottom-[5.25rem] right-4 sm:bottom-[6.5rem] sm:right-6 z-40 w-[min(100vw-2rem,24rem)] h-[min(70vh,36rem)] max-h-[600px] rounded-2xl shadow-2xl glass-strong overflow-hidden border border-slate-200/80 dark:border-slate-700/80 flex flex-col"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAssistant;
