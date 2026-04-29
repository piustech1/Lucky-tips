import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, BarChart3, 
  MapPin, Globe, Zap, 
  Search, Filter, Smartphone,
  Activity, Users, Trophy, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { 
  ResponsiveContainer, PieChart, Pie, 
  Cell, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';

export default function AdminMarketIntel() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTips: 0,
    wonTips: 0,
    vipTips: 0,
    categories: [] as any[],
    userLocations: [
      { name: 'Uganda', value: 65, color: '#00BFA6' },
      { name: 'Kenya', value: 15, color: '#1DE9B6' },
      { name: 'Tanzania', value: 10, color: '#00897B' },
      { name: 'Others', value: 10, color: '#E0F7F5' },
    ]
  });

  useEffect(() => {
    const predictionsRef = ref(rtdb, 'predictions');
    const unsubscribe = onValue(predictionsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const tips = Object.values(data) as any[];
      
      const totalTips = tips.length;
      const wonTips = tips.filter(t => t.status === 'won').length;
      const vipTips = tips.filter(t => t.isVip || t.category === 'vip').length;

      const catCounts = tips.reduce((acc: any, t) => {
        const cat = t.category || 'unassigned';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const categoryData = Object.entries(catCounts).map(([name, value]) => ({
        name,
        value
      }));

      setStats(prev => ({
        ...prev,
        totalTips,
        wonTips,
        vipTips,
        categories: categoryData
      }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[48px] border border-[#E9ECEF]">
        <div className="space-y-1">
           <h3 className="text-3xl font-black lowercase tracking-tighter italic">Market Intel</h3>
           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">deep analysis of prediction performance & user reach</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-zinc-50 rounded-2xl flex items-center gap-3 border border-zinc-100">
              <div className="w-2 h-2 bg-win rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest lowercase">System Live</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 bg-white border border-[#E9ECEF] rounded-[48px] space-y-8">
           <div className="flex items-center justify-between">
              <div>
                 <h4 className="text-xl font-black italic lowercase tracking-tight">Category Distribution</h4>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">volume of tips per market sector</p>
              </div>
              <Activity className="w-6 h-6 text-primary" />
           </div>

           <div className="h-64 w-full">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categories}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                    <Tooltip 
                      cursor={{ fill: '#F8F9FA' }}
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" fill="#00BFA6" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
           </div>
        </div>

        <div className="p-10 bg-[#0A0A0A] rounded-[48px] text-white space-y-8 relative overflow-hidden">
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
           
           <div className="relative z-10 space-y-8">
              <div>
                 <h4 className="text-xl font-black italic lowercase tracking-tight">Geographic Reach</h4>
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest lowercase">User concentration by region</p>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.userLocations}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.userLocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {stats.userLocations.map(loc => (
                   <div key={loc.name} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: loc.color }} />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60 lowercase">{loc.name}</span>
                      <span className="text-[10px] font-black ml-auto">{loc.value}%</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard icon={Trophy} label="Win Efficiency" value={`${Math.round((stats.wonTips / stats.totalTips) * 100) || 0}%`} color="text-win" bg="bg-win/10" />
         <StatCard icon={Zap} label="Premium Density" value={`${Math.round((stats.vipTips / stats.totalTips) * 100) || 0}%`} color="text-amber-500" bg="bg-amber-500/10" />
         <StatCard icon={Target} label="Market Accuracy" value="94.2%" color="text-blue-500" bg="bg-blue-500/10" />
         <StatCard icon={Smartphone} label="Direct Reach" value="8.4k" color="text-primary" bg="bg-primary/10" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="p-8 bg-white border border-[#E9ECEF] rounded-[40px] flex items-center gap-5 hover:shadow-xl transition-all group">
       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", bg)}>
          <Icon className={cn("w-7 h-7", color)} />
       </div>
       <div>
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1 lowercase">{label}</p>
          <p className="text-xl font-black text-zinc-900 tracking-tighter">{value}</p>
       </div>
    </div>
  );
}
