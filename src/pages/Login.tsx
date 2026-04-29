import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

const LOGO_URL = "https://i.postimg.cc/c1j7ByYH/1000856002-removebg-preview.png";

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'Invalid email or password. Please try again.';
      if (err.code === 'auth/user-not-found') message = 'No account found with this email.';
      if (err.code === 'auth/wrong-password') message = 'Incorrect password. Try again.';
      if (err.code === 'auth/operation-not-allowed') message = 'Email/Password sign-in is not enabled in Firebase Console.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Hero Image Header */}
      <div className="relative h-[40vh] w-full">
        <img 
          src="https://resources.premierleague.pulselive.com/premierleague/photo/2024/12/24/18c87529-827d-4cb1-ae61-c9bf9b0904ed/PL2425-BEST-PHOTOS-Arsenal.png" 
          alt="Login Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent transition-colors duration-300" />
        
        <div className="absolute top-10 right-6 left-6 flex items-center justify-between z-20">
          <img src={LOGO_URL} alt="Lucky Tips Logo" className="w-12 h-12 object-contain drop-shadow-xl" />
          <button 
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-[var(--foreground)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--muted)] transition-all shadow-lg"
          >
            skip for now
          </button>
        </div>

        <div className="absolute bottom-10 left-10 right-10">
            <h2 className="text-4xl font-black text-white italic lowercase tracking-tight leading-none drop-shadow-md">Welcome back</h2>
            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mt-2 lowercase drop-shadow-sm">the expert picks await your return</p>
        </div>
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-1 bg-[var(--card)] px-8 pt-8 pb-12 relative z-20 border-t border-[var(--border)] rounded-t-[40px] -mt-10 shadow-2xl overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-w-[340px] mx-auto">
          <div className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-bold lowercase">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <InputField 
              label="Secret Login ID (Email)"
              icon={Mail}
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(v: string) => setFormData({...formData, email: v})}
            />
            <InputField 
              label="Access Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(v: string) => setFormData({...formData, password: v})}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-premium-gradient text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-glow-teal">Unlock Predictions</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)] opacity-50"></div></div>
            <div className="relative flex justify-center"><span className="px-3 bg-[var(--card)] text-[10px] font-black text-[var(--muted-foreground)]/50 uppercase tracking-widest lowercase tracking-tighter">secured entry with</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 bg-[var(--muted)]/30 border border-[var(--border)] rounded-2xl flex items-center justify-center gap-4 hover:bg-[var(--muted)] transition-all active:scale-[0.98] text-[var(--foreground)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="text-xs font-black lowercase tracking-tight">Google Authentication</span>
          </button>

          <p className="text-center text-xs font-black text-[var(--muted-foreground)] lowercase tracking-tight">
            New to Lucky Tips? {' '}
            <Link to="/signup" className="text-primary hover:underline underline-offset-4 decoration-primary/30">Claim Your Spot</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

function InputField({ label, icon: Icon, type, placeholder, value, onChange }: any) {
  return (
    <div className="space-y-1.5 group">
      <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-1 lowercase">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/60 group-focus-within:text-primary transition-colors" />
        <input 
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-14 bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl pl-12 pr-4 text-sm font-black placeholder:text-[var(--muted-foreground)]/30 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[var(--foreground)]"
          required
        />
      </div>
    </div>
  );
}
