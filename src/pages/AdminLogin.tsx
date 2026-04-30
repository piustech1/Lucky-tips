import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified passkey-only login as requested
    if (password === 'greatdev') {
      localStorage.setItem('admin_authenticated', 'true');
      navigate('/admin');
    } else {
      setError('Invalid passkey. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-[40px] mb-6 border border-primary/20">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter lowercase">Passkey Access</h1>
          <p className="text-zinc-500 text-sm font-bold lowercase tracking-widest mt-2">restricted area • enter passkey</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-zinc-600">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="enter passkey"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-16 bg-zinc-900/50 border border-zinc-800 rounded-3xl pl-14 pr-6 text-white text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-zinc-700 lowercase"
              required
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full h-16 bg-primary text-black rounded-[32px] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 mt-8"
          >
            initiate override
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center mt-10 text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
           &copy; 2026 force main systems • secure link active
        </p>
      </motion.div>
    </div>
  );
}
