// Types for teammate profiles and matching
import { Category } from "../components/category-config";

export type Skill = string;
export type Availability = "Full-time" | "Part-time" | "Occasional";
export type LocationPreference = "Remote" | "Local" | "Hybrid";

export interface TeammateProfile {
  name: string;
  bio: string;
  category: Category;
  skills: Skill[];
  availability: Availability;
  locationPreference: LocationPreference;
  goals: string;
  // Add category-specific attributes as needed
}

export interface MatchCriteria {
  category: Category;
  skills?: Skill[];
  availability?: Availability;
  locationPreference?: LocationPreference;
  goals?: string;
}
