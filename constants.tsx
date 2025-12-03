import { IdentityProfile, TransformationItem, MemoryItem, Persona } from './types';

export const MOCK_IDENTITY: IdentityProfile = {
  id: 'id-001',
  name: 'Professional Tech Lead',
  version: 'v2.4',
  tone: ['Direct', 'Professional', 'Encouraging', 'Clear'],
  vocabulary: {
    frequent: ['optimize', 'scalability', 'robust', 'perspective'],
    avoid: ['stuff', 'things', 'literally', 'kinda'],
  },
  values: ['Transparency', 'Efficiency', 'User-Centricity'],
  rules: {
    always: ['Use active voice', 'Provide context before code'],
    never: ['Use passive aggression', 'Oversimplify complex topics'],
  },
  alignmentScore: 92,
};

export const MOCK_TRANSFORMATIONS: TransformationItem[] = [
  { id: '1', date: '2 mins ago', preview: 'Email to engineering team about Q3 goals...', score: 9.4 },
  { id: '2', date: '1 hour ago', preview: 'Documentation for the new API endpoint...', score: 8.8 },
  { id: '3', date: 'Yesterday', preview: 'Response to client feedback regarding UI...', score: 9.1 },
];

export const MOCK_MEMORIES: MemoryItem[] = [
  { id: '1', title: 'Project Alpha Context', content: 'Use "Project Alpha" when referring to the new mobile initiative.', isActive: true, dateAdded: '2023-10-12' },
  { id: '2', title: 'Team Structure', content: 'My team consists of 4 backend and 3 frontend engineers.', isActive: true, dateAdded: '2023-11-05' },
  { id: '3', title: 'Preferred Sign-off', content: 'Always sign off emails with "Best regards, [Name]".', isActive: false, dateAdded: '2023-12-01' },
];

export const MOCK_PERSONAS: Persona[] = [
  { id: '1', name: 'Professional Work', description: 'For emails, slack messages, and documentation.', isActive: true, avatarColor: 'bg-blue-500' },
  { id: '2', name: 'Creative Writing', description: 'For blog posts and creative brainstorming.', isActive: false, avatarColor: 'bg-purple-500' },
  { id: '3', name: 'Casual Social', description: 'For social media and casual chats.', isActive: false, avatarColor: 'bg-green-500' },
];

export const DUMMY_JSON = JSON.stringify(MOCK_IDENTITY, null, 2);
