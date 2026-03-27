import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';

/**
 * Medical mark + wordmark for a premium clinical UI.
 * `compact` hides the subtitle and slightly shrinks the icon/wordmark for navbars.
 */
const Logo = ({ className = '', compact = true, iconOnly = false }) => {
  const iconBoxSize = compact ? 'h-10 w-10' : 'h-11 w-11';
  const stethoscopeSize = compact ? 'w-5 h-5' : 'w-6 h-6';
  const wordmarkSize = compact ? 'text-sm' : 'text-base';

  return (
    <div className={`flex items-center ${iconOnly ? 'gap-0' : 'gap-2.5 sm:gap-3'} ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600 text-white shadow-lg shadow-sky-500/25 ${iconBoxSize}`}
        aria-hidden
      >
        <Stethoscope className={stethoscopeSize} aria-hidden />
      </motion.div>

      {!iconOnly && (
        <div className="min-w-0 text-left">
          <p
            className={`truncate font-semibold tracking-tight text-slate-900 dark:text-white ${wordmarkSize}`}
          >
            MedNexus
          </p>
          {!compact && (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              Clinical AI workspace
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
