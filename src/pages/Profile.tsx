import { useState } from 'react';
import { motion } from 'motion/react';
import { User, ShieldCheck, Mail, Calendar, LogOut, ChevronRight, Award, Star, Zap, Phone, Lock, Loader2, Camera, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const LOGO_URL = "https://i.postimg.cc/c1j7ByYH/1000856002-removebg-preview.png";

export default function Profile() {
  const { user, profile, isVip, updateProfile } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    displayName: profile?.displayName || '',
    phoneNumber: profile?.phoneNumber || '',
  });

  if (!profile) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const avatarUrl = profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  const calculateTimeLeft = () => {
    if (!profile.subscriptionExpiry && !profile.lastActivated) return null;
    
    let expiryDate: Date;
    if (profile.subscriptionExpiry && profile.subscriptionExpiry !== 'End of Time') {
      expiryDate = new Date(profile.subscriptionExpiry);
    } else if (profile.lastActivated) {
      // Default to 24h if only lastActivated exists
      expiryDate = new Date(profile.lastActivated + 24 * 60 * 60 * 1000);
    } else {
      return 'Infinity';
    }

    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  const timeLeft = calculateTimeLeft();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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

      <div className="flex justify-center pt-8 relative z-10">
         <img src={LOGO_URL} alt="Lucky Tip$ Logo" className="w-16 h-16 object-contain drop-shadow-xl" />
      </div>

      {/* Profile Header */}
      <section className="relative pt-4 pb-6 flex flex-col items-center z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group mb-6"
        >
          <div className="w-32 h-32 rounded-[48px] bg-white border-2 border-primary/20 p-2 shadow-2xl shadow-primary/15">
            <div className="w-full h-full rounded-[38px] overflow-hidden bg-zinc-50 border border-zinc-100 relative">
              <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
              <button className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          <div className={cn(
             "absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center transition-colors",
             isVip ? "bg-yellow-500 text-black" : "bg-zinc-200 text-zinc-500"
          )}>
            {isVip ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
        </motion.div>

        <div className="text-center space-y-1 px-6 w-full max-w-[280px]">
          {isEditing ? (
            <div className="space-y-4">
               <input 
                 type="text" 
                 value={editedProfile.displayName}
                 onChange={(e) => setEditedProfile({...editedProfile, displayName: e.target.value})}
                 className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl px-4 py-3 text-center text-lg font-black tracking-tight text-zinc-900 leading-none lowercase focus:ring-2 focus:ring-primary/20 outline-none"
                 placeholder="Your display name"
               />
               <input 
                 type="text" 
                 value={editedProfile.phoneNumber}
                 onChange={(e) => setEditedProfile({...editedProfile, phoneNumber: e.target.value})}
                 className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl px-4 py-3 text-center text-sm font-black tracking-tight text-zinc-900 leading-none focus:ring-2 focus:ring-primary/20 outline-none"
                 placeholder="+256 7xx xxxxxx"
               />
               <div className="flex gap-2">
                 <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                 </button>
                 <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-zinc-100 text-zinc-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                    Cancel
                 </button>
               </div>
            </div>
          ) : (
            <>
               <h3 className="text-3xl font-black tracking-tight text-[var(--foreground)] leading-none lowercase">{profile.displayName}</h3>
               <p className="text-zinc-400 text-xs font-bold">{profile.email}</p>
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
               <button 
                 onClick={() => setIsEditing(true)}
                 className="mt-4 text-[10px] font-black text-primary uppercase tracking-widest hover:underline underline-offset-4"
               >
                 Edit my identity
               </button>
            </>
          )}
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
                  <div className="flex flex-col">
                    <span className="text-xl font-black tabular-nums leading-none">
                      {profile.subscriptionExpiry ? format(new Date(profile.subscriptionExpiry), 'MMM dd, HH:mm') : 
                       (profile.lastActivated ? format(new Date(profile.lastActivated + 24*60*60*1000), 'MMM dd, HH:mm') : 'End of Time')}
                    </span>
                    {timeLeft && (
                      <span className="text-[10px] font-black text-yellow-500 mt-1 uppercase tracking-widest leading-none">
                        {timeLeft}
                      </span>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Grid */}
      <section className="px-4 grid grid-cols-2 gap-3">
        <div className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[32px] shadow-sm space-y-3">
           <div className="w-10 h-10 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
           </div>
           <div>
              <p className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-widest lowercase">Rating</p>
              <h4 className="text-xl font-black text-[var(--foreground)]">4.9</h4>
           </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[32px] shadow-sm space-y-3">
           <div className="w-10 h-10 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
           </div>
           <div>
              <p className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-widest lowercase">Tier</p>
              <h4 className="text-xl font-black text-[var(--foreground)] lowercase">{profile.subscriptionTier}</h4>
           </div>
        </div>
      </section>

      {/* Account Info List */}
      <section className="mx-4 bg-[var(--card)] border border-[var(--border)] rounded-[36px] overflow-hidden shadow-sm">
        <div className="divide-y divide-[var(--border)]/50">
          {[
            { label: 'Login Identity', value: profile.email, icon: Mail },
            { label: 'Contact Secret', value: profile.phoneNumber || 'not set', icon: Phone },
            { label: 'Joined Matrix', value: profile.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : 'Recently', icon: Calendar },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 hover:bg-[var(--muted)]/30 transition-colors">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest lowercase">{item.label}</p>
                <div className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-black text-[var(--foreground)] lowercase truncate max-w-[200px]">{item.value}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--border)]" />
            </div>
          ))}
        </div>
      </section>

      {/* Logout */}
      <div className="px-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-5 bg-[var(--muted)] rounded-[32px] text-[var(--foreground)] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-900 hover:text-white transition-all lowercase"
        >
          <LogOut className="w-4 h-4" />
          logout of matrix
        </button>
      </div>
    </div>
  );
}
