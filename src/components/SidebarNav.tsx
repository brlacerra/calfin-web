"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Percent,
  Scale,
  CreditCard,
  PieChart,
  Landmark,
  Calculator,
} from "lucide-react";

export type ModuleKey =
  | "juros-simples"
  | "juros-compostos"
  | "desc-comercial"
  | "desc-racional"
  | "sac"
  | "taxas"
  | "taxa-efetiva-comercial"
  | "fvp"
  | "vpl";

interface NavItem {
  key: ModuleKey;
  label: string;
  category: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "juros-simples",
    label: "Juros Simples",
    category: "Capitalização",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    key: "juros-compostos",
    label: "Juros Compostos",
    category: "Capitalização",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    key: "desc-comercial",
    label: "Desc. Comercial",
    category: "Desconto Composto",
    icon: <TrendingDown className="w-4 h-4" />,
  },
  {
    key: "desc-racional",
    label: "Desc. Racional",
    category: "Desconto Composto",
    icon: <TrendingDown className="w-4 h-4" />,
  },
  {
    key: "sac",
    label: "Amortização SAC",
    category: "Crédito & Financiamento",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    key: "fvp",
    label: "FVP (Price)",
    category: "Crédito & Financiamento",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    key: "taxas",
    label: "Taxas Equivalentes",
    category: "Taxas & Equivalências",
    icon: <Percent className="w-4 h-4" />,
  },
  {
    key: "taxa-efetiva-comercial",
    label: "Comercial vs Efetiva",
    category: "Taxas & Equivalências",
    icon: <Scale className="w-4 h-4" />,
  },
  {
    key: "vpl",
    label: "VPL & Viabilidade",
    category: "Engenharia Econômica",
    icon: <PieChart className="w-4 h-4" />,
  },
];

interface SidebarNavProps {
  activeModule: ModuleKey;
  onSelect: (key: ModuleKey) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeModule, onSelect }) => {
  const categories = Array.from(new Set(NAV_ITEMS.map((item) => item.category)));

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between">
      <div>
        {/* Brand / Logo */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 flex items-center justify-center text-amber-400 font-mono font-bold text-sm border border-slate-800">
              cF
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                calFin<span className="text-amber-600">.</span>Pro
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 block">
                Finanças Corporativas
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="p-3 flex flex-col gap-4">
          {categories.map((category) => (
            <div key={category} className="flex flex-col gap-1">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {category}
              </span>
              {NAV_ITEMS.filter((item) => item.category === category).map((item) => {
                const isActive = activeModule === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelect(item.key)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold tracking-wide transition-all text-left cursor-pointer border ${
                      isActive
                        ? "bg-amber-50/80 text-amber-900 border-amber-400 border-l-4 border-l-amber-600 shadow-xs"
                        : "bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    style={{ borderRadius: "0px" }}
                  >
                    <span className={isActive ? "text-amber-600" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex items-center justify-between font-mono font-semibold text-slate-700">
          <span>calFin Next v2.0</span>
          <span className="text-emerald-700 font-bold">100% TS</span>
        </div>
        <div className="text-[10px] text-slate-600">
          Precisão de 6 casas decimais • Padrão ABNT/CVM
        </div>
      </div>
    </aside>
  );
};
