import React from "react";
import { categories, Category } from "./category-config";

interface CategorySelectorProps {
  selected: Category | null;
  onSelect: (category: Category) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ selected, onSelect }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-lg font-semibold">Choose Collaboration Category</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map(cat => (
        <button
          key={cat.value}
          className={`border rounded-lg p-4 text-left transition-all ${selected === cat.value ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
          onClick={() => onSelect(cat.value)}
        >
          <div className="font-bold">{cat.label}</div>
          <div className="text-sm text-gray-600">{cat.description}</div>
        </button>
      ))}
    </div>
  </div>
);
