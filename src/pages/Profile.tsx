import { motion } from 'motion/react';
import { User, ShieldCheck, Mail, Calendar, LogOut, ChevronRight, Award, Star, Zap, Phone, Lock, Unlock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';

export default function Profile() {
  const { isVip, setIsVip, phoneNumber, username, setUsername, premiumExpiry } = useUser();
  
  // Deterministic avatar based on username
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Background Hero Image */}
      <div className="absolute -top-20 -left-4 -right-4 h-[50vh] overflow-hidden pointer-events-none z-0">
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG00YHbaanlEarMRUyXNGg_e-ltAJhQAhXBtd4E9czCwQHnRTqjv1EYa1u&s=10" 
          alt="Profile Background" 
          className="w-full h-full object-cover opacity-40 contrast-125 saturate-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/40 to-[var(--background)]" />
      </div>

      {/* Profile Header */}
      <section className="relative pt-12 pb-6 flex flex-col items-center z-10">
        {/* Glow behind avatar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group mb-6"
        >
          <div className="w-36 h-36 rounded-[48px] bg-white border-2 border-primary/20 p-2 shadow-2xl shadow-primary/15 transition-transform duration-500 group-hover:scale-105">
            <div className="w-full h-full rounded-[38px] overflow-hidden bg-zinc-50 border border-zinc-100">
              <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className={cn(
             "absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center transition-colors",
             isVip ? "bg-yellow-500 text-black" : "bg-zinc-200 text-zinc-500"
          )}>
            {isVip ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
        </motion.div>

        <div className="text-center space-y-1 px-6">
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent border-none text-center text-3xl font-black tracking-tight text-zinc-900 leading-none lowercase focus:ring-0"
          />
          <div className={cn(
            "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border transition-all mt-3",
            isVip 
              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-600" 
              : "bg-zinc-100 border-zinc-200 text-zinc-400"
          )}>
            {isVip ? <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" /> : <Lock className="w-3 h-3" />}
            <span className="text-[10px] font-black uppercase tracking-widest lowercase">
              {isVip ? 'Global VIP Member' : 'Standard Member'}
            </span>
          </div>
        </div>
      </section>

      {/* Subscription Card */}
      {isVip && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-4 p-6 rounded-[32px] bg-zinc-900 text-white relative overflow-hidden shadow-2xl shadow-zinc-900/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500 text-black flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-black lowercase">Premium active</span>
               </div>
               <span className="text-[9px] font-black bg-white/10 px-2 py-1 rounded-lg uppercase tracking-widest text-white/60">Global VIP</span>
            </div>
            
            <div className="space-y-1">
               <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] lowercase">Subscription valid until</p>
               <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-black tabular-nums">{premiumExpiry || '2026-05-26'}</span>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Verification Toggle (Test) */}
      <section className="px-4">
        <div className="bg-[var(--muted)] border border-primary/10 rounded-[32px] p-4 flex items-center justify-between">
          <div className="pl-2">
            <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest lowercase">Simulate VIP</h4>
            <p className="text-[9px] font-bold text-[var(--muted-foreground)] lowercase">For testing layout</p>
          </div>
          <button 
            onClick={() => setIsVip(!isVip)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
              isVip ? "bg-lose text-white" : "bg-win text-white"
            )}
          >
            {isVip ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </section>

      {/* Settings Grid */}
      <section className="px-4 grid grid-cols-2 gap-3">
        <div className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[32px] shadow-sm space-y-3">
           <div className="w-10 h-10 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
           </div>
           <div>
              <p className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-widest lowercase">Account Rating</p>
              <h4 className="text-xl font-black text-[var(--foreground)]">4.9/5</h4>
           </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[32px] shadow-sm space-y-3">
           <div className="w-10 h-10 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
           </div>
           <div>
              <p className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-widest lowercase">Active Tips</p>
              <h4 className="text-xl font-black text-[var(--foreground)]">12</h4>
           </div>
        </div>
      </section>

      {/* Account Info List */}
      <section className="mx-4 bg-[var(--card)] border border-[var(--border)] rounded-[36px] overflow-hidden shadow-sm">
        <div className="divide-y divide-[var(--border)]/50">
          {[
            { label: 'Login ID', value: phoneNumber || '+256 701 000 000', icon: Phone },
            { label: 'Access Tier', value: isVip ? 'Global Premium' : 'Free User', icon: ShieldCheck },
            { label: 'Join Date', value: '2026-04-26', icon: Calendar },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 hover:bg-[var(--muted)]/30 transition-colors">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest lowercase">{item.label}</p>
                <div className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-black text-[var(--foreground)] lowercase">{item.value}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--border)]" />
            </div>
          ))}
        </div>
      </section>

      {/* Logout */}
      <div className="px-4">
        <button className="w-full flex items-center justify-center gap-3 py-5 bg-[var(--muted)] rounded-[32px] text-[var(--foreground)] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--border)] transition-colors lowercase">
          <LogOut className="w-4 h-4" />
          logout of system
        </button>
      </div>
    </div>
  );
}
