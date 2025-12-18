export interface ActivityItem {
  action: string;
  time: string;
  icon: any;
}

export interface Project {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

export interface Template {
  id: string;
  title: string;
  updatedAt?: Date | string;
  createdAt?: Date | string;
  featured?: boolean;
  authorId?: string;
}

export interface RecentActivitiesCardProps {
  projects?: Project[];
  templates?: Template[];
}

export interface UserProfile {
  name?: string;
  email: string;
  address: string;
  joinDate: string;
  username: string;
  bio: string;
  avatar?: string;
  initials?: string;
}

export interface Stat {
  label: string;
  value: string;
  icon?: any;
  color?: string;
  bgColor?: string;
}

export interface ProfileHeroProps {
  profile: UserProfile;
  stats: Stat[];
  onEditClick?: () => void;
}

export interface PersonalInfoCardProps {
  profile: UserProfile;
}