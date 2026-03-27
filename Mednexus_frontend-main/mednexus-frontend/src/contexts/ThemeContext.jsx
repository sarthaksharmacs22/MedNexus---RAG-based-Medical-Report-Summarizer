import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext({
  theme: {
    mode: 'light',
    color: 'blue',
    colors: ['blue', 'green', 'purple', 'pink'],
    pattern: 'crosses',
    patternIntensity: 'medium',
    colorMode: 'single'
  },
  toggleMode: () => {},
  setMode: () => {},
  setColor: () => {},
  setPattern: () => {},
  setPatternIntensity: () => {},
  getThemeColors: () => [],
  getThemeOptions: () => ({}),
  setMultiColor: () => {},
  setColorMode: () => {}
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/** Resolve effective mode: if user picked 'system', follow OS preference. */
const resolveMode = (mode) => {
  if (mode === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('mednexus-theme');
    const parsed = saved ? JSON.parse(saved) : null;

    const defaults = {
      mode: 'light',       // 'light' | 'dark' | 'system'
      color: 'blue',
      colors: ['blue', 'green', 'purple', 'pink'],
      pattern: 'crosses',
      patternIntensity: 'medium',
      colorMode: 'single',
    };

    return {
      ...defaults,
      ...(parsed || {}),
    };
  });

  // Apply theme changes (including dark mode)
  useEffect(() => {
    localStorage.setItem('mednexus-theme', JSON.stringify(theme));
    
    const root = document.documentElement;
    const appRoot = document.getElementById('root');
    const effective = resolveMode(theme.mode);

    // Toggle dark class
    if (effective === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply theme to both html and app root
    [root, appRoot].forEach(el => {
      if (!el) return;
      el.setAttribute('data-theme-color', 'custom');
      el.setAttribute('data-color-mode', theme.colorMode || 'single');
      
      if (theme.colorMode === 'multi' && theme.colors && theme.colors.length > 0) {
        const gradient = `linear-gradient(135deg, ${theme.colors.join(', ')})`;
        el.style.setProperty('--gradient', gradient);
        theme.colors.forEach((color, index) => {
          el.style.setProperty(`--color-${index}`, color);
        });
        el.style.setProperty('--primary', theme.colors[0]);
      }
    });
    
    document.body.style.background = '';
    document.body.style.backgroundAttachment = '';
  }, [theme]);

  // Listen for OS preference changes when mode is 'system'
  useEffect(() => {
    if (theme.mode !== 'system') return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;

    const handler = () => {
      // Force re-apply by toggling a dummy field
      setTheme((prev) => ({ ...prev, _systemTick: Date.now() }));
    };

    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, [theme.mode]);

  const setMode = useCallback((mode) => {
    setTheme((prev) => ({ ...prev, mode }));
  }, []);

  const toggleMode = useCallback(() => {
    setTheme((prev) => {
      const next = prev.mode === 'light' ? 'dark' : 'light';
      return { ...prev, mode: next };
    });
  }, []);

  const setColor = useCallback((color) => {
    setTheme(prev => ({ ...prev, color, colorMode: 'single' }));
  }, []);

  const setMultiColor = useCallback((colors) => {
    setTheme(prev => ({ ...prev, colors, colorMode: 'multi' }));
  }, []);

  const setColorMode = useCallback((mode) => {
    setTheme(prev => ({ ...prev, colorMode: mode }));
  }, []);

  const setPattern = useCallback((pattern) => {
    setTheme(prev => ({ ...prev, pattern }));
  }, []);

  const setPatternIntensity = useCallback((intensity) => {
    setTheme(prev => ({ ...prev, patternIntensity: intensity }));
  }, []);

  const getThemeColors = useCallback(() => {
    const accent = '#0EA5E9';
    const gradient = 'from-sky-500 via-blue-600 to-violet-600';
    return {
      primary: accent,
      light: '#E0F2FE',
      dark: '#1E40AF',
      gradient,
      bgGradient: 'from-sky-50 via-white to-emerald-50',
      secondary: 'from-violet-500 to-purple-600',
      accent: 'from-emerald-500 to-teal-600',
      warm: 'from-amber-400 to-orange-500',
    };
  }, []);

  const getThemeOptions = useCallback(() => ({
    colors: [
      { name: 'Medical Blue', value: 'blue' },
      { name: 'Clinical Teal', value: 'teal' },
      { name: 'Wellness Green', value: 'green' },
      { name: 'Professional Purple', value: 'purple' },
      { name: 'Emergency Red', value: 'red' },
    ],
    patterns: [
      { name: 'Crosses', value: 'crosses' },
      { name: 'Pulse', value: 'pulse' },
      { name: 'Dots', value: 'dots' },
      { name: 'Grid', value: 'grid' },
      { name: 'None', value: 'none' },
    ],
    intensities: [
      { name: 'Low', value: 'low' },
      { name: 'Medium', value: 'medium' },
      { name: 'High', value: 'high' },
    ]
  }), []);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleMode,
        setMode,
        setColor,
        setMultiColor,
        setColorMode,
        setPattern,
        setPatternIntensity,
        getThemeColors, 
        getThemeOptions
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
