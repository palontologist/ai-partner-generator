import React from "react";

export type Category = "Business" | "Academic" | "Travel" | "Life" | "Creative";

export const categories: { label: string; value: Category; description: string }[] = [
  {
    label: "Business",
    value: "Business",
    description: "Find co-founders, startup partners, or business collaborators."
  },
  {
    label: "Academic",
    value: "Academic",
    description: "Connect for study groups, research, or school projects."
  },
  {
    label: "Travel",
    value: "Travel",
    description: "Meet travel buddies, trip planners, or local guides."
  },
  {
    label: "Life",
    value: "Life",
    description: "Find accountability partners, wellness buddies, or support networks."
  },
  {
    label: "Creative",
    value: "Creative",
    description: "Collaborate on art, music, writing, or creative projects."
  }
];
