import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

const VoiceInput = ({ onTranscript, isRecording, setIsRecording }) => {
  const { getThemeColors } = useTheme();
  const { error: toastError } = useToast();
  const colors = getThemeColors();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(' ');
        onTranscript?.(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (typeof setIsRecording === 'function') {
          setIsRecording(false);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (typeof setIsRecording === 'function') {
          setIsRecording(false);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, setIsRecording]);

  useEffect(() => {
    if (typeof setIsRecording === 'function') {
      setIsRecording(isListening);
    }
  }, [isListening, setIsRecording]);

  const handleToggleRecording = () => {
    if (!isSupported) {
      toastError('Voice input needs a supported browser (e.g. Chrome or Edge).');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleToggleRecording}
      className={`p-3 rounded-xl transition-all duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 ${
        isListening
          ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
          : `bg-gradient-to-br ${colors.gradient} text-white shadow-md shadow-sky-500/20`
      }`}
      title={isListening ? 'Stop recording' : 'Start voice input'}
      aria-pressed={isListening}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      {isListening ? <MicOff className="w-5 h-5" aria-hidden /> : <Mic className="w-5 h-5" aria-hidden />}
    </motion.button>
  );
};

export default VoiceInput;
