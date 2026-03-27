import { motion } from 'framer-motion';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector = () => {
  const { theme, toggleMode, setColor } = useTheme();

  const colorOptions = [
    { name: 'blue', label: 'Blue', swatch: 'rgb(37 99 235)' },
    { name: 'teal', label: 'Teal', swatch: 'rgb(13 148 136)' },
    { name: 'green', label: 'Green', swatch: 'rgb(5 150 105)' },
    { name: 'purple', label: 'Purple', swatch: 'rgb(124 58 237)' },
  ];

  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/60 dark:bg-slate-900/40 p-3">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Palette className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">Appearance</span>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMode}
          className={`p-2 rounded-lg ${
            theme.mode === 'dark'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'bg-slate-200/80 text-slate-700 border border-slate-300/60'
          }`}
          aria-label={theme.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme.mode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </motion.button>
      </div>

      <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Accent</p>
      <div className="flex flex-wrap gap-2">
        {colorOptions.map((option) => (
          <motion.button
            key={option.name}
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setColor(option.name)}
            className={`w-9 h-9 rounded-full border-2 transition-all ${
              theme.color === option.name
                ? 'border-slate-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-teal-500/50'
                : 'border-slate-300 dark:border-slate-600'
            }`}
            style={{ backgroundColor: option.swatch }}
            title={option.label}
            aria-label={`${option.label} accent`}
            aria-pressed={theme.color === option.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
