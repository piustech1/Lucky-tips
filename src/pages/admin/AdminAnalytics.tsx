import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, TrendingUp, PieChart, 
  Target, Zap, Globe, Clock,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { cn } from '../../lib/utils';

const leagueData = [
  { name: 'Premier League', winRate: 88, tips: 124 },
  { name: 'La Liga', winRate: 75, tips: 98 },
  { name: 'Serie A', winRate: 82, tips: 110 },
  { name: 'Bundesliga', winRate: 68, tips: 85 },
  { name: 'NBA', winRate: 92, tips: 240 },
];

const oddsPerformance = [
  { range: '1.2 - 1.5', accuracy: 95 },
  { range: '1.5 - 2.0', accuracy: 82 },
  { range: '2.0 - 3.0', accuracy: 64 },
  { range: '3.0+', accuracy: 41 },
];

const monthlyTrend = [
  { month: 'Jan', rate: 78 },
  { month: 'Feb', rate: 82 },
  { month: 'Mar', rate: 85 },
  { month: 'Apr', rate: 84 },
];

const COLORS = ['#00BFA6', '#2196F3', '#FFC107', '#FF5722', '#9C27B0'];

export default function AdminAnalytics() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="bg-white p-8 rounded-[40px] border border-[#E9ECEF] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
           <h3 className="text-2xl font-black lowercase tracking-tight italic">Market Intelligence</h3>
           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">deep dive into prediction accuracy and market trends</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* League Performance */}
        <div className="p-10 bg-white border border-[#E9ECEF] rounded-[48px] space-y-8">
           <div className="flex items-center justify-between">
              <div>
                 <h4 className="text-xl font-black italic lowercase tracking-tight">League Performance</h4>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">win rate per association</p>
              </div>
              <Globe className="w-8 h-8 text-zinc-100" />
           </div>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leagueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F3F5" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} width={100} />
                  <Tooltip cursor={{ fill: '#F8F9FA' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="winRate" fill="#00BFA6" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Odds Accuracy */}
        <div className="p-10 bg-white border border-[#E9ECEF] rounded-[48px] space-y-8">
           <div className="flex items-center justify-between">
              <div>
                 <h4 className="text-xl font-black italic lowercase tracking-tight">Odds vs Accuracy</h4>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">hit rate based on market value</p>
              </div>
              <Target className="w-8 h-8 text-zinc-100" />
           </div>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oddsPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Bar dataKey="accuracy" fill="#FFC107" radius={[12, 12, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Monthly Hit Rate Trend */}
        <div className="lg:col-span-2 p-10 bg-white border border-[#E9ECEF] rounded-[48px] space-y-8">
           <div className="flex items-center justify-between">
              <div>
                 <h4 className="text-xl font-black italic lowercase tracking-tight">Consistency Curve</h4>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">monthly win rate progression</p>
              </div>
              <TrendingUp className="w-8 h-8 text-zinc-100" />
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ADB5BD', fontWeight: 'bold' }} domain={[60, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#00BFA6" strokeWidth={4} dot={{ r: 6, fill: '#00BFA6', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
