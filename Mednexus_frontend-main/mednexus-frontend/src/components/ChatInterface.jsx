import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Upload, FileText, ImageIcon, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useTheme } from '../contexts/ThemeContext';
import VoiceInput from './VoiceInput';
import { uploadFile } from '../services/api';
import { formatFileSize, getFileType } from '../utils/fileUtils';
import Skeleton from './ui/Skeleton';

const ChatInterface = ({
  messages,
  onSendMessage,
  isLoading,
  onVoiceTranscript,
  onFileUploaded,
  enableUploads = true,
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setInput(transcript);
    onVoiceTranscript?.(transcript);
  };

  const handleFileUpload = useCallback(
    async (file) => {
      const tempId = `${file.name}-${Date.now()}`;
      const newAttachment = {
        id: tempId,
        name: file.name,
        size: file.size,
        type: getFileType(file.name),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        progress: 0,
        status: 'uploading',
      };

      setAttachments((prev) => [...prev, newAttachment]);

      try {
        const response = await uploadFile(file, (progress) => {
          setAttachments((prev) =>
            prev.map((attachment) =>
              attachment.id === tempId ? { ...attachment, progress } : attachment
            )
          );
        });

        const serverId = response?.data?.file_id || tempId;

        setAttachments((prev) =>
          prev.map((attachment) =>
            attachment.id === tempId
              ? {
                  ...attachment,
                  status: 'uploaded',
                  progress: 100,
                  serverId,
                }
              : attachment
          )
        );

        onFileUploaded?.({
          ...newAttachment,
          id: serverId,
          fileId: serverId,
        });
      } catch (error) {
        console.error('Upload error:', error);
        setAttachments((prev) =>
          prev.map((attachment) =>
            attachment.id === tempId ? { ...attachment, status: 'error' } : attachment
          )
        );
      }
    },
    [onFileUploaded]
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!enableUploads) return;
      acceptedFiles.forEach((file) => handleFileUpload(file));
    },
    [handleFileUpload, enableUploads]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !enableUploads,
    accept: enableUploads
      ? {
          'application/pdf': ['.pdf'],
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
        }
      : undefined,
    maxSize: 10 * 1024 * 1024,
  });

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const updated = prev.filter((attachment) => attachment.id !== id);
      const removed = prev.find((attachment) => attachment.id === id);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const renderFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5" aria-hidden />;
      case 'pdf':
        return <FileText className="w-5 h-5" aria-hidden />;
      default:
        return <FileText className="w-5 h-5" aria-hidden />;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-hide"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id ?? `msg-${index}-${message.timestamp}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[min(92%,28rem)] rounded-2xl px-4 py-3 shadow-sm transition-shadow hover:shadow-md ${
                  message.role === 'user'
                    ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg shadow-sky-500/20`
                    : 'glass-strong text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-600/50'
                }`}
              >
                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.content}</p>
                {message.timestamp && (
                  <p
                    className={`text-xs mt-1.5 tabular-nums ${
                      message.role === 'user'
                        ? 'text-white/80'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
            aria-busy="true"
            aria-label="Assistant is typing"
          >
            <div className="glass-strong rounded-2xl px-4 py-3 border border-slate-200/70 dark:border-slate-600/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-sky-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </div>
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200/80 dark:border-slate-700/80 p-3 sm:p-4 space-y-3 bg-white/40 dark:bg-slate-900/30">
        {enableUploads && (
          <>
            <div
              {...getRootProps()}
              className={`w-full rounded-xl border-2 border-dashed px-3 sm:px-4 py-3 transition-all cursor-pointer glass hover:border-sky-400/60 dark:hover:border-sky-500/50 ${
                isDragActive
                  ? 'border-sky-500 bg-sky-500/10 dark:border-sky-400/50'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shrink-0">
                  <Upload className="w-4 h-4" aria-hidden />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    Drag or click to attach PDFs or images
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PDF, PNG, JPG · up to 10 MB each</p>
                </div>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="glass-strong rounded-2xl p-3 flex items-center gap-3 border border-slate-200/60 dark:border-slate-600/50"
                  >
                    {file.preview ? (
                      <img src={file.preview} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} text-white flex items-center justify-center shrink-0`}
                      >
                        {renderFileIcon(file.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
                      <div className="mt-2">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress || 0}%` }}
                            className={`h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}
                          />
                        </div>
                        {file.status === 'error' && (
                          <p className="text-xs text-red-500 mt-1">Upload failed. Try again.</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="p-2 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex items-end gap-2">
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />

          <div className="flex-1 relative min-w-0">
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your medical documents…"
              className="w-full px-4 py-3 pr-12 rounded-xl glass-strong resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/35 dark:focus:ring-sky-400/35 focus:ring-offset-0 border border-transparent focus:border-sky-500/30 dark:focus:border-sky-400/30"
              style={{
                minHeight: '48px',
                maxHeight: '200px',
              }}
              rows={1}
            />
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: input.trim() && !isLoading ? 1.04 : 1 }}
            whileTap={{ scale: input.trim() && !isLoading ? 0.96 : 1 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 ${
              input.trim() && !isLoading
              ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg shadow-sky-500/25`
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" aria-hidden />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default memo(ChatInterface);
