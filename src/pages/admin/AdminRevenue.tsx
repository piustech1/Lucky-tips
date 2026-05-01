import React from 'react';
import { 
  DollarSign, ArrowUpRight, TrendingUp, 
  Download, Filter, Calendar, 
  CreditCard, Wallet, Smartphone,
  BarChart3, PieChart, Coins, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { rtdb } from '../../lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function AdminRevenue() {
  const [stats, setStats] = React.useState({
    totalRevenue: 0,
    activeSubs: 0,
    dailyAvg: 0,
    weeklyData: [] as any[],
    recentPayments: [] as any[]
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const paymentsRef = ref(rtdb, 'payments');
    const usersRef = ref(rtdb, 'users');

    const unsubscribePayments = onValue(paymentsRef, (snapshot) => {
      const dataVal = snapshot.val() || {};
      const allPayments = Object.values(dataVal) as any[];
      
      // Filter for only completed payments to fix calculation error
      const completedPayments = allPayments.filter(p => (p.status === 'completed' || p.status === 'successful'));
      
      let totalRevenue = 0;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekly = [0, 0, 0, 0, 0, 0, 0];
      
      completedPayments.forEach(p => {
        const amt = Number(p.amount || 0);
        totalRevenue += amt;
        if (p.timestamp) {
          const date = new Date(p.timestamp);
          weekly[date.getDay()] += amt;
        }
      });

      const weeklyData = days.map((day, i) => ({
        name: day,
        revenue: weekly[i]
      }));

      setStats(prev => ({
        ...prev,
        totalRevenue,
        weeklyData,
        recentPayments: completedPayments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 5)
      }));
    });

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const dataVal = snapshot.val() || {};
      const users = Object.values(dataVal) as any[];
      const activeSubs = users.filter((u: any) => u.subscriptionTier === 'vip').length;
      
      setStats(prev => ({
        ...prev,
        activeSubs,
        dailyAvg: Math.round(prev.totalRevenue / 30)
      }));
      setLoading(false);
    });

    return () => {
      unsubscribePayments();
      unsubscribeUsers();
    };
  }, []);

  const totalRevenue = stats.totalRevenue;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 bg-premium-gradient rounded-[48px] shadow-2xl shadow-primary/25 text-white flex flex-col justify-between h-72 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />
           <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Matrix Gross Revenue</p>
                 <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter">
                    {loading ? '...' : totalRevenue.toLocaleString()} <span className="text-2xl opacity-50 not-italic">UGX</span>
                 </h2>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[24px] flex items-center justify-center">
                 <Coins className="w-8 h-8" />
              </div>
           </div>
           
           <div className="flex items-center gap-8 relative z-10">
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Monthly Pulse</p>
                 <p className="text-xl font-black">+{stats.dailyAvg.toLocaleString()} UGX / day</p>
              </div>
              <div className="h-10 w-[2px] bg-white/20" />
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Active VIPs</p>
                 <p className="text-xl font-black text-win">{stats.activeSubs} Users</p>
              </div>
           </div>
        </div>

        <div className="p-10 bg-white border border-[#E9ECEF] rounded-[48px] flex flex-col justify-between">
           <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 lowercase">Market Channel</p>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                   <Smartphone className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                   <h4 className="text-lg font-black lowercase tracking-tight">MTN/Airtel</h4>
                   <p className="text-[11px] font-black text-zinc-400">88% Mobile Volume</p>
                </div>
              </div>
           </div>
           <button className="w-full h-16 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-[#F1F3F5] transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4 text-zinc-400" />
              download intel.csv
           </button>
        </div>
      </div>

      {/* Daily Performance Chart */}
      <div className="p-10 bg-white border border-[#E9ECEF] rounded-[48px] space-y-10">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black italic lowercase tracking-tight leading-none">Market Growth Intel</h3>
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase mt-1">revenue snapshots in UGX (weekly)</p>
            </div>
            <BarChart3 className="w-8 h-8 text-zinc-200" />
         </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }}
                  tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#F8F9FA' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString()} UGX`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#00BFA6" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <MethodCard icon={Smartphone} label="Direct Mobile" volume={`${(stats.totalRevenue * 0.85).toLocaleString()} UGX`} color="text-amber-500" bg="bg-amber-500/10" />
         <MethodCard icon={CreditCard} label="Bank Transfers" volume={`${(stats.totalRevenue * 0.10).toLocaleString()} UGX`} color="text-blue-500" bg="bg-blue-500/10" />
         <MethodCard icon={Wallet} label="Digital Wallet" volume={`${(stats.totalRevenue * 0.05).toLocaleString()} UGX`} color="text-primary" bg="bg-primary/10" />
      </div>

      {/* Detailed Transactions List */}
      <div className="p-10 bg-white border border-[#E9ECEF] rounded-[48px] space-y-8">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black italic lowercase tracking-tight leading-none">Recent Vault entries</h3>
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase mt-1">last 5 verified transactions</p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-2xl">
               <Wallet className="w-5 h-5 text-zinc-400" />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-zinc-100">
                     <th className="pb-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">User</th>
                     <th className="pb-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ref</th>
                     <th className="pb-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</th>
                     <th className="pb-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-50">
                  {stats.recentPayments.map((p, i) => (
                     <tr key={i} className="group">
                        <td className="py-4">
                           <p className="text-xs font-black lowercase">{p.userName || 'Anonymous'}</p>
                           <p className="text-[9px] text-zinc-400 font-bold">{p.userEmail}</p>
                        </td>
                        <td className="py-4">
                           <code className="text-[10px] font-mono text-zinc-400 uppercase">{p.reference?.slice(0, 8)}...</code>
                        </td>
                        <td className="py-4">
                           <span className="text-sm font-black tracking-tighter text-zinc-900">{Number(p.amount).toLocaleString()} UGX</span>
                        </td>
                        <td className="py-4 text-right">
                           <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                              Verified
                           </span>
                        </td>
                     </tr>
                  ))}
                  {stats.recentPayments.length === 0 && (
                     <tr>
                        <td colSpan={4} className="py-10 text-center text-[10px] font-black text-zinc-300 uppercase tracking-widest">No verified entries yet</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function MethodCard({ icon: Icon, label, volume, color, bg }: any) {
  return (
    <div className="p-8 bg-white border border-[#E9ECEF] rounded-[40px] flex items-center justify-between group hover:shadow-xl transition-all">
       <div className="flex items-center gap-4">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", bg)}>
             <Icon className={cn("w-7 h-7", color)} />
          </div>
          <div>
             <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1 lowercase">{label}</p>
             <p className="text-xl font-black text-zinc-900 tracking-tighter">{volume}</p>
          </div>
       </div>
       <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 text-zinc-400 font-black text-[9px] lowercase">
          <TrendingUp className="w-3 h-3 text-win" />
          stable
       </div>
    </div>
  );
}
