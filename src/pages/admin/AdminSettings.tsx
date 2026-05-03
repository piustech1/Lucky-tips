import React, { useEffect, useState } from 'react';
import { 
  Settings, Shield, Bell, Wallet, 
  Globe, Database, Key, Trash2, 
  Save, RefreshCw, ZapOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { getActiveKeyIndex, setActiveKeyIndex } from '../../services/apiService';
import { ref, onValue, set, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

export default function AdminSettings() {
  const [activeKey, setKey] = useState(getActiveKeyIndex());
  const [freeMode, setFreeMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const settingsRef = ref(rtdb, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFreeMode(data.freeMode === true);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleFreeMode = async () => {
    try {
      const newMode = !freeMode;
      await update(ref(rtdb, 'settings'), { freeMode: newMode });
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyToggle = (index: number) => {
    setActiveKeyIndex(index);
    setKey(index);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-[#E9ECEF]">
        <div className="space-y-1">
           <h3 className="text-2xl font-black lowercase tracking-tight italic">System Configuration</h3>
           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">fine-tune the engine and security protocols</p>
        </div>
        <button className="h-14 px-8 bg-premium-gradient text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
           <Save className="w-5 h-5" />
           Apply Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API & Keys */}
        <div className="bg-white p-10 rounded-[48px] border border-[#E9ECEF] space-y-10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                 <Key className="w-6 h-6 text-amber-500" />
              </div>
              <h4 className="text-xl font-black italic lowercase tracking-tight">API & Security</h4>
           </div>

           <div className="space-y-6">
              <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 flex items-center justify-between">
                 <div className="space-y-1">
                    <h5 className="text-[11px] font-black lowercase tracking-tight">Active API Key</h5>
                    <p className="text-[9px] font-bold text-zinc-400 lowercase">Select which subscription tunnel to use</p>
                 </div>
                 <div className="flex bg-white p-1 rounded-2xl border border-zinc-100">
                   {[0, 1, 2, 3].map((idx) => (
                     <button 
                       key={idx}
                       onClick={() => handleKeyToggle(idx)}
                       className={cn(
                         "px-4 py-2 rounded-xl text-[10px] font-black transition-all",
                         activeKey === idx ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-400 hover:text-zinc-600"
                       )}
                     >
                       Key {idx + 1}
                     </button>
                   ))}
                 </div>
              </div>
              <AdminSettingInput label="Logo Auto-Fetch Provider" value="api-sports.io" />
              <AdminSettingInput label="System Currency" value="USD ($)" />
              <div className="flex items-center justify-between p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                 <div>
                    <h5 className="text-[11px] font-black lowercase tracking-tight">Two-Factor Authentication</h5>
                    <p className="text-[9px] font-bold text-zinc-400 lowercase">Enforced for all admin accounts</p>
                 </div>
                 <div className="w-12 h-6 bg-primary rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                 </div>
              </div>
           </div>
        </div>

        {/* App Config */}
          <div className="bg-white p-10 rounded-[48px] border border-[#E9ECEF] space-y-10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                 <Globe className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-black italic lowercase tracking-tight">Global Parameters</h4>
           </div>

           <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-primary/5 rounded-3xl border-2 border-primary/10 shadow-lg shadow-primary/5">
                 <div className="space-y-1">
                    <h5 className="text-[12px] font-black lowercase tracking-tight text-primary flex items-center gap-2">
                       <ZapOff className="w-4 h-4" />
                       GLOBAL FREE MODE
                    </h5>
                    <p className="text-[9px] font-bold text-zinc-500 lowercase leading-tight max-w-[200px]">Unlock all VIP content and hide payments for all users instantly.</p>
                 </div>
                 <button 
                  type="button"
                  onClick={toggleFreeMode}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors duration-300",
                    freeMode ? "bg-primary" : "bg-zinc-200"
                  )}
                 >
                    <motion.div 
                      animate={{ x: freeMode ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm" 
                    />
                 </button>
              </div>
              <AdminSettingInput label="App Name Override" value="Lucky Tip$" />
              <AdminSettingInput label="Contact Whatsapp" value="+256 701 234 567" />
              <div className="grid grid-cols-2 gap-4">
                 <AdminSettingInput label="VIP Monthly Price" value="29.00" />
                 <AdminSettingInput label="VIP Yearly Price" value="199.00" />
              </div>
              <div className="pt-4">
                 <button className="w-full h-14 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3">
                    <Trash2 className="w-4 h-4" />
                    Wipe System Cache
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function AdminSettingInput({ label, value, ...props }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">{label}</label>
       <input 
         defaultValue={value}
         {...props}
         className="w-full h-14 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl px-6 text-sm font-black lowercase tracking-tight outline-none focus:ring-2 focus:ring-primary/20 transition-all"
       />
    </div>
  );
}
