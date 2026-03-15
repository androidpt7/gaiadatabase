export interface Planet {
  id: string;
  name: string;
  ring: number;
  enemy?: string;
  quarcs?: string;
  last_cm?: string;
  base_coords?: string;
  collapse_time?: string; // ISO String
  collapse_days?: number;
  collapse_hours?: number;
  respawn_time?: string; // ISO String
  status?: 'Active' | 'Collapsed';
  editor?: string;
  requester?: string;
}

export type TechCategory = 'WU' | 'MU' | 'SU' | 'CU' | 'Amarna' | 'Soris' | 'Giza';

export interface Drop {
  id: string;
  planet_id: string;
  category: TechCategory;
  tech_name: string;
  editor?: string;
  requester?: string;
  created_at: string; // ISO String
}

export interface UserProfile {
  auth_id: string;
  uid: string; // This is the nickname
  email: string;
  role: 'admin' | 'user';
  approved: boolean;
}
