import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ToastProps {
  message: string | null;
  type?: 'error' | 'success';
  onClose: () => void;
}

export default function Toast({ message, type = 'error', onClose }: ToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-28 left-4 right-4 z-[100] flex justify-center"
        >
          <div className={cn(
            "w-full max-w-sm px-4 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl",
            type === 'error' 
              ? "bg-red-500/10 border-red-500/20 text-red-500" 
              : "bg-win/10 border-win/20 text-win"
          )}>
            <div className={cn(
              "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
              type === 'error' ? "bg-red-500/10" : "bg-win/10"
            )}>
              {type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1 lowercase">{type === 'error' ? 'Transmission Error' : 'Success'}</p>
               <p className="text-[12px] font-bold leading-tight line-clamp-2 lowercase">{message}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
              <X className="w-4 h-4 opacity-40" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
