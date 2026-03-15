export interface Planet {
  id: string;
  name: string;
  ring: number;
  enemy?: string;
  quarcs?: string;
  lastCM?: string;
  baseCoords?: string;
  collapseTime?: string; // ISO String
  collapseDays?: number;
  collapseHours?: number;
  respawnTime?: string; // ISO String
  status?: 'Active' | 'Collapsed';
  editor?: string;
  requester?: string;
}

export type TechCategory = 'WU' | 'MU' | 'SU' | 'CU' | 'Amarna' | 'Soris' | 'Giza';

export interface Drop {
  id: string;
  planetId: string;
  category: TechCategory;
  techName: string;
  editor?: string;
  requester?: string;
  updated_at: string; // ISO String
}

export interface UserProfile {
  auth_id: string;
  uid: string; // This is the nickname
  email: string;
  role: 'admin' | 'user';
  approved: boolean;
}
