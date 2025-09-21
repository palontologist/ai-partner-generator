import React, { useState } from "react";
import { CategorySelector } from "../components/CategorySelector";
import { Category } from "../components/category-config";
import { TeammateProfile, Availability, LocationPreference } from "../types/teammate";

const defaultProfile: TeammateProfile = {
  name: "",
  bio: "",
  category: "Business",
  skills: [],
  availability: "Occasional",
  locationPreference: "Remote",
  goals: ""
};

export const ProfileForm: React.FC = () => {
  const [profile, setProfile] = useState<TeammateProfile>(defaultProfile);

  return (
    <form className="space-y-6">
      <CategorySelector
        selected={profile.category}
        onSelect={cat => setProfile({ ...profile, category: cat })}
      />
      <div>
        <label>Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={e => setProfile({ ...profile, name: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label>Bio</label>
        <textarea
          value={profile.bio}
          onChange={e => setProfile({ ...profile, bio: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label>Skills (comma separated)</label>
        <input
          type="text"
          value={profile.skills.join(", ")}
          onChange={e => setProfile({ ...profile, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label>Availability</label>
        <select
          value={profile.availability}
          onChange={e => setProfile({ ...profile, availability: e.target.value as Availability })}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Occasional">Occasional</option>
        </select>
      </div>
      <div>
        <label>Location Preference</label>
        <select
          value={profile.locationPreference}
          onChange={e => setProfile({ ...profile, locationPreference: e.target.value as LocationPreference })}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="Remote">Remote</option>
          <option value="Local">Local</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>
      <div>
        <label>Goals</label>
        <input
          type="text"
          value={profile.goals}
          onChange={e => setProfile({ ...profile, goals: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      {/* Add category-specific fields here if needed */}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Profile</button>
    </form>
  );
};
