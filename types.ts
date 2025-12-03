// Navigation Types
export type PageView = 
  | 'landing' 
  | 'onboarding' 
  | 'loading' 
  | 'review' 
  | 'dashboard' 
  | 'transform' 
  | 'editor' 
  | 'analytics' 
  | 'memory' 
  | 'personas' 
  | 'settings';

export interface NavItem {
  id: PageView;
  label: string;
  icon: any; // Using Lucide icons
}

// Data Types (Placeholder)
export interface IdentityProfile {
  id: string;
  name: string;
  version: string;
  tone: string[];
  vocabulary: {
    frequent: string[];
    avoid: string[];
  };
  values: string[];
  rules: {
    always: string[];
    never: string[];
  };
  alignmentScore: number;
}

export interface TransformationItem {
  id: string;
  date: string;
  preview: string;
  score: number;
}

export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  dateAdded: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  avatarColor: string;
}
