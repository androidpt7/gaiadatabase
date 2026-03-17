/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { Planet, Drop, UserProfile, TechCategory, Message } from './types';
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
  X,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@supabase/supabase-js';

const CATEGORIES: TechCategory[] = ['WU', 'MU', 'SU', 'CU', 'Amarna', 'Soris', 'Giza'];
const ENEMY_OPTIONS = ['-', 'Ancient', 'Mantis', 'Pirates', 'Methanoid', 'Imperials'];
const QUARCS_OPTIONS = ['-', 'Ecoglyte', 'Oolyte', 'Dolomyte', 'Kenyte', 'Clay'];

const parseTechName = (techName: string) => {
  if (!techName) return { system: '', type: 'Normal', item: '' };

  const sysMapRev: Record<string, string> = {
    'V': 'Vega', 'A': 'Antares', 'G': 'Gemini', 'M': 'Mizar', 'So': 'Sol', 'D': 'Draconis', 'Si': 'Sirius'
  };
  const typeMapRev: Record<string, string> = {
    'R': 'Rapid', 'L': 'Long', 'St': 'Strong'
  };
  
  let system = '';
  let type = 'Normal';
  let item = techName;

  const parts = techName.split(' ');
  if (parts.length >= 2) {
    if (sysMapRev[parts[0]]) {
      system = sysMapRev[parts[0]];
      if (typeMapRev[parts[1]]) {
        type = typeMapRev[parts[1]];
        item = parts.slice(2).join(' ');
      } else {
        item = parts.slice(1).join(' ');
      }
    }
  }

  if (item.endsWith('s')) {
    item = item.slice(0, -1);
  }

  return { system, type, item };
};

// Icon mapping
const ITEM_ICONS: Record<string, string> = {
  'Blaster': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/blaster.png',
  'Collector': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/collector.png',
  'Repair Droid': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/repair_droid.png',
  'Afterburner': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/afterburner.png',
  'Rocket': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/rockets.png',
  'Shield': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/shield.png',
  'Repair Target': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/repair_target.png',
  'Speed Actuator': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/speed_actuator.png',
  'Aim Computer': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/aim_computer.png',
  'Taunt': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/taunt.png',
  'Protector': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/protector.png',
  'Stun Charge': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/stun_charge.png',
  'Perforator': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/perforator.png',
  'Aim Scrambler': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/aim_scrambler.png',
  'Repair Field': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/repair_field.png',
  'Aggro Beacon': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/aggro_beacon.png',
  'Thermoblast': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/thermoblast.png',
  'Aggro Bomb': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/aggro_bomb.png',
  'Materializer': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/materializer.png',
  'Stun Dome': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/stun_dome.png',
  'Sniper Blaster': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/sniper_blaster.png',
  'Attack Droid': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/attack_droid.png',
  'Orbital Strike': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/orbital.png',
  'Attack Charge': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/attack_charge.png',
  'Repair Turret': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/repair_turret.png',
  'Attack Turret': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/attack_turret.png',
  'Sticky Bomb': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/sticky_bomb.png',
  'Minelayer': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/mine.png',
  'Color Pattern': 'https://raw.githubusercontent.com/androidpt7/itempg/main/icons/pattern.png',
};

const getAbbreviation = (system: string, type: string) => {
  const sysMap: Record<string, string> = {
    'Vega': 'V', 'Antares': 'A', 'Gemini': 'G', 'Mizar': 'M', 'Sol': 'So', 'Draconis': 'D', 'Sirius': 'Si'
  };
  const typeMap: Record<string, string> = {
    'Rapid': 'R', 'Long': 'L', 'Normal': '', 'Strong': 'St'
  };
  return `${sysMap[system] || ''} ${typeMap[type] || ''}`.trim();
};

const formatTechName = (techName: string) => {
  const parsed = parseTechName(techName);
  if (parsed.system) {
    const abbr = getAbbreviation(parsed.system, parsed.type);
    return `${abbr} ${parsed.item}`.trim();
  }
  return techName;
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
  const [selectedRing, setSelectedRing] = useState<number | 'all'>(5);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPlanetModal, setShowAddPlanetModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [editingPlanet, setEditingPlanet] = useState<Planet | null>(null);
  const [editingDrop, setEditingDrop] = useState<{ planetId: string, category: TechCategory, initialValue: string } | null>(null);
  const [isSpreadsheetMode, setIsSpreadsheetMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPlanetId, setRequestPlanetId] = useState('');
  const [requestContent, setRequestContent] = useState('');
  const [requestSenderName, setRequestSenderName] = useState('');
  const [adminTab, setAdminTab] = useState<'users' | 'messages'>('users');
  
  const formatForInput = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatForDisplay = (isoString?: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    const datePart = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    
    return (
      <div className="flex flex-col items-center leading-tight">
        <span>{datePart}</span>
        <span>{timePart}</span>
      </div>
    );
  };

  const isCollapsed = (collapse_time?: string) => {
    if (!collapse_time) return false;
    const collapseDate = new Date(collapse_time);
    if (isNaN(collapseDate.getTime())) return false;
    return new Date() > collapseDate;
  };

  const getEdtString = (date: Date) => {
    return date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkExpired = async () => {
      const now = new Date();
      const expiredPlanets = planets.filter(p => p.respawn_time && new Date(p.respawn_time) <= now);
      if (expiredPlanets.length > 0) {
        for (const planet of expiredPlanets) {
          await supabase.from('planets').delete().eq('id', planet.id);
        }
        fetchPlanets();
      }
    };
    const timer = setInterval(checkExpired, 10000);
    return () => clearInterval(timer);
  }, [planets]);

  const [newDrop, setNewDrop] = useState({ 
    id: '',
    planet_id: '', 
    category: 'WU' as TechCategory, 
    tech_name: '',
    requester: '',
    system: '',
    item: '',
    type: ''
  });

  useEffect(() => {
    if (newDrop.planet_id && newDrop.category) {
      const existingDrops = getDropsForPlanet(newDrop.planet_id, newDrop.category);
      const idExists = existingDrops.some(d => d.id === newDrop.id);
      
      if (!idExists && newDrop.id !== '') {
        setNewDrop(prev => ({ ...prev, id: '', system: '', type: '', item: '', tech_name: '' }));
      } else if (
        !newDrop.id && 
        (
          ['WU', 'MU', 'SU', 'CU'].includes(newDrop.category) || 
          (['Amarna', 'Soris', 'Giza'].includes(newDrop.category) && existingDrops.length >= 3)
        ) && 
        existingDrops.length > 0
      ) {
        const drop = existingDrops[0];
        const parsed = parseTechName(drop.tech_name);
        setNewDrop(prev => ({
          ...prev,
          id: drop.id,
          system: parsed.system,
          type: parsed.type,
          item: parsed.item,
          tech_name: drop.tech_name
        }));
      }
    }
  }, [newDrop.planet_id, newDrop.category, drops]);

  const updateTechName = (system: string, type: string, item: string) => {
    const abbr = getAbbreviation(system, type);
    setNewDrop(prev => ({ 
      ...prev, 
      system, 
      type, 
      item,
      tech_name: `${abbr} ${item}`.trim() 
    }));
  };

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

  const fetchMessages = async () => {
    if (profile?.role !== 'admin') return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }
    if (data) setMessages(data as Message[]);
  };

  useEffect(() => {
    if (profile?.role === 'admin' && showAdminModal) {
      fetchMessages();
      const sub = supabase
        .channel('messages_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchMessages)
        .subscribe();
      return () => { sub.unsubscribe(); };
    }
  }, [profile, showAdminModal]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestPlanetId || !requestContent) return;

    const { error } = await supabase.from('messages').insert([{
      planet_id: requestPlanetId,
      content: requestContent,
      sender_name: requestSenderName || 'Anonymous',
      status: 'pending'
    }]);

    if (error) {
      console.error("Error sending request:", error);
      alert("Error sending request. Please try again.");
    } else {
      setShowRequestModal(false);
      setRequestPlanetId('');
      setRequestContent('');
      setRequestSenderName('');
      alert("Request sent successfully!");
    }
  };

  const handleUpdateMessageStatus = async (id: string, status: Message['status']) => {
    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', id);
    if (error) console.error("Error updating message status:", error);
    else fetchMessages();
  };

  const handleDeleteMessage = async (id: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);
    if (error) console.error("Error deleting message:", error);
    else fetchMessages();
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
      console.error("Failed to approve user: " + error.message);
    }
  };

  const removeUser = async (auth_id: string) => {
    if (profile?.role !== 'admin') return;
    
    // Removed window.confirm as it doesn't work in iframes

    // Optimistic update
    setAllProfiles(prev => prev.filter(p => p.auth_id !== auth_id));

    // Call the custom RPC function to delete the user from auth.users
    // This will automatically cascade and delete the profile as well
    const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: auth_id });
      
    if (error) {
      console.error("Error removing user:", error);
      fetchAllProfiles();
      console.error("Failed to remove user: " + error.message);
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
    status: 'Active' as const,
    collapse_time: '',
    requester: ''
  });

  const handleAddPlanet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.role !== 'admin') return;

    try {
      let respawn_time = null;
      let collapse_time = null;
      
      if (newPlanet.collapse_time) {
        const collapseDate = new Date(newPlanet.collapse_time);
        if (!isNaN(collapseDate.getTime())) {
          collapse_time = collapseDate.toISOString();
          respawn_time = new Date(collapseDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
        }
      }

      const planetData = {
        name: newPlanet.name,
        ring: newPlanet.ring,
        enemy: newPlanet.enemy,
        quarcs: newPlanet.quarcs,
        status: newPlanet.status,
        collapse_time,
        respawn_time,
        requester: newPlanet.requester
      };

      const { error } = await supabase.from('planets').insert([planetData]);
      if (error) throw error;
      setShowAddPlanetModal(false);
      setNewPlanet({ name: '', ring: 5, enemy: '-', quarcs: '-', status: 'Active', collapse_time: '', requester: '' });
      fetchPlanets();
    } catch (err) {
      console.error("Error adding planet:", err);
    }
  };

  useEffect(() => {
    if (showAddModal && newDrop.planet_id && newDrop.category) {
      const existingDrops = getDropsForPlanet(newDrop.planet_id, newDrop.category);
      if (existingDrops.length > 0) {
        const dropToEdit = existingDrops[0];
        const parsed = parseTechName(dropToEdit.tech_name);
        setNewDrop(prev => ({
          ...prev,
          id: dropToEdit.id,
          system: parsed.system,
          type: parsed.type,
          item: parsed.item,
          tech_name: dropToEdit.tech_name
        }));
      } else {
        setNewDrop(prev => ({
          ...prev,
          id: '',
          system: '',
          type: '',
          item: '',
          tech_name: ''
        }));
      }
    }
  }, [newDrop.planet_id, newDrop.category, showAddModal]);

  const updatePlanetEditor = async (planetId: string) => {
    if (!user) return;
    const currentNickname = profile?.uid || user.email;
    if (!currentNickname) return;

    // Fetch latest planet data to avoid overwriting other editors
    const { data: planetData } = await supabase.from('planets').select('editor').eq('id', planetId).single();
    if (!planetData) return;

    let editors = planetData.editor ? planetData.editor.split(',').map((e: string) => e.trim()).filter((e: string) => e !== '' && e !== '-') : [];
    if (!editors.includes(currentNickname)) {
      editors.push(currentNickname);
      const newEditorString = editors.join(', ');
      await supabase.from('planets').update({ editor: newEditorString }).eq('id', planetId);
      fetchPlanets();
    }
  };

  const handleAddDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDrop.planet_id || !newDrop.tech_name || !newDrop.system || !newDrop.type || !newDrop.item) return;

    try {
      if (newDrop.id) {
        // Update existing drop
        const { data: updateData, error: updateError } = await supabase.from('drops')
          .update({
            planet_id: newDrop.planet_id,
            category: newDrop.category,
            tech_name: newDrop.tech_name,
            editor: profile?.uid || user.email
          })
          .eq('id', newDrop.id)
          .select();
        
        if (updateError) {
          console.error("Error updating drop: " + updateError.message);
          alert("Error updating drop: " + updateError.message);
          return;
        }
        
        if (!updateData || updateData.length === 0) {
          console.warn("You don't have permission to edit this drop or it no longer exists.");
          alert("You don't have permission to edit this drop. Please check your database permissions (RLS).");
          return;
        }
        
        await updatePlanetEditor(newDrop.planet_id);
        await fetchDrops();
      } else {
        // Insert new drop
        const existingDrops = getDropsForPlanet(newDrop.planet_id, newDrop.category);
        if (['WU', 'MU', 'SU', 'CU'].includes(newDrop.category) && existingDrops.length > 0) {
          console.warn(`Category ${newDrop.category} already has an item registered on this planet.`);
          return;
        }
        if (['Amarna', 'Soris', 'Giza'].includes(newDrop.category) && existingDrops.length >= 3) {
          console.warn(`${newDrop.category} can have at most 3 technologies.`);
          return;
        }
        
        const { error } = await supabase.from('drops').insert([{
          planet_id: newDrop.planet_id,
          category: newDrop.category,
          tech_name: newDrop.tech_name,
          editor: profile?.uid || user.email,
          created_at: new Date().toISOString()
        }]);
        
        if (error) {
          console.error("Error inserting: " + error.message);
          return;
        }
        await updatePlanetEditor(newDrop.planet_id);
        await fetchDrops();
      }
      
      setShowAddModal(false);
      setNewDrop({ id: '', planet_id: '', category: 'WU', tech_name: '', requester: '', system: '', item: '', type: '' });
      fetchDrops();
    } catch (err: any) {
      console.error("Unexpected error: " + err.message);
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
      
      let respawn_time = data.respawn_time;
      let collapse_time = data.collapse_time;
      
      if (collapse_time) {
        const collapseDate = new Date(collapse_time);
        if (!isNaN(collapseDate.getTime())) {
          collapse_time = collapseDate.toISOString();
        } else {
          collapse_time = null;
        }
      } else {
        collapse_time = null;
      }

      if (respawn_time) {
        const respawnDate = new Date(respawn_time);
        if (!isNaN(respawnDate.getTime())) {
          respawn_time = respawnDate.toISOString();
        } else {
          respawn_time = null;
        }
      } else {
        respawn_time = null;
      }
      
      const updateData = {
        ...data,
        collapse_time,
        respawn_time
      };
      
      await supabase.from('planets').update(updateData).eq('id', id);
      setEditingPlanet(null);
      fetchPlanets();
    } catch (err) {
      console.error("Error updating planet:", err);
    }
  };

  const updatePlanetField = async (planet_id: string, field: string, value: any) => {
    let updates: any = { [field]: value };
    
    if (field === 'collapse_time') {
      if (value) {
        const collapseDate = new Date(value);
        if (!isNaN(collapseDate.getTime())) {
          updates.collapse_time = collapseDate.toISOString();
          updates.respawn_time = new Date(collapseDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
        } else {
          updates.collapse_time = null;
          updates.respawn_time = null;
        }
      } else {
        updates.collapse_time = null;
        updates.respawn_time = null;
      }
    } else if (field === 'respawn_time') {
      if (value) {
        const respawnDate = new Date(value);
        if (!isNaN(respawnDate.getTime())) {
          updates.respawn_time = respawnDate.toISOString();
        } else {
          updates.respawn_time = null;
        }
      } else {
        updates.respawn_time = null;
      }
    }

    const { error } = await supabase
      .from('planets')
      .update(updates)
      .eq('id', planet_id);
    if (error) console.error(error);
    else fetchPlanets();
  };

  const updateTechField = async (planet_id: string, category: TechCategory, value: string) => {
    const planet = planets.find(p => p.id === planet_id);
    const restrictedCategories = ['Amarna', 'Soris', 'Giza'];
    
    if (restrictedCategories.includes(category)) {
      if (planet && planet.ring !== 5) {
        console.warn(`${category} can only be added to R5 planets.`);
        return;
      }
      
      const techNames = value.split('\n').filter(t => t.trim() !== '');
      if (techNames.length > 3) {
        console.warn(`${category} can have at most 3 technologies.`);
        return;
      }
    }

    const techNames = value.split('\n').filter(t => t.trim() !== '');
    const { error: deleteError } = await supabase.from('drops').delete().eq('planet_id', planet_id).eq('category', category);
    
    if (deleteError) {
      console.error("Error clearing old drops:", deleteError);
      alert("Error clearing old drops. Please check your database permissions (RLS).");
      return;
    }

    if (techNames.length > 0) {
      const newDrops = techNames.map(name => ({
        planet_id,
        category,
        tech_name: name.trim(),
        editor: profile?.uid || user?.email,
        created_at: new Date().toISOString()
      }));
      const { error: insertError } = await supabase.from('drops').insert(newDrops);
      if (insertError) {
        console.error("Error inserting new drops:", insertError);
        alert("Error inserting new drops. Please check your database permissions (RLS).");
        return;
      }
    }
    await updatePlanetEditor(planet_id);
    fetchDrops();
  };

  const handleDeletePlanet = async (id: string) => {
    console.log("handleDeletePlanet called for:", id, "Profile:", profile);
    if (!profile || profile.role !== 'admin') {
      console.warn("Delete failed: User is not an admin or profile not loaded.");
      return;
    }
    // Removed window.confirm as it doesn't work in iframes
    const { error } = await supabase.from('planets').delete().eq('id', id);
    if (error) {
      console.error("Error deleting planet:", error);
    } else {
      console.log("Planet deleted successfully");
      fetchPlanets();
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
          <div className="flex flex-col">
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Sirius Tracker</div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono opacity-30 uppercase">EDT:</span>
              <span className="text-[10px] font-mono font-bold text-[#90EE90]">{getEdtString(currentTime)}</span>
            </div>
          </div>
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
          <button 
            onClick={() => setShowRequestModal(true)}
            className="bg-[#333] hover:bg-[#444] px-4 py-1.5 text-[10px] uppercase font-bold transition-colors rounded flex items-center gap-2"
          >
            <MessageSquare size={12} />
            Request
          </button>
        </div>
      </header>

      {/* Community Notice */}
      <div className="bg-[#1A1A1A] border-b border-[#333] px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-[#90EE90]/10 p-1.5 rounded">
            <Database size={14} className="text-[#90EE90]" />
          </div>
          <p className="text-[10px] md:text-[11px] leading-relaxed opacity-70 italic">
            <span className="font-bold text-[#90EE90] not-italic mr-1">Community Notice:</span>
            We kindly ask all members to maintain a spirit of cordiality and responsibility. 
            The integrity of this database depends on accurate information and mutual respect. 
            Please ensure all entries are verified and help us preserve this collective resource for everyone.
          </p>
        </div>
      </div>

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
                <Edit2 size={14} />
                Edit Drop
              </button>
            </div>
          )}

          {profile?.role === 'admin' && planets.length === 0 && (
            <button onClick={seedInitialData} className="text-[10px] opacity-30 hover:opacity-100">Seed Data</button>
          )}
        </div>

        {/* Database Table */}
        <div className="bg-[#2A2A2A] rounded overflow-visible border border-[#333]">
          <table className="w-full border-collapse text-[11px] min-w-[1400px]">
            <thead>
              <tr className="bg-[#5CB85C] text-[#1A1A1A] font-bold uppercase">
                <th className="border border-[#444] p-1 w-16 rounded-tl">Ring</th>
                <th className="border border-[#444] p-1 w-40">Planet</th>
                {CATEGORIES.map(cat => (
                  <th key={cat} className="border border-[#444] p-1 w-32 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {cat}
                      <div className="relative flex items-center group/tooltip">
                        <HelpCircle className="w-2.5 h-2.5 text-[#1A1A1A] opacity-50 hover:opacity-100 cursor-help" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover/tooltip:block w-max min-w-[140px] bg-[#1A1A1A] text-white border border-[#444] rounded shadow-2xl p-2 text-left z-50 text-[9px] font-normal normal-case">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-bold text-[#90EE90]">PT:</span>
                              <span className="opacity-90 text-right">{
                                cat === 'WU' ? 'Unidades Fracas' :
                                cat === 'MU' ? 'Unidades Médias' :
                                cat === 'SU' ? 'Unidades Fortes' :
                                cat === 'CU' ? 'Unidades Comandantes (Chefe)' :
                                'Grande Chefe'
                              }</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-bold text-[#90EE90]">EN:</span>
                              <span className="opacity-90 text-right">{
                                cat === 'WU' ? 'Weak Units' :
                                cat === 'MU' ? 'Medium Units' :
                                cat === 'SU' ? 'Strong Units' :
                                cat === 'CU' ? 'Commander Units (Boss)' :
                                'Big Boss'
                              }</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-bold text-[#90EE90]">ES:</span>
                              <span className="opacity-90 text-right">{
                                cat === 'WU' ? 'Unidades Débiles' :
                                cat === 'MU' ? 'Unidades Medias' :
                                cat === 'SU' ? 'Unidades Fuertes' :
                                cat === 'CU' ? 'Unidades Comandantes (Jefe)' :
                                'Gran Jefe'
                              }</span>
                            </div>
                            <div className="pt-1 mt-1 border-t border-[#444] flex items-center justify-between gap-3">
                              <span className="font-bold text-[#FFD700]">Needed BP's:</span>
                              <span className="opacity-90 text-right font-bold">{
                                cat === 'WU' ? '18' :
                                cat === 'MU' ? '14' :
                                cat === 'SU' ? '12' :
                                cat === 'CU' ? '5' :
                                '2'
                              }</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="border border-[#444] p-1 w-24">Enemy</th>
                <th className="border border-[#444] p-1 w-24">Quarcs</th>
                <th className="border border-[#444] p-1 w-24">Collapse</th>
                <th className="border border-[#444] p-1 w-24">Respawn</th>
                <th className="border border-[#444] p-1 w-24">Editor</th>
                <th className="border border-[#444] p-1 w-24 rounded-tr">Requester</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlanets.map((planet) => {
                const isEditing = isSpreadsheetMode && profile?.approved;
                const collapsed = isCollapsed(planet.collapse_time);
                
                return (
                  <tr key={planet.id} className="hover:bg-[#333] transition-colors group">
                    <td className="border border-[#444] p-1 text-center font-mono">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs">{planet.ring}</span>
                        {isEditing && profile?.role === 'admin' && (
                          <div className="flex flex-col gap-1 w-full px-1">
                            <button 
                              onClick={() => setEditingPlanet(planet)}
                              className="w-full bg-[#1A1A1A] border border-[#444] px-1 py-0.5 rounded text-[9px] hover:bg-blue-900 hover:text-white transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeletePlanet(planet.id)}
                              className="w-full bg-[#1A1A1A] border border-[#444] px-1 py-0.5 rounded text-[9px] hover:bg-red-900 hover:text-white transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-[#444] p-1">
                      <div className="flex flex-col items-center justify-center">
                        <div className={`font-bold px-1 text-[10px] text-center ${collapsed ? 'text-red-500 line-through' : ''}`}>
                          {planet.name}
                        </div>
                        {collapsed && (
                          <div className="text-[9px] text-white">(To be replaced)</div>
                        )}
                      </div>
                    </td>
                    
                    {CATEGORIES.map(cat => {
                      const planetDrops = getDropsForPlanet(planet.id, cat);
                      const techValue = planetDrops.map(d => formatTechName(d.tech_name)).join('\n');
                      
                      return (
                        <td key={cat} className="border border-[#444] p-1 align-middle text-center">
                          {isEditing ? (
                            <div 
                              onClick={() => {
                                if (['Amarna', 'Soris', 'Giza'].includes(cat) && planet.ring !== 5) return;
                                setEditingDrop({ planetId: planet.id, category: cat, initialValue: techValue });
                              }}
                              className={`w-full min-h-[24px] bg-[#1A1A1A] border border-[#444] p-1 rounded cursor-pointer hover:border-[#90EE90] text-[10px] leading-tight ${['Amarna', 'Soris', 'Giza'].includes(cat) && planet.ring !== 5 ? 'opacity-50 cursor-not-allowed' : ''} text-center flex flex-col items-center justify-center gap-0.5`}
                            >
                              {techValue ? (
                                planetDrops.map(drop => {
                                  const parsed = parseTechName(drop.tech_name);
                                  return (
                                    <div key={drop.id} className="bg-[#333] px-1 rounded text-[9px] truncate w-full flex items-center gap-1">
                                      {(() => {
                                        const iconKey = parsed.item;
                                        return ITEM_ICONS[iconKey] ? (
                                          <img src={ITEM_ICONS[iconKey]} alt={parsed.item} className="w-3 h-3 object-contain" referrerPolicy="no-referrer" />
                                        ) : null;
                                      })()}
                                      <span className={parsed.system === 'Sirius' ? 'text-orange-500' : ''}>{formatTechName(drop.tech_name)}</span>
                                    </div>
                                  );
                                })
                              ) : (
                                <span className="text-[#666] italic">Edit</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-0.5 h-full">
                              {planetDrops.map(drop => {
                                const parsed = parseTechName(drop.tech_name);
                                return (
                                  <div key={drop.id} className="bg-[#333] px-1 rounded text-[9px] truncate w-full flex items-center gap-1">
                                    {(() => {
                                      const iconKey = parsed.item;
                                      return ITEM_ICONS[iconKey] ? (
                                        <img src={ITEM_ICONS[iconKey]} alt={parsed.item} className="w-3 h-3 object-contain" referrerPolicy="no-referrer" />
                                      ) : null;
                                    })()}
                                    <span className={parsed.system === 'Sirius' ? 'text-orange-500' : ''}>{formatTechName(drop.tech_name)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="border border-[#444] p-1">
                      <div className="text-center">{planet.enemy || '-'}</div>
                    </td>

                    <td className="border border-[#444] p-1">
                      <div className="text-center">{planet.quarcs || '-'}</div>
                    </td>

                    <td className="border border-[#444] p-1">
                      <div className={`text-center text-[10px] ${collapsed ? 'text-red-500' : ''}`}>
                        {formatForDisplay(planet.collapse_time)}
                      </div>
                    </td>

                    <td className="border border-[#444] p-1">
                      <div className="text-center text-[10px] text-green-500">
                        {formatForDisplay(planet.respawn_time)}
                      </div>
                    </td>

                    <td className="border border-[#444] p-1">
                      <div className="text-center text-[10px]">{planet.editor || '-'}</div>
                    </td>

                    <td className="border border-[#444] p-1">
                      <div className="text-center text-[10px]">{planet.requester || '-'}</div>
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
          {editingDrop && (
            <motion.div 
              key="edit-drop-modal"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingDrop(null)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-sm bg-[#1A1A1A] border border-[#333] p-6 rounded-lg shadow-2xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold uppercase tracking-tight">Edit {editingDrop.category}</h2>
                  <button onClick={() => setEditingDrop(null)}><X size={18} /></button>
                </div>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateTechField(editingDrop.planetId, editingDrop.category, editingDrop.initialValue);
                    setEditingDrop(null);
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Technologies (one per line)</label>
                    <textarea 
                      value={editingDrop.initialValue}
                      onChange={(e) => setEditingDrop(prev => prev ? ({ ...prev, initialValue: e.target.value }) : null)}
                      rows={['Amarna', 'Soris', 'Giza'].includes(editingDrop.category) ? 3 : 2}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90] resize-none"
                      placeholder="e.g. WU 1&#10;WU 2"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setEditingDrop(null)}
                      className="flex-1 bg-[#333] text-white py-2 text-xs font-bold rounded uppercase"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-[#90EE90] text-[#2A2A2A] py-2 text-xs font-bold rounded uppercase"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Planet Name</label>
                      <input 
                        type="text" required value={newPlanet.name}
                        onChange={(e) => setNewPlanet(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Requester</label>
                      <input 
                        type="text" value={newPlanet.requester}
                        onChange={(e) => setNewPlanet(prev => ({ ...prev, requester: e.target.value }))}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                        placeholder="Optional"
                      />
                    </div>
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
                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Collapse Time</label>
                      <input 
                        type="datetime-local"
                        value={newPlanet.collapse_time}
                        onChange={(e) => setNewPlanet(prev => ({ ...prev, collapse_time: e.target.value }))}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                      />
                    </div>
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
                className="relative w-full max-w-2xl bg-[#1A1A1A] border border-[#333] p-6 rounded-lg shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-tight">Admin Panel</h2>
                  <button onClick={() => setShowAdminModal(false)}><X size={18} /></button>
                </div>

                <div className="flex gap-4 mb-6 border-b border-[#333]">
                  <button 
                    onClick={() => setAdminTab('users')}
                    className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${adminTab === 'users' ? 'text-[#90EE90] border-b-2 border-[#90EE90]' : 'opacity-50 hover:opacity-100'}`}
                  >
                    Users
                  </button>
                  <button 
                    onClick={() => setAdminTab('messages')}
                    className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${adminTab === 'messages' ? 'text-[#90EE90] border-b-2 border-[#90EE90]' : 'opacity-50 hover:opacity-100'}`}
                  >
                    Messages
                    {messages.filter(m => m.status === 'pending').length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                        {messages.filter(m => m.status === 'pending').length}
                      </span>
                    )}
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {adminTab === 'users' ? (
                    <>
                      {allProfiles.filter(p => p.role !== 'admin').map(p => (
                        <div key={p.auth_id} className="bg-[#2A2A2A] p-4 rounded border border-[#333] flex items-center justify-center gap-4">
                          <div className="flex-1">
                            <div className="text-xs font-bold">{p.uid}</div>
                            <div className={`text-[9px] uppercase font-bold ${p.approved ? 'text-[#90EE90]' : 'text-yellow-500'}`}>
                              {p.approved ? 'Approved' : 'Pending Approval'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!p.approved && (
                              <button 
                                onClick={() => approveUser(p.auth_id)}
                                className="bg-[#90EE90] text-[#2A2A2A] px-4 py-1.5 text-[10px] uppercase font-bold rounded hover:opacity-90"
                              >
                                Approve
                              </button>
                            )}
                            <button 
                              onClick={() => removeUser(p.auth_id)}
                              className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-1.5 text-[10px] uppercase font-bold rounded hover:bg-red-500 hover:text-white transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      {allProfiles.filter(p => p.role !== 'admin').length === 0 && (
                        <p className="text-center text-xs opacity-50 py-8">No users found.</p>
                      )}
                    </>
                  ) : (
                    <>
                      {messages.map(m => {
                        const planet = planets.find(p => p.id === m.planet_id);
                        return (
                          <div key={m.id} className={`bg-[#2A2A2A] p-4 rounded border border-[#333] space-y-2 ${m.status === 'pending' ? 'border-l-4 border-l-[#90EE90]' : ''}`}>
                            <div className="flex justify-between items-start">
                              <div className="text-[10px] font-bold uppercase text-[#90EE90]">
                                Planet: {planet?.name || 'Unknown'}
                              </div>
                              <div className="text-[8px] opacity-50">
                                {new Date(m.created_at).toLocaleString()}
                              </div>
                            </div>
                            <p className="text-xs italic opacity-80">"{m.content}"</p>
                            <div className="flex justify-between items-center pt-2">
                              <div className="text-[9px] opacity-50 uppercase">From: {m.sender_name}</div>
                              <div className="flex gap-2">
                                {m.status === 'pending' && (
                                  <button 
                                    onClick={() => handleUpdateMessageStatus(m.id, 'read')}
                                    className="text-[9px] uppercase font-bold text-[#90EE90] hover:underline"
                                  >
                                    Mark as Read
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteMessage(m.id)}
                                  className="text-[9px] uppercase font-bold text-red-400 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {messages.length === 0 && (
                        <p className="text-center text-xs opacity-50 py-8">No messages found.</p>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {showRequestModal && (
            <motion.div 
              key="request-modal"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRequestModal(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-[#1A1A1A] border border-[#333] p-6 rounded-lg shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-tight">Send Request</h2>
                  <button onClick={() => setShowRequestModal(false)}><X size={18} /></button>
                </div>

                <form onSubmit={handleSendRequest} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Planet (Required)</label>
                    <select 
                      required
                      value={requestPlanetId}
                      onChange={(e) => setRequestPlanetId(e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                    >
                      <option value="">Select Planet...</option>
                      {planets.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (R{p.ring})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Your Name (Optional)</label>
                    <input 
                      type="text"
                      value={requestSenderName}
                      onChange={(e) => setRequestSenderName(e.target.value)}
                      placeholder="Anonymous"
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Message (Required)</label>
                    <textarea 
                      required
                      value={requestContent}
                      onChange={(e) => setRequestContent(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90] resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#90EE90] text-[#2A2A2A] py-2 text-xs font-bold rounded uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    Send Request
                  </button>
                </form>
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
                <h2 className="text-lg font-bold mb-4 uppercase tracking-tight">Edit Drop</h2>
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
                  
                  {newDrop.planet_id && newDrop.category && getDropsForPlanet(newDrop.planet_id, newDrop.category).length > 0 && (
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Action</label>
                      <select 
                        value={newDrop.id}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (selectedId === '') {
                            setNewDrop(prev => ({ ...prev, id: '', system: '', type: '', item: '', tech_name: '' }));
                          } else {
                            const drop = getDropsForPlanet(newDrop.planet_id, newDrop.category).find(d => d.id === selectedId);
                            if (drop) {
                              const parsed = parseTechName(drop.tech_name);
                              setNewDrop(prev => ({
                                ...prev,
                                id: drop.id,
                                system: parsed.system,
                                type: parsed.type,
                                item: parsed.item,
                                tech_name: drop.tech_name
                              }));
                            }
                          }
                        }}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                      >
                        {(['WU', 'MU', 'SU', 'CU'].includes(newDrop.category) || (['Amarna', 'Soris', 'Giza'].includes(newDrop.category) && getDropsForPlanet(newDrop.planet_id, newDrop.category).length >= 3)) ? null : <option value="">-- Add New --</option>}
                        {getDropsForPlanet(newDrop.planet_id, newDrop.category).map(d => (
                          <option key={d.id} value={d.id}>Edit: {formatTechName(d.tech_name)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">System</label>
                    <select 
                      required value={newDrop.system}
                      onChange={(e) => updateTechName(e.target.value, newDrop.type, newDrop.item)}
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
                      onChange={(e) => updateTechName(newDrop.system, e.target.value, newDrop.item)}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                    >
                      <option value="">Select Type...</option>
                      {['Rapid', 'Long', 'Normal', 'Strong'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Item</label>
                    <select 
                      required value={newDrop.item}
                      onChange={(e) => updateTechName(newDrop.system, newDrop.type, e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                    >
                      <option value="">Select Item...</option>
                      {Object.keys(ITEM_ICONS).map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Tech Name (Auto)</label>
                    <input 
                      type="text" readOnly value={newDrop.tech_name}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none opacity-50"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-[#333] py-2 text-xs font-bold rounded">Cancel</button>
                    <button type="submit" className="flex-1 bg-[#90EE90] text-[#2A2A2A] py-2 text-xs font-bold rounded">Save Drop</button>
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
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Planet Name</label>
                      <input 
                        type="text" required value={editingPlanet.name}
                        onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Requester</label>
                      <input 
                        type="text" value={editingPlanet.requester || ''}
                        onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, requester: e.target.value }) : null)}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Ring</label>
                      <select 
                        value={editingPlanet.ring}
                        onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, ring: Number(e.target.value) }) : null)}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                      >
                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>Ring {r}</option>)}
                      </select>
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Enemy</label>
                      <select 
                        value={editingPlanet.enemy || '-'}
                        onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, enemy: e.target.value }) : null)}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                      >
                        {ENEMY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Quarcs</label>
                      <select 
                        value={editingPlanet.quarcs || '-'}
                        onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, quarcs: e.target.value }) : null)}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none"
                      >
                        {QUARCS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Collapse Time</label>
                      <input 
                        type="datetime-local"
                        value={formatForInput(editingPlanet.collapse_time)}
                        onChange={(e) => {
                          const newCollapse = e.target.value;
                          setEditingPlanet(prev => {
                            if (!prev) return null;
                            let newRespawn = prev.respawn_time;
                            if (newCollapse) {
                              const collapseDate = new Date(newCollapse);
                              if (!isNaN(collapseDate.getTime())) {
                                newRespawn = new Date(collapseDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
                              }
                            }
                            return { ...prev, collapse_time: newCollapse, respawn_time: newRespawn };
                          });
                        }}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase opacity-50 block mb-1">Respawn Time</label>
                      <input 
                        type="datetime-local"
                        value={formatForInput(editingPlanet.respawn_time)}
                        onChange={(e) => setEditingPlanet(prev => prev ? ({ ...prev, respawn_time: e.target.value }) : null)}
                        className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-xs rounded focus:outline-none focus:border-[#90EE90]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setEditingPlanet(null)}
                      className="flex-1 bg-[#333] text-white py-2 text-xs font-bold rounded uppercase"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-[#90EE90] text-[#2A2A2A] py-2 text-xs font-bold rounded uppercase"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
