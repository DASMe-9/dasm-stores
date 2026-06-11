"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

export interface Variant {
  id?: string | number;
  name: string;
  price: string | number;
  option_values: Record<string, string>;
  stock_quantity?: number;
}

export interface ProductOption {
  name: string;
  values: string[];
}

interface ProductVariationsBuilderProps {
  basePrice: string | number;
  options: ProductOption[];
  setOptions: (options: ProductOption[]) => void;
  variants: Variant[];
  setVariants: (variants: Variant[]) => void;
}

function generateCombinations(options: ProductOption[]) {
  const validOptions = options.filter((o) => o.values.length > 0 && o.name.trim() !== "");
  if (validOptions.length === 0) return [];

  let combos: Record<string, string>[] = [{}];
  for (const opt of validOptions) {
    const nextCombos: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const val of opt.values) {
        nextCombos.push({ ...combo, [opt.name]: val });
      }
    }
    combos = nextCombos;
  }
  return combos;
}

export function ProductVariationsBuilder({
  basePrice,
  options,
  setOptions,
  variants,
  setVariants,
}: ProductVariationsBuilderProps) {
  // Use a ref to store previous variants to preserve prices when auto-generating
  const prevVariantsRef = useRef<Variant[]>(variants);

  // Sync ref with current variants
  useEffect(() => {
    prevVariantsRef.current = variants;
  }, [variants]);

  // Auto-generate variants whenever options change
  useEffect(() => {
    const combos = generateCombinations(options);
    
    if (combos.length === 0) {
      if (variants.length > 0) setVariants([]);
      return;
    }

    const currentVariantsMap = new Map(
      prevVariantsRef.current.map((v) => [JSON.stringify(v.option_values), v])
    );

    const newVariants = combos.map((combo) => {
      const key = JSON.stringify(combo);
      const existing = currentVariantsMap.get(key);
      const name = Object.values(combo).join(" - ");

      if (existing) {
        // Preserve existing variant (especially its price)
        return {
          ...existing,
          name, // update name just in case
          option_values: combo,
        };
      }

      return {
        name,
        price: basePrice || 0,
        option_values: combo,
        stock_quantity: 0,
      };
    });

    // Check if the newly generated variants are actually different from the current ones
    // to avoid unnecessary re-renders.
    const isDifferent =
      newVariants.length !== variants.length ||
      newVariants.some(
        (nv, i) =>
          nv.name !== variants[i]?.name ||
          String(nv.price) !== String(variants[i]?.price) ||
          JSON.stringify(nv.option_values) !== JSON.stringify(variants[i]?.option_values)
      );

    if (isDifferent) {
      setVariants(newVariants);
    }
  }, [options, basePrice]); // We depend on options and basePrice

  const handleUpdateVariantPrice = (index: number, newPrice: string) => {
    const next = [...variants];
    next[index] = { ...next[index], price: newPrice };
    setVariants(next);
  };

  const handleRemoveVariant = (index: number) => {
    const next = variants.filter((_, i) => i !== index);
    setVariants(next);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {options.map((opt, oIdx) => (
          <div key={oIdx} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
              <div className="flex-1 flex items-center gap-2 relative">
                <div className="w-1 h-6 rounded-full bg-emerald-500" />
                <input
                  type="text"
                  value={opt.name}
                  placeholder="اسم الخيار (مثال: المقاس، اللون)"
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[oIdx].name = e.target.value;
                    setOptions(newOpts);
                  }}
                  className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 py-1 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setOptions(options.filter((_, i) => i !== oIdx))}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition shrink-0"
                title="حذف هذا الخيار"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center mr-3">
              {opt.values.map((v, vIdx) => (
                <span
                  key={vIdx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-gray-700 dark:text-zinc-300 shadow-sm transition hover:bg-gray-100 dark:hover:bg-zinc-700"
                >
                  {v}
                  <button
                    type="button"
                    onClick={() => {
                      const newOpts = [...options];
                      newOpts[oIdx].values = newOpts[oIdx].values.filter((_, i) => i !== vIdx);
                      setOptions(newOpts);
                    }}
                    className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="relative flex-1 min-w-[120px]">
                <input
                  type="text"
                  placeholder="أضف قيمة (ثم اضغط Enter)"
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim().replace(/,$/, "");
                      if (val && !opt.values.includes(val)) {
                        const newOpts = [...options];
                        newOpts[oIdx].values.push(val);
                        setOptions(newOpts);
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.currentTarget.value.trim().replace(/,$/, "");
                    if (val && !opt.values.includes(val)) {
                      const newOpts = [...options];
                      newOpts[oIdx].values.push(val);
                      setOptions(newOpts);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setOptions([...options, { name: "", values: [] }])}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة خيار جديد
        </button>
      </div>

      {variants.length > 0 && (
        <div className="mt-6 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50/80 dark:bg-zinc-800/80 border-b border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3">المتغير</th>
                  <th className="px-4 py-3 w-32">السعر (ر.س)</th>
                  <th className="px-4 py-3 w-16 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                {variants.map((v, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-900 dark:text-zinc-100 font-semibold text-xs whitespace-nowrap">
                      {v.name}
                    </td>
                    <td className="px-4 py-2">
                      <div className="relative">
                        <input
                          type="number"
                          value={v.price}
                          min="0"
                          step="0.01"
                          onChange={(e) => handleUpdateVariantPrice(i, e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-shadow"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="حذف المتغير"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
