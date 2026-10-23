'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Check, Flame } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export interface VariantData {
  id: string;
  name: string;
  price: number;
}

export interface AddOnData {
  id: string;
  name: string;
  price: number;
}

export interface DishData {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  servingSize?: string | null;
  isAvailable: boolean;
  variants?: VariantData[];
  addOns?: AddOnData[];
}

interface DishModalProps {
  dish: DishData | null;
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
}

export default function DishModal({
  dish,
  isOpen,
  onClose,
  currency = 'ج.م',
}: DishModalProps) {
  const { addItem } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Reset or initialize state when a new dish is loaded
  React.useEffect(() => {
    if (dish) {
      if (dish.variants && dish.variants.length > 0) {
        setSelectedVariantId(dish.variants[0].id);
      } else {
        setSelectedVariantId(null);
      }
      setSelectedAddOnIds([]);
      setQuantity(1);
      setNotes('');
    }
  }, [dish]);

  if (!isOpen || !dish) return null;

  // Selected variant
  const selectedVariant = dish.variants?.find((v) => v.id === selectedVariantId);
  const currentUnitPrice = selectedVariant ? selectedVariant.price : dish.basePrice;

  // Selected add-ons
  const selectedAddOns = (dish.addOns || []).filter((a) =>
    selectedAddOnIds.includes(a.id)
  );
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);

  // Total for item
  const finalItemPrice = (currentUnitPrice + addOnsTotal) * quantity;

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    );
  };

  const handleAddToCart = () => {
    addItem({
      menuItemId: dish.id,
      name: dish.name,
      imageUrl: dish.imageUrl,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      unitPrice: currentUnitPrice,
      quantity,
      notes: notes.trim() || undefined,
      addOns: selectedAddOns.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
      })),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#1a1008] border border-[#382414] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
          aria-label="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dish Banner Image */}
        <div className="relative h-56 sm:h-64 bg-[#140d07] overflow-hidden shrink-0">
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // fallback to svg if needed
              (e.target as HTMLImageElement).src = '/images/hero-yemeni-feast.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1008] via-transparent to-transparent" />
          
          {dish.servingSize && (
            <span className="absolute bottom-4 right-4 bg-amber-950/90 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-800/60 backdrop-blur-md">
              {dish.servingSize}
            </span>
          )}
        </div>

        {/* Content Body (scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#fbf7ee]">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl sm:text-2xl font-black text-[#fbf7ee] leading-tight">
                {dish.name}
              </h3>
              <div className="text-left font-black text-amber-400 text-xl shrink-0">
                {currentUnitPrice} {currency}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#a89580] mt-2 leading-relaxed">
              {dish.description}
            </p>
          </div>

          {/* Variants Selection */}
          {dish.variants && dish.variants.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#29190e]">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                اختر الحجم أو الحصة المطلوبة:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {dish.variants.map((v) => {
                  const isSelected = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold text-right transition-all ${
                        isSelected
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                          : 'bg-[#22140a] border-[#382414] text-[#d6c7b2] hover:border-amber-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400 text-[#140d07]'
                              : 'border-[#5c4431]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#140d07]" />}
                        </div>
                        <span>{v.name}</span>
                      </div>
                      <span className="font-bold text-amber-400">
                        {v.price} {currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons Selection */}
          {dish.addOns && dish.addOns.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#29190e]">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                إضافات ومقبلات شهية مع الطبق (اختياري):
              </label>
              <div className="grid grid-cols-1 gap-2">
                {dish.addOns.map((addon) => {
                  const isChecked = selectedAddOnIds.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium text-right transition-all ${
                        isChecked
                          ? 'bg-amber-950/40 border-amber-600/80 text-amber-200'
                          : 'bg-[#22140a] border-[#382414] text-[#bda790] hover:border-amber-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? 'bg-amber-500 border-amber-500 text-[#140d07]'
                              : 'border-[#5c4431] bg-[#1a1008]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-amber-400/90">
                        +{addon.price} {currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes for chef */}
          <div className="space-y-2 pt-3 border-t border-[#29190e]">
            <label className="text-xs font-bold text-[#bda790] block">
              ملاحظات خاصة للشيف (اختياري):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: اللحم محمر زيادة، بدون شطة، أو ليمون إضافي..."
              className="w-full bg-[#140d07] border border-[#382414] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-[#fbf7ee] placeholder-[#665342] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Modal Footer with Quantity & Add to Cart Action */}
        <div className="p-4 bg-[#140d07] border-t border-[#2d1c10] flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 bg-[#24170d] p-1.5 rounded-xl border border-[#382414]">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg bg-[#321f12] hover:bg-[#452b19] flex items-center justify-center text-white transition-colors"
              aria-label="إنقاص"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-[#fbf7ee]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg bg-[#b45309] hover:bg-[#d97706] flex items-center justify-center text-[#140d07] font-bold transition-colors"
              aria-label="زيادة"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#d97706] hover:to-[#f59e0b] text-[#140d07] flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 hover:scale-[1.01] active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span>إضافة إلى السلة ({finalItemPrice.toFixed(0)} {currency})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
