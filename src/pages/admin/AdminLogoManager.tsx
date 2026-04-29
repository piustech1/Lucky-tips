import React, { useState, useEffect } from 'react';
import { 
  Trophy, Search, Shield, Save, Loader2, 
  ChevronRight, CheckCircle2, AlertCircle, Globe, Key, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ref, set, get, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { fetchFromFootballAPI, getActiveKeyIndex, setActiveKeyIndex } from '../../services/apiService';

interface League {
  league: {
    id: number;
    name: string;
    logo: string;
    type: string;
  };
  country: {
    name: string;
    code: string;
    flag: string;
  };
}

interface Team {
  team: {
    id: number;
    name: string;
    logo: string;
    country: string;
  };
}

/**
 * Normalizes strings for consistent keys
 */
const normalize = (name: string) => name.toLowerCase().trim();

export default function AdminLogoManager() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const deleteAllLogos = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete ALL cached logos? This action cannot be reversed.')) return;
    
    setIsDeleting(true);
    setError(null);
    try {
      await set(ref(rtdb, 'logos'), null);
      setSuccess('Logo cache cleared from terminal');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to purge cache');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchLeagues = async () => {
    setIsLoadingLeagues(true);
    setError(null);
    try {
      const data = await fetchFromFootballAPI('leagues?season=2024');
      if (data.response) {
        setLeagues(data.response);
      } else {
        setError('Failed to load leagues from API');
      }
    } catch (err) {
      setError('Network error loading leagues');
    } finally {
      setIsLoadingLeagues(false);
    }
  };

  const fetchTeams = async (leagueId: number) => {
    setSelectedLeague(leagueId);
    setIsLoadingTeams(true);
    setTeams([]);
    setError(null);
    try {
      const data = await fetchFromFootballAPI(`teams?league=${leagueId}&season=2024`);
      if (data.response) {
        setTeams(data.response);
      } else {
        setError('Failed to load teams for this league');
      }
    } catch (err) {
      setError('Network error loading teams');
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const saveAllLogos = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updates: any = {};
      
      // Map all leagues to updates using normalized names as keys
      leagues.forEach(l => {
        const key = normalize(l.league.name);
        if (key) {
          updates[`leagues/${key}`] = {
            name: l.league.name,
            logo: l.league.logo
          };
        }
      });

      // Map all loaded teams to updates using normalized names as keys
      teams.forEach(t => {
        const key = normalize(t.team.name);
        if (key) {
          updates[`teams/${key}`] = {
            name: t.team.name,
            logo: t.team.logo,
            leagueId: selectedLeague
          };
        }
      });

      // Perform bulk update on logos node
      if (Object.keys(updates).length > 0) {
        await update(ref(rtdb, 'logos'), updates);
      }

      setSuccess('All logos synchronized successfully with terminal');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Save Error:', err);
      setError('Failed to sync logos with firebase');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter lowercase text-[#1A1A1A]">logo manager</h1>
          <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mt-1 lowercase">api-football synchronization engine</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={deleteAllLogos}
            disabled={isDeleting}
            className="h-16 px-8 bg-zinc-100 text-zinc-500 rounded-[32px] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            delete all logos
          </button>
          <button 
            onClick={saveAllLogos}
            disabled={isSaving || (leagues.length === 0 && teams.length === 0)}
            className="h-16 px-10 bg-premium-gradient text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            save all logos
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-red-50 border border-red-100 rounded-[32px] flex items-center gap-4 text-red-600"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-black lowercase tracking-tight">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-green-50 border border-green-100 rounded-[32px] flex items-center gap-4 text-green-600"
          >
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <p className="text-sm font-black lowercase tracking-tight">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Leagues Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black lowercase tracking-tight">Active Leagues</h2>
            <span className="ml-auto text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{leagues.length} found</span>
          </div>
          
          <div className="bg-white border border-zinc-100 rounded-[40px] shadow-sm overflow-hidden min-h-[400px]">
            {isLoadingLeagues ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">probing api matrix...</p>
              </div>
            ) : leagues.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4">
                <Shield className="w-10 h-10 text-zinc-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">no data found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 p-6 gap-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                {leagues.map((l) => (
                  <motion.div
                    key={l.league.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fetchTeams(l.league.id)}
                    className={cn(
                      "p-4 rounded-3xl border transition-all cursor-pointer flex flex-col items-center text-center gap-3",
                      selectedLeague === l.league.id 
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" 
                        : "bg-zinc-50/50 border-zinc-100 hover:border-zinc-300"
                    )}
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl p-2 border border-zinc-100 shadow-sm flex items-center justify-center">
                      <img 
                        src={l.league.logo} 
                        alt={l.league.name} 
                        className="w-full h-full object-contain"
                        onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=No+Img')}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-black italic lowercase leading-tight">{l.league.name}</p>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{l.country.name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Teams Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black lowercase tracking-tight">League Teams</h2>
            <span className="ml-auto text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{teams.length} mapped</span>
          </div>
          
          <div className="bg-white border border-zinc-100 rounded-[40px] shadow-sm overflow-hidden min-h-[400px]">
            {isLoadingTeams ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">extracting team frequencies...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4">
                <Search className="w-10 h-10 text-zinc-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">select a league to see teams</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 p-6 gap-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                {teams.map((t) => (
                  <motion.div
                    key={t.team.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-3xl border border-zinc-100 bg-zinc-50/50 flex flex-col items-center text-center gap-3"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl p-2 border border-zinc-100 shadow-sm flex items-center justify-center">
                      <img 
                        src={t.team.logo} 
                        alt={t.team.name} 
                        className="w-full h-full object-contain"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=No+Img')}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-black italic lowercase leading-tight">{t.team.name}</p>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{t.team.country}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
