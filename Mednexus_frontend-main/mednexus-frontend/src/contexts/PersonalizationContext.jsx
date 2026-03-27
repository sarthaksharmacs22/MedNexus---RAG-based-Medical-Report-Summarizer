import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'mednexus-personalization';

const defaults = {
  customInstructions: '',
  whatToKnow: '',
  responseStyle: 'balanced',   // 'concise' | 'balanced' | 'detailed'
  specialty: '',
  language: 'en',
  memoryEnabled: true,
  chatHistoryVisible: true,
};

const PersonalizationContext = createContext(null);

export const usePersonalization = () => {
  const ctx = useContext(PersonalizationContext);
  if (!ctx) throw new Error('usePersonalization must be used within PersonalizationProvider');
  return ctx;
};

export const PersonalizationProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    } catch {
      return { ...defaults };
    }
  });

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback((partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setSettings({ ...defaults });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Build a system prompt prefix from the current personalisation settings.
   * This is injected before user messages when calling the AI.
   */
  const getSystemPrompt = useCallback(() => {
    const parts = [];

    if (settings.specialty) {
      parts.push(`The user is a ${settings.specialty} specialist.`);
    }

    if (settings.whatToKnow?.trim()) {
      parts.push(`About the user: ${settings.whatToKnow.trim()}`);
    }

    if (settings.customInstructions?.trim()) {
      parts.push(`Custom instructions: ${settings.customInstructions.trim()}`);
    }

    const styleMap = {
      concise: 'Be concise. Give short, direct answers without unnecessary elaboration.',
      balanced: 'Provide balanced answers — thorough yet readable.',
      detailed: 'Be very detailed and comprehensive. Include references, explanations, and nuance.',
    };
    parts.push(styleMap[settings.responseStyle] || styleMap.balanced);

    return parts.length ? parts.join('\n') : '';
  }, [settings]);

  const value = useMemo(
    () => ({ settings, update, reset, getSystemPrompt }),
    [settings, update, reset, getSystemPrompt]
  );

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
};
