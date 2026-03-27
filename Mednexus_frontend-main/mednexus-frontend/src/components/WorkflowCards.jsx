import { motion } from 'framer-motion';
import { FileText, Sparkles, BookMarked } from 'lucide-react';
import Skeleton from './ui/Skeleton';

const WorkflowCards = ({ ocrText, explanation, ragSources, isLoading }) => {

  const cards = [
    {
      id: 'ocr',
      title: 'OCR extracted text',
      subtitle: 'Structured capture from uploads',
      icon: FileText,
      content: ocrText,
      iconWrap: 'from-sky-500 to-blue-600',
      ring: 'ring-sky-500/20',
      shadow: 'hover:shadow-sky-500/15',
      dotColor: 'bg-sky-400',
    },
    {
      id: 'explanation',
      title: 'Simplified explanation',
      subtitle: 'Plain-language summary',
      icon: Sparkles,
      content: explanation,
      iconWrap: 'from-violet-500 to-purple-600',
      ring: 'ring-violet-500/20',
      shadow: 'hover:shadow-violet-500/15',
      dotColor: 'bg-violet-400',
    },
    {
      id: 'rag',
      title: 'Sources & evidence',
      subtitle: 'Traceable references',
      icon: BookMarked,
      content: ragSources,
      iconWrap: 'from-emerald-500 to-teal-600',
      ring: 'ring-emerald-500/20',
      shadow: 'hover:shadow-emerald-500/15',
      dotColor: 'bg-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            whileHover={{ y: -4 }}
            className={`group glass-strong rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-md shadow-slate-900/5 hover:shadow-xl ${card.shadow} transition-all duration-300 ring-1 ${card.ring}`}
          >
            <div
              className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.iconWrap} text-white mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {card.title}
            </h3>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 font-medium">
              {card.subtitle}
            </p>
            <div className="text-sm text-slate-600 dark:text-slate-300 max-h-64 overflow-y-auto scrollbar-hide min-h-[4.5rem] leading-relaxed">
              {isLoading ? (
                <div className="space-y-2" aria-busy="true" aria-label="Loading card content">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-[92%] rounded" />
                  <Skeleton className="h-3 w-4/5 rounded" />
                  <div className="flex gap-1.5 pt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${card.dotColor} animate-pulse`} />
                    <span className={`w-1.5 h-1.5 rounded-full ${card.dotColor} animate-pulse [animation-delay:150ms]`} />
                    <span className={`w-1.5 h-1.5 rounded-full ${card.dotColor} animate-pulse [animation-delay:300ms]`} />
                  </div>
                </div>
              ) : card.content ? (
                <p className="whitespace-pre-wrap">{card.content}</p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic">
                  No data yet. Upload a clinical file to populate this card.
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WorkflowCards;
