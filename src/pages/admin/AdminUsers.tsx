import React, { useState } from 'react';
import { 
  Users, Search, Filter, MoreVertical, 
  Ban, Shield, Trash2, Edit2, Mail, 
  Phone, Calendar, Clock, ChevronRight,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_USERS = [
  { 
    id: '1', 
    name: 'Pius Tech', 
    email: 'piustech245@gmail.com', 
    phone: '+256701234567',
    role: 'Admin',
    status: 'active',
    subscription: 'VIP Annual',
    lastLogin: '2 mins ago',
    joinedDate: '2024-01-15'
  },
  { 
    id: '2', 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '+254712345678',
    role: 'User',
    status: 'active',
    subscription: 'Free',
    lastLogin: '1 hour ago',
    joinedDate: '2024-02-10'
  },
  { 
    id: '3', 
    name: 'Sarah Wilson', 
    email: 'sarah.w@gmail.com', 
    phone: '+255789123456',
    role: 'User',
    status: 'banned',
    subscription: 'VIP Monthly',
    lastLogin: '3 days ago',
    joinedDate: '2024-01-20'
  },
  // Add more mock users as needed
];

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-[#E9ECEF]">
        <div className="space-y-1">
           <h3 className="text-2xl font-black lowercase tracking-tight italic">User Management</h3>
           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">monitor and control your community</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl pl-12 pr-4 text-xs font-black placeholder:text-zinc-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="h-12 px-6 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-white rounded-3xl border border-[#E9ECEF] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
               <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
               <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 lowercase">Total Users</p>
               <h4 className="text-xl font-black text-[#1A1A1A] tracking-tighter">12,482</h4>
            </div>
         </div>
         <div className="p-6 bg-white rounded-3xl border border-[#E9ECEF] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
               <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
               <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 lowercase">VIP Users</p>
               <h4 className="text-xl font-black text-[#1A1A1A] tracking-tighter">3,842</h4>
            </div>
         </div>
         <div className="p-6 bg-white rounded-3xl border border-[#E9ECEF] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
               <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <div>
               <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 lowercase">Active Today</p>
               <h4 className="text-xl font-black text-[#1A1A1A] tracking-tighter">1,209</h4>
            </div>
         </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredUsers.map((user) => (
            <motion.div
              layout
              key={user.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "p-6 bg-white border rounded-[32px] hover:shadow-xl transition-all group flex flex-col justify-between",
                user.status === 'banned' ? "border-red-100 bg-red-50/10" : "border-[#E9ECEF]"
              )}
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} />
                    </div>
                    <div>
                      <h4 className="font-black text-[#1A1A1A] text-lg lowercase tracking-tighter leading-none mb-1">{user.name}</h4>
                      <div className="flex items-center gap-2">
                         <span className={cn(
                           "text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full lowercase",
                           user.role === 'Admin' ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-500"
                         )}>{user.role}</span>
                         <span className={cn(
                           "text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full lowercase",
                           user.status === 'active' ? "bg-win/10 text-win" : "bg-red-100 text-red-500"
                         )}>{user.status}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                    <MoreVertical className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   <div className="flex items-center gap-3 text-zinc-500">
                      <Mail className="w-3.5 h-3.5 opacity-60" />
                      <span className="text-[11px] font-bold lowercase">{user.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-zinc-500">
                      <Phone className="w-3.5 h-3.5 opacity-60" />
                      <span className="text-[11px] font-bold">{user.phone}</span>
                   </div>
                </div>

                <div className="pt-6 border-t border-[#F1F3F5] grid grid-cols-2 gap-4">
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest lowercase">Subscription</p>
                      <p className="text-[11px] font-black text-primary lowercase tracking-tight">{user.subscription}</p>
                   </div>
                   <div className="space-y-0.5 text-right">
                      <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest lowercase">Last Active</p>
                      <p className="text-[11px] font-black text-zinc-600 lowercase tracking-tight">{user.lastLogin}</p>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                 <button className="flex-1 h-11 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2">
                    <Edit2 className="w-3 h-3" />
                    Edit User
                 </button>
                 <button className={cn(
                   "h-11 px-4 rounded-xl text-white font-black text-[9px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center",
                   user.status === 'active' ? "bg-orange-500 shadow-orange-500/20" : "bg-win shadow-win/20"
                 )}>
                    <Ban className="w-3 h-3 mr-2" />
                    {user.status === 'active' ? 'Ban' : 'Pardon'}
                 </button>
                 <button className="h-11 px-4 bg-red-500 text-white rounded-xl font-black shadow-lg shadow-red-500/20 hover:scale-105 transition-all">
                    <Trash2 className="w-3 h-3" />
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
