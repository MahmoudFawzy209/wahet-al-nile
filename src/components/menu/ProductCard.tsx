'use client';

import React from 'react';
import { Plus, Flame, Sparkles } from 'lucide-react';
import { DishData } from './DishModal';

interface ProductCardProps {
  dish: DishData;
  onSelect: (dish: DishData) => void;
  currency?: string;
}

export default function ProductCard({
  dish,
  onSelect,
  currency = 'ج.م',
}: ProductCardProps) {
  const hasVariants = dish.variants && dish.variants.length > 0;
  const lowestPrice = hasVariants
    ? Math.min(...dish.variants!.map((v) => v.price))
    : dish.basePrice;

  return (
    <div className="group relative bg-[#1c120a] hover:bg-[#23170e] border border-[#382414] hover:border-amber-700/60 rounded-3xl overflow-hidden shadow-lg shadow-black/40 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
      
      {/* Image container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#120a05]">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/hero-yemeni-feast.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c120a] via-transparent to-transparent opacity-90" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {dish.servingSize && (
            <span className="bg-[#140d07]/90 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-900/60 backdrop-blur-md">
              {dish.servingSize}
            </span>
          )}
        </div>

        {!dish.isAvailable && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-950/90 text-red-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-red-800">
              غير متوفر حالياً
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-[#fbf7ee] group-hover:text-amber-400 transition-colors line-clamp-1">
            {dish.name}
          </h3>
          <p className="text-xs text-[#a89580] mt-1.5 line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Price & Action row */}
        <div className="mt-5 pt-3 border-t border-[#2d1c10] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#8c7964] block font-medium">
              {hasVariants ? 'يبدأ من' : 'السعر'}
            </span>
            <span className="text-base sm:text-lg font-black text-amber-400">
              {lowestPrice} <span className="text-xs font-bold text-[#bda790]">{currency}</span>
            </span>
          </div>

          <button
            type="button"
            disabled={!dish.isAvailable}
            onClick={() => onSelect(dish)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 ${
              dish.isAvailable
                ? 'bg-[#b45309] hover:bg-[#d97706] text-[#140d07] hover:scale-105'
                : 'bg-[#29190e] text-[#5c4a38] cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>طلب الطبق</span>
          </button>
        </div>
      </div>
    </div>
  );
}
