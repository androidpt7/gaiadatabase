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
const ENEMY_OPTIONS = ['-', 'Ancient', 'Mantis', 'Pirates', 'Methanoid', 'Imperials'];
const QUARCS_OPTIONS = ['-', 'Ecoglyte', 'Oolyte', 'Dolomyte', 'Kenyte', 'Clay'];

// Mapeamento de ícones
const TECH_ICONS: Record<string, string> = {
  'Blasters': 'https://github.com/androidpt7/itempg/blob/main/icons/blaster.png?raw=true',
  'Collectors': 'https://github.com/androidpt7/itempg/blob/main/icons/collector.png?raw=true',
  'Repair Droids': 'https://github.com/androidpt7/itempg/blob/main/icons/repair_droid.png?raw=true',
  'Afterburners': 'https://github.com/androidpt7/itempg/blob/main/icons/afterburner.png?raw=true',
  'Rockets': 'https://github.com/androidpt7/itempg/blob/main/icons/rockets.png?raw=true',
  'Shields': 'https://github.com/androidpt7/itempg/blob/main/icons/shield.png?raw=true',
  'Repair Targets': 'https://github.com/androidpt7/itempg/blob/main/icons/repair_target.png?raw=true',
  'Speed Actuators': 'https://github.com/androidpt7/itempg/blob/main/icons/speed_actuator.png?raw=true',
  'Aim Computers': 'https://github.com/androidpt7/itempg/blob/main/icons/aim_computer.png?raw=true',
  'Taunts': 'https://github.com/androidpt7/itempg/blob/main/icons/taunt.png?raw=true',
  'Protectors': 'https://github.com/androidpt7/itempg/blob/main/icons/protector.png?raw=true',
  'Stun Charges': 'https://github.com/androidpt7/itempg/blob/main/icons/stun_charge.png?raw=true',
  'Perforators': 'https://github.com/androidpt7/itempg/blob/main/icons/perforator.png?raw=true',
  'Aim Scramblers': 'https://github.com/androidpt7/itempg/blob/main/icons/aim_scrambler.png?raw=true',
  'Repair Fields': 'https://github.com/androidpt7/itempg/blob/main/icons/repair_field.png?raw=true',
  'Aggro Beacons': 'https://github.com/androidpt7/itempg/blob/main/icons/aggro_beacon.png?raw=true',
  'Thermoblasts': 'https://github.com/androidpt7/itempg/blob/main/icons/thermoblast.png?raw=true',
  'Aggro Bombs': 'https://github.com/androidpt7/itempg/blob/main/icons/aggro_bomb.png?raw=true',
  'Materializers': 'https://github.com/androidpt7/itempg/blob/main/icons/materializer.png?raw=true',
  'Stun Domes': 'https://github.com/androidpt7/itempg/blob/main/icons/stun_dome.png?raw=true',
  'Sniper Blasters': 'https://github.com/androidpt7/itempg/blob/main/icons/sniper_blaster.png?raw=true',
  'Attack Droids': 'https://github.com/androidpt7/itempg/blob/main/icons/attack_droid.png?raw=true',
  'Orbital Strikes': 'https://github.com/androidpt7/itempg/blob/main/icons/orbital.png?raw=true',
  'Attack Charges': 'https://github.com/androidpt7/itempg/blob/main/icons/attack_charge.png?raw=true',
  'Repair Turrets': 'https://github.com/androidpt7/itempg/blob/main/icons/repair_turret.png?raw=true',
  'Attack Turrets': 'https://github.com/androidpt7/itempg/blob/main/icons/attack_turret.png?raw=true',
  'Sticky Bombs': 'https://github.com/androidpt7/itempg/blob/main/icons/sticky_bomb.png?raw=true',
  'Minelayers': 'https://github.com/androidpt7/itempg/blob/main/icons/mine.png?raw=true',
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRing, setSelectedRing] = useState<number | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPlanetModal, setShowAddPlanetModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [editingPlanet, setEditingPlanet] = useState<Planet | null>(null);
  const [isSpreadsheetMode, setIsSpreadsheetMode] = useState(true);
  
  const [newDrop, setNewDrop] = useState({ 
    planet_id: '', 
    category: 'WU' as TechCategory, 
    tech_name: '',
    requester: '',
    system: '',
    item: '',
    type: ''
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

  const fetchProfile = async (auth_id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', auth_id)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Create profile if not exists
      const { data: userSession } = await supabase.auth.getSession();
      const email = userSession.session?.user.email || '';
      const storedNickname = userSession.session?.user.user_metadata?.nickname || email.split('@')[0];
      const isAdmin = email === 'elton.duarteboss7@gmail.com' || storedNickname.toLowerCase() === 'admin';
      
      const newProfile: UserProfile = {
        auth_id,
        email,
        uid: storedNickname,
        role: isAdmin ? 'admin' : 'user',
        approved: isAdmin
      };
      await supabase.from('profiles').insert([newProfile]);
      setProfile(newProfile);
    } else if (data) {
      setProfile(data as UserProfile);
    }
  };

  const fetchAllProfiles = async () => {
    if (profile?.role !== 'admin') return;
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error("Error fetching profiles:", error);
      return;
    }
    if (data) setAllProfiles(data as UserProfile[]);
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAllProfiles();
      const sub = supabase
        .channel('profiles_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAllProfiles)
        .subscribe();
      return () => { sub.unsubscribe(); };
    }
  }, [profile]);

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
      .order('created_at', { ascending: false });
    if (data) setDrops(data as Drop[]);
  };

  const handleLogin = () => setShowAuthModal(true);
  const handleLogout = () => supabase.auth.signOut();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    // Internal identifier generation (hidden from user)
    const sanitizedNickname = nickname.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const internalId = `${sanitizedNickname}@gaia.db`;
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ 
          email: internalId, 
          password,
          options: {
            data: { nickname }
          }
        });
        if (error) throw error;
        setAuthMode('login');
        setAuthError('NICKNAME REGISTERED! YOU CAN NOW LOGIN.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: internalId, 
          password 
        });
        if (error) throw error;
        setShowAuthModal(false);
      }
    } catch (err: any) {
      // Translate technical email errors to Nickname terms and make them friendlier
      let msg = err.message.toUpperCase();
      
      if (msg.includes('RATE LIMIT')) {
        msg = 'TOO MANY ATTEMPTS. PLEASE WAIT A FEW MINUTES BEFORE TRYING AGAIN.';
      } else if (msg.includes('INVALID LOGIN CREDENTIALS')) {
        msg = 'WRONG NICKNAME OR PASSWORD.';
      } else if (msg.includes('USER ALREADY REGISTERED')) {
        msg = 'NICKNAME ALREADY TAKEN. CHOOSE ANOTHER ONE.';
      } else {
        msg = msg.replace(/EMAIL/g, 'NICKNAME');
      }
      
      setAuthError(msg);
    }
  };

  const approveUser = async (auth_id: string) => {
    console.log("Attempting to approve user:", auth_id);
    if (profile?.role !== 'admin') {
      console.warn("Permission denied: user is not an admin");
      return;
    }
    
    // Optimistic update
    setAllProfiles(prev => prev.map(p => 
      p.auth_id === auth_id ? { ...p, approved: true } : p
    ));

    const { error } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('auth_id', auth_id);
    
    if (error) {
      console.error("Error approving user:", error);
      // Revert optimistic update on error
      fetchAllProfiles();
      alert("Failed to approve user: " + error.message);
    }
  };

  const createAdminProfileManually = async () => {
    if (!user) return;
    setIsCreatingAdmin(true);
    try {
      const isAdmin = user.email === 'elton.duarteboss7@gmail.com';
      const newProfile: UserProfile = {
        auth_id: user.id,
        email: user.email || '',
        uid: user.user_metadata?.nickname || 'Admin',
        role: isAdmin ? 'admin' : 'user',
        approved: isAdmin
      };
      const { error } = await supabase.from('profiles').upsert([newProfile], { onConflict: 'auth_id' });
      if (error) throw error;
      setProfile(newProfile);
    } catch (err) {
      console.error("Error creating admin profile:", err);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const filteredPlanets = useMemo(() => {
    return planets.filter(p => {
      const matchesRing = selectedRing === 'all' || p.ring === selectedRing;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRing && matchesSearch;
    });
  }, [planets, selectedRing, searchTerm]);

  const getDropsForPlanet = (planet_id: string, category: TechCategory) => {
    return drops.filter(d => d.planet_id === planet_id && d.category === category);
  };

  const [newPlanet, setNewPlanet] = useState({
    name: '',
    ring: 5,
    enemy: '-',
    quarcs: '-',
    status: 'Active' as const
  });

  const handleAddPlanet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.role !== 'admin') return;

    try {
      const { error } = await supabase.from('planets').insert([newPlanet]);
      if (error) throw error;
      setShowAddPlanetModal(false);
      setNewPlanet({ name: '', ring: 5, enemy: '-', quarcs: '-', status: 'Active' });
      fetchPlanets();
    } catch (err) {
      console.error("Error adding planet:", err);
    }
  };

  const handleAddDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDrop.planet_id || !newDrop.tech_name || !newDrop.system || !newDrop.type) return;

    try {
      await supabase.from('drops').insert([{
        ...newDrop,
        editor: profile?.uid || user.email,
        created_at: new Date().toISOString()
      }]);
      setShowAddModal(false);
      setNewDrop({ planet_id: '', category: 'WU', tech_name: '', requester: '', system: '', item: '', type: '' });
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
      fetchPlanets();
    } catch (err) {
      console.error("Error updating planet:", err);
    }
  };

  const updatePlanetField = async (planet_id: string, field: string, value: any) => {
    const { error } = await supabase
      .from('planets')
      .update({ [field]: value })
      .eq('id', planet_id);
    if (error) console.error(error);
    else fetchPlanets();
  };

  const updateTechField = async (planet_id: string, category: TechCategory, value: string) => {
    const planet = planets.find(p => p.id === planet_id);
    const restrictedCategories = ['Amarna', 'Soris', 'Giza'];
    
    if (restrictedCategories.includes(category)) {
      if (planet && planet.ring !== 5) {
        alert(`${category} só pode ser adicionado em planetas R5.`);
        return;
      }
      
      const techNames = value.split('\n').filter(t => t.trim() !== '');
      if (techNames.length > 3) {
        alert(`${category} só pode ter no máximo 3 tecnologias.`);
        return;
      }
    }

    const techNames = value.split('\n').filter(t => t.trim() !== '');
    await supabase.from('drops').delete().eq('planet_id', planet_id).eq('category', category);
    
    if (techNames.length > 0) {
      const newDrops = techNames.map(name => ({
        planet_id,
        category,
        tech_name: name.trim(),
        editor: profile?.uid || user?.email,
        created_at: new Date().toISOString()
      }));
      await supabase.from('drops').insert(newDrops);
    }
    fetchDrops();
  };

  const handleDeletePlanet = async (id: string) => {
    if (!profile || profile.role !== 'admin') return;
    if (!window.confirm('DELETE THIS PLANET AND ALL ITS DATA?')) return;
    await supabase.from('planets').delete().eq('id', id);
    fetchPlanets();
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
      { name: "Eqdocor", ring: 4, enemy: "Pirates", last_cm: "Resource War", status: "Active" },
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
              {user && (user.email === 'elton.duarteboss7@gmail.com' || user.email?.startsWith('admin@')) && profile?.role !== 'admin' && (
                <button 
                  onClick={createAdminProfileManually}
                  disabled={isCreatingAdmin}
                  className="bg-red-600 text-white px-4 py-2 text-[11px] uppercase font-black animate-bounce rounded shadow-lg border-2 border-white z-50"
                >
                  {isCreatingAdmin ? 'Creating...' : '⚠️ CLICK HERE TO FIX ADMIN PROFILE'}
                </button>
              )}
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono opacity-50 uppercase">{profile?.uid || 'GUEST'}</span>
                {profile && !profile.approved && (
                  <span className="text-[8px] text-yellow-500 font-bold uppercase animate-pulse">Pending Approval</span>
                )}
              </div>
              {profile?.role === 'admin' && (
                <button 
                  onClick={() => setShowAdminModal(true)}
                  className="bg-[#444] hover:bg-[#555] px-3 py-1.5 text-[10px] uppercase font-bold transition-colors rounded flex items-center gap-2"
                >
                  Admin
                  {allProfiles.filter(p => !p.approved).length > 0 && (
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              )}
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

          {profile?.approved && (
            <div className="flex items-center gap-2 ml-auto">
              <button 
                onClick={() => setIsSpreadsheetMode(!isSpreadsheetMode)}
                className={`px-4 py-2 text-xs font-bold rounded transition-colors ${isSpreadsheetMode ? 'bg-[#90EE90] text-[#2A2A2A]' : 'bg-[#333] text-white'}`}
              >
                {isSpreadsheetMode ? 'View Mode' : 'Edit Mode'}
              </button>
              {profile?.role === 'admin' && (
                <button 
                  onClick={() => setShowAddPlanetModal(true)}
                  className="bg-[#90EE90] text-[#2A2A2A] flex items-center gap-2 px-4 py-2 text-xs font-bold rounded hover:opacity-90"
                >
                  <Plus size={14} />
                  Add Planet
                </button>
              )}
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-[#90EE90] text-[#2A2A2A] flex items-center gap-2 px-4 py-2 text-xs font-bold rounded hover:opacity-90"
              >
                <Plus size={14} />
                Add Drop
              </button>
            </div>
          )}

          {profile?.role === 'admin' && planets.length === 0 && (
            <button onClick={seedInitialData} className="text-[10px] opacity-30 hover:opacity-100">Seed Data</button>
          )}
        </div>

        {/* Database Table */}
        <div className="bg-[#2A2A2A] rounded overflow-hidden border border-[#333]">
          <table className="w-full border-collapse text-[11px] min-w-[1400px]">
            <thead>
              <tr className="bg-[#5CB85C] text-[#1A1A1A] font-bold uppercase">
                <th className="border border-[#444] p-1 w-16">Ring</th>
                <th className="border border-[#444] p-1 w-40">Name</th>
                {CATEGORIES.map(cat => (
                  <th key={cat} className={`border border-[#444] p-1 w-32 text-center`}>{cat}</th>
                ))}
                <th className="border border-[#444] p-1 w-24">Enemy</th>
                <th className="border border-[#444] p-1 w-24">Quarcs</th>
                <th className="border border-[#444] p-1 w-24">Last CM</th>
                <th className="border border-[#444] p-1 w-32">Base Coords</th>
                <th className="border border-[#444] p-1 w-24">Collapse</th>
                <th className="border border-[#444] p-1 w-24">Respawn</th>
                <th className="border border-[#444] p-1 w-24">Editor</th>
                <th className="border border-[#444] p-1 w-24">Request</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlanets.map((planet) => {
                const isEditing = isSpreadsheetMode && profile?.approved;
                
                return (
                  <tr key={planet.id} className="hover:bg-[#333] transition-colors group">
                    <td className="border border-[#444] p-1 text-center font-mono">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs">{planet.ring}</span>
                        {isEditing && profile?.role === 'admin' && (
                          <button 
                            onClick={() => handleDeletePlanet(planet.id)}
                            className="bg-[#1A1A1A] border border-[#444] px-2 py-0.5 rounded text-[9px] hover:bg-red-900 hover:text-white transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="border border-[#444] p-1">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={planet.name}
                          onChange={(e) => updatePlanetField(planet.id, 'name', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#444] p-0.5 rounded focus:outline-none focus:border-[#90EE90] text-[10px]"
                        />
                      ) : (
                        <div className="font-bold px-1 text-[10px]">{planet.name}</div>
                      )}
                    </td>
                    
                    {CATEGORIES.map(cat => {
                      const planetDrops = getDropsForPlanet(planet.id, cat);
                      const techValue = planetDrops.map(d => d.tech_name).join('\n');
                      
                      return (
                        <td key={cat} className="border border-[#444] p-1 align-middle text-center">
                          {isEditing ? (
                            <textarea 
                              value={techValue}
                              onChange={(e) => updateTechField(planet.id, cat, e.target.value)}
                              disabled={['Amarna', 'Soris', 'Giza'].includes(cat) && planet.ring !== 5}
                              rows={cat === 'Amarna' || cat === 'Soris' || cat === 'Giza' ? 3 : 1}
                              className={`w-full bg-[#1A1A1A] border border-[#444] p-1 rounded focus:outline-none focus:border-[#90EE90] resize-none text-[10px] leading-tight ${['Amarna', 'Soris', 'Giza'].includes(cat) && planet.ring !== 5 ? 'opacity-50 cursor-not-allowed' : ''} text-center`}
                            />


// ... (rest of the file)


                          ) : (
                            <div className="flex flex-col items-center justify-center gap-0.5 h-full">
                              {planetDrops.map(drop => (
                                <div key={drop.id} className="bg-[#333] px-1 rounded text-[9px] truncate w-full flex items-center gap-1">
                                  {TECH_ICONS[drop.tech_name] && (
                                    <img src={TECH_ICONS[drop.tech_name]} alt={drop.tech_name} className="w-3 h-3 object-contain" referrerPolicy="no-referrer" />
                                  )}
                                  {drop.tech_name}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="border border-[#444] p-1">
                      {isEditing ? (
                        <select 
                          value={planet.enemy || '-'}
                          onChange={(e) => updatePlanetField(planet.id, 'enemy', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#444] p-1 rounded focus:outline-none text-[10px]"
                        >
                          {ENEMY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <div className="text-center">{planet.enemy || '-'}</div>
                      )}
                    </td>

                    <td className="border border-[#444] p-1">
                      {isEditing ? (
                        <select 
                          value={planet.quarcs || '-'}
                          onChange={(e) => updatePlanetField(planet.id, 'quarcs', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#444] p-1 rounded focus:outline-none text-[10px]"
                        >
                          {QUARCS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <div className="text-center">{planet.quarcs || '-'}</div>
                      )}
                    </td>

                    <td className="border border-[#444] p-1">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={planet.last_cm || ''}
                          onChange={(e) => updatePlanetField(planet.id, 'last_cm', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#444] p-0.5 rounded focus:outline-none text-[10px]"
                        />
                      ) : (
                        <div className="text-center text-[10px]">{planet.last_cm || '-'}</div>
                      )}
                    </td>

                    <td className="border border-[#444] p-1">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={planet.base_coords || ''}
                          onChange={(e) => updatePlanetField(planet.id, 'base_coords', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#444] p-0.5 rounded focus:outline-none text-[10px]"
                        />
                      ) : (
                        <div className="text-center text-[10px]">{planet.base_coords || '-'}</div>
                      )}
                    </td>

                    <td className="border border-[#444] p-1">
                      {isEditing ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[7px] opacity-50 uppercase w-6">Days</span>
                            <input 
                              type="number" 
                              value={planet.collapse_days || 0}
                              onChange={(e) => updatePlanetField(planet.id, 'collapse_days', parseInt(e.target.value) || 0)}
                              className="w-full bg-[#1A1A1A] border border-[#444] p-0.5 rounded text-[9px] focus:outline-none h-4"
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[7px] opacity-50 uppercase w-6">Hours</span>
                            <input 
                              type="number" 
                              value={planet.collapse_hours || 0}
                              onChange={(e) => updatePlanetField(planet.id, 'collapse_hours', parseInt(e.target.value) || 0)}
                              className="w-full bg-[#1A1A1A] border border-[#444] p-0.5 rounded text-[9px] focus:outline-none h-4"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          {planet.collapse_days || planet.collapse_hours ? (
                            <div className="flex flex-col text-[9px]">
                              {planet.collapse_days ? <span>{planet.collapse_days}d</span> : null}
                              {planet.collapse_hours ? <span>{planet.collapse_hours}h</span> : null}
                            </div>
                          ) : '-'}
                        </div>
                      )}
                    </td>

                    <td className="border border-[#444] p-1">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={planet.respawn_time || ''}
                          onChange={(e) => updatePlanetField(planet.id, 'respawn_time', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#444] p-0.5 rounded focus:outline-none text-[10px]"
                        />
                      ) : (
                        <div className="text-center text-[10px]">{planet.respawn_time || '-'}</div>
                      )}
                    </td>

                    <td className="border border-[#444] p-1">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={planet.editor || ''}
                          onChange={(e) => updatePlanetField(planet.id, 'editor', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#444] p-0.5 rounded focus:outline-none text-[10px]"
                        />
                      ) : (
                        <div className="text-center text-[10px]">{planet.editor || '-'}</div>
                      )}
                    </td>

                    <td className="border border-[#444] p-1">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={planet.requester || ''}
                          onChange={(e) => updatePlanetField(planet.id, 'requester', e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#444] p-0.5 rounded focus:outline-none text-[10px]"
                        />
                      ) : (
                        <div className="text-center text-[10px]">{planet.requester || '-'}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modals */}
        <AnimatePresence>
          {showAddPlanetModal && (
            <motion.div 
              key="add-planet-modal"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddPlanetModal(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-[#1A1A1A] border border-[#333] p-6 rounded-lg shadow-2xl"
              >
                <h2 className="text-lg font-bold mb-4 uppercase tracking-tight">Add New Planet</h2>
                <form onSubmit={handleAddPlanet} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Planet Name</label>
                    <input 
                      type="text" required value={newPlanet.name}
                      onChange={(e) => setNewPlanet(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Ring</label>
                      <select 
                        value={newPlanet.ring}
                        onChange={(e) => setNewPlanet(prev => ({ ...prev, ring: Number(e.target.value) }))}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                      >
                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>Ring {r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Enemy</label>
                      <select 
                        value={newPlanet.enemy}
                        onChange={(e) => setNewPlanet(prev => ({ ...prev, enemy: e.target.value }))}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                      >
                        {ENEMY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Quarcs</label>
                    <select 
                      value={newPlanet.quarcs}
                      onChange={(e) => setNewPlanet(prev => ({ ...prev, quarcs: e.target.value }))}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                    >
                      {QUARCS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddPlanetModal(false)}
                      className="flex-1 bg-[#333] text-white py-2 text-xs font-bold rounded uppercase"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-[#90EE90] text-[#2A2A2A] py-2 text-xs font-bold rounded uppercase"
                    >
                      Add Planet
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {showAuthModal && (
            <motion.div 
              key="auth-modal"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-sm bg-[#1A1A1A] border border-[#333] p-8 rounded-lg shadow-2xl"
              >
                <h2 className="text-xl font-bold mb-6 uppercase tracking-tight text-center">
                  {authMode === 'login' ? 'Editor Access' : 'Create Account'}
                </h2>
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Nickname</label>
                    <input 
                      type="text" required value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-3 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Password</label>
                    <input 
                      type="password" required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-3 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                    />
                  </div>
                  {authError && <p className="text-red-400 text-[10px] uppercase font-bold">{authError}</p>}
                  <button type="submit" className="w-full bg-[#90EE90] text-[#2A2A2A] py-3 text-xs font-bold rounded uppercase tracking-widest">
                    {authMode === 'login' ? 'Login' : 'Sign Up'}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-[10px] uppercase opacity-50 hover:opacity-100 transition-opacity"
                  >
                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showAdminModal && (
            <motion.div 
              key="admin-modal"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdminModal(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-2xl bg-[#1A1A1A] border border-[#333] p-6 rounded-lg shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-tight">User Management</h2>
                  <button onClick={() => setShowAdminModal(false)}><X size={18} /></button>
                </div>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {allProfiles.filter(p => p.role !== 'admin').map(p => (
                    <div key={p.auth_id} className="bg-[#2A2A2A] p-4 rounded border border-[#333] flex items-center justify-center gap-4">
                      <div className="flex-1">
                        <div className="text-xs font-bold">{p.uid}</div>
                        <div className={`text-[9px] uppercase font-bold ${p.approved ? 'text-[#90EE90]' : 'text-yellow-500'}`}>
                          {p.approved ? 'Approved' : 'Pending Approval'}
                        </div>
                      </div>
                      {!p.approved && (
                        <button 
                          onClick={() => approveUser(p.auth_id)}
                          className="bg-[#90EE90] text-[#2A2A2A] px-4 py-1.5 text-[10px] uppercase font-bold rounded hover:opacity-90"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  ))}
                  {allProfiles.filter(p => p.role !== 'admin').length === 0 && (
                    <p className="text-center text-xs opacity-50 py-8">No users found.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {showAddModal && (
            <motion.div 
              key="add-drop-modal"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
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
                      required value={newDrop.planet_id}
                      onChange={(e) => setNewDrop(prev => ({ ...prev, planet_id: e.target.value }))}
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
                    <label className="text-[10px] uppercase opacity-50 block mb-1">System</label>
                    <select 
                      required value={newDrop.system}
                      onChange={(e) => setNewDrop(prev => ({ ...prev, system: e.target.value }))}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                    >
                      <option value="">Select System...</option>
                      {['Vega', 'Antares', 'Gemini', 'Mizar', 'Sol', 'Draconis', 'Sirius'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Type</label>
                    <select 
                      required value={newDrop.type}
                      onChange={(e) => setNewDrop(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                    >
                      <option value="">Select Type...</option>
                      {['Rapid', 'Long', 'Normal', 'Strong'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Item</label>
                    <input 
                      type="text" required value={newDrop.tech_name}
                      onChange={(e) => setNewDrop(prev => ({ ...prev, tech_name: e.target.value }))}
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
            </motion.div>
          )}

          {editingPlanet && (
            <motion.div 
              key="edit-planet-modal"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
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
                      type="text" value={editingPlanet.base_coords || ''}
                      onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, base_coords: e.target.value }) : null)}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#90EE90] text-[#2A2A2A] py-2 text-xs font-bold rounded mt-4">Save Changes</button>
                </form>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
