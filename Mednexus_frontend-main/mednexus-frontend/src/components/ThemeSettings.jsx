import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSun, FiMoon, FiDroplet } from 'react-icons/fi';

const ThemeSettings = ({ isOpen, onClose, theme, onThemeChange, colors }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          style={{
            backgroundColor: colors.sidebar,
            color: colors.text,
          }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FiDroplet className="text-orange-500" />
                Theme Settings
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close theme settings"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Color Mode
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onThemeChange('light')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      theme === 'light'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <FiSun className="w-5 h-5" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => onThemeChange('dark')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      theme === 'dark'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <FiMoon className="w-5 h-5" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Accent Color
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {['blue', 'green', 'purple', 'pink', 'orange'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {}}
                      className={`w-10 h-10 rounded-full bg-${color}-500 hover:opacity-90 transition-opacity`}
                      aria-label={`${color} theme`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ThemeSettings;
