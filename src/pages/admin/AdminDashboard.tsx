import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Trophy, Wallet, ArrowUpRight, 
  TrendingUp, Activity, CheckCircle2, AlertCircle,
  BarChart3, Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';

const stats = [
  { label: 'Total Users', value: '12,482', icon: Users, color: 'bg-blue-500', trend: '+12%' },
  { label: 'Active Subs', value: '3,842', icon: Wallet, color: 'bg-green-500', trend: '+8%' },
  { label: 'Total Tips', value: '1,248', icon: Trophy, color: 'bg-amber-500', trend: '+24' },
  { label: 'Win Rate', value: '84.2%', icon: CheckCircle2, color: 'bg-purple-500', trend: '-2%' },
];

const revenueData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

const userGrowthData = [
  { name: 'Week 1', value: 400 },
  { name: 'Week 2', value: 800 },
  { name: 'Week 3', value: 1200 },
  { name: 'Week 4', value: 2000 },
];

const winLossData = [
  { name: 'Won', value: 84 },
  { name: 'Lost', value: 16 },
];
const COLORS = ['#1DE9B6', '#FF5252'];

export default function AdminDashboard() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h3 className="text-3xl font-black lowercase tracking-tight">morning, pius.</h3>
           <p className="text-sm font-black text-zinc-400 lowercase tracking-tight">the system is healthy. win rate is holding steady at 84%.</p>
        </div>
        <div className="flex gap-3">
          <button className="h-12 px-6 bg-white border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            Last 30 Days
          </button>
          <button className="h-12 px-6 bg-premium-gradient text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-[32px] border border-[#E9ECEF] group hover:shadow-2xl hover:shadow-black/5 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-opacity-30", stat.color)}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7F9F5] text-win font-black text-[10px]">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 lowercase">{stat.label}</p>
            <h4 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">{stat.value}</h4>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 p-8 bg-white border border-[#E9ECEF] rounded-[40px] space-y-6">
          <div className="flex items-center justify-between">
            <div>
               <h4 className="text-xl font-black italic lowercase tracking-tight">revenue trend</h4>
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">weekly performance</p>
            </div>
            <TrendingUp className="w-6 h-6 text-primary opacity-20" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00BFA6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00BFA6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'black', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#00BFA6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win Ratio Pie */}
        <div className="p-8 bg-white border border-[#E9ECEF] rounded-[40px] flex flex-col items-center justify-center space-y-8">
          <div className="w-full">
             <h4 className="text-xl font-black italic lowercase tracking-tight text-center">win vs loss</h4>
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center lowercase">overall accuracy</p>
          </div>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tighter">84%</span>
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">accuracy</span>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-win" />
              <span className="text-[10px] font-black uppercase tracking-tight">Won</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5252]" />
              <span className="text-[10px] font-black uppercase tracking-tight">Lost</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth */}
      <div className="p-8 bg-white border border-[#E9ECEF] rounded-[40px] space-y-6">
          <div className="flex items-center justify-between">
            <div>
               <h4 className="text-xl font-black italic lowercase tracking-tight">user acquisition</h4>
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">growth velocity</p>
            </div>
            <BarChart3 className="w-6 h-6 text-zinc-200" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#00BFA6" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
