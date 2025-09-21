// Core types for the TeamMate Finder platform

export interface PersonalInfo {
  name: string
  email: string
  bio: string
  location: string
  timezone: string
  profilePhoto?: string
  languages: string[]
  age?: number
  occupation?: string
}

export interface Skill {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsExperience: number
  verified?: boolean
  category?: string
}

export interface Goal {
  id: string
  category: CollaborationCategory
  title: string
  description: string
  timeline: 'immediate' | '1-3 months' | '3-6 months' | '6-12 months' | 'long-term'
  commitment: 'casual' | 'part-time' | 'full-time' | 'flexible'
  priority: 'low' | 'medium' | 'high'
  specificOutcomes?: string[]
}

export interface Schedule {
  timezone: string
  availability: {
    monday: TimeSlot[]
    tuesday: TimeSlot[]
    wednesday: TimeSlot[]
    thursday: TimeSlot[]
    friday: TimeSlot[]
    saturday: TimeSlot[]
    sunday: TimeSlot[]
  }
  preferredMeetingTimes: string[]
  responseTime: 'immediate' | 'same-day' | 'within-24h' | 'within-week'
}

export interface TimeSlot {
  start: string // HH:MM format
  end: string   // HH:MM format
}

export interface MatchingPreferences {
  workingStyle: 'independent' | 'collaborative' | 'leader' | 'follower' | 'flexible'
  communicationStyle: 'direct' | 'diplomatic' | 'casual' | 'formal' | 'visual'
  meetingPreference: 'in-person' | 'remote' | 'hybrid' | 'no-preference'
  locationRadius?: number // in miles/km for in-person preferences
  maxTeamSize: number
  experienceLevel: 'beginner-friendly' | 'intermediate' | 'expert-only' | 'mixed'
  diversityPreferences?: string[]
  conflictResolution: 'discussion' | 'mediation' | 'voting' | 'leader-decides'
}

export type CollaborationCategory = 
  | 'business'
  | 'academic'
  | 'travel'
  | 'creative'
  | 'lifestyle'
  | 'professional'
  | 'volunteer'
  | 'sports'
  | 'technology'
  | 'learning'

export interface CategoryConfig {
  id: CollaborationCategory
  name: string
  description: string
  icon: string
  color: string
  subcategories: Subcategory[]
  requiredFields: string[]
  optionalFields: string[]
  matchingCriteria: MatchingCriteria
  suggestedSkills: string[]
  commonGoals: string[]
}

export interface Subcategory {
  id: string
  name: string
  description: string
  specificFields?: string[]
}

export interface MatchingCriteria {
  skillWeight: number        // 0-1, importance of skill matching
  goalWeight: number         // 0-1, importance of goal alignment
  personalityWeight: number  // 0-1, importance of personality fit
  locationWeight: number     // 0-1, importance of location proximity
  scheduleWeight: number     // 0-1, importance of schedule overlap
  experienceWeight: number   // 0-1, importance of experience level match
}

export interface TeammateProfile {
  id: string
  basicInfo: PersonalInfo
  categories: CollaborationCategory[]
  skills: Skill[]
  goals: Goal[]
  preferences: MatchingPreferences
  availability: Schedule
  categorySpecificData: Record<string, any>
  verification: {
    email: boolean
    phone?: boolean
    identity?: boolean
    skills?: string[] // verified skill IDs
  }
  socialProfiles?: {
    linkedin?: string
    github?: string
    portfolio?: string
    website?: string
  }
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface CompatibilityScore {
  overall: number // 0-1
  breakdown: {
    skills: number
    goals: number
    personality: number
    location: number
    schedule: number
    experience: number
  }
  reasons: string[]
  concerns: string[]
  recommendations: string[]
}

export interface TeammateMatch {
  profileId: string
  profile: Partial<TeammateProfile>
  compatibilityScore: CompatibilityScore
  matchedCategories: CollaborationCategory[]
  sharedSkills: string[]
  complementarySkills: { yours: string[], theirs: string[] }
  sharedGoals: string[]
  connectionStatus: 'none' | 'pending' | 'connected' | 'declined'
  lastInteraction?: Date
}

export interface Team {
  id: string
  name: string
  description: string
  category: CollaborationCategory
  createdBy: string
  members: TeamMember[]
  goals: Goal[]
  requiredSkills: string[]
  maxMembers: number
  isPrivate: boolean
  applicationProcess: 'open' | 'application' | 'invitation-only'
  status: 'forming' | 'active' | 'completed' | 'paused'
  createdAt: Date
  deadlines?: { milestone: string, date: Date }[]
}

export interface TeamMember {
  profileId: string
  role: string
  joinedAt: Date
  contributedSkills: string[]
  responsibilities: string[]
  isLeader: boolean
}

export interface Connection {
  id: string
  participants: string[] // profile IDs
  category: CollaborationCategory
  status: 'pending' | 'active' | 'paused' | 'completed'
  initiatedBy: string
  initiatedAt: Date
  acceptedAt?: Date
  sharedGoals: string[]
  communicationPrefs: {
    platform: string
    frequency: string
    meetingSchedule?: string
  }
  progressTracking?: {
    milestones: Milestone[]
    lastUpdate: Date
  }
}

export interface Milestone {
  id: string
  title: string
  description: string
  dueDate?: Date
  completedAt?: Date
  assignedTo?: string[]
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
}

export interface Message {
  id: string
  connectionId: string
  senderId: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'system'
  isRead: boolean
  metadata?: {
    fileName?: string
    fileSize?: number
    fileType?: string
  }
}

export interface Notification {
  id: string
  userId: string
  type: 'match' | 'connection_request' | 'team_invitation' | 'message' | 'milestone'
  title: string
  message: string
  data: any
  isRead: boolean
  createdAt: Date
  actionUrl?: string
}

// Form and UI types
export interface CategoryFormData {
  [key: string]: any
}

export interface SearchFilters {
  categories: CollaborationCategory[]
  skills: string[]
  location?: {
    city: string
    radius: number
  }
  availability: string[]
  experienceLevel: string[]
  workingStyle: string[]
  commitment: string[]
  timeline: string[]
}

export interface PaginationParams {
  page: number
  limit: number
  cursor?: string
}

export interface APIResponse<T> {
  data: T
  success: boolean
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
    nextCursor?: string
  }
}

// Analytics types
export interface UserAnalytics {
  profileCompleteness: number
  matchQuality: number
  responseRate: number
  successfulConnections: number
  averageCompatibilityScore: number
  topCategories: { category: CollaborationCategory, count: number }[]
  skillDemand: { skill: string, demand: number }[]
}

export interface PlatformAnalytics {
  totalUsers: number
  activeUsers: number
  totalMatches: number
  successfulConnections: number
  categoryDistribution: Record<CollaborationCategory, number>
  averageMatchingTime: number // in hours
  userSatisfactionScore: number
}