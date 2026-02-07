import React from 'react';
import { 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  HandHelping, 
  User as UserIcon, 
  Heart, 
  Star, 
  Zap, 
  Medal, 
  Settings, 
  Layers, 
  Leaf 
} from 'lucide-react';

export const SELECTABLE_ICONS = [
  { name: 'crown', icon: Crown },
  { name: 'shield', icon: ShieldCheck },
  { name: 'sparkles', icon: Sparkles },
  { name: 'hand-helping', icon: HandHelping },
  { name: 'user', icon: UserIcon },
  { name: 'heart', icon: Heart },
  { name: 'star', icon: Star },
  { name: 'zap', icon: Zap },
  { name: 'medal', icon: Medal },
  { name: 'settings', icon: Settings },
  { name: 'layers', icon: Layers },
  { name: 'leaf', icon: Leaf },
];

export const RoleIconComponent = ({ name, size = 16, className = "" }: { name?: string, size?: number, className?: string }) => {
  const IconComp = SELECTABLE_ICONS.find(i => i.name === name)?.icon || UserIcon;
  return <IconComp size={size} className={className} />;
};
