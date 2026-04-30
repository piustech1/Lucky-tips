import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MoreVertical, 
  Ban, Shield, Trash2, Edit2, Mail, 
  Phone, Calendar, Clock, ChevronRight,
  Activity, Loader2, Globe, Sparkles, X,
  Crown, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ref, onValue, update, remove, get } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { addDays, format } from 'date-fns';
import { recordLog } from '../../lib/adminUtils';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const usersRef = ref(rtdb, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }));
        setUsers(list);
      } else {
        setUsers([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('RTDB Users Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleBan = async (id: string, currentStatus: string) => {
    try {
      const userRef = ref(rtdb, `users/${id}`);
      const newStatus = currentStatus === 'active' ? 'banned' : 'active';
      await update(userRef, { status: newStatus });
      await recordLog('Pius Tech', 'user', `user_${newStatus}`, (users.find(u => u.id === id)?.displayName || id));
    } catch (error) {
      console.error('RTDB Ban Error:', error);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      const targetUser = users.find(u => u.id === id);
      await remove(ref(rtdb, `users/${id}`));
      await recordLog('Pius Tech', 'delete', 'deleted_user', (targetUser?.displayName || id));
    } catch (error) {
      console.error('RTDB Delete Error:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const userRef = ref(rtdb, `users/${editingUser.id}`);
      const { id, ...saveData } = editingUser;
      await update(userRef, saveData);
      await recordLog('Pius Tech', 'edit', 'updated_user_info', editingUser.displayName || 'Unnamed User');
      setEditingUser(null);
    } catch (error) {
      console.error('Update Error:', error);
      alert('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVip = async (userId: string, isCurrentlyVip: boolean) => {
    try {
      const userRef = ref(rtdb, `users/${userId}`);
      const targetUser = users.find(u => u.id === userId);
      if (isCurrentlyVip) {
        await update(userRef, {
          subscriptionTier: 'free',
          subscriptionExpiry: null
        });
        await recordLog('Pius Tech', 'edit', 'revoked_vip', (targetUser?.displayName || userId));
      } else {
        const expiryDate = format(addDays(new Date(), 30), 'yyyy-MM-dd HH:mm:ss');
        await update(userRef, {
          subscriptionTier: 'vip',
          subscriptionExpiry: expiryDate
        });
        await recordLog('Pius Tech', 'win', 'granted_vip', (targetUser?.displayName || userId));
      }
    } catch (error) {
       console.error('VIP Toggle Error:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedRole === 'all' || (selectedRole === 'admin' ? user.isAdmin : !user.isAdmin))
  );

  const stats = {
    total: users.length,
    vip: users.filter(u => u.subscriptionTier === 'vip').length,
    admins: users.filter(u => u.isAdmin).length
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
               <h4 className="text-xl font-black text-[#1A1A1A] tracking-tighter">{stats.total}</h4>
            </div>
         </div>
         <div className="p-6 bg-white rounded-3xl border border-[#E9ECEF] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
               <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
               <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 lowercase">VIP Users</p>
               <h4 className="text-xl font-black text-[#1A1A1A] tracking-tighter">{stats.vip}</h4>
            </div>
         </div>
         <div className="p-6 bg-white rounded-3xl border border-[#E9ECEF] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
               <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <div>
               <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 lowercase">Admins</p>
               <h4 className="text-xl font-black text-[#1A1A1A] tracking-tighter">{stats.admins}</h4>
            </div>
         </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-300 gap-4">
             <Loader2 className="w-10 h-10 animate-spin" />
             <p className="text-xs font-black uppercase tracking-widest">acquiring target list...</p>
          </div>
        ) : (
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
                         <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || user.email}`} alt={user.displayName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-black text-[#1A1A1A] text-lg lowercase tracking-tighter leading-none mb-1 truncate max-w-[120px]">{user.displayName || 'No Name'}</h4>
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full lowercase",
                             user.isAdmin ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-500"
                           )}>{user.isAdmin ? 'Admin' : 'User'}</span>
                           <span className={cn(
                             "text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full lowercase",
                             user.status === 'banned' ? "bg-red-100 text-red-500" : "bg-win/10 text-win"
                           )}>{user.status || 'active'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <div className="flex items-center gap-1.5 px-2 py-1 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg">
                          <Globe className="w-3 h-3 text-zinc-400" />
                          <span className="text-[9px] font-black lowercase text-zinc-500">{user.country || 'Uganda'}</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                     <div className="flex items-center gap-3 text-zinc-500">
                        <Mail className="w-3.5 h-3.5 opacity-60" />
                        <span className="text-[11px] font-bold lowercase truncate">{user.email}</span>
                     </div>
                     <div className="flex items-center gap-3 text-zinc-500">
                        <Phone className="w-3.5 h-3.5 opacity-60" />
                        <span className="text-[11px] font-bold">{user.phoneNumber || 'N/A'}</span>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-[#F1F3F5] grid grid-cols-2 gap-4">
                     <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest lowercase">Subscription</p>
                        <div className="flex items-center gap-2">
                           <p className={cn(
                             "text-[11px] font-black lowercase tracking-tight",
                             user.subscriptionTier === 'vip' ? "text-primary" : "text-zinc-400"
                           )}>{user.subscriptionTier || 'free'}</p>
                           {user.subscriptionTier === 'vip' && <Crown className="w-3 h-3 text-primary" />}
                        </div>
                     </div>
                     <div className="space-y-0.5 text-right flex flex-col items-end">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest lowercase">Expiry</p>
                        <p className="text-[11px] font-black text-zinc-600 lowercase tracking-tight">
                           {user.subscriptionExpiry ? format(new Date(user.subscriptionExpiry), 'dd MMM yyyy') : '—'}
                        </p>
                     </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-8">
                   <button 
                     onClick={() => setEditingUser(user)}
                     className="flex-1 min-w-[100px] h-10 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                   >
                      <Edit2 className="w-3 h-3" />
                      Edit Info
                   </button>
                   <button 
                     onClick={() => toggleVip(user.id, user.subscriptionTier === 'vip')}
                     className={cn(
                       "h-10 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2",
                       user.subscriptionTier === 'vip' ? "bg-red-50 text-red-500 border border-red-100" : "bg-primary/20 text-primary border border-primary/20"
                     )}
                   >
                      <Crown className="w-3 h-3" />
                      {user.subscriptionTier === 'vip' ? 'Revoke VIP' : 'Give VIP'}
                   </button>
                   <button 
                     onClick={() => toggleBan(user.id, user.status || 'active')}
                     className={cn(
                       "h-10 w-10 rounded-xl text-white font-black transition-all shadow-lg flex items-center justify-center",
                       (user.status || 'active') === 'active' ? "bg-orange-500 shadow-orange-500/20" : "bg-win shadow-win/20"
                     )}
                     title={(user.status || 'active') === 'active' ? 'Ban' : 'Pardon'}
                   >
                      <Ban className="w-3.5 h-3.5" />
                   </button>
                   <button 
                     onClick={() => deleteUser(user.id)}
                     className="h-10 w-10 bg-red-500 text-white rounded-xl font-black shadow-lg shadow-red-500/20 hover:scale-105 transition-all flex items-center justify-center"
                   >
                      <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              onClick={() => setEditingUser(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 space-y-6 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-zinc-900" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black italic lowercase tracking-tight">Edit Intelligence</h4>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest lowercase">Update identity markers</p>
                  </div>
                </div>
                <button onClick={() => setEditingUser(null)} className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Display Name</label>
                    <input 
                      value={editingUser.displayName || ''}
                      onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                      className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 text-xs font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Phone Marker</label>
                    <input 
                      value={editingUser.phoneNumber || ''}
                      onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                      className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 text-xs font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Email Directive</label>
                    <input 
                      value={editingUser.email || ''}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 text-xs font-black outline-none focus:ring-4 focus:ring-zinc-900/10 transition-all opacity-60"
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Home Logistics (Country)</label>
                    <input 
                      value={editingUser.country || ''}
                      onChange={(e) => setEditingUser({...editingUser, country: e.target.value})}
                      className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 text-xs font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleUpdateUser}
                    disabled={isSaving}
                    className="flex-1 h-14 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-zinc-900/20 hover:scale-[1.02] active:scale-97 transition-all flex items-center justify-center gap-3"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Store Variations
                  </button>
                  <button 
                    onClick={() => setEditingUser(null)}
                    className="px-6 h-14 bg-zinc-100 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
