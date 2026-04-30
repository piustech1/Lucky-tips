import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoggedOut = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('last_logged_in_user') || 'User';

  return (
    <div className="fixed inset-0 z-[500] w-full h-full bg-black flex flex-col justify-end p-8 md:p-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: 'url("https://i.pinimg.com/736x/8d/f8/28/8df828375948967bf0bed5eaf1b70a70.jpg")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content Aligned Bottom Left */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 max-w-md space-y-8"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Multi-Device Alert</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter lowercase italic">
              Session Terminated
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed lowercase">
              Hello <span className="text-white font-black">{userName}</span>, your account was accessed from another device. To protect your intel, we've secured this session.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <button 
            onClick={() => navigate('/auth')}
            className="group flex items-center justify-between w-full h-18 bg-white text-black rounded-[24px] px-8 font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-2xl shadow-black/50 overflow-hidden"
          >
            <span>Login Back</span>
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-zinc-300 transition-colors"
          >
            back to dashboard
          </button>
        </div>
      </motion.div>

      {/* Decorative details */}
      <div className="absolute top-12 right-12 z-10 w-24 h-[1px] bg-white/20 hidden md:block" />
      <div className="absolute bottom-12 right-12 z-10 text-[10px] font-black text-white/20 uppercase tracking-[0.5em] vertical-text hidden md:block" style={{ writingMode: 'vertical-rl' }}>
        security protocol alpha-9
      </div>
    </div>
  );
};

export default LoggedOut;
