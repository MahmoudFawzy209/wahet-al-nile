'use client';

import React, { useState, useMemo } from 'react';
import { Search, Flame, Filter, UtensilsCrossed } from 'lucide-react';
import ProductCard from './ProductCard';
import DishModal, { DishData } from './DishModal';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  items: DishData[];
}

interface MenuClientProps {
  categories: CategoryData[];
  currency?: string;
  initialCategory?: string;
}

export default function MenuClient({
  categories,
  currency = 'ج.م',
  initialCategory = 'all',
}: MenuClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDish, setActiveDish] = useState<DishData | null>(null);

  // Flatten all dishes or filter
  const allDishes = useMemo(() => {
    return categories.flatMap((cat) => cat.items);
  }, [categories]);

  const filteredDishes = useMemo(() => {
    let list =
      selectedCategory === 'all'
        ? allDishes
        : categories.find((c) => c.slug === selectedCategory)?.items || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [categories, allDishes, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Controls */}
      <div className="bg-[#1c120a] border border-[#382414] p-4 sm:p-6 rounded-3xl shadow-xl space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8f7b66]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم عن طبقك المفضل (مندي، حنيذ، سلتة، عريكة...)"
            className="w-full bg-[#140d07] border border-[#382414] focus:border-amber-500 rounded-2xl pr-12 pl-4 py-3.5 text-sm text-[#fbf7ee] placeholder-[#6b5847] outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#8f7b66] hover:text-white"
            >
              مسح
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-[#b45309] to-[#d97706] text-[#140d07] shadow-lg shadow-amber-950/40'
                : 'bg-[#25170d] text-[#bda790] border border-[#382414] hover:border-amber-800/60'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>كافة الأطباق ({allDishes.length})</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#b45309] to-[#d97706] text-[#140d07] shadow-lg shadow-amber-950/40'
                    : 'bg-[#25170d] text-[#bda790] border border-[#382414] hover:border-amber-800/60'
                }`}
              >
                {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Dishes */}
      {filteredDishes.length === 0 ? (
        <div className="bg-[#1c120a] border border-[#382414] rounded-3xl p-12 text-center text-[#8f7b66]">
          <Flame className="w-12 h-12 mx-auto text-[#5c4a38] mb-3" />
          <h4 className="text-lg font-bold text-[#fbf7ee]">لم نجد أطباقاً تطابق بحثك</h4>
          <p className="text-xs text-[#a89580] mt-1">
            جرب البحث بكلمة أخرى أو اختر قسماً آخر من المنيو.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <ProductCard
              key={dish.id}
              dish={dish}
              currency={currency}
              onSelect={(selected) => setActiveDish(selected)}
            />
          ))}
        </div>
      )}

      {/* Dish Modal Dialog */}
      <DishModal
        dish={activeDish}
        isOpen={!!activeDish}
        currency={currency}
        onClose={() => setActiveDish(null)}
      />
    </div>
  );
}
