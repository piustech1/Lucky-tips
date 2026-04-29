import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, CheckCircle2, ChevronDown, User, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { Feedback as FeedbackType } from '../types';
import { rtdb } from '../lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';

export default function Feedback() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FeedbackType>>({
    type: 'suggestion'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const feedbackRef = ref(rtdb, 'feedback');
      await push(feedbackRef, {
        ...formData,
        createdAt: serverTimestamp()
      });
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Feedback error:", error);
    }
  };

  const feedbackTypes = [
    { value: 'suggestion', label: '💡 Suggestion' },
    { value: 'bug', label: '🐛 Bug Report' },
    { value: 'complaint', label: '⚠️ Complaint' },
    { value: 'praise', label: '✨ Praise' },
  ];

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="w-24 h-24 bg-green-500/10 rounded-[40px] flex items-center justify-center border border-green-500/20">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <div className="space-y-2 px-6">
          <h2 className="text-3xl font-black tracking-tighter">THANK YOU!</h2>
          <p className="text-[var(--muted-foreground)] max-w-[280px] mx-auto text-sm font-medium leading-relaxed">
            Your feedback has been received. We use your input to make Lucky Tips even better for the community.
          </p>
        </div>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="bg-[var(--card)] border border-[var(--border)] px-10 py-4 rounded-2xl font-bold hover:border-primary/30 transition-all shadow-lg"
        >
          Send Another
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-8 text-center sm:text-left">
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight tracking-widest bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase">Feedback</h2>
        <p className="text-[var(--muted-foreground)] text-sm font-medium">Help us improve the King's experience</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="space-y-8 bg-[var(--card)] border border-[var(--border)] p-8 rounded-[40px] shadow-xl shadow-black/5"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Your Name</label>
            <div className="relative group text-left">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                required
                placeholder="John Doe"
                className="w-full bg-[var(--muted)] border-none rounded-2xl py-4 pl-12 pr-4 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-[var(--muted-foreground)]/30"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group text-left">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                required
                placeholder="john@example.com"
                className="w-full bg-[var(--muted)] border-none rounded-2xl py-4 pl-12 pr-4 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-[var(--muted-foreground)]/30"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Feedback Type</label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value as any })}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-sm font-black transition-all text-center",
                    formData.type === type.value 
                      ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10 scale-[1.02]" 
                      : "bg-[var(--muted)] border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)]"
                  )}
                >
                  {type.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest ml-1 text-left block">Message</label>
            <textarea 
              required
              rows={4}
              placeholder="Tell us what's on your mind..."
              className="w-full bg-[var(--muted)] border-none rounded-2xl p-5 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-[var(--muted-foreground)]/30 resize-none min-h-[120px]"
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-premium-gradient py-5 rounded-[20px] text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50 transition-all active:scale-[0.98] mt-4"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-lg tracking-tight">SUBMIT FEEDBACK</span>
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}
