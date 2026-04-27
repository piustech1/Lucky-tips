import React from 'react';
import { 
  DollarSign, ArrowUpRight, TrendingUp, 
  Download, Filter, Calendar, 
  CreditCard, Wallet, Smartphone,
  BarChart3, PieChart
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const data = [
  { name: 'Mon', revenue: 400, subscriptions: 12 },
  { name: 'Tue', revenue: 300, subscriptions: 8 },
  { name: 'Wed', revenue: 600, subscriptions: 18 },
  { name: 'Thu', revenue: 400, subscriptions: 15 },
  { name: 'Fri', revenue: 700, subscriptions: 22 },
  { name: 'Sat', revenue: 900, subscriptions: 30 },
  { name: 'Sun', revenue: 1200, subscriptions: 42 },
];

export default function AdminRevenue() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 bg-premium-gradient rounded-[48px] shadow-2xl shadow-primary/25 text-white flex flex-col justify-between h-72 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />
           <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Gross Revenue</p>
                 <h2 className="text-6xl font-black italic tracking-tighter">$42,852.00</h2>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[24px] flex items-center justify-center">
                 <DollarSign className="w-8 h-8" />
              </div>
           </div>
           
           <div className="flex items-center gap-8 relative z-10">
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60">This month</p>
                 <p className="text-xl font-black">+$5,248.50</p>
              </div>
              <div className="h-10 w-[2px] bg-white/20" />
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Pending</p>
                 <p className="text-xl font-black text-amber-300">$1,421.00</p>
              </div>
           </div>
        </div>

        <div className="p-10 bg-white border border-[#E9ECEF] rounded-[48px] flex flex-col justify-between">
           <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 lowercase">Popular Method</p>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                   <Smartphone className="w-7 h-7 text-indigo-500" />
                </div>
                <div>
                   <h4 className="text-lg font-black lowercase tracking-tight">Mobile Money</h4>
                   <p className="text-[11px] font-black text-zinc-400">72% of total volume</p>
                </div>
              </div>
           </div>
           <button className="w-full h-16 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-[#F1F3F5] transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4 text-zinc-400" />
              Export Financials.csv
           </button>
        </div>
      </div>

      {/* Daily Performance Chart */}
      <div className="p-10 bg-white border border-[#E9ECEF] rounded-[48px] space-y-10">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black italic lowercase tracking-tight leading-none">Daily Income Streams</h3>
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase mt-1">performance overview for current week</p>
            </div>
            <BarChart3 className="w-8 h-8 text-zinc-200" />
         </div>

         <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: '#F8F9FA' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#00BFA6" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Payment methods breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <MethodCard icon={Smartphone} label="Mobile Money" volume="$31,042" color="text-indigo-500" bg="bg-indigo-500/10" />
         <MethodCard icon={CreditCard} label="Credit Cards" volume="$8,421" color="text-blue-500" bg="bg-blue-500/10" />
         <MethodCard icon={Wallet} label="Crypto Support" volume="$3,389" color="text-amber-500" bg="bg-amber-500/10" />
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
