import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, CheckCircle2, ChevronDown, User, Mail, Sparkles, Bug, AlertTriangle, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { useUser } from '../contexts/UserContext';

export default function Feedback() {
  const { profile } = useUser();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    type: 'suggestion',
    name: profile?.displayName || '',
    email: profile?.email || '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const feedbackRef = ref(rtdb, 'feedback');
      await push(feedbackRef, {
        ...formData,
        userId: profile?.uid || 'anonymous',
        status: 'open',
        createdAt: serverTimestamp()
      });
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Feedback error:", error);
      setIsLoading(false);
    }
  };

  const feedbackTypes = [
    { value: 'suggestion', label: 'idea', icon: Sparkles, color: 'text-primary' },
    { value: 'bug', label: 'flaw', icon: Bug, color: 'text-red-500' },
    { value: 'complaint', label: 'issue', icon: AlertTriangle, color: 'text-pending' },
    { value: 'praise', label: 'love', icon: Heart, color: 'text-win' },
  ];

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8"
      >
        <div className="w-24 h-24 bg-win/10 rounded-[40px] flex items-center justify-center border border-win/20 shadow-2xl shadow-win/10">
          <CheckCircle2 className="w-12 h-12 text-win" />
        </div>
        <div className="space-y-3 px-6">
          <h2 className="text-3xl font-black tracking-tighter lowercase italic leading-none">Transmission Received</h2>
          <p className="text-[var(--muted-foreground)] max-w-[280px] mx-auto text-[11px] font-bold leading-relaxed lowercase tracking-tight">
            Your intelligence has been injected into our development cycle. We prioritize every insight to refine the Lucky Tip$ experience.
          </p>
        </div>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="h-14 px-10 bg-[var(--card)] border border-[var(--border)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/30 transition-all shadow-xl shadow-black/5 lowercase"
        >
          Send Another
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-1 px-4">
        <h2 className="text-3xl font-black tracking-tight lowercase italic text-zinc-900 leading-none">Feedback Hub</h2>
        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] lowercase">Refine the terminal with your insights</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="space-y-10 bg-white border border-[#E9ECEF] p-8 rounded-[48px] shadow-2xl shadow-black/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">Identity Marker (Name)</label>
              <div className="relative group text-left">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  placeholder="Your Name"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs lowercase placeholder:text-zinc-200"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">Contact channel (Email)</label>
              <div className="relative group text-left">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  placeholder="your@email.com"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs lowercase placeholder:text-zinc-200"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">Message Intelligence Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {feedbackTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value as any })}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-[10px] font-black transition-all flex flex-col items-center gap-2",
                    formData.type === type.value 
                      ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/10 scale-[1.05]" 
                      : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200"
                  )}
                >
                  <type.icon className={cn("w-5 h-5", formData.type === type.value ? "text-primary" : "text-zinc-300")} />
                  <span className="uppercase tracking-widest lowercase">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2 text-left block">Intel Transmission (Message)</label>
            <textarea 
              required
              rows={4}
              placeholder="Inject your thoughts into the terminal..."
              className="w-full bg-zinc-50 border border-zinc-100 rounded-[32px] p-6 text-zinc-900 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs lowercase placeholder:text-zinc-200 resize-none min-h-[160px]"
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-16 bg-zinc-900 text-white rounded-[24px] font-black flex items-center justify-center gap-4 shadow-2xl shadow-black/20 disabled:opacity-50 transition-all active:scale-[0.97] hover:scale-[1.01]"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-xs tracking-[0.2em] uppercase">Inject Intelligence</span>
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}
