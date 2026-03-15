export interface Planet {
  id: string;
  name: string;
  ring: number;
  enemy?: string;
  quarcs?: string;
  lastCM?: string;
  baseCoords?: string;
  collapseTime?: string; // ISO String
  respawnTime?: string; // ISO String
  status?: 'Active' | 'Collapsed';
}

export type TechCategory = 'WU' | 'MU' | 'SU' | 'CU' | 'Amarna' | 'Soris' | 'Giza';

export interface Drop {
  id: string;
  planetId: string;
  category: TechCategory;
  techName: string;
  editor?: string;
  requester?: string;
  updatedAt: string; // ISO String
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}
