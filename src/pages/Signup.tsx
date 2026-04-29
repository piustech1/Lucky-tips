import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, ArrowLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ref, set, update, get } from 'firebase/database';
import { auth, rtdb } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { cn } from '../lib/utils';

const COUNTRIES = [
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+211', name: 'South Sudan', flag: '🇸🇸' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
];

const LOGO_URL = "https://i.postimg.cc/c1j7ByYH/1000856002-removebg-preview.png";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+256',
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });

      // Create RTDB profile
      const fullPhone = `${formData.countryCode}${formData.phone}`;
      await set(ref(rtdb, `users/${user.uid}`), {
        uid: user.uid,
        email: user.email,
        displayName: formData.name,
        phoneNumber: fullPhone,
        photoURL: '',
        subscriptionTier: 'free',
        subscriptionExpiry: null,
        isAdmin: false,
        createdAt: new Date().toISOString()
      });

      navigate('/');
    } catch (err: any) {
      console.error('Signup error:', err);
      let message = 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') message = 'This email is already registered.';
      if (err.code === 'auth/invalid-email') message = 'Please enter a valid email address.';
      if (err.code === 'auth/operation-not-allowed') message = 'Email/Password sign-in is not enabled in Firebase Console.';
      if (err.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists, if not create in RTDB
      const profileRef = ref(rtdb, `users/${user.uid}`);
      const snapshot = await get(profileRef);
      
      if (!snapshot.exists()) {
        await set(profileRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Lucky User',
          phoneNumber: user.phoneNumber || '',
          photoURL: user.photoURL || '',
          subscriptionTier: 'free',
          subscriptionExpiry: null,
          isAdmin: false,
          createdAt: new Date().toISOString()
        });
      }

      navigate('/');
    } catch (err: any) {
      console.error('Google signup error:', err);
      let message = 'Google signup failed. Please try again.';
      if (err.code === 'auth/operation-not-allowed') message = 'Google sign-in is not enabled in Firebase Console.';
      if (err.code === 'auth/popup-closed-by-user') message = 'Signup cancelled.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

// Inside Signup component return
  return (
    <div className="min-h-screen bg-[#103D39] flex flex-col font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Header Image Area */}
      <div className="relative h-[30vh] w-full">
        <img 
          src="https://img.freepik.com/premium-photo/soccer-ball-rain-with-lights-photo_1233553-36592.jpg?semt=ais_hybrid&w=740&q=80" 
          alt="Signup Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#103D39] via-[#103D39]/20 to-transparent" />
        
        <div className="absolute top-8 left-6 right-6 flex items-center justify-between z-20">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={LOGO_URL} alt="Lucky Tips Logo" className="w-12 h-12 object-contain drop-shadow-xl" />
        </div>

        <div className="absolute bottom-6 left-10 right-10 text-center">
            <h1 className="text-3xl font-black text-white italic lowercase tracking-tight drop-shadow-lg">Join Lucky Tips</h1>
        </div>
      </div>

      {/* Main Content Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 bg-[#103D39] px-8 pt-2 pb-12 relative z-20 border-t border-white/10 rounded-t-[40px] -mt-10 shadow-2xl overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-w-[340px] mx-auto">
          <div className="space-y-4 pt-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-[10px] font-bold lowercase">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <InputField 
              label="Full Name"
              icon={User}
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(v: string) => setFormData({...formData, name: v})}
              theme="dark"
            />
            <InputField 
              label="Email"
              icon={Mail}
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(v: string) => setFormData({...formData, email: v})}
              theme="dark"
            />

            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 lowercase">Phone Number</label>
              <div className="flex gap-2">
                <div className="relative w-28 shrink-0 group">
                  <select 
                    value={formData.countryCode}
                    onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-3 pr-8 text-sm font-black appearance-none focus:ring-4 focus:ring-primary/20 transition-all text-white"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code} className="bg-[#103D39] text-white">{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover:text-primary transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>
                <div className="relative flex-1 group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="tel"
                    placeholder="701 234 567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-black placeholder:text-white/10 focus:ring-4 focus:ring-primary/20 transition-all text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <InputField 
              label="Secure Password"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(v: string) => setFormData({...formData, password: v})}
              theme="dark"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-premium-gradient text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Secret Account</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center"><span className="px-3 bg-[#103D39] text-[10px] font-black text-white/20 uppercase tracking-widest lowercase tracking-tighter">or continue with</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-4 hover:bg-white/10 transition-all active:scale-[0.98] text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="text-xs font-black lowercase tracking-tight">Google Authentication</span>
          </button>

          <p className="text-center text-xs font-black text-white/30 lowercase tracking-tight">
            Already with us? {' '}
            <Link to="/login" className="text-primary hover:underline underline-offset-4 decoration-primary/30">Log In Here</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

function InputField({ label, icon: Icon, type, placeholder, value, onChange, theme }: any) {
  return (
    <div className="space-y-1.5 group">
      <label className={cn(
        "text-[10px] font-black uppercase tracking-widest ml-1 lowercase",
        theme === 'dark' ? "text-white/40" : "text-[var(--muted-foreground)]"
      )}>{label}</label>
      <div className="relative">
        <Icon className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
          theme === 'dark' ? "text-white/20 group-focus-within:text-primary" : "text-[var(--muted-foreground)]/60 group-focus-within:text-primary"
        )} />
        <input 
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-14 rounded-2xl pl-12 pr-4 text-sm font-black outline-none focus:ring-4 transition-all shadow-sm",
            theme === 'dark' 
              ? "bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:ring-primary/20" 
              : "bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/30 focus:ring-primary/20"
          )}
          required
        />
      </div>
    </div>
  );
}
