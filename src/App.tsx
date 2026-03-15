/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { Planet, Drop, UserProfile, TechCategory } from './types';
import { 
  Search, 
  Plus, 
  Database, 
  LogOut, 
  LogIn, 
  Clock,
  Filter,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@supabase/supabase-js';

const CATEGORIES: TechCategory[] = ['WU', 'MU', 'SU', 'CU', 'Amarna', 'Soris', 'Giza'];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRing, setSelectedRing] = useState<number | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlanet, setEditingPlanet] = useState<Planet | null>(null);
  
  const [newDrop, setNewDrop] = useState({ 
    planetId: '', 
    category: 'WU' as TechCategory, 
    techName: '',
    requester: ''
  });

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', uid)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Create profile if not exists
      const { data: userSession } = await supabase.auth.getSession();
      const email = userSession.session?.user.email || '';
      const newProfile: UserProfile = {
        uid,
        email,
        role: email === 'elton.duarteboss7@gmail.com' ? 'admin' : 'user'
      };
      await supabase.from('profiles').insert([newProfile]);
      setProfile(newProfile);
    } else if (data) {
      setProfile(data as UserProfile);
    }
  };

  // Data Listeners
  useEffect(() => {
    fetchPlanets();
    fetchDrops();

    const planetsSub = supabase
      .channel('planets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'planets' }, fetchPlanets)
      .subscribe();

    const dropsSub = supabase
      .channel('drops_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drops' }, fetchDrops)
      .subscribe();

    return () => {
      planetsSub.unsubscribe();
      dropsSub.unsubscribe();
    };
  }, []);

  const fetchPlanets = async () => {
    const { data } = await supabase
      .from('planets')
      .select('*')
      .order('ring', { ascending: false })
      .order('name');
    if (data) setPlanets(data as Planet[]);
  };

  const fetchDrops = async () => {
    const { data } = await supabase
      .from('drops')
      .select('*')
      .order('updatedAt', { ascending: false });
    if (data) setDrops(data as Drop[]);
  };

  const handleLogin = () => supabase.auth.signInWithOAuth({ provider: 'google' });
  const handleLogout = () => supabase.auth.signOut();

  const filteredPlanets = useMemo(() => {
    return planets.filter(p => {
      const matchesRing = selectedRing === 'all' || p.ring === selectedRing;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRing && matchesSearch;
    });
  }, [planets, selectedRing, searchTerm]);

  const getDropsForPlanet = (planetId: string, category: TechCategory) => {
    return drops.filter(d => d.planetId === planetId && d.category === category);
  };

  const handleAddDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDrop.planetId || !newDrop.techName) return;

    try {
      await supabase.from('drops').insert([{
        ...newDrop,
        editor: user.user_metadata.full_name || user.email,
        updatedAt: new Date().toISOString()
      }]);
      setShowAddModal(false);
      setNewDrop({ planetId: '', category: 'WU', techName: '', requester: '' });
    } catch (err) {
      console.error("Error adding drop:", err);
    }
  };

  const handleDeleteDrop = async (id: string) => {
    if (!profile || profile.role !== 'admin') return;
    try {
      await supabase.from('drops').delete().eq('id', id);
    } catch (err) {
      console.error("Error deleting drop:", err);
    }
  };

  const handleUpdatePlanet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlanet || !profile || profile.role !== 'admin') return;
    
    try {
      const { id, ...data } = editingPlanet;
      await supabase.from('planets').update(data).eq('id', id);
      setEditingPlanet(null);
    } catch (err) {
      console.error("Error updating planet:", err);
    }
  };

  const seedInitialData = async () => {
    if (!profile || profile.role !== 'admin') return;
    
    const initialPlanets = [
      { name: "Heosmi", ring: 5, enemy: "Ancient", status: "Active" },
      { name: "Idze", ring: 5, enemy: "Ancient", quarcs: "Ecoglyte", status: "Active" },
      { name: "Bihe", ring: 5, enemy: "Ancient", status: "Active" },
      { name: "Tonmuslin", ring: 5, enemy: "Ancient", quarcs: "Kenyte", status: "Active" },
      { name: "Igynrianton", ring: 5, enemy: "Ancient", quarcs: "Dolomyte", status: "Active" },
      { name: "Torunacor", ring: 5, enemy: "Ancient", quarcs: "Oolyte", status: "Active" },
      { name: "Usrian", ring: 5, enemy: "Ancient", quarcs: "Clay", status: "Active" },
      { name: "Toragar", ring: 5, enemy: "Ancient", status: "Active" },
      { name: "Mitomus", ring: 5, enemy: "Ancient", status: "Active" },
      { name: "Ivia", ring: 5, enemy: "Ancient", status: "Collapsed" },
      { name: "Monrianak", ring: 4, enemy: "Methanoid", status: "Active" },
      { name: "Eqdocor", ring: 4, enemy: "Pirates", lastCM: "Resource War", status: "Active" },
    ];

    await supabase.from('planets').insert(initialPlanets);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center font-mono text-white">
        <div className="flex flex-col items-center gap-4">
          <Database className="animate-pulse w-12 h-12 text-[#90EE90]" />
          <p className="text-xs uppercase tracking-widest">Loading Gaia Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2A2A2A] text-white font-sans selection:bg-[#90EE90] selection:text-[#2A2A2A]">
      {/* Header */}
      <header className="bg-[#1A1A1A] border-b border-[#333] p-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold tracking-tighter uppercase">Gaia</div>
          <div className="h-6 w-[1px] bg-[#333]" />
          <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Sirius Tracker</div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono opacity-50 uppercase">{user.email}</span>
              <button 
                onClick={handleLogout}
                className="bg-[#333] hover:bg-[#444] px-3 py-1.5 text-[10px] uppercase font-bold transition-colors rounded"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-[#90EE90] text-[#2A2A2A] px-4 py-1.5 text-[10px] uppercase font-bold hover:opacity-90 transition-opacity rounded"
            >
              Editor Login
            </button>
          )}
          <button className="bg-[#333] hover:bg-[#444] px-4 py-1.5 text-[10px] uppercase font-bold transition-colors rounded">
            Request
          </button>
        </div>
      </header>

      <main className="p-4 overflow-x-auto">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
            <input 
              type="text" 
              placeholder="Filter planets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333] pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#90EE90] rounded"
            />
          </div>

          <select 
            value={selectedRing}
            onChange={(e) => setSelectedRing(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-[#1A1A1A] border border-[#333] px-4 py-2 text-xs focus:outline-none rounded cursor-pointer"
          >
            <option value="all">All Rings</option>
            {[5, 4, 3, 2, 1].map(r => (
              <option key={r} value={r}>Ring {r}</option>
            ))}
          </select>

          {user && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#90EE90] text-[#2A2A2A] flex items-center gap-2 px-4 py-2 text-xs font-bold rounded hover:opacity-90"
            >
              <Plus size={14} />
              Add Drop
            </button>
          )}

          {profile?.role === 'admin' && planets.length === 0 && (
            <button onClick={seedInitialData} className="text-[10px] opacity-30 hover:opacity-100">Seed Data</button>
          )}
        </div>

        {/* Database Table */}
        <table className="w-full border-collapse text-[11px] min-w-[1200px]">
          <thead>
            <tr className="bg-[#5CB85C] text-[#1A1A1A] font-bold uppercase">
              <th className="border border-[#333] p-1.5 w-12 text-center">Ring</th>
              <th className="border border-[#333] p-1.5 w-32 text-center">Name</th>
              {CATEGORIES.map(cat => (
                <th key={cat} className="border border-[#333] p-1.5 w-24 text-center">{cat}</th>
              ))}
              <th className="border border-[#333] p-1.5 w-24 text-center">Enemy</th>
              <th className="border border-[#333] p-1.5 w-24 text-center">Quarcs</th>
              <th className="border border-[#333] p-1.5 w-24 text-center">Last CM</th>
              <th className="border border-[#333] p-1.5 w-24 text-center">Base Coords</th>
              <th className="border border-[#333] p-1.5 w-32 text-center">Collapse</th>
              <th className="border border-[#333] p-1.5 w-32 text-center">Respawn</th>
              <th className="border border-[#333] p-1.5 w-24 text-center">Editor</th>
              <th className="border border-[#333] p-1.5 w-24 text-center">Requester</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlanets.map((planet, idx) => {
              return (
                <React.Fragment key={planet.id}>
                  <tr className={`hover:bg-[#333] transition-colors ${planet.status === 'Collapsed' ? 'text-red-400' : ''}`}>
                    <td className="border border-[#333] p-2 text-center font-mono">{planet.ring}</td>
                    <td className="border border-[#333] p-2 text-center relative group">
                      <div className="font-bold">{planet.name}</div>
                      {planet.status === 'Collapsed' && <div className="text-[9px] opacity-70">(Collapsed)</div>}
                      {profile?.role === 'admin' && (
                        <button 
                          onClick={() => setEditingPlanet(planet)}
                          className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 hover:text-[#90EE90]"
                        >
                          <Edit2 size={10} />
                        </button>
                      )}
                    </td>
                    
                    {CATEGORIES.map(cat => {
                      const planetDrops = getDropsForPlanet(planet.id, cat);
                      return (
                        <td key={cat} className="border border-[#333] p-1 text-center align-top min-h-[40px]">
                          <div className="flex flex-col gap-1">
                            {planetDrops.map(drop => (
                              <div key={drop.id} className="group/drop relative bg-[#444] p-1 rounded text-[9px] flex items-center justify-between">
                                <span className="truncate">{drop.techName}</span>
                                {profile?.role === 'admin' && (
                                  <button 
                                    onClick={() => handleDeleteDrop(drop.id)}
                                    className="opacity-0 group-hover/drop:opacity-100 text-red-400 hover:text-red-300 ml-1"
                                  >
                                    <Trash2 size={8} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}

                    <td className="border border-[#333] p-2 text-center">{planet.enemy}</td>
                    <td className="border border-[#333] p-2 text-center">{planet.quarcs}</td>
                    <td className="border border-[#333] p-2 text-center">{planet.lastCM}</td>
                    <td className="border border-[#333] p-2 text-center">{planet.baseCoords}</td>
                    <td className="border border-[#333] p-2 text-center font-mono text-[10px]">
                      {planet.collapseTime ? new Date(planet.collapseTime).toLocaleString() : '-'}
                    </td>
                    <td className="border border-[#333] p-2 text-center font-mono text-[10px]">
                      {planet.respawnTime ? new Date(planet.respawnTime).toLocaleString() : '-'}
                    </td>
                    <td className="border border-[#333] p-2 text-center opacity-70">
                      {drops.find(d => d.planetId === planet.id)?.editor || '-'}
                    </td>
                    <td className="border border-[#333] p-2 text-center opacity-70">
                      {drops.find(d => d.planetId === planet.id)?.requester || '-'}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#1A1A1A] border border-[#333] p-6 rounded-lg shadow-2xl"
            >
              <h2 className="text-lg font-bold mb-4 uppercase tracking-tight">Report Drop</h2>
              <form onSubmit={handleAddDrop} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase opacity-50 block mb-1">Planet</label>
                  <select 
                    required value={newDrop.planetId}
                    onChange={(e) => setNewDrop(prev => ({ ...prev, planetId: e.target.value }))}
                    className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                  >
                    <option value="">Select Planet...</option>
                    {planets.map(p => <option key={p.id} value={p.id}>{p.name} (R{p.ring})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase opacity-50 block mb-1">Category</label>
                  <select 
                    value={newDrop.category}
                    onChange={(e) => setNewDrop(prev => ({ ...prev, category: e.target.value as TechCategory }))}
                    className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase opacity-50 block mb-1">Tech Name</label>
                  <input 
                    type="text" required value={newDrop.techName}
                    onChange={(e) => setNewDrop(prev => ({ ...prev, techName: e.target.value }))}
                    className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase opacity-50 block mb-1">Requester (Optional)</label>
                  <input 
                    type="text" value={newDrop.requester}
                    onChange={(e) => setNewDrop(prev => ({ ...prev, requester: e.target.value }))}
                    className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-[#333] py-2 text-xs font-bold rounded">Cancel</button>
                  <button type="submit" className="flex-1 bg-[#90EE90] text-[#2A2A2A] py-2 text-xs font-bold rounded">Add Drop</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {editingPlanet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingPlanet(null)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#1A1A1A] border border-[#333] p-6 rounded-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold uppercase tracking-tight">Edit {editingPlanet.name}</h2>
                <button onClick={() => setEditingPlanet(null)}><X size={18} /></button>
              </div>
              <form onSubmit={handleUpdatePlanet} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Enemy</label>
                    <input 
                      type="text" value={editingPlanet.enemy || ''}
                      onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, enemy: e.target.value }) : null)}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Quarcs</label>
                    <input 
                      type="text" value={editingPlanet.quarcs || ''}
                      onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, quarcs: e.target.value }) : null)}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase opacity-50 block mb-1">Status</label>
                  <select 
                    value={editingPlanet.status}
                    onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, status: e.target.value as any }) : null)}
                    className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Collapsed">Collapsed</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase opacity-50 block mb-1">Base Coords</label>
                  <input 
                    type="text" value={editingPlanet.baseCoords || ''}
                    onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, baseCoords: e.target.value }) : null)}
                    className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <button type="submit" className="w-full bg-[#90EE90] text-[#2A2A2A] py-2 text-xs font-bold rounded mt-4">Save Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
